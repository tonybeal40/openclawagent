# TONYOS_MASTER_PLAN

## Current Priority Order (User-directed)
1. LinkedIn Creator OS completion
2. Replit canonicalization/build completion
3. Mission Control reliability + reporting
4. Job pipeline + outreach execution
5. Deprioritized: dinner-app, swing-analyzer

## 3-Agent Operator Stack
- Discovery Agent: collect jobs/companies/signals
- Intelligence Agent: rank opportunities + generate daily brief
- Action Agent: produce outreach/applications + next actions

## Daily Operating Loop
1. Discovery scripts run
2. Structured memory update (`memory/*.json`)
3. Intelligence ranking + brief generation
4. Action outputs generated
5. Dashboard refreshed
6. Follow-up tasks scheduled

## Done-State Criteria
- LinkedIn Creator: local run stable + checklist complete + documented start/stop
- Replit: canonical path resolver + env mapping + build verification passing (tracked in `docs/REPLIT_IMPLEMENTATION_STATUS.md`)
- Mission Control: dashboard readable, data-backed panels, daily report generated
- Documentation: one-page map present in `docs/MASTER_INDEX.md` + consistency checklist in `docs/DOC_CONSISTENCY_PASS.md`

## Reliability Guardrails
- Scripts-first, AI-last
- Token/iteration limits on agent tasks
- Logs for each agent stage
- Recovery-safe writes and backup trail
