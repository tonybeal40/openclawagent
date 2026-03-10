# FULL INVENTORY REPORT

_Date:_ 2026-03-09 (America/Chicago)

## Scope Scanned (read-only)
1. `C:\Users\tonyb\.openclaw\workspace`
2. `G:\My Drive\openclaw-workspace-main`
3. `G:\My Drive\openclaw-full-main` (and `...\workspace`)

## High-Level Inventory

| Root | Files | Dirs | Approx Size |
|---|---:|---:|---:|
| `C:\Users\tonyb\.openclaw\workspace` | 12,473 | 1,988 | 2.42 GB |
| `G:\My Drive\openclaw-workspace-main` | 5,143 | 308 | 1.81 GB |
| `G:\My Drive\openclaw-full-main\workspace` | 17 | 11 | 0.89 GB* |

\* likely cloud placeholder/content-hydration behavior.

## Root Structure Findings
- Local workspace has an organized active layout: `projects/`, `ops/`, `runbooks/`, `scripts/`, `outputs/`, `job_pipeline/`, `archive/`.
- Google Drive mirror `openclaw-workspace-main` contains both top-level legacy project folders and `projects/` copies (duplication pattern).
- `openclaw-full-main` appears to be full OpenClaw data (agents, credentials, memory, logs, workspace) rather than a clean project mirror.

## Project Presence (requested set)

- Found across scanned roots: `TonyOS`, `replit-standalone`, `replit-standalone-ui`, `marketing-genius`, `dinner-app`, `swing-analyzer`, `swing-analysis`.
- `job pipeline`: local canonical appears as `job_pipeline/` (outside `projects/`).
- `linkedin assets`: no dedicated local canonical folder found under active roots; LinkedIn-related assets are currently concentrated in archived TonyOS content and Drive folder `linkedin-background`.

## Notable Duplication / Drift
- Multiple naming variants: `TonyOS`, `tony-os`, `tonyos-extracted`, `swing-analysis` vs `swing-analyzer`.
- Duplicate hierarchy style in Drive mirror:
  - `G:\My Drive\openclaw-workspace-main\<project>`
  - `G:\My Drive\openclaw-workspace-main\projects\<project>`
- Local `projects/*` directories are mostly stubs/empty for several projects (likely after structure reset/rebuild).

## LinkedIn Asset Findings
LinkedIn files discovered primarily in:
- `C:\Users\tonyb\.openclaw\workspace\archive\projects-restore-20260309-132018\TonyOS\attached_assets\...`
- `C:\Users\tonyb\.openclaw\workspace\archive\projects-restore-20260309-132018\TonyOS\static\internal\...`
- Drive folder: `G:\My Drive\openclaw-workspace-main\linkedin-background`

## Safety Posture Used
- Non-destructive read-only inventory.
- No deletes, no moves, no overwrites of existing project data.
- Copy-first strategy is recommended for all rebuild/recovery actions.

## Immediate Risks
1. Canonical ambiguity due to duplicated roots and naming variants.
2. Projects represented as empty/stub folders in active local tree.
3. Potential reliance on cloud-hydrated content that is not fully local/offline.

## Recommended Next Step
Implement canonical map + worker recovery plan (see companion files) and perform staged copy-first hydration from selected source roots into `C:\Users\tonyb\.openclaw\workspace\projects` and `...\reference\linkedin-assets`.
