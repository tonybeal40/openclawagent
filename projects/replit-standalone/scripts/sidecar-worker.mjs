#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

function parseArgs(argv) {
  const args = {
    bundle: '',
    dryRun: false,
    timeoutMs: 0
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--bundle') args.bundle = argv[i + 1] || ''
    if (token === '--dry-run') args.dryRun = true
    if (token === '--timeout-ms') args.timeoutMs = Number(argv[i + 1] || 0)
  }

  if (!args.bundle) {
    throw new Error('Missing --bundle <path-to-bundle.json>')
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 0) {
    throw new Error('--timeout-ms must be a non-negative number')
  }

  return args
}

function logEvent(level, step, detail) {
  const event = {
    ts: new Date().toISOString(),
    level,
    step,
    detail
  }

  console.log(JSON.stringify(event))
}

async function readBundle(bundlePath) {
  const raw = await fs.readFile(bundlePath, 'utf8')
  const bundle = JSON.parse(raw)

  if (!bundle.executionId || !bundle.rootDir || !Array.isArray(bundle.files) || !Array.isArray(bundle.commands)) {
    throw new Error('Invalid scaffold bundle shape')
  }

  if (bundle.commandRisk) {
    const summary = bundle.commandRisk.summary || {}
    if (!Number.isFinite(summary.high) || !Number.isFinite(summary.medium) || !Number.isFinite(summary.low)) {
      throw new Error('Invalid scaffold bundle commandRisk summary')
    }
  }

  return bundle
}

async function ensureRoot(rootDir, dryRun) {
  if (dryRun) {
    logEvent('info', 'mkdir:dry-run', `Would create ${rootDir}`)
    return
  }

  await fs.mkdir(rootDir, { recursive: true })
  logEvent('success', 'mkdir', `Created ${rootDir}`)
}

async function writeFiles(rootDir, files, dryRun) {
  for (const file of files) {
    const filePath = path.join(rootDir, file.path)
    const dir = path.dirname(filePath)

    if (dryRun) {
      logEvent('info', `write:dry-run:${file.path}`, `Would write ${file.path} (${file.bytes} bytes)`)
      continue
    }

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, file.content, 'utf8')
    logEvent('success', `write:${file.path}`, `Wrote ${file.path} (${file.bytes} bytes)`)
  }
}

async function runCommand(command, cwd, index, dryRun, timeoutMs, abortState, risk) {
  if (abortState.cancelled) {
    throw new Error('Execution cancelled before command start')
  }

  const riskTag = risk ? ` [risk=${risk.severity}${risk.reason ? `:${risk.reason}` : ''}]` : ''

  if (dryRun) {
    logEvent('warn', `command:dry-run:${index}`, `Would execute${riskTag}: ${command}`)
    return { code: 0 }
  }

  logEvent('info', `command:start:${index}`, `${command}${riskTag}`)

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      env: process.env
    })

    abortState.currentChild = child

    let timeoutHandle = null
    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        logEvent('warn', `command:timeout:${index}`, `Exceeded ${timeoutMs}ms, terminating: ${command}`)
        child.kill('SIGTERM')
      }, timeoutMs)
    }

    child.stdout.on('data', (chunk) => {
      const detail = String(chunk).trim()
      if (detail) logEvent('info', `command:stdout:${index}`, detail)
    })

    child.stderr.on('data', (chunk) => {
      const detail = String(chunk).trim()
      if (detail) logEvent('warn', `command:stderr:${index}`, detail)
    })

    child.on('error', (error) => {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      abortState.currentChild = null
      reject(error)
    })

    child.on('close', (code, signal) => {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      abortState.currentChild = null

      if (signal) {
        logEvent('warn', `command:signal:${index}`, `Terminated by ${signal}: ${command}`)
      }

      if (code === 0) {
        logEvent('success', `command:exit:${index}`, `Exited 0: ${command}`)
      } else {
        logEvent('warn', `command:exit:${index}`, `Exited ${code}: ${command}`)
      }
      resolve({ code: code ?? 1, signal })
    })
  })
}

async function runCommands(rootDir, commands, dryRun, timeoutMs, abortState, commandRisks = []) {
  for (let i = 0; i < commands.length; i += 1) {
    if (abortState.cancelled) {
      throw new Error('Execution cancelled by signal')
    }

    const result = await runCommand(commands[i], rootDir, i + 1, dryRun, timeoutMs, abortState, commandRisks[i])
    if (result.code !== 0) {
      throw new Error(`Command failed (${result.code}): ${commands[i]}`)
    }
  }
}

async function main() {
  const { bundle: bundlePath, dryRun, timeoutMs } = parseArgs(process.argv.slice(2))
  const resolvedBundle = path.resolve(bundlePath)
  const abortState = {
    cancelled: false,
    currentChild: null
  }

  const onSigint = () => {
    abortState.cancelled = true
    logEvent('warn', 'sidecar:cancel', 'SIGINT received, stopping execution')
    if (abortState.currentChild) {
      abortState.currentChild.kill('SIGTERM')
    }
  }

  process.once('SIGINT', onSigint)

  logEvent('info', 'bundle:load', `Loading ${resolvedBundle}`)
  const bundle = await readBundle(resolvedBundle)

  logEvent('success', 'bundle:validated', `Bundle ${bundle.executionId} with ${bundle.files.length} files + ${bundle.commands.length} commands`)
  if (bundle.commandRisk?.summary) {
    const { high, medium, low } = bundle.commandRisk.summary
    logEvent('info', 'bundle:command-risk', `Risk summary high=${high} medium=${medium} low=${low}`)
  }
  if (timeoutMs > 0) {
    logEvent('info', 'sidecar:timeout', `Per-command timeout enabled: ${timeoutMs}ms`)
  }

  const rootDir = path.resolve(bundle.rootDir)
  await ensureRoot(rootDir, dryRun)
  await writeFiles(rootDir, bundle.files, dryRun)
  await runCommands(rootDir, bundle.commands, dryRun, timeoutMs, abortState, bundle.commandRisk?.commands || [])

  process.removeListener('SIGINT', onSigint)
  logEvent('success', 'sidecar:complete', `Execution ${bundle.executionId} complete`)
}

main().catch((error) => {
  logEvent('warn', 'sidecar:error', String(error?.message || error))
  process.exitCode = 1
})
