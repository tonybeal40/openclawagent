import { describe, expect, it } from 'vitest'

import { parseBuildIntent } from './intentParser'

describe('parseBuildIntent determinism', () => {
  it('returns identical output for repeated parses of the same input', () => {
    const input = 'I want to build this: a web dashboard for landlords with rent tracking and maintenance requests'

    const first = parseBuildIntent(input)
    const second = parseBuildIntent(input)
    const third = parseBuildIntent(input)

    expect(second).toEqual(first)
    expect(third).toEqual(first)
  })

  it('returns missing fields in stable canonical order', () => {
    const input = 'idea'

    const intent = parseBuildIntent(input)

    expect(intent.missingFields).toEqual(['goal', 'platform', 'audience', 'keyFeatures'])
  })
})

describe('parseBuildIntent constraints extraction', () => {
  it('captures common timeline/budget/scope constraints deterministically', () => {
    const input = 'I want to build this: a web app for students with progress tracking, must support export, under $500, by Friday, without login'

    const intent = parseBuildIntent(input)

    expect(intent.constraints).toEqual([
      'without login',
      'must support export',
      'under $500',
      'by Friday'
    ])
  })
})

describe('parseBuildIntent confidence and missing-field behavior', () => {
  it('produces high confidence when no fields are missing', () => {
    const input = 'I want to build this: a web portal for students with assignment tracking and due-date reminders'

    const intent = parseBuildIntent(input)

    expect(intent.missingFields).toEqual([])
    expect(intent.confidence).toBe(0.95)
  })

  it('drops confidence as fields are missing (2 missing => 0.64)', () => {
    const input = 'I want to build this: a web dashboard for clinics'

    const intent = parseBuildIntent(input)

    expect(intent.missingFields).toEqual(['keyFeatures'])
    expect(intent.confidence).toBe(0.82)

    const inputTwoMissing = 'I want to build this: reminders and notifications'
    const intentTwoMissing = parseBuildIntent(inputTwoMissing)
    expect(intentTwoMissing.missingFields).toEqual(['platform', 'audience'])
    expect(intentTwoMissing.confidence).toBe(0.64)
  })

  it('keeps very sparse prompts low-confidence (4 missing => 0.28)', () => {
    const intent = parseBuildIntent('todo')

    expect(intent.missingFields).toEqual(['goal', 'platform', 'audience', 'keyFeatures'])
    expect(intent.confidence).toBe(0.28)
  })
})
