#!/usr/bin/env node
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

function parseArgs(argv) {
  const args = {
    bundle: '',
    out: '',
    dryRun: false,
    timeoutMs: 0
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--bundle') args.bundle = argv[i + 1] || ''
    if (token === '--out') args.out = argv[i + 1] || ''
    if (token === '--dry-run') args.dryRun = true
    if (token === '--timeout-ms') args.timeoutMs = Number(argv[i + 1] || 0)
  }

  if (!args.bundle) throw new Error('Missing --bundle <path-to-bundle.json>')
  if (!args.out) throw new Error('Missing --out <path-to-events.jsonl>')
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 0) throw new Error('--timeout-ms must be >= 0')

  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const outPath = path.resolve(args.out)
  await mkdir(path.dirname(outPath), { recursive: true })

  const childArgs = ['scripts/sidecar-worker.mjs', '--bundle', path.resolve(args.bundle)]
  if (args.dryRun) childArgs.push('--dry-run')
  if (args.timeoutMs > 0) childArgs.push('--timeout-ms', String(args.timeoutMs))

  const eventsOut = createWriteStream(outPath, { flags: 'w', encoding: 'utf8' })
  const child = spawn(process.execPath, childArgs, {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env
  })

  child.stdout.on('data', (chunk) => {
    const text = String(chunk)
    process.stdout.write(text)
    eventsOut.write(text)
  })

  child.stderr.on('data', (chunk) => {
    process.stderr.write(String(chunk))
  })

  child.on('close', (code) => {
    eventsOut.end()
    process.exitCode = code ?? 1
  })

  process.once('SIGINT', () => {
    child.kill('SIGINT')
  })
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
