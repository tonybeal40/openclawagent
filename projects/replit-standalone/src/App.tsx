import { useMemo, useState } from 'react'

import './App.css';
import { parseBuildIntent } from './commandFirst/intentParser'
import { starterPrompts } from './commandFirst/starterPrompts'
import { CommandFirstComposer } from './commandFirst/components/CommandFirstComposer'
import { IntentPreviewCard } from './commandFirst/components/IntentPreviewCard'
import { BuildPlanCard } from './commandFirst/components/BuildPlanCard'
import { generateBuildPlan } from './commandFirst/buildPlanner'
import { createScaffoldExecution } from './commandFirst/scaffoldExecutor'
import { buildScaffoldBundle, scaffoldBundleToJson } from './commandFirst/scaffoldBundle'
import { createSidecarExecutionReport, sidecarExecutionReportToJson } from './commandFirst/sidecarBridge'
import type { BuildPlan } from './commandFirst/buildPlanner'
import type { ScaffoldExecution } from './commandFirst/scaffoldExecutor'

type NavItem = {
  label: string
  icon: IconName
  accent?: boolean
  active?: boolean
  external?: boolean
}

const navSections = [
  { title: 'Create', items: [
    { label: 'Create App', icon: 'plus', accent: true },
    { label: 'Import code or design', icon: 'upload' }
  ] },
  { title: 'Workspace', items: [
    { label: 'Home', icon: 'home' },
    { label: 'Apps', icon: 'apps', active: true },
    { label: 'Published apps', icon: 'globe' },
    { label: 'Integrations', icon: 'layers' },
    { label: 'Usage', icon: 'chart' },
    { label: 'Developer Frameworks', icon: 'spark' }
  ] },
  { title: 'Resources', items: [
    { label: 'Learn', icon: 'book', external: true },
    { label: 'Documentation', icon: 'doc', external: true }
  ] }
];

const introCopy = {
  headline: 'Replit is the fastest way to go from idea to app.',
  body: 'Create and publish full-stack apps from your browser with AI at your fingertipsâ€”no installation or setup required. Replit configures the environment instantly so you can focus on building, not wrangling toolchains.',
  checklist: [
    'Coding, publishing, and collaboration tools in one interface',
    'Zero-install browser workspace with AI assistance',
    'Instant start for beginners and seasoned devs alike'
  ]
};

const quickstartCreate = [
  { title: 'Build your first app', duration: '5 min', description: 'Let AI wire up your starter app and walk you through the basics.' },
  { title: 'Remix an existing app', duration: '1 min', description: 'Fork a community app and customize the parts you care about.' }
];

const quickstartImport = [
  { title: 'Import from GitHub', duration: '2 min', description: 'Pull an existing repo and keep commits flowing locally.' },
  { title: 'Import from Figma', duration: '3 min', description: 'Convert company-styled Figma mocks into React components.' },
  { title: 'Import from Bolt', duration: '4 min', description: 'Migrate Bolt projects with the agent watching for compatibility.' },
  { title: 'Import from Lovable', duration: '4 min', description: 'Drop Lovable archives in and keep iterating without the cloud.' }
];

const workspaceFeatures = [
  'Real-time preview of your app',
  'Publish in minutes',
  'Browser-native dev environment (zero install)',
  'Full-featured code editor',
  'Mobile app for building anywhere',
  'AI-assisted creation + debugging',
  'Version control integration',
  'Team collaboration tools'
];

const aiCapabilities = [
  'Generate full apps from natural language briefs',
  'Inline code suggestions + autocomplete',
  'Automated error detection and fixes',
  'Documentation drafts for every deliverable'
];

const sharePillars = [
  'Publish to the LAN or cloud in clicks',
  'Database integration + hosting',
  'Custom domains with TLS baked in'
];

const resourceLinks = [
  'Starter Plan overview',
  'Workspace feature guide',
  'Replit Agent capabilities',
  'Sharing + publishing docs',
  'Download the mobile app'
];

const billingCopy = {
  headline: 'Billing that stays simple and predictable',
  subhead: 'Core plan shifts to the new Pro plan on Feb 20, 2026â€”credits, alerts, and dashboards already mirrored here.',
  plans: [
    { name: 'Starter', detail: 'Limited daily Agent + monthly cloud credits' },
    { name: 'Core', detail: '$25 in monthly credits for solo devs' },
    { name: 'Teams', detail: '$40 / user / month with shared tooling' }
  ],
  highlights: [
    'Credits cover Agent, publishing, DB ops, and more before any extra spend',
    'Credit packs + Managing Your Spend hooks ready for larger workloads',
    'Smart alerts + budgets stop runaway costs',
    'Usage dashboard + invoices give per-service visibility'
  ],
  tools: [
    { title: 'Account billing page', description: 'Plan details, payment methods, alerts, and budgets in one view.' },
    { title: 'Usage dashboard', description: 'Track consumption by service + stay within the monthly allowance.' },
    { title: 'Invoices', description: 'Download history for accounting and reimbursement.' }
  ],
  useCases: [
    { title: 'Protect your budget when apps spike', steps: [
      'Create usage alerts for custom thresholds',
      'Set budget caps to pause when the ceiling hits',
      'Raise the cap + resume service when youâ€™re ready'
    ] },
    { title: 'Track + optimize dev costs', steps: [
      'Pull invoice exports for finance + ops',
      'Compare usage trends to find optimization wins',
      'Document plan changes ahead of the Feb 20 switch'
    ] }
  ],
  nextLinks: [
    'Starter Plan',
    'Pricing plans',
    'AI Billing',
    'Publishing & Database Billing',
    'Replit Teams'
  ]
};

const docsFlyout = {
  title: 'Docs & Tutorials',
  shortcuts: ['Docs', 'Tutorials', 'Trust & Billing', 'Enterprise', 'Changelog', 'Learn'],
  searchHint: 'Start Building â€¢ Searchâ€¦ (Ctrl K)',
  vibeLinks: [
    'Vibe coding & prompting',
    'Efficient prompting',
    'How to vibe code effectively',
    'Agent Design vs. App Mode',
    'Plan vs. Build Mode'
  ],
  buildLinks: [
    'Notion-powered website',
    'Launch a mobile app',
    'Mobile app troubleshooting',
    'Claude Agent SDK on Replit'
  ],
  securityLinks: [
    'Built-in security features',
    'Security checklist',
    'MCP in 3 minutes',
    'Share a database across apps',
    'Add a SQL database',
    'App Storage in Python',
    'App Storage in JavaScript'
  ]
};

const orgSetup = {
  title: 'Set up your organization',
  summary: 'Tell Replit who you are, what youâ€™re building, and who to bill before unlocking Teams â†’ Pro features.',
  fields: ['Organization name', 'Intended use of Replit', 'Optional build notes', 'Billing email (tonybeal40@gmail.com)', 'Invite team members'],
  planHighlights: [
    'Teams â†’ Pro upgrade on Feb 20, 2026 (no cost until then)',
    'Pro renews at $100/mo with unlimited apps + editors',
    '$40/mo usage credits included (annual grants upfront)',
    '5Ã— storage, 10Ã— compute power',
    'Claude Sonnet 4 + GPT-4o access',
    'Company Profiles + role-based permissions'
  ],
  testimonial: { quote: 'We use Replit internally to prototype new Assistants before pushing them to production... it lets us deploy fast and verify features.', author: 'Ismail Pelaseyet, Co-founder @ SUPERAGENT.SH' }
};

const enterprisePanel = {
  title: 'Enterprise hub',
  shortcuts: ['Overview', 'Information Security', 'Security Center', 'Connectors', 'IAM', 'Projects', 'Profiles', 'Privacy Settings', 'Billing', 'Seats', 'Analytics', 'Cancellation'],
  description: 'Mirror of the Enterprise docs surface so we can plug in trust/billing dashboards next.',
  columns: [
    { heading: 'Trust & Security', items: ['Information Security', 'Security Center', 'Privacy Settings'] },
    { heading: 'Admin & Identity', items: ['Connectors', 'Identity & Access Management', 'Projects', 'Profiles & collaboration'] },
    { heading: 'Billing & Operations', items: ['Billing for Enterprise', 'Managing Seats', 'Analytics Dashboard', 'Cancellation workflows'] }
  ]
};

const enterpriseCopy = {
  headline: 'Teams & Enterprise plans',
  subhead: 'Have your org build production-ready customer apps and tools faster. Teams sunsets into Pro on Feb 20, 2026.',
  plans: [
    { name: 'Teams', price: '$40 / user / month', detail: 'Shared credits, private deployments, viewer seats, RBAC.' },
    { name: 'Enterprise', price: 'Custom', detail: 'SOC-2, SSO/SAML, SCIM, larger VMs, dedicated support.' }
  ],
  teamsFeatures: [
    'Pooled credits across projects',
    'Private deployments + viewer seats',
    'Role-Based Access Control',
    'Stakeholder access to private apps'
  ],
  enterpriseFeatures: [
    'SOC-2 platform with SSO/SAML + SCIM provisioning',
    'Centralized admin dashboard + budget controls',
    'Security Center with CVE tracking + SBOM export',
    'Custom integration permissions & larger deployment VMs',
    'Enterprise data connectors (Snowflake, BigQuery, Databricks)',
    'Dedicated support + unlimited viewer seats'
  ],
  resources: ['Identity & Access', 'Security & Compliance', 'Project Management Guide', 'Teams Billing Information'],
  useCases: [
    'Enterprise apps with compliance requirements',
    'Internal business tooling with managed access',
    'Rapid prototyping with instant enterprise-grade environments'
  ]
};

const projectsCopy = {
  headline: 'Projects (beta) â€” retiring March 3, 2026',
  alert: 'Projects will be removed on Mar 3, 2026. Existing apps remain accessible, but merging between forks goes away. No action needed yet.',
  summary: 'Projects let Teams users fork apps, work in isolation, and merge via a git-backed dashboard without touching the CLI. Perfect for coordinating feature forks.',
  advantages: [
    'Everyone gets their own fork for feature work',
    'Git history + branching/merging without leaving Replit',
    'Rollback to known-good versions when something breaks'
  ],
  workflow: [
    'Fork the main Replit App to start a feature branch',
    'Make changes in your fork, preview via the Project tool',
    'Merge changes back into the main app when ready'
  ],
  dashboard: [
    'See the main app, all forks, and whoâ€™s online',
    'Switch between forks or create new ones from the workspace header',
    'Access settings + transfer apps directly from the sidebar'
  ],
  steps: [
    { title: 'Fork from main', detail: 'Create a project fork from the main app before starting feature work.' },
    { title: 'Ship in isolation', detail: 'Iterate in your fork with previews and checkpoints while main stays stable.' },
    { title: 'Merge back safely', detail: 'Resolve conflicts and merge changes into main once QA passes.' }
  ],
  links: ['Transfer App to Teams', 'Conflict Resolution in Projects', 'Project Dashboard basics']
};

const conflictsCopy = {
  headline: 'Resolve merge conflicts',
  overview: 'When two forks touch the same file, the Project tool blocks the merge and asks you to resolve conflicts manually.',
  steps: [
    'Attempt to merge â†’ hit the â€œresolve manuallyâ€ warning.',
    'Conflict markers appear inside the file (<<<<<<< HEAD / ======= / >>>>>>> fork).',
    'Edit out the markers and keep the correct code.',
    'Click â€œComplete merge and commitâ€ to finish the resolution.'
  ],
  notes: [
    'Markers between <<<<<<< HEAD and ======= are main-app changes.',
    'Markers between ======= and >>>>>>> are your fork changes.',
    'You can blend both sections or keep one entirely.',
    'After the commit, merging back into main succeeds.'
  ]
};

const learnCopy = {
  headline: 'Replit Learn',
  welcome: 'Set yourself up for success on your vibe coding journey. These tracks teach you how to communicate with AI, shape ideas, and ship real apps.',
  modules: [
    { title: 'AI foundations', duration: '30 minutes', lessons: '7 lessons', status: 'Available' },
    { title: 'Intro to Replit', duration: '45 minutes', lessons: '5 lessons', status: 'Coming soon' },
    { title: 'Advanced vibes', duration: '30 minutes', lessons: '5 lessons', status: 'Coming soon' },
    { title: 'Replit at work', duration: '30 minutes', lessons: '5 lessons', status: 'Coming soon' },
    { title: 'Built with â¤ï¸ by our team', duration: '30 minutes', lessons: '5 lessons', status: 'Available' }
  ]
};

const quickActions = [
  { title: 'Start LAN dev server', description: 'Bind Vite to 0.0.0.0 so phones + tablets on the network can open a live preview. Auto restarts when files change.', pill: 'npm run dev:lan', details: 'Ports: 4173 (vite) + 4174 (storybook reserved). Strict port + HTTPS toggle ready.' },
  { title: 'Scaffold a new template', description: 'Spin up React, Vanilla HTML, or API starters with company palette + TonyOS lint rules in under 3 seconds.', pill: 'scripts/scaffold --type <template>', details: 'Outputs to /studio/projects/<name> with git init + README instructions.' },
  { title: 'Archive + import prep', description: 'Phase 2 needs a clean archive rail. Map Google Drive drops + local zips here so imports stay deterministic.', pill: 'imports/queue.json', details: 'Next: watcher service + UI review bucket before enabling publish.' }
];

const frameworks = [
  { name: 'Next.js + Turbo', description: 'React full-stack with file-based routing, API handlers, and image optimization out of the box.', tags: ['React', 'SSR', 'API'], accent: 'blue' },
  { name: 'Astro + Tailwind', description: 'Content-heavy marketing sites with island hydration and the company palette baked in.', tags: ['Content', 'MDX', 'Fast'], accent: 'purple' },
  { name: 'Vanilla HTML sprint', description: 'Single-index apps for ultra-fast experiments. Ships with ESBuild + lightning deploy script.', tags: ['HTML', 'ESBuild', '1-file'], accent: 'orange' },
  { name: 'Node API + Hono', description: 'Minimal API worker that proxies to LAN dev servers now and Netlify Edge later.', tags: ['API', 'Edge'], accent: 'teal' },
  { name: 'SvelteKit canvas', description: 'Lightweight interactive dashboards for prototypes that need reactivity without the React tax.', tags: ['Svelte', 'SPA'], accent: 'pink' },
  { name: 'Datasette notebook', description: 'SQLite-first analytics surface with CSV/Parquet imports and shareable queries.', tags: ['Data', 'SQLite'], accent: 'lime' }
];

const workspaces = [
  { name: 'marketing-genius', summary: 'Calendar rail done. Phase 2 = imports + archive automation.', stack: 'React + TypeScript + Supabase', updated: 'Updated 2 minutes ago', status: 'Ready', tags: ['Week view', 'company kit'] },
  { name: 'dinner-app', summary: 'Legacy Replit project waiting on template migration.', stack: 'Next.js 14', updated: 'Updated yesterday', status: 'Needs import', tags: ['Recipes', 'Offline-first'] },
  { name: 'video-frame-reader', summary: 'Swing analyzer assets recovered from Drive. Needs studio wiring.', stack: 'Python + OpenCV', updated: 'Updated 12 hours ago', status: 'Ingesting', tags: ['AI assist', 'Media'] }
];

type PanePreview = { title: string; description: string; todo: string; icon: IconName }
const panePreviews: PanePreview[] = [
  { title: 'File Tree', description: 'Live workspace view with git status, hidden dirs, and template badges.', todo: 'Connect to fs watcher + Git plumbing', icon: 'files' },
  { title: 'Live Preview', description: 'Embeds LAN dev server with QR pairing + responsive frames.', todo: 'Wire iframe to vite websocket + fallback screenshot', icon: 'preview' },
  { title: 'Console & Tasks', description: 'Unified log stream for npm scripts, scaffolds, and build hooks.', todo: 'Stream child_process output + persist 200 lines', icon: 'terminal' }
]

type IconName =
  | 'plus'
  | 'upload'
  | 'home'
  | 'apps'
  | 'globe'
  | 'layers'
  | 'chart'
  | 'spark'
  | 'book'
  | 'doc'
  | 'search'
  | 'server'
  | 'play'
  | 'files'
  | 'preview'
  | 'terminal'
  | 'server'
  | 'play'

const Icon = ({ name }: { name: IconName }) => {
  switch (name) {
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5a1 1 0 0 1 2 0v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V5Z" />
        </svg>
      )
    case 'upload':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a1 1 0 0 1 1 1v9.17l2.59-2.58a1 1 0 0 1 1.41 1.41l-4.3 4.29a1 1 0 0 1-1.4 0l-4.3-4.3a1 1 0 1 1 1.41-1.41L11 13.17V4a1 1 0 0 1 1-1Z" />
          <path d="M5 20a2 2 0 0 1-2-2v-3a1 1 0 1 1 2 0v3h14v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H5Z" />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m4.3 11.3 6.9-6.9a1.2 1.2 0 0 1 1.6 0l6.9 6.9a1 1 0 0 1-.7 1.7H18v7a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1v-4h-3v4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7H5a1 1 0 0 1-.7-1.7Z" />
        </svg>
      )
    case 'apps':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 3h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 10h4a1 1 0 0 1 1 1v7H3v-7a1 1 0 0 1 1-1Zm11-9h5a1 1 0 0 1 1 1v7h-7V5a1 1 0 0 1 1-1Zm0 11h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
        </svg>
      )
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 2a7 7 0 0 0-1.9.27c.6.83 1.07 2.01 1.32 3.33H15a7.02 7.02 0 0 0-3-3.6Zm-3.42.68A7.01 7.01 0 0 0 5.05 11h3.95c.06-1.35.33-2.63.79-3.73l-.21-.26Zm6.96 3.93c.15.57.24 1.18.27 1.82h4.14a7 7 0 0 0-3.2-4.66 7.96 7.96 0 0 0-1.21 2.84ZM9 13H5.05a7 7 0 0 0 3.52 4.29 8.28 8.28 0 0 1-.57-2.04Zm6.13 0a8.3 8.3 0 0 1-.57 2.04A7 7 0 0 0 18.95 13h-3.82ZM11.1 5.07c-.96.79-1.63 2.8-1.73 5.93h3.27c-.1-3.13-.77-5.14-1.54-5.93Zm1.54 8h-3.27c.1 3.13.77 5.14 1.54 5.93.96-.79 1.63-2.8 1.73-5.93Z" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4a1 1 0 0 1 .45.11l8 4a1 1 0 0 1 0 1.78l-8 4a1 1 0 0 1-.9 0l-8-4a1 1 0 0 1 0-1.78l8-4A1 1 0 0 1 12 4Zm7.55 8.11 1.9.95a1 1 0 0 1 0 1.78l-8 4a1 1 0 0 1-.9 0l-8-4a1 1 0 0 1 0-1.78l1.9-.95 6.1 3.05a1 1 0 0 0 .9 0l6.1-3.05Z" />
        </svg>
      )
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 20a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Zm2-12a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1Zm5-3a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm5 5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3c.4 0 .77.24.92.61l1.54 3.7 3.99.3a1 1 0 0 1 .56 1.76l-3.02 2.59.95 3.86a1 1 0 0 1-1.47 1.1L12 14.97l-3.47 1.95a1 1 0 0 1-1.47-1.1l.95-3.86-3.02-2.58a1 1 0 0 1 .56-1.77l3.99-.3 1.54-3.7A1 1 0 0 1 12 3Z" />
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4a2 2 0 0 0-2 2v12c0 .55.45 1 1 1h5.2c.39 0 .78.08 1.14.24l.66.29.66-.29c.36-.16.75-.24 1.14-.24H19c.55 0 1-.45 1-1V6a2 2 0 0 0-2-2h-5.5a2 2 0 0 0-1.41.59L12 5.5l-.09-.91A2 2 0 0 0 10.5 4H6Z" />
        </svg>
      )
    case 'doc':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 3a2 2 0 0 0-2 2v14c0 .55.45 1 1 1h10a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.41l-3.83-3.83A2 2 0 0 0 13.17 4H8Zm2 5h3a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2Zm0 4h5a1 1 0 1 1 0 2h-5a1 1 0 1 1 0-2Z" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 4a7 7 0 1 1-4.95 11.95l-1.8 1.8a1 1 0 0 1-1.42-1.42l1.8-1.8A7 7 0 0 1 11 4Zm0 2a5 5 0 1 0 3.54 8.54A5 5 0 0 0 11 6Z" />
        </svg>
      )
    case 'files':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 4a2 2 0 0 1 2 2v1h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4Zm10 6h-6v8h6v-8Zm-8 8V6H6v12h6Z" />
        </svg>
      )
    case 'preview':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6c4.6 0 8.2 3.14 9.77 5.16a1 1 0 0 1 0 1.18C20.2 14.86 16.6 18 12 18s-8.2-3.14-9.77-5.16a1 1 0 0 1 0-1.18C3.8 9.14 7.4 6 12 6Zm0 2c-3.16 0-5.98 2.09-7.62 4 1.64 1.91 4.46 4 7.62 4s5.98-2.09 7.62-4c-1.64-1.91-4.46-4-7.62-4Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
        </svg>
      )
    case 'terminal':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm4.05 3.29a1 1 0 1 0-1.1 1.64L8.9 11.5l-1.95 1.57a1 1 0 0 0 1.1 1.64l3-2.4a1 1 0 0 0 0-1.58l-3-2.44ZM12 15a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4Z" />
        </svg>
      )
    case 'server':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 9h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm2 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H8Zm0-9a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H8Z" />
        </svg>
      )
    case 'play':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.5 5.5a1 1 0 0 1 1.52-.85l8 5a1 1 0 0 1 0 1.7l-8 5A1 1 0 0 1 8 15.5v-10Z" />
        </svg>
      )
    default:
      return null
  }
}

const NavButton = ({ item }: { item: NavItem }) => (
  <button type="button" className={`nav-button ${item.active ? 'is-active' : ''} ${item.accent ? 'is-accent' : ''}`}> <span className="nav-icon"> <Icon name={item.icon} /> </span> <span className="nav-label">{item.label}</span> {item.external && <span className="nav-chip">â†—</span>} </button>
)

const Tag = ({ children }: { children: string }) => <span className="tag">{children}</span>

function App() {
  const initialIntent = useMemo(() => parseBuildIntent(starterPrompts[0]), [])
  const [intentPreview, setIntentPreview] = useState(initialIntent)
  const [buildPlan, setBuildPlan] = useState<BuildPlan | null>(null)
  const [scaffoldExecution, setScaffoldExecution] = useState<ScaffoldExecution | null>(null)
  const [bundleJson, setBundleJson] = useState<string | null>(null)
  const [sidecarReportJson, setSidecarReportJson] = useState<string | null>(null)

  const handleIntentChange = (intent: typeof initialIntent) => {
    setIntentPreview(intent)
    setBuildPlan(null)
    setScaffoldExecution(null)
    setBundleJson(null)
    setSidecarReportJson(null)
  }

  const handleGeneratePlan = () => {
    setBuildPlan(generateBuildPlan(intentPreview))
    setScaffoldExecution(null)
    setBundleJson(null)
    setSidecarReportJson(null)
  }

  const handleExecuteScaffold = () => {
    if (!buildPlan) return
    setScaffoldExecution(createScaffoldExecution(intentPreview, buildPlan))
    setBundleJson(null)
    setSidecarReportJson(null)
  }

  const handleExportBundle = () => {
    if (!scaffoldExecution) return
    const bundle = buildScaffoldBundle(scaffoldExecution)
    setBundleJson(scaffoldBundleToJson(bundle))
  }

  const handlePrepareSidecar = () => {
    if (!scaffoldExecution) return
    const bundle = buildScaffoldBundle(scaffoldExecution)
    const report = createSidecarExecutionReport(bundle)
    setSidecarReportJson(sidecarExecutionReportToJson(report))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Studio navigation">
        <div className="sidebar__header">
          <div className="studio-mark">âš™ï¸</div>
          <div>
            <p className="studio-label">Tony Studio</p>
            <p className="studio-sub">Local â€¢ Replit-style</p>
          </div>
        </div>
        {navSections.map((section) => (
          <div className="sidebar__section" key={section.title}>
            <p className="sidebar__section-title">{section.title}</p>
            {section.items.map((item) => (
              <NavButton key={item.label} item={item as NavItem} />
            ))}
          </div>
        ))}
        <div className="sidebar__footer">
          <p>Install on mobile</p>
          <div className="pill muted">QR kit coming soon</div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar__left">
            <button className="icon-chip" aria-label="Toggle sidebar">
              <Icon name="apps" />
            </button>
            <div className="input-shell">
              <Icon name="search" />
              <input placeholder="Search projects, commands, or docs" />
            </div>
          </div>
          <div className="topbar__right">
            <button className="icon-chip" aria-label="Open console">
              <Icon name="terminal" />
            </button>
            <div className="user-chip">
              <span className="status-dot" /> Tony
            </div>
          </div>
        </header>
        <main className="main-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Workspace / Apps</p>
              <div className="heading-row">
                <h1>Apps</h1>
                <div className="status-pill">Phase 1 âœ“</div>
              </div>
              <p className="lead">
                Calendar rail is live. Now we mirror Replitâ€™s studio experience locally so every project feels instant again.
              </p>
            </div>
            <div className="hero-actions">
              <button className="primary-btn">
                <Icon name="plus" /> Create app
              </button>
              <button className="ghost-btn">
                <Icon name="upload" /> Import archive
              </button>
            </div>
          </section>
          <section className="command-first-grid">
            <CommandFirstComposer onIntentChange={handleIntentChange} />
            <IntentPreviewCard intent={intentPreview} onGeneratePlan={handleGeneratePlan} />
            <BuildPlanCard
              plan={buildPlan}
              execution={scaffoldExecution}
              bundleJson={bundleJson}
              sidecarReportJson={sidecarReportJson}
              onExecuteScaffold={handleExecuteScaffold}
              onExportBundle={handleExportBundle}
              onPrepareSidecar={handlePrepareSidecar}
            />
          </section>
          <section>
            <div className="intro-card">
              <div>
                <h2>{introCopy.headline}</h2>
                <p>{introCopy.body}</p>
                <ul>
                  {introCopy.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="billing-links">
                  {resourceLinks.map((link) => (
                    <div className="pill muted" key={link}>{link}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="org-setup-panel">
              <header>
                <div>
                  <p className="eyebrow">Organization setup</p>
                  <h2>{orgSetup.title}</h2>
                  <p>{orgSetup.summary}</p>
                </div>
                <div className="pill">Teams â†’ Pro upgrade</div>
              </header>
              <div className="org-grid">
                <article>
                  <h3>Required fields</h3>
                  <ul>
                    {orgSetup.fields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Pro plan highlights</h3>
                  <ul>
                    {orgSetup.planHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article className="org-quote">
                  <p>â€œ{orgSetup.testimonial.quote}â€</p>
                  <p className="org-quote__author">â€” {orgSetup.testimonial.author}</p>
                </article>
              </div>
            </div>
          </section>
          <section>
            <div className="docs-flyout">
              <header>
                <div className="pill muted">{docsFlyout.title}</div>
                <div className="docs-shortcuts">
                  {docsFlyout.shortcuts.map((shortcut) => (
                    <span key={shortcut}>{shortcut}</span>
                  ))}
                </div>
                <div className="input-shell wide">
                  <Icon name="search" />
                  <input placeholder={docsFlyout.searchHint} />
                  <div className="pill muted">Ctrl K</div>
                </div>
              </header>
              <div className="docs-columns">
                <article>
                  <h3>Vibe & Prompting</h3>
                  <ul>
                    {docsFlyout.vibeLinks.map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Build Tutorials</h3>
                  <ul>
                    {docsFlyout.buildLinks.map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Security & Data</h3>
                  <ul>
                    {docsFlyout.securityLinks.map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </section>
          <section>
            <div className="learn-panel">
              <header>
                <div>
                  <p className="eyebrow">Replit Learn</p>
                  <h2>{learnCopy.headline}</h2>
                  <p>{learnCopy.welcome}</p>
                </div>
                <button className="ghost-btn">
                  <Icon name="play" /> Watch welcome video
                </button>
              </header>
              <div className="learn-grid">
                {learnCopy.modules.map((module) => (
                  <article key={module.title}>
                    <div className="pill muted">{module.duration} Â· {module.lessons}</div>
                    <h3>{module.title}</h3>
                    <p>{module.status}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="enterprise-hub">
              <div className="enterprise-hub__header">
                <div>
                  <p className="eyebrow">Enterprise</p>
                  <h2>{enterprisePanel.title}</h2>
                  <p>{enterprisePanel.description}</p>
                </div>
                <div className="pill muted">Trust & Billing</div>
              </div>
              <div className="enterprise-shortcuts">
                {enterprisePanel.shortcuts.map((shortcut) => (
                  <span key={shortcut}>{shortcut}</span>
                ))}
              </div>
              <div className="enterprise-columns">
                {enterprisePanel.columns.map((column) => (
                  <article key={column.heading}>
                    <h3>{column.heading}</h3>
                    <ul>
                      {column.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="enterprise-panel">
              <div className="enterprise-header">
                <div>
                  <p className="eyebrow">Enterprise</p>
                  <h2>{enterprisePanel.title}</h2>
                  <p>{enterprisePanel.description}</p>
                </div>
                <div className="docs-shortcuts">
                  {enterprisePanel.shortcuts.map((shortcut) => (
                    <span key={shortcut}>{shortcut}</span>
                  ))}
                </div>
              </div>
              <div className="enterprise-columns">
                {enterprisePanel.columns.map((column) => (
                  <article key={column.heading}>
                    <h3>{column.heading}</h3>
                    <ul>
                      {column.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="card-grid">
              {quickActions.map((action) => (
                <article className="card" key={action.title}>
                  <div className="card__header">
                    <h2>{action.title}</h2>
                    <Icon name="server" />
                  </div>
                  <p>{action.description}</p>
                  <div className="pill">{action.pill}</div>
                  <p className="card__meta">{action.details}</p>
                </article>
              ))}
            </div>
          </section>
          <section>
            <div className="billing-panel">
              <header>
                <div>
                  <p className="eyebrow">Billing</p>
                  <h2>{billingCopy.headline}</h2>
                  <p>{billingCopy.subhead}</p>
                </div>
                <div className="pill">Pro plan launches Feb 20</div>
              </header>
              <div className="billing-plans">
                {billingCopy.plans.map((plan) => (
                  <article key={plan.name}>
                    <h3>{plan.name}</h3>
                    <p>{plan.detail}</p>
                  </article>
                ))}
              </div>
              <ul className="billing-highlights">
                {billingCopy.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="billing-tools">
                {billingCopy.tools.map((tool) => (
                  <article key={tool.title}>
                    <h4>{tool.title}</h4>
                    <p>{tool.description}</p>
                  </article>
                ))}
              </div>
              <div className="billing-usecases">
                {billingCopy.useCases.map((useCase) => (
                  <article key={useCase.title}>
                    <ol>
                      {useCase.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>
              <div className="billing-links">
                {billingCopy.nextLinks.map((link) => (
                  <div className="pill muted" key={link}>
                    {link}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="enterprise-plans-panel">
              <header>
                <div>
                  <p className="eyebrow">Teams & Enterprise</p>
                  <h2>{enterpriseCopy.headline}</h2>
                  <p>{enterpriseCopy.subhead}</p>
                </div>
                <button className="ghost-btn">
                  <Icon name="spark" /> Contact sales
                </button>
              </header>
              <div className="enterprise-plan-cards">
                {enterpriseCopy.plans.map((plan) => (
                  <article key={plan.name}>
                    <h3>{plan.name}</h3>
                    <p className="plan-price">{plan.price}</p>
                    <p>{plan.detail}</p>
                  </article>
                ))}
              </div>
              <div className="enterprise-feature-grid">
                <article>
                  <h3>Teams includes</h3>
                  <ul>
                    {enterpriseCopy.teamsFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Enterprise adds</h3>
                  <ul>
                    {enterpriseCopy.enterpriseFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              </div>
              <div className="enterprise-resources">
                {enterpriseCopy.resources.map((resource) => (
                  <div className="pill muted" key={resource}>
                    {resource}
                  </div>
                ))}
              </div>
              <div className="enterprise-usecases">
                {enterpriseCopy.useCases.map((useCase) => (
                  <article key={useCase}>
                    <p>{useCase}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="projects-panel">
              <header>
                <div>
                  <p className="eyebrow">Projects (beta)</p>
                  <h2>{projectsCopy.headline}</h2>
                  <p>{projectsCopy.summary}</p>
                </div>
                <div className="pill warning">Sunsets Mar 3, 2026</div>
              </header>
              <div className="projects-alert">{projectsCopy.alert}</div>
              <div className="projects-columns">
                <article>
                  <h3>Why teams used Projects</h3>
                  <ul>
                    {projectsCopy.advantages.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Workflow</h3>
                  <ol>
                    {projectsCopy.workflow.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </article>
                <article>
                  <h3>Dashboard perks</h3>
                  <ul>
                    {projectsCopy.dashboard.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
              <div className="projects-step-grid">
                {projectsCopy.steps.map((step) => (
                  <article key={step.title}>
                    <h4>{step.title}</h4>
                    <p>{step.detail}</p>
                  </article>
                ))}
              </div>
              <div className="projects-links">
                {projectsCopy.links.map((link) => (
                  <div className="pill muted" key={link}>
                    {link}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="conflict-panel">
              <header>
                <div>
                  <p className="eyebrow">Conflict resolution</p>
                  <h2>{conflictsCopy.headline}</h2>
                  <p>{conflictsCopy.overview}</p>
                </div>
                <div className="pill muted">Git powered</div>
              </header>
              <div className="conflict-columns">
                <article>
                  <h3>Steps</h3>
                  <ol>
                    {conflictsCopy.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
                <article>
                  <h3>Notes</h3>
                  <ul>
                    {conflictsCopy.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </section>
          <section>
            <div className="section-heading">
              <h2>Quickstarts</h2>
              <p className="section-sub">Mirror Replitâ€™s Getting Started flow locally.</p>
            </div>
            <div className="quickstart-grid">
              <div>
                <h3>Create new apps</h3>
                {quickstartCreate.map((guide) => (
                  <article className="quickstart-card" key={guide.title}>
                    <div className="pill">{guide.duration}</div>
                    <div>
                      <h4>{guide.title}</h4>
                      <p>{guide.description}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div>
                <h3>Import existing projects</h3>
                {quickstartImport.map((guide) => (
                  <article className="quickstart-card" key={guide.title}>
                    <div className="pill">{guide.duration}</div>
                    <div>
                      <h4>{guide.title}</h4>
                      <p>{guide.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section>
            <div className="pillar-grid">
              <article className="pillar-card">
                <h3>Workspace features</h3>
                <ul>
                  {workspaceFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
              <article className="pillar-card">
                <h3>AI companion</h3>
                <ul>
                  {aiCapabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </article>
              <article className="pillar-card">
                <h3>Share in minutes</h3>
                <ul>
                  {sharePillars.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
          <section>
            <div className="section-heading">
              <h2>Developer frameworks</h2>
              <button className="ghost-btn small">
                <Icon name="spark" /> Manage templates
              </button>
            </div>
            <div className="framework-grid">
              {frameworks.map((framework) => (
                <article className={`framework-card accent-${framework.accent}`} key={framework.name}>
                  <div className="framework-card__body">
                    <h3>{framework.name}</h3>
                    <p>{framework.description}</p>
                  </div>
                  <div className="framework-card__tags">
                    {framework.tags.map((tag) => (<Tag key={tag}>{tag}</Tag>))}
                  </div>
                  <button className="ghost-btn small">
                    <Icon name="play" /> Use template
                  </button>
                </article>))}
            </div>
          </section>
          <section>
            <div className="section-heading">
              <h2>Active workspaces</h2>
              <div className="pill">LAN-ready</div>
            </div>
            <div className="workspace-list">
              {workspaces.map((workspace) => (
                <article className="workspace-card" key={workspace.name}>
                  <div>
                    <div className="workspace-card__heading">
                      <h3>{workspace.name}</h3>
                      <span className={`status-chip status-${workspace.status.toLowerCase().replace(' ', '-')}`}>{workspace.status}</span>
                    </div>
                    <p>{workspace.summary}</p>
                    <div className="workspace-meta">
                      <div className="pill muted">{workspace.stack}</div>
                      <div className="pill muted">{workspace.updated}</div>
                    </div>
                  </div>
                  <div className="workspace-card__tags">
                    {workspace.tags.map((tag) => (<Tag key={tag}>{tag}</Tag>))}
                  </div>
                </article>))}
            </div>
          </section>
          <section>
            <div className="studio-panes">
              {panePreviews.map((preview) => (
                <article key={preview.title} className="pane-card">
                  <h4>{preview.title}</h4>
                  <p>{preview.description}</p>
                  <div className="pill muted">Next: {preview.todo}</div>
                </article>))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App;

