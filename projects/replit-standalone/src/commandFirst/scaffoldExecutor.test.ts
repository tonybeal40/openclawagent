import { describe, expect, it } from 'vitest'

import { generateBuildPlan } from './buildPlanner'
import { parseBuildIntent } from './intentParser'
import { createScaffoldExecution } from './scaffoldExecutor'

describe('createScaffoldExecution', () => {
  it('generates deterministic project metadata and runbook', () => {
    const intent = parseBuildIntent('I want to build this: a web app for clinics with appointments and reminders under $500')
    const plan = generateBuildPlan(intent)

    const execution = createScaffoldExecution(intent, plan)

    expect(execution.status).toBe('files-generated')
    expect(execution.projectName).toContain('a-web-app-for-clinics')
    expect(execution.runbook[0]).toContain('mkdir -p ./studio/projects/')
    expect(execution.runbook[2]).toContain('npm create vite@latest')
    expect(execution.generatedFiles.length).toBe(3)
    expect(execution.generatedFiles.some((file) => file.path.endsWith('/README.md'))).toBe(true)
    expect(execution.warnings).toEqual([])
  })

  it('surfaces warnings when clarifiers are missing', () => {
    const intent = parseBuildIntent('build something cool')
    const plan = generateBuildPlan(intent)

    const execution = createScaffoldExecution(intent, plan)

    expect(execution.warnings.some((warning) => warning.includes('Platform is still unknown'))).toBe(true)
    expect(execution.warnings.some((warning) => warning.includes('Clarifiers pending'))).toBe(true)
  })
})
