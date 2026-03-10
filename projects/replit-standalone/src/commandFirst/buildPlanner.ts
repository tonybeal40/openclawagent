import type { BuildIntent } from './types'

export type BuildPlanTask = {
  title: string
  reason: string
  doneDefinition: string
}

export type BuildPlan = {
  summary: string
  assumptions: string[]
  day1Checklist: string[]
  executionTasks: BuildPlanTask[]
  risks: string[]
}

function toTitleCase(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function platformStarter(platform: BuildIntent['platform']): string {
  switch (platform) {
    case 'web':
      return 'Scaffold Vite React app with routing + base layout'
    case 'mobile':
      return 'Scaffold Expo React Native app shell with core screens'
    case 'desktop':
      return 'Scaffold Electron + React desktop shell with local storage'
    case 'api':
      return 'Scaffold Node API service with typed routes and health check'
    default:
      return 'Scaffold web-first starter and confirm final platform'
  }
}

export function generateBuildPlan(intent: BuildIntent): BuildPlan {
  const topFeatures = intent.keyFeatures.slice(0, 3)
  const assumptions = [
    intent.audience ? `Primary audience: ${intent.audience}` : 'Audience still needs confirmation',
    intent.platform !== 'unknown' ? `Target platform: ${intent.platform}` : 'Platform not locked yet (defaulting web-first)',
    ...intent.constraints.map((constraint) => `Constraint: ${constraint}`)
  ]

  const day1Checklist = [
    'Lock v1 scope (single user journey + success metric)',
    platformStarter(intent.platform),
    'Create repo structure + environment setup instructions',
    topFeatures.length ? `Stub first feature flow: ${topFeatures[0]}` : 'Stub first feature flow from clarified requirements',
    'Add smoke test + README run instructions'
  ]

  const executionTasks: BuildPlanTask[] = [
    {
      title: 'Clarify open requirements',
      reason: intent.missingFields.length
        ? `Missing fields detected: ${intent.missingFields.join(', ')}`
        : 'Intent appears complete enough for implementation',
      doneDefinition: 'All high-importance clarifier questions answered in writing'
    },
    {
      title: 'Generate scaffold + baseline architecture',
      reason: `Align codebase structure to goal: ${toTitleCase(intent.goal)}`,
      doneDefinition: 'Project runs locally and contains starter modules for v1 flow'
    },
    {
      title: 'Implement v1 feature slice',
      reason: topFeatures.length
        ? `Ship thin slice covering: ${topFeatures.join(', ')}`
        : 'Ship one thin slice from clarified feature list',
      doneDefinition: 'Feature demo works end-to-end with placeholder data'
    },
    {
      title: 'Harden + handoff',
      reason: 'Make the build loop repeatable and safe for next shift',
      doneDefinition: 'Smoke tests pass, docs updated, and next-step backlog captured'
    }
  ]

  const risks = [
    intent.platform === 'unknown' ? 'Platform mismatch risk until platform is confirmed' : '',
    intent.missingFields.includes('audience') ? 'Audience unclear may cause wrong UX assumptions' : '',
    intent.constraints.length === 0 ? 'No explicit constraints captured; risk of scope creep' : ''
  ].filter(Boolean)

  return {
    summary: `Day-1 execution plan for: ${intent.goal}`,
    assumptions,
    day1Checklist,
    executionTasks,
    risks
  }
}
