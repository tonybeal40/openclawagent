# TASK BACKLOG (PRIORITIZED)

## P0 (Do first)
1. **Canonical lock-in**
   - Confirm canonical roots from `ops/PROJECT_CANONICAL_MAP.md`.
2. **Staged recovery copy pass**
   - Execute Stage 1/2 from `runbooks/WORKER_RECOVERY_PLAN.md`.
3. **Promote recovered project content**
   - Copy staged project data into local canonical `projects/*`.
4. **Create/populate LinkedIn canonical asset folder**
   - `reference/linkedin-assets` from Drive + archived TonyOS sources.

## P1 (Stability)
5. **Normalize naming and aliases**
   - Resolve `swing-analysis` vs `swing-analyzer` split/merge decision.
   - Resolve `TonyOS` vs `tony-os` variants in references.
6. **Worker control hardening**
   - Update `ops/WORKER_ROSTER.md` with active worker -> canonical root mapping.
7. **Workflow checkpointing**
   - Add daily status write into `deliverables/mission-control/mission_control_status.md`.

## P2 (Optimization)
8. **Mirror hygiene**
   - Mark Drive top-level project dirs as `legacy-mirror` in docs.
9. **Inventory automation**
   - Add weekly non-destructive inventory script output to `ops/inventory/`.
10. **Prompt operations integration**
   - Use new prompt library files under `prompts/` for recurring rebuild/recovery tasks.

## Deferred / Watchlist
- Cloud hydration reliability under `G:` paths.
- Archived TonyOS content quality before selective reintegration.
