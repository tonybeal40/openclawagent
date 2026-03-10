import { describe, expect, it } from 'vitest'

import { createScaffoldExecution } from './scaffoldExecutor'
import { buildScaffoldBundle } from './scaffoldBundle'
import { generateBuildPlan } from './buildPlanner'
import { parseBuildIntent } from './intentParser'
import { createSidecarExecutionReport, sidecarExecutionReportToJson } from './sidecarBridge'

describe('sidecarBridge', () => {
  it('produces deterministic file/command operation plan from scaffold bundle', () => {
    const intent = parseBuildIntent('Build a web dashboard for sales reps with auth and analytics under $100.')
    const plan = generateBuildPlan(intent)
    const execution = createScaffoldExecution(intent, plan)
    const bundle = buildScaffoldBundle(execution)

    const report = createSidecarExecutionReport(bundle)

    expect(report.status).toBe('ready-to-run')
    expect(report.fileOps.length).toBe(bundle.files.length)
    expect(report.commandOps).toEqual(bundle.commands)
    expect(report.commandRisk.summary.low + report.commandRisk.summary.medium + report.commandRisk.summary.high).toBe(bundle.commands.length)
    expect(report.events[0]?.step).toBe('risk-summary')
    expect(report.events.some((entry) => entry.step.startsWith('write:'))).toBe(true)
    expect(report.events.some((entry) => entry.step.startsWith('command:'))).toBe(true)
  })

  it('serializes sidecar report as pretty JSON', () => {
    const intent = parseBuildIntent('Build a mobile todo app for parents with reminders.')
    const plan = generateBuildPlan(intent)
    const execution = createScaffoldExecution(intent, plan)
    const bundle = buildScaffoldBundle(execution)
    const report = createSidecarExecutionReport(bundle)

    const json = sidecarExecutionReportToJson(report)

    expect(json).toContain('"status": "ready-to-run"')
    expect(json).toContain(bundle.executionId)
    expect(json.split('\n').length).toBeGreaterThan(5)
  })
})
