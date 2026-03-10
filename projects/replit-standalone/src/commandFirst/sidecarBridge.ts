import type { ScaffoldBundle } from './scaffoldBundle'
import { assessCommandRisks, summarizeCommandRisk, type CommandRiskAssessment } from './commandRisk'

export type SidecarLogLevel = 'info' | 'success' | 'warn'

export type SidecarEvent = {
  step: string
  level: SidecarLogLevel
  detail: string
}

export type SidecarExecutionReport = {
  executionId: string
  rootDir: string
  status: 'ready-to-run'
  fileOps: Array<{
    path: string
    bytes: number
  }>
  commandOps: string[]
  commandRisk: {
    summary: {
      high: number
      medium: number
      low: number
    }
    commands: CommandRiskAssessment[]
  }
  events: SidecarEvent[]
  nextAction: string
}

export function createSidecarExecutionReport(bundle: ScaffoldBundle): SidecarExecutionReport {
  const fileOps = bundle.files.map((file) => ({
    path: file.path,
    bytes: file.bytes
  }))

  const commandRiskCommands = assessCommandRisks(bundle.commands)
  const commandRiskSummary = summarizeCommandRisk(commandRiskCommands)

  const events: SidecarEvent[] = [
    {
      step: 'risk-summary',
      level: commandRiskSummary.high > 0 ? 'warn' : commandRiskSummary.medium > 0 ? 'info' : 'success',
      detail: `Command risk summary: high=${commandRiskSummary.high}, medium=${commandRiskSummary.medium}, low=${commandRiskSummary.low}`
    },
    {
      step: 'bundle-validated',
      level: 'success',
      detail: `Bundle ${bundle.executionId} accepted (${bundle.files.length} files, ${bundle.commands.length} commands).`
    },
    {
      step: 'filesystem-plan',
      level: 'info',
      detail: `Will create ${bundle.rootDir} and write ${bundle.files.length} files.`
    },
    ...bundle.files.map((file) => ({
      step: `write:${file.path}`,
      level: 'info' as const,
      detail: `Queue write ${file.path} (${file.bytes} bytes)`
    })),
    ...bundle.commands.map((command, index) => ({
      step: `command:${index + 1}`,
      level: 'warn' as const,
      detail: `Manual shell execution required: ${command}`
    }))
  ]

  return {
    executionId: bundle.executionId,
    rootDir: bundle.rootDir,
    status: 'ready-to-run',
    fileOps,
    commandOps: bundle.commands,
    commandRisk: {
      summary: commandRiskSummary,
      commands: commandRiskCommands
    },
    events,
    nextAction: 'Start `npm run sidecar:bridge`, POST /run with bundle path OR inline bundleJson + out, then subscribe to /events (SSE) directly from the UI timeline panel.'
  }
}

export function sidecarExecutionReportToJson(report: SidecarExecutionReport): string {
  return JSON.stringify(report, null, 2)
}
