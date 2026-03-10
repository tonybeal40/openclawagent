export type CommandRiskLevel = 'high' | 'medium' | 'low'

export type CommandRiskRule = {
  pattern: RegExp
  level: CommandRiskLevel
  reason: string
}

export type CommandRiskAssessment = {
  command: string
  level: CommandRiskLevel
  reason: string
}

const COMMAND_RISK_RULES: CommandRiskRule[] = [
  { pattern: /\brm\s+-rf\b/i, level: 'high', reason: 'recursive force delete' },
  { pattern: /\brm\s+-r\b/i, level: 'high', reason: 'recursive delete' },
  { pattern: /\bdel\s+\/f\b/i, level: 'high', reason: 'forced file delete' },
  { pattern: /\brmdir\s+\/s\b/i, level: 'high', reason: 'recursive directory delete' },
  { pattern: /\bmkfs\b/i, level: 'high', reason: 'filesystem format command' },
  { pattern: /\bformat\b/i, level: 'high', reason: 'disk format command' },
  { pattern: /\bgit\s+clean\s+-fdx\b/i, level: 'high', reason: 'destructive git clean' },
  { pattern: /\bshutdown\b/i, level: 'high', reason: 'system shutdown command' },
  { pattern: /\breboot\b/i, level: 'high', reason: 'system reboot command' },
  { pattern: />\s*\//, level: 'high', reason: 'redirect to root path' },
  { pattern: /\bsudo\b/i, level: 'medium', reason: 'elevated privilege request' },
  { pattern: /\b(chmod\s+777|chown\s+-R)\b/i, level: 'medium', reason: 'broad permission change' },
  { pattern: /\b(curl|wget)\b[^\n]*\|[^\n]*\b(sh|bash|zsh|pwsh|powershell)\b/i, level: 'medium', reason: 'remote script pipe execution' }
]

export function classifyCommandRisk(command: string): Omit<CommandRiskAssessment, 'command'> {
  const match = COMMAND_RISK_RULES.find((rule) => rule.pattern.test(command))
  if (!match) return { level: 'low', reason: 'no destructive pattern detected' }
  return { level: match.level, reason: match.reason }
}

export function assessCommandRisks(commands: string[]): CommandRiskAssessment[] {
  return commands.map((command) => ({ command, ...classifyCommandRisk(command) }))
}

export function summarizeCommandRisk(assessments: CommandRiskAssessment[]) {
  return assessments.reduce(
    (summary, entry) => {
      summary[entry.level] += 1
      return summary
    },
    { high: 0, medium: 0, low: 0 }
  )
}
