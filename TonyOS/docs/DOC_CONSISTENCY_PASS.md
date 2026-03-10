# DOC_CONSISTENCY_PASS

## Scope
- Normalize naming and purpose across TonyOS docs/agents/actions/reports.
- Remove ambiguity between current priorities and legacy/deprioritized tracks.

## Current consistency decisions
- Canonical priorities: LinkedIn Creator + Replit + Mission Control reliability.
- Deprioritized tracks remain documented but clearly marked: dinner-app, swing-analyzer.
- 3-agent operator stack is canonical architecture.

## Link sanity checklist
- `docs/TONYOS_MASTER_PLAN.md` is source-of-truth plan.
- `docs/WORKFLOW.md` should reflect daily execution loop.
- `agents/*.md` should map directly to outputs in `memory/`, `reports/`, `actions/`.
- `reports/TONIGHT_TOP_ROLES_AND_COMPANIES.md` should be referenced by Action workflow.
- `dashboard/mission_control.html` should mirror current priority language.

## Duplicate/overlap handling
- Keep one canonical planning doc (`TONYOS_MASTER_PLAN.md`).
- Keep one index (`MASTER_INDEX.md`) for navigation.
- Keep tactical tonight status in `reports/` only.

## Next maintenance step
- Weekly 10-minute doc pass: verify links, priority order, and active outputs.
