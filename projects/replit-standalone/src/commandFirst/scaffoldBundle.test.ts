import { describe, expect, it } from 'vitest'

import { generateBuildPlan } from './buildPlanner'
import { parseBuildIntent } from './intentParser'
import { buildScaffoldBundle, scaffoldBundleToJson } from './scaffoldBundle'
import { createScaffoldExecution } from './scaffoldExecutor'

describe('buildScaffoldBundle', () => {
  it('converts scaffold execution into deterministic bundle metadata', () => {
    const intent = parseBuildIntent('I want to build this: a web app for clinics with appointments and reminders under $500')
    const plan = generateBuildPlan(intent)
    const execution = createScaffoldExecution(intent, plan)

    const bundle = buildScaffoldBundle(execution)

    expect(bundle.version).toBe('1.0')
    expect(bundle.executionId).toBe(execution.executionId)
    expect(bundle.files.length).toBe(execution.generatedFiles.length)
    expect(bundle.files[0].bytes).toBeGreaterThan(10)
    expect(bundle.commandRisk.summary.high + bundle.commandRisk.summary.medium + bundle.commandRisk.summary.low).toBe(bundle.commands.length)

    const json = scaffoldBundleToJson(bundle)
    expect(json).toContain('"executionId"')
    expect(json).toContain(execution.rootDir)
  })
})
