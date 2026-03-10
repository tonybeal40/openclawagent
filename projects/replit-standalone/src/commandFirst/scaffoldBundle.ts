import type { ScaffoldExecution } from './scaffoldExecutor'
import { assessCommandRisks, summarizeCommandRisk, type CommandRiskAssessment } from './commandRisk'

export type ScaffoldBundle = {
  version: '1.0'
  executionId: string
  rootDir: string
  generatedAt: string
  commands: string[]
  commandRisk: {
    summary: {
      high: number
      medium: number
      low: number
    }
    commands: CommandRiskAssessment[]
  }
  files: Array<{
    path: string
    purpose: string
    bytes: number
    content: string
  }>
}

export function buildScaffoldBundle(execution: ScaffoldExecution): ScaffoldBundle {
  const commandRiskCommands = assessCommandRisks(execution.runbook)

  return {
    version: '1.0',
    executionId: execution.executionId,
    rootDir: execution.rootDir,
    generatedAt: execution.createdAt,
    commands: execution.runbook,
    commandRisk: {
      summary: summarizeCommandRisk(commandRiskCommands),
      commands: commandRiskCommands
    },
    files: execution.generatedFiles.map((file) => ({
      path: file.path,
      purpose: file.purpose,
      bytes: new TextEncoder().encode(file.content).length,
      content: file.content
    }))
  }
}

export function scaffoldBundleToJson(bundle: ScaffoldBundle): string {
  return JSON.stringify(bundle, null, 2)
}
