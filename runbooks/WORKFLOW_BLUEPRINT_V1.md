# WORKFLOW BLUEPRINT V1

## Intent
Create a repeatable, safe rebuild workflow for project/worker continuity without destructive operations.

## Workflow Graph (V1)
1. **Inventory (Read-only)**
   - Scan local + mirrors
   - Emit inventory report
2. **Canonical Mapping**
   - Select canonical roots
   - Label all duplicates as source/legacy
3. **Staging Recovery (Copy-only)**
   - Pull from chosen mirror to staging
   - Validate file counts and key manifests
4. **Promotion (Copy-only)**
   - Copy from staging to canonical project roots
5. **Worker Rebind**
   - Update worker roster/runbooks to canonical paths
6. **Operationalize**
   - Schedule safe recurring checks and status output

## Inputs
- Local root: `C:\Users\tonyb\.openclaw\workspace`
- Mirror root A: `G:\My Drive\openclaw-workspace-main`
- Mirror root B: `G:\My Drive\openclaw-full-main`

## Outputs
- `ops/FULL_INVENTORY_REPORT.md`
- `ops/PROJECT_CANONICAL_MAP.md`
- `runbooks/WORKER_RECOVERY_PLAN.md`
- `ops/TASK_BACKLOG_PRIORITIZED.md`
- Prompt/task library under `prompts/`

## Worker Loop (Daily)
1. `scripts/run-daily-pipeline.ps1`
2. Validate `job_pipeline/jobs_latest_summary.json`
3. Write status to `deliverables/mission-control/mission_control_status.md`
4. Log notable deltas to memory/runbook

## Safe Failure Handling
- If mirror unavailable: skip promotion; keep last good canonical state.
- If staged content incomplete: retry hydration, do not overwrite canonical.
- If worker script fails: capture error logs; create backlog item with repro command.

## Non-Destructive Policy
- Always use copy-first promotion.
- No cleanup deletes during rebuild window.
- Archive snapshots before any major copy pass.
