import type { BuildPlan } from './buildPlanner'
import type { BuildIntent } from './types'

export type ScaffoldStep = {
  title: string
  status: 'pending' | 'ready' | 'generated'
  command: string
}

export type GeneratedFile = {
  path: string
  content: string
  purpose: string
}

export type ScaffoldExecution = {
  executionId: string
  createdAt: string
  status: 'stub-ready' | 'files-generated'
  projectName: string
  rootDir: string
  summary: string
  steps: ScaffoldStep[]
  runbook: string[]
  nextCommand: string
  warnings: string[]
  generatedFiles: GeneratedFile[]
  statusTimeline: string[]
}

function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return cleaned || 'new-app'
}

function platformStarterCommand(platform: BuildIntent['platform'], projectName: string): string {
  switch (platform) {
    case 'mobile':
      return `npm create expo@latest ${projectName}`
    case 'desktop':
      return `npm create vite@latest ${projectName} -- --template react-ts && cd ${projectName} && npm i electron`
    case 'api':
      return `npm create hono@latest ${projectName}`
    case 'web':
    case 'unknown':
    default:
      return `npm create vite@latest ${projectName} -- --template react-ts`
  }
}

function createReadme(intent: BuildIntent, plan: BuildPlan): string {
  return `# ${intent.goal}\n\n## Goal\n${intent.goal}\n\n## Platform\n${intent.platform}\n\n## Day-1 checklist\n${plan.day1Checklist.map((item) => `- ${item}`).join('\n')}\n\n## Constraints\n${intent.constraints.length ? intent.constraints.map((c) => `- ${c}`).join('\n') : '- none captured yet'}\n\n## Next step\n- Start with the first execution task and validate with a smoke test.\n`
}

function createGeneratedFiles(rootDir: string, intent: BuildIntent, plan: BuildPlan): GeneratedFile[] {
  const planLines = plan.executionTasks
    .map((task, idx) => `${idx + 1}. ${task.title}\n   - why: ${task.reason}\n   - done when: ${task.doneDefinition}`)
    .join('\n\n')

  return [
    {
      path: `${rootDir}/README.md`,
      purpose: 'Operator-facing overview and day-1 runbook',
      content: createReadme(intent, plan)
    },
    {
      path: `${rootDir}/docs/BUILD_PLAN.md`,
      purpose: 'Deterministic execution plan generated from parsed intent',
      content: `# Build plan\n\n${plan.summary}\n\n## Tasks\n${planLines}\n\n## Risks\n${plan.risks.length ? plan.risks.map((risk) => `- ${risk}`).join('\n') : '- none'}\n`
    },
    {
      path: `${rootDir}/src/app.config.json`,
      purpose: 'Starter config derived from intent for later automation',
      content: JSON.stringify(
        {
          goal: intent.goal,
          platform: intent.platform,
          audience: intent.audience ?? null,
          keyFeatures: intent.keyFeatures,
          constraints: intent.constraints,
          generatedAt: new Date().toISOString()
        },
        null,
        2
      )
    }
  ]
}

export function createScaffoldExecution(intent: BuildIntent, plan: BuildPlan): ScaffoldExecution {
  const projectName = slugify(intent.goal).slice(0, 40)
  const rootDir = `./studio/projects/${projectName}`
  const starter = platformStarterCommand(intent.platform, projectName)

  const warnings = [
    intent.platform === 'unknown' ? 'Platform is still unknown. Stub defaults to web scaffold.' : '',
    intent.missingFields.length > 0 ? `Clarifiers pending: ${intent.missingFields.join(', ')}` : '',
    intent.constraints.length === 0 ? 'No constraints detected. Confirm scope before coding.' : ''
  ].filter(Boolean)

  const runbook = [`mkdir -p ${rootDir}`, `cd ${rootDir}`, starter, 'npm install', 'npm run dev']
  const generatedFiles = createGeneratedFiles(rootDir, intent, plan)

  return {
    executionId: `stub-${projectName}`,
    createdAt: new Date().toISOString(),
    status: 'files-generated',
    projectName,
    rootDir,
    summary: `Scaffold package ready for ${intent.goal} (${plan.executionTasks.length} execution tasks queued)`,
    steps: [
      { title: 'Create project directory', status: 'ready', command: `mkdir -p ${rootDir}` },
      { title: 'Generate starter app', status: 'ready', command: starter },
      { title: 'Generate starter docs/config', status: 'generated', command: 'write README.md + BUILD_PLAN.md + src/app.config.json' },
      { title: 'Install dependencies', status: 'pending', command: 'npm install' },
      { title: 'Run local dev server', status: 'pending', command: 'npm run dev' }
    ],
    runbook,
    nextCommand: runbook[0],
    warnings,
    generatedFiles,
    statusTimeline: [
      'Intent accepted',
      'Build plan generated',
      `Scaffold package generated (${generatedFiles.length} files)`,
      'Awaiting local shell execution for npm install/dev'
    ]
  }
}
