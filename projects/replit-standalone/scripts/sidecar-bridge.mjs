#!/usr/bin/env node
import { createServer } from 'node:http'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const state = {
  runId: 0,
  status: 'idle',
  child: null,
  outPath: '',
  events: [],
  subscribers: new Set(),
  commandRisk: null
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  })
  res.end(JSON.stringify(payload))
}

function broadcast(event) {
  state.events.push(event)
  const line = `data: ${JSON.stringify(event)}\n\n`
  for (const res of state.subscribers) {
    res.write(line)
  }
}

function parseJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (!chunks.length) return resolveBody({})
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolveBody(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

async function startRun(payload = {}) {
  if (state.status === 'running') {
    throw new Error('A sidecar run is already active')
  }

  const bundle = String(payload.bundle || '').trim()
  const bundleJsonRaw = typeof payload.bundleJson === 'string' ? payload.bundleJson.trim() : ''
  const out = String(payload.out || '').trim()
  const dryRun = Boolean(payload.dryRun)
  const timeoutMs = Number(payload.timeoutMs || 0)

  if (!bundle && !bundleJsonRaw) throw new Error('Missing "bundle" or "bundleJson"')
  if (!out) throw new Error('Missing "out"')
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) throw new Error('"timeoutMs" must be >= 0')

  const outPath = resolve(out)
  await mkdir(dirname(outPath), { recursive: true })

  let bundlePath = ''
  let parsedBundle = null
  if (bundle) {
    bundlePath = resolve(bundle)
    try {
      parsedBundle = JSON.parse(await readFile(bundlePath, 'utf8'))
    } catch {
      throw new Error('"bundle" must point to a readable JSON file')
    }
  } else {
    try {
      parsedBundle = JSON.parse(bundleJsonRaw)
    } catch {
      throw new Error('"bundleJson" must be valid JSON')
    }

    const executionId = String(parsedBundle?.executionId || `bridge-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-')
    bundlePath = resolve('runs', `${executionId}.bundle.json`)
    await mkdir(dirname(bundlePath), { recursive: true })
    await writeFile(bundlePath, JSON.stringify(parsedBundle, null, 2), 'utf8')
  }

  const workerArgs = ['scripts/sidecar-worker.mjs', '--bundle', bundlePath]
  if (dryRun) workerArgs.push('--dry-run')
  if (timeoutMs > 0) workerArgs.push('--timeout-ms', String(timeoutMs))

  state.runId += 1
  const runId = `run-${state.runId}`
  state.status = 'running'
  state.outPath = outPath
  state.events = []
  state.commandRisk = parsedBundle?.commandRisk || null

  const outStream = createWriteStream(outPath, { flags: 'w', encoding: 'utf8' })
  const child = spawn(process.execPath, workerArgs, {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env
  })

  state.child = child

  const riskSummary = state.commandRisk?.summary || null
  broadcast({
    ts: new Date().toISOString(),
    runId,
    level: 'info',
    step: 'run:start',
    detail: `Started sidecar run (${dryRun ? 'dry-run' : 'live'}) bundle=${bundlePath} out=${outPath}`,
    commandRiskSummary: riskSummary
  })

  child.stdout.on('data', (chunk) => {
    const text = String(chunk)
    outStream.write(text)
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const parsed = JSON.parse(trimmed)
        broadcast(parsed)
      } catch {
        broadcast({ ts: new Date().toISOString(), runId, level: 'info', step: 'sidecar:stdout', detail: trimmed })
      }
    }
  })

  child.stderr.on('data', (chunk) => {
    const text = String(chunk).trim()
    if (!text) return
    broadcast({ ts: new Date().toISOString(), runId, level: 'warn', step: 'sidecar:stderr', detail: text })
  })

  child.on('close', (code, signal) => {
    outStream.end()
    state.status = code === 0 ? 'complete' : signal === 'SIGINT' ? 'cancelled' : 'error'
    broadcast({
      ts: new Date().toISOString(),
      runId,
      level: state.status === 'complete' ? 'success' : 'warn',
      step: 'run:close',
      detail: `Sidecar exited (code=${code ?? 'null'}, signal=${signal ?? 'none'})`
    })
    state.child = null
    if (state.status !== 'running') {
      // keep last run risk in recent events/status for operator audit context
    }
  })

  return { runId, outPath, bundlePath }
}

function cancelRun() {
  if (!state.child || state.status !== 'running') {
    return false
  }
  state.child.kill('SIGINT')
  return true
}

const port = Number(process.env.SIDECAR_BRIDGE_PORT || 4310)
const host = process.env.SIDECAR_BRIDGE_HOST || '127.0.0.1'

const server = createServer(async (req, res) => {
  const method = req.method || 'GET'
  const url = req.url || '/'

  if (method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true })
  }

  try {
    if (method === 'GET' && url === '/healthz') {
      return sendJson(res, 200, { ok: true, status: state.status, outPath: state.outPath || null })
    }

    if (method === 'GET' && url === '/status') {
      return sendJson(res, 200, {
        status: state.status,
        outPath: state.outPath || null,
        commandRisk: state.commandRisk,
        recentEvents: state.events.slice(-25)
      })
    }

    if (method === 'GET' && url === '/events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        'access-control-allow-origin': '*'
      })

      for (const event of state.events.slice(-200)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }

      state.subscribers.add(res)
      req.on('close', () => {
        state.subscribers.delete(res)
      })
      return
    }

    if (method === 'POST' && url === '/run') {
      const body = await parseJsonBody(req)
      const run = await startRun(body)
      return sendJson(res, 200, { ok: true, ...run })
    }

    if (method === 'POST' && url === '/cancel') {
      const cancelled = cancelRun()
      return sendJson(res, 200, { ok: true, cancelled })
    }

    return sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message || error) })
  }
})

server.listen(port, host, () => {
  console.log(`sidecar bridge listening on http://${host}:${port}`)
})
