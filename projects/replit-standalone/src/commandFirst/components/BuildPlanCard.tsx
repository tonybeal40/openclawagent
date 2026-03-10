import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { BuildPlan } from '../buildPlanner'
import type { ScaffoldExecution } from '../scaffoldExecutor'
import { assessCommandRisks } from '../commandRisk'

type BuildPlanCardProps = {
  plan: BuildPlan | null
  execution: ScaffoldExecution | null
  bundleJson?: string | null
  sidecarReportJson?: string | null
  onExecuteScaffold?: () => void
  onExportBundle?: () => void
  onPrepareSidecar?: () => void
}

type SidecarEvent = {
  ts?: string
  level?: string
  step?: string
  detail?: string
}

type BridgePolicyPreset = {
  key: 'conservative' | 'balanced' | 'aggressive'
  label: string
  reconnectBaseMs: number
  reconnectMaxMs: number
  maxReconnectAttempts: number
  staleThresholdSec: number
  hardDownFailureThreshold: number
}

const BRIDGE_POLICY_PRESETS: BridgePolicyPreset[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    reconnectBaseMs: 1500,
    reconnectMaxMs: 20000,
    maxReconnectAttempts: 12,
    staleThresholdSec: 20,
    hardDownFailureThreshold: 5
  },
  {
    key: 'balanced',
    label: 'Balanced',
    reconnectBaseMs: 1000,
    reconnectMaxMs: 15000,
    maxReconnectAttempts: 8,
    staleThresholdSec: 10,
    hardDownFailureThreshold: 3
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    reconnectBaseMs: 500,
    reconnectMaxMs: 8000,
    maxReconnectAttempts: 15,
    staleThresholdSec: 6,
    hardDownFailureThreshold: 6
  }
]

function parseJsonlEvents(input: string): SidecarEvent[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SidecarEvent)
}

function parseBundleCommands(bundleJson?: string | null): string[] {
  if (!bundleJson?.trim()) return []

  try {
    const parsed = JSON.parse(bundleJson) as { commands?: unknown }
    if (!Array.isArray(parsed.commands)) return []
    return parsed.commands.filter((cmd): cmd is string => typeof cmd === 'string')
  } catch {
    return []
  }
}

function findHighRiskCommands(bundleJson?: string | null): string[] {
  return assessCommandRisks(parseBundleCommands(bundleJson))
    .filter((entry) => entry.level === 'high')
    .map((entry) => entry.command)
}

export function BuildPlanCard({
  plan,
  execution,
  bundleJson,
  sidecarReportJson,
  onExecuteScaffold,
  onExportBundle,
  onPrepareSidecar
}: BuildPlanCardProps) {
  const [eventInput, setEventInput] = useState('')
  const [events, setEvents] = useState<SidecarEvent[]>([])
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'complete' | 'cancelled' | 'error'>('idle')
  const [eventError, setEventError] = useState<string | null>(null)
  const replayTimer = useRef<number | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const statusPollRef = useRef<number | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const reconnectCountdownRef = useRef<number | null>(null)
  const eventKeySetRef = useRef<Set<string>>(new Set())

  const [bridgeBaseUrl, setBridgeBaseUrl] = useState(() => {
    const envUrl = (import.meta.env.VITE_SIDECAR_BRIDGE_URL as string | undefined)?.trim()
    return envUrl || 'http://127.0.0.1:4310'
  })
  const [bridgeOutPath, setBridgeOutPath] = useState('runs/latest-events.jsonl')
  const [bridgeConnected, setBridgeConnected] = useState(false)
  const [bridgeBusy, setBridgeBusy] = useState(false)
  const [lastStatusPollAt, setLastStatusPollAt] = useState<number | null>(null)
  const [lastEventAt, setLastEventAt] = useState<number | null>(null)
  const [healthLatencyMs, setHealthLatencyMs] = useState<number | null>(null)
  const [healthState, setHealthState] = useState<'unknown' | 'ok' | 'down'>('unknown')
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [reconnectInMs, setReconnectInMs] = useState<number | null>(null)
  const [reconnectBaseMs, setReconnectBaseMs] = useState(1000)
  const [reconnectMaxMs, setReconnectMaxMs] = useState(15000)
  const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(8)
  const [staleThresholdSec, setStaleThresholdSec] = useState(10)
  const [healthFailureCount, setHealthFailureCount] = useState(0)
  const [hardDownFailureThreshold, setHardDownFailureThreshold] = useState(3)
  const [showAdvancedBridgePolicy, setShowAdvancedBridgePolicy] = useState(false)
  const [activePolicyPreset, setActivePolicyPreset] = useState<BridgePolicyPreset['key']>('balanced')
  const [runMode, setRunMode] = useState<'dry-run' | 'apply'>('dry-run')

  const canReplay = useMemo(() => eventInput.trim().length > 0, [eventInput])
  const hasBundle = useMemo(() => Boolean(bundleJson?.trim()), [bundleJson])
  const commandRiskRows = useMemo(() => assessCommandRisks(parseBundleCommands(bundleJson)), [bundleJson])
  const bridgeMode = bridgeConnected ? 'connected (SSE)' : statusPollRef.current !== null ? 'polling /status' : 'disconnected'
  const staleEventSeconds = lastEventAt ? Math.round((Date.now() - lastEventAt) / 1000) : null
  const staleEventWarning = runStatus === 'running' && staleEventSeconds !== null && staleEventSeconds > staleThresholdSec
  const hardDown = healthFailureCount >= hardDownFailureThreshold || reconnectAttempt >= maxReconnectAttempts

  const formatAgo = (timestamp: number | null) => {
    if (!timestamp) return 'n/a'
    const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000))
    return `${seconds}s ago`
  }

  const eventKey = (event: SidecarEvent) => `${event.ts || ''}|${event.level || ''}|${event.step || ''}|${event.detail || ''}`

  const appendEvent = (event: SidecarEvent) => {
    const key = eventKey(event)
    if (eventKeySetRef.current.has(key)) return
    eventKeySetRef.current.add(key)
    setEvents((current) => [...current, event].slice(-250))
  }

  const stopStatusPolling = () => {
    if (statusPollRef.current !== null) {
      window.clearInterval(statusPollRef.current)
      statusPollRef.current = null
    }
  }

  const clearReconnectTimers = () => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (reconnectCountdownRef.current !== null) {
      window.clearInterval(reconnectCountdownRef.current)
      reconnectCountdownRef.current = null
    }
    setReconnectInMs(null)
  }

  const startStatusPolling = () => {
    if (statusPollRef.current !== null) return

    const poll = async () => {
      try {
        const response = await fetch(`${bridgeBaseUrl.replace(/\/$/, '')}/status`)
        if (!response.ok) return
        const payload = (await response.json()) as { status?: string; recentEvents?: SidecarEvent[] }
        setLastStatusPollAt(Date.now())

        const status = payload.status
        if (status === 'running' || status === 'complete' || status === 'cancelled' || status === 'error') {
          setRunStatus(status)
        }

        const recentEvents = payload.recentEvents || []
        for (const event of recentEvents) {
          appendEvent(event)
        }
        if (recentEvents.length > 0) {
          setLastEventAt(Date.now())
        }
      } catch {
        // keep polling quietly until bridge comes back
      }
    }

    void poll()
    statusPollRef.current = window.setInterval(() => {
      void poll()
    }, 3000)
  }

  const pingBridgeHealth = async () => {
    const started = performance.now()
    try {
      const response = await fetch(`${bridgeBaseUrl.replace(/\/$/, '')}/healthz`)
      if (!response.ok) {
        setHealthState('down')
        setHealthLatencyMs(null)
        setHealthFailureCount((count) => count + 1)
        return
      }
      setHealthState('ok')
      setHealthLatencyMs(Math.round(performance.now() - started))
      setHealthFailureCount(0)
    } catch {
      setHealthState('down')
      setHealthLatencyMs(null)
      setHealthFailureCount((count) => count + 1)
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('sidecar.bridgeBaseUrl')
    if (saved && !import.meta.env.VITE_SIDECAR_BRIDGE_URL) {
      setBridgeBaseUrl(saved)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('sidecar.bridgeBaseUrl', bridgeBaseUrl)
  }, [bridgeBaseUrl])

  useEffect(() => {
    const parseSetting = (key: string, fallback: number) => {
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? Number(raw) : Number.NaN
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
    }

    setReconnectBaseMs(parseSetting('sidecar.reconnectBaseMs', 1000))
    setReconnectMaxMs(parseSetting('sidecar.reconnectMaxMs', 15000))
    setMaxReconnectAttempts(parseSetting('sidecar.maxReconnectAttempts', 8))
    setStaleThresholdSec(parseSetting('sidecar.staleThresholdSec', 10))
    setHardDownFailureThreshold(parseSetting('sidecar.hardDownFailureThreshold', 3))

    const presetRaw = window.localStorage.getItem('sidecar.policyPreset')
    if (presetRaw === 'conservative' || presetRaw === 'balanced' || presetRaw === 'aggressive') {
      setActivePolicyPreset(presetRaw)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('sidecar.reconnectBaseMs', String(reconnectBaseMs))
    window.localStorage.setItem('sidecar.reconnectMaxMs', String(reconnectMaxMs))
    window.localStorage.setItem('sidecar.maxReconnectAttempts', String(maxReconnectAttempts))
    window.localStorage.setItem('sidecar.staleThresholdSec', String(staleThresholdSec))
    window.localStorage.setItem('sidecar.hardDownFailureThreshold', String(hardDownFailureThreshold))
    window.localStorage.setItem('sidecar.policyPreset', activePolicyPreset)
  }, [reconnectBaseMs, reconnectMaxMs, maxReconnectAttempts, staleThresholdSec, hardDownFailureThreshold, activePolicyPreset])

  useEffect(() => {
    void pingBridgeHealth()
    const timer = window.setInterval(() => {
      void pingBridgeHealth()
    }, 15000)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridgeBaseUrl])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      stopStatusPolling()
      clearReconnectTimers()
    }
  }, [])

  const stopReplay = (status: 'cancelled' | 'complete') => {
    if (replayTimer.current !== null) {
      window.clearInterval(replayTimer.current)
      replayTimer.current = null
    }
    setRunStatus(status)
  }

  const loadEventFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setEventInput(text)
      setEventError(null)
    } catch (error) {
      setEventError(String((error as Error)?.message || error))
    } finally {
      event.target.value = ''
    }
  }

  const startReplay = () => {
    try {
      const parsed = parseJsonlEvents(eventInput)
      setEventError(null)
      eventKeySetRef.current.clear()
      setEvents([])

      if (!parsed.length) {
        setRunStatus('idle')
        return
      }

      setRunStatus('running')
      let index = 0

      if (replayTimer.current !== null) {
        window.clearInterval(replayTimer.current)
      }

      replayTimer.current = window.setInterval(() => {
        const next = parsed[index]
        index += 1
        if (next) appendEvent(next)

        if (index >= parsed.length) {
          stopReplay('complete')
        }
      }, 220)
    } catch (error) {
      setEvents([])
      setRunStatus('error')
      setEventError(String((error as Error)?.message || error))
    }
  }

  const connectBridgeEvents = (attempt = 0) => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      stopStatusPolling()

      const source = new EventSource(`${bridgeBaseUrl.replace(/\/$/, '')}/events`)
      eventSourceRef.current = source

      source.onopen = () => {
        clearReconnectTimers()
        setReconnectAttempt(0)
        setBridgeConnected(true)
        setEventError(null)
      }

      source.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data) as SidecarEvent
          appendEvent(payload)
          setLastEventAt(Date.now())
          if (payload.step === 'run:start') setRunStatus('running')
          if (payload.step === 'run:close') {
            if (payload.detail?.includes('signal=SIGINT')) setRunStatus('cancelled')
            else if (payload.detail?.includes('code=0')) setRunStatus('complete')
            else setRunStatus('error')
          }
        } catch {
          // ignore non-json SSE chunks
        }
      }

      source.onerror = () => {
        setBridgeConnected(false)
        startStatusPolling()

        clearReconnectTimers()
        const nextAttempt = attempt + 1
        setReconnectAttempt(nextAttempt)

        if (nextAttempt >= maxReconnectAttempts) {
          setEventError(`SSE reconnect limit reached (${maxReconnectAttempts}). Running in polling-only mode.`)
          return
        }

        const exponent = Math.min(nextAttempt, 6)
        const delay = Math.min(reconnectMaxMs, reconnectBaseMs * 2 ** exponent)
        setReconnectInMs(delay)

        reconnectCountdownRef.current = window.setInterval(() => {
          setReconnectInMs((current) => {
            if (current === null) return null
            return current > 250 ? current - 250 : 0
          })
        }, 250)

        reconnectTimerRef.current = window.setTimeout(() => {
          clearReconnectTimers()
          connectBridgeEvents(nextAttempt)
        }, delay)
      }
    } catch (error) {
      setBridgeConnected(false)
      setEventError(String((error as Error)?.message || error))
    }
  }

  const triggerBridgeRun = async () => {
    if (!bundleJson?.trim()) {
      setEventError('Export execution bundle JSON first, then trigger bridge run.')
      return
    }

    const isDryRun = runMode === 'dry-run'
    if (!isDryRun) {
      const confirmed = window.confirm(
        'Apply mode will write scaffold files and execute bootstrap commands on your local machine. Continue?'
      )
      if (!confirmed) {
        setEventError('Apply run cancelled by operator confirmation guardrail.')
        return
      }

      const highRiskCommands = findHighRiskCommands(bundleJson)
      if (highRiskCommands.length > 0) {
        const phrase = 'APPLY'
        const typed = window.prompt(
          `High-risk command(s) detected:\n- ${highRiskCommands.join('\n- ')}\n\nType ${phrase} to continue.`
        )

        if ((typed || '').trim() !== phrase) {
          setEventError('Apply run blocked: typed confirmation phrase did not match for high-risk bundle.')
          return
        }
      }
    }

    setBridgeBusy(true)
    setEventError(null)
    eventKeySetRef.current.clear()
    setEvents([])

    try {
      const response = await fetch(`${bridgeBaseUrl.replace(/\/$/, '')}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleJson,
          out: bridgeOutPath,
          dryRun: isDryRun,
          timeoutMs: 5000
        })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Bridge run failed (${response.status})`)
      }

      setRunStatus('running')
      connectBridgeEvents()
    } catch (error) {
      setRunStatus('error')
      setEventError(String((error as Error)?.message || error))
    } finally {
      setBridgeBusy(false)
    }
  }

  useEffect(() => {
    if (!execution) return
    connectBridgeEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execution, bridgeBaseUrl])

  const cancelBridgeRun = async () => {
    try {
      await fetch(`${bridgeBaseUrl.replace(/\/$/, '')}/cancel`, { method: 'POST' })
      setRunStatus('cancelled')
    } catch (error) {
      setEventError(String((error as Error)?.message || error))
    }
  }

  const applyBridgePolicyPreset = (presetKey: BridgePolicyPreset['key']) => {
    const preset = BRIDGE_POLICY_PRESETS.find((entry) => entry.key === presetKey)
    if (!preset) return

    setReconnectBaseMs(preset.reconnectBaseMs)
    setReconnectMaxMs(preset.reconnectMaxMs)
    setMaxReconnectAttempts(preset.maxReconnectAttempts)
    setStaleThresholdSec(preset.staleThresholdSec)
    setHardDownFailureThreshold(preset.hardDownFailureThreshold)
    setActivePolicyPreset(preset.key)
  }

  const resetBridgePolicyDefaults = () => {
    applyBridgePolicyPreset('balanced')
  }

  return (
    <section className="intent-preview-card" aria-label="Build plan preview">
      <header>
        <p className="eyebrow">Build plan</p>
        {plan && onExecuteScaffold && (
          <button className="ghost-btn" type="button" onClick={onExecuteScaffold}>
            Create scaffold runbook
          </button>
        )}
      </header>

      {!plan ? (
        <p>Generate a build plan from your parsed intent to get a day-1 checklist and execution tasks.</p>
      ) : (
        <div className="intent-preview-body">
          <h3>{plan.summary}</h3>

          <div>
            <h4>Day-1 checklist</h4>
            <ul>
              {plan.day1Checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Execution tasks</h4>
            <ul>
              {plan.executionTasks.map((task) => (
                <li key={task.title}>
                  <strong>{task.title}</strong>: {task.reason}
                </li>
              ))}
            </ul>
          </div>

          {plan.risks.length > 0 && (
            <div>
              <h4>Risks</h4>
              <ul>
                {plan.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {execution && (
            <div>
              <h4>Scaffold package</h4>
              <p>
                <strong>{execution.projectName}</strong> → {execution.rootDir}
              </p>
              {onExportBundle && (
                <button className="ghost-btn" type="button" onClick={onExportBundle}>
                  Export execution bundle JSON
                </button>
              )}
              {onPrepareSidecar && (
                <button className="ghost-btn" type="button" onClick={onPrepareSidecar}>
                  Prepare sidecar execution plan
                </button>
              )}
              <ul>
                {execution.steps.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong> ({step.status}): <code>{step.command}</code>
                  </li>
                ))}
              </ul>

              <h4>Generated files</h4>
              <ul>
                {execution.generatedFiles.map((file) => (
                  <li key={file.path}>
                    <strong>{file.path}</strong>: {file.purpose}
                  </li>
                ))}
              </ul>

              <h4>Status timeline</h4>
              <ul>
                {execution.statusTimeline.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>

              {execution.warnings.length > 0 && (
                <>
                  <h4>Warnings</h4>
                  <ul>
                    {execution.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </>
              )}

              {bundleJson && (
                <>
                  <h4>Execution bundle JSON</h4>
                  <pre>{bundleJson}</pre>
                </>
              )}

              {commandRiskRows.length > 0 && (
                <>
                  <h4>Command risk review</h4>
                  <ul className="command-risk-list">
                    {commandRiskRows.map((item) => (
                      <li key={item.command}>
                        <span className={`pill command-risk-badge risk-${item.level}`}>{item.level.toUpperCase()}</span>{' '}
                        <code>{item.command}</code>
                        <span className="event-hint"> — {item.reason}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sidecarReportJson && (
                <>
                  <h4>Sidecar execution plan JSON</h4>
                  <pre>{sidecarReportJson}</pre>
                </>
              )}

              <h4>Sidecar event timeline</h4>
              <p className="event-hint">Bridge mode: run <code>npm run sidecar:bridge</code>, then stream events directly in-app.</p>
              <textarea
                value={eventInput}
                onChange={(event) => setEventInput(event.target.value)}
                rows={8}
                placeholder='{"ts":"...","level":"info","step":"bundle:load","detail":"..."}'
              />
              <div className="command-first-actions">
                <input value={bridgeBaseUrl} onChange={(event) => setBridgeBaseUrl(event.target.value)} placeholder="http://127.0.0.1:4310" />
                <input value={bridgeOutPath} onChange={(event) => setBridgeOutPath(event.target.value)} placeholder="runs/latest-events.jsonl" />
                <button className="ghost-btn" type="button" onClick={() => setShowAdvancedBridgePolicy((current) => !current)}>
                  {showAdvancedBridgePolicy ? 'Hide advanced bridge policy' : 'Show advanced bridge policy'}
                </button>
              </div>
              <div className="run-mode-row">
                <span className="event-hint">Run mode:</span>
                <div className="starter-chip-group">
                  <button
                    className={`starter-chip ${runMode === 'dry-run' ? 'is-selected' : ''}`}
                    type="button"
                    onClick={() => setRunMode('dry-run')}
                  >
                    Dry-run (safe)
                  </button>
                  <button
                    className={`starter-chip ${runMode === 'apply' ? 'is-selected' : ''}`}
                    type="button"
                    onClick={() => setRunMode('apply')}
                  >
                    Apply (writes + commands)
                  </button>
                </div>
              </div>
              {showAdvancedBridgePolicy && (
                <div className="bridge-policy-advanced">
                  <p className="event-hint">Presets:</p>
                  <div className="starter-chip-group">
                    {BRIDGE_POLICY_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        className={`starter-chip ${activePolicyPreset === preset.key ? 'is-selected' : ''}`}
                        type="button"
                        onClick={() => applyBridgePolicyPreset(preset.key)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="command-first-actions">
                    <label>
                      Reconnect base (ms)
                      <input
                        type="number"
                        min={250}
                        step={250}
                        value={reconnectBaseMs}
                        onChange={(event) => setReconnectBaseMs(Math.max(250, Number(event.target.value) || 1000))}
                      />
                    </label>
                    <label>
                      Reconnect cap (ms)
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={reconnectMaxMs}
                        onChange={(event) => setReconnectMaxMs(Math.max(1000, Number(event.target.value) || 15000))}
                      />
                    </label>
                    <label>
                      Max SSE retries
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={maxReconnectAttempts}
                        onChange={(event) => setMaxReconnectAttempts(Math.max(1, Number(event.target.value) || 8))}
                      />
                    </label>
                    <label>
                      Stale threshold (s)
                      <input
                        type="number"
                        min={3}
                        max={120}
                        value={staleThresholdSec}
                        onChange={(event) => setStaleThresholdSec(Math.max(3, Number(event.target.value) || 10))}
                      />
                    </label>
                    <label>
                      Hard-down failures
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={hardDownFailureThreshold}
                        onChange={(event) => setHardDownFailureThreshold(Math.max(1, Number(event.target.value) || 3))}
                      />
                    </label>
                  </div>
                  <button className="ghost-btn" type="button" onClick={resetBridgePolicyDefaults}>
                    Reset bridge policy defaults
                  </button>
                </div>
              )}
              <div className="command-first-actions">
                <button className="ghost-btn" type="button" onClick={() => connectBridgeEvents()}>
                  {bridgeConnected ? 'Reconnect SSE' : 'Connect SSE'}
                </button>
                <button className="ghost-btn" type="button" onClick={triggerBridgeRun} disabled={!hasBundle || bridgeBusy}>
                  {runMode === 'dry-run' ? 'Trigger bridge dry-run' : 'Trigger bridge apply run'}
                </button>
                <button className="ghost-btn" type="button" onClick={cancelBridgeRun} disabled={runStatus !== 'running'}>
                  Cancel bridge run
                </button>
                <button className="ghost-btn" type="button" onClick={startReplay} disabled={!canReplay || runStatus === 'running'}>
                  Replay pasted events
                </button>
                <label className="ghost-btn file-upload-btn">
                  Load .jsonl file
                  <input type="file" accept=".jsonl,.txt,application/jsonl" onChange={loadEventFile} />
                </label>
                <span className="pill muted">Bridge: {bridgeMode}</span>
                <span className="pill muted">Status: {runStatus}</span>
              </div>
              <div className="bridge-health-row">
                <span className={`pill muted ${healthState === 'ok' ? 'health-ok' : healthState === 'down' ? 'health-down' : ''}`}>
                  Health: {healthState === 'ok' ? `ok (${healthLatencyMs ?? '?'}ms)` : healthState}
                </span>
                <span className="pill muted">Last status poll: {formatAgo(lastStatusPollAt)}</span>
                <span className="pill muted">Last event: {formatAgo(lastEventAt)}</span>
                <span className={`pill muted ${hardDown ? 'health-down' : ''}`}>
                  Health failures: {healthFailureCount}/{hardDownFailureThreshold}
                </span>
              </div>
              {reconnectInMs !== null && (
                <p className="event-hint reconnect-note">SSE reconnect attempt {reconnectAttempt} in {Math.ceil(reconnectInMs / 1000)}s (polling fallback active).</p>
              )}
              {hardDown && (
                <p className="event-hard-down">
                  Bridge hard-down: repeated failures detected. Staying in polling mode until bridge health recovers or you reconnect manually.
                </p>
              )}
              {staleEventWarning && (
                <p className="event-warning">No sidecar events for {staleEventSeconds}s while run is active (threshold {staleThresholdSec}s). Bridge may be degraded; check polling/status.</p>
              )}
              {eventError && <p className="event-error">Event parse failed: {eventError}</p>}
              <ul>
                {events.map((event, idx) => (
                  <li key={`${event.ts || idx}-${event.step || idx}`}>
                    <strong>[{event.level || 'info'}]</strong> {event.step || 'event'} — {event.detail || ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
