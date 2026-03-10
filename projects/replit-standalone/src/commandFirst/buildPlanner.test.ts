import { describe, expect, it } from 'vitest'

import { generateBuildPlan } from './buildPlanner'
import { parseBuildIntent } from './intentParser'

describe('generateBuildPlan', () => {
  it('creates deterministic day-1 checklist for a complete intent', () => {
    const intent = parseBuildIntent(
      'I want to build this: a web portal for students with assignment tracking and due-date reminders, by Friday, under $500'
    )

    const first = generateBuildPlan(intent)
    const second = generateBuildPlan(intent)

    expect(second).toEqual(first)
    expect(first.day1Checklist.length).toBeGreaterThanOrEqual(5)
    expect(first.summary).toContain('web portal for students')
  })

  it('surfaces risks for unknown platform and missing audience', () => {
    const intent = parseBuildIntent('I want to build this: reminders and notifications without login')
    const plan = generateBuildPlan(intent)

    expect(plan.risks).toContain('Platform mismatch risk until platform is confirmed')
    expect(plan.risks).toContain('Audience unclear may cause wrong UX assumptions')
  })
})
