import type { BuildIntent, BuildPlatform, ClarifierQuestion } from './types'

const FEATURE_SPLIT_REGEX = /,| and | with /gi
const MISSING_FIELD_ORDER = ['goal', 'platform', 'audience', 'keyFeatures'] as const

function detectPlatform(input: string): BuildPlatform {
  const normalized = input.toLowerCase()
  if (normalized.includes('mobile') || normalized.includes('ios') || normalized.includes('android')) return 'mobile'
  if (normalized.includes('desktop')) return 'desktop'
  if (normalized.includes('api') || normalized.includes('backend')) return 'api'
  if (normalized.includes('web') || normalized.includes('dashboard') || normalized.includes('portal') || normalized.includes('site')) return 'web'
  return 'unknown'
}

function extractGoal(input: string): string {
  const normalized = input.replace(/^i want to build this:?/i, '').trim()
  return normalized.length > 0 ? normalized : input.trim()
}

function extractFeatures(goal: string): string[] {
  const segments = goal
    .split(FEATURE_SPLIT_REGEX)
    .map((part) => part.trim())
    .filter(Boolean)

  if (segments.length <= 1) return []

  const deduped = new Set<string>()
  for (const segment of segments.slice(1, 6)) {
    if (!deduped.has(segment)) deduped.add(segment)
  }

  return Array.from(deduped)
}

function inferAudience(goal: string): string | undefined {
  const lowered = goal.toLowerCase()
  const audienceHints = ['for ', 'for teams', 'for students', 'for parents', 'for clinics', 'for landlords']
  const hit = audienceHints.find((hint) => lowered.includes(hint))
  if (!hit) return undefined

  const idx = lowered.indexOf('for ')
  if (idx === -1) return undefined
  return goal.slice(idx + 4).trim()
}

function extractConstraints(input: string): string[] {
  const lowered = input.toLowerCase()
  const constraints: string[] = []

  const patterns = [
    /\bwithout\s+([^,.]+)[,.]?/gi,
    /\bmust\s+([^,.]+)[,.]?/gi,
    /\bunder\s+\$?([\d,]+(?:\s*(?:usd|dollars))?)/gi,
    /\bby\s+((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|q[1-4]))/gi
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(input)) !== null) {
      const value = match[0].trim().replace(/,$/, '')
      if (value && !constraints.includes(value)) constraints.push(value)
    }
  }

  if (lowered.includes('no login') && !constraints.includes('no login')) {
    constraints.push('no login')
  }

  return constraints.slice(0, 5)
}

function calculateConfidence(missingFields: string[]): number {
  const rawScore = Math.max(0.2, Math.min(0.95, 1 - missingFields.length * 0.18))
  return Number(rawScore.toFixed(2))
}

export function parseBuildIntent(input: string): BuildIntent {
  const goal = extractGoal(input)
  const platform = detectPlatform(input)
  const keyFeatures = extractFeatures(goal)
  const audience = inferAudience(goal)
  const constraints = extractConstraints(input)

  const missingFieldSet = new Set<string>()
  if (!goal || goal.length < 12) missingFieldSet.add('goal')
  if (platform === 'unknown') missingFieldSet.add('platform')
  if (!audience) missingFieldSet.add('audience')
  if (keyFeatures.length === 0) missingFieldSet.add('keyFeatures')

  const missingFields = MISSING_FIELD_ORDER.filter((field) => missingFieldSet.has(field))

  return {
    rawInput: input,
    goal,
    platform,
    audience,
    keyFeatures,
    constraints,
    missingFields,
    confidence: calculateConfidence(missingFields)
  }
}

export function getClarifierQuestions(intent: BuildIntent): ClarifierQuestion[] {
  return intent.missingFields.map((field) => {
    switch (field) {
      case 'platform':
        return {
          field,
          importance: 'high',
          question: 'Should this be a web app, mobile app, desktop tool, or API-first service?'
        }
      case 'audience':
        return {
          field,
          importance: 'high',
          question: 'Who is this for (e.g., customers, internal team, students, patients)?'
        }
      case 'keyFeatures':
        return {
          field,
          importance: 'medium',
          question: 'What are the top 2–3 must-have features for v1?'
        }
      default:
        return {
          field,
          importance: 'medium',
          question: 'What outcome should this app deliver in its first version?'
        }
    }
  })
}
