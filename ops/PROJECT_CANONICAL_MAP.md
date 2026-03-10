# PROJECT CANONICAL MAP

_Date:_ 2026-03-09

## Canonical Root Policy
Primary active root (authoritative for rebuild):
- `C:\Users\tonyb\.openclaw\workspace`

Project code canonical container:
- `C:\Users\tonyb\.openclaw\workspace\projects`

Operational data canonical paths:
- Job pipeline data: `C:\Users\tonyb\.openclaw\workspace\job_pipeline`
- Runbooks: `C:\Users\tonyb\.openclaw\workspace\runbooks`
- Ops docs/scripts: `C:\Users\tonyb\.openclaw\workspace\ops` and `...\scripts`

## Canonical Project Roots (requested)

| Domain | Canonical Root | Alternate / Recovery Sources | Status |
|---|---|---|---|
| TonyOS | `C:\Users\tonyb\.openclaw\workspace\projects\TonyOS` | `G:\My Drive\openclaw-workspace-main\TonyOS`; `...\projects\TonyOS`; local archive restores | Stub locally; needs hydration |
| replit-standalone | `C:\Users\tonyb\.openclaw\workspace\projects\replit-standalone` | `G:\My Drive\openclaw-workspace-main\replit-standalone`; `...\projects\replit-standalone` | Stub locally |
| replit-standalone-ui | `C:\Users\tonyb\.openclaw\workspace\projects\replit-standalone-ui` | `G:\My Drive\openclaw-workspace-main\replit-standalone-ui`; `...\projects\replit-standalone-ui` | Stub locally |
| marketing-genius | `C:\Users\tonyb\.openclaw\workspace\projects\marketing-genius` | `G:\My Drive\openclaw-workspace-main\marketing-genius`; `...\projects\marketing-genius` | Stub locally |
| job pipeline | `C:\Users\tonyb\.openclaw\workspace\job_pipeline` | `outputs\jobs`, archive snapshots | Active JSON outputs present |
| swing-analyzer | `C:\Users\tonyb\.openclaw\workspace\projects\swing-analyzer` | `G:\My Drive\openclaw-workspace-main\swing-analyzer`; `...\projects\swing-analyzer` | Stub locally |
| dinner-app | `C:\Users\tonyb\.openclaw\workspace\projects\dinner-app` | `G:\My Drive\openclaw-workspace-main\dinner-app`; `...\projects\dinner-app` | Stub locally |
| linkedin assets | `C:\Users\tonyb\.openclaw\workspace\reference\linkedin-assets` (create/populate) | `G:\My Drive\openclaw-workspace-main\linkedin-background`; archived TonyOS LinkedIn files | Canonical folder not yet populated |

## De-duplication Rules
1. Prefer `C:\Users\tonyb\.openclaw\workspace\projects\<name>` for active development.
2. Treat Drive top-level project folders as source mirrors only; do not use as active working dirs.
3. Consolidate variant names:
   - `tony-os`, `tonyos-extracted` -> `TonyOS`
   - `swing-analysis` and `swing-analyzer` should be explicitly split by purpose, or merged under one chosen canonical name.
4. Do all recovery by **copy** into canonical roots (never destructive move/delete during rebuild pass).

## Worker/Workflow Canonical Anchors
- Worker roster/source-of-truth: `C:\Users\tonyb\.openclaw\workspace\ops\WORKER_ROSTER.md`
- Master runbook: `C:\Users\tonyb\.openclaw\workspace\runbooks\OPENCLAW_MASTER_RUNBOOK.md`
- Workflow contract: `C:\Users\tonyb\.openclaw\workspace\WORKFLOW.md`
- Daily pipeline runner: `C:\Users\tonyb\.openclaw\workspace\scripts\run-daily-pipeline.ps1`
