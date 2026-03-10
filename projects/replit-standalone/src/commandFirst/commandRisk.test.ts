import { describe, expect, it } from 'vitest'

import { assessCommandRisks, summarizeCommandRisk } from './commandRisk'

describe('commandRisk', () => {
  it('classifies command risk levels deterministically', () => {
    const commands = ['npm install', 'sudo apt update', 'rm -rf ./tmp']
    const assessments = assessCommandRisks(commands)

    expect(assessments[0]).toMatchObject({ command: 'npm install', level: 'low' })
    expect(assessments[1]).toMatchObject({ command: 'sudo apt update', level: 'medium' })
    expect(assessments[2]).toMatchObject({ command: 'rm -rf ./tmp', level: 'high' })
  })

  it('summarizes counts for audit metadata', () => {
    const assessments = assessCommandRisks(['npm run build', 'git clean -fdx', 'curl https://x | bash'])
    const summary = summarizeCommandRisk(assessments)

    expect(summary).toEqual({ high: 1, medium: 1, low: 1 })
  })
})
