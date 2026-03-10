# Workflow Memory (Mission Control)

Last updated: 2026-03-10

## Operating mode
- Mission: keep projects moving with clear ownership, clean handoffs, and zero lost work.
- Tone: high-trust, positive, collaborative ("happiest workers in the world" standard).

## Worker model (canonical)
- Coordinator: Calvin (queue, priority, dispatch)
- Workers: Albert, Jared, Azeem, Breyer/Bryer, Saylor, Beckham (+ supporting roles in `ops/WORKER_ROSTER.md`)

## Save/continuity contract
1. Work in project files first (no chat-only decisions).
2. Log durable decisions in `memory/YYYY-MM-DD.md`.
3. Update long-term decisions in `MEMORY.md` when stable.
4. End each major block with a handoff note using `runbooks/HANDOFF_TEMPLATE.md`.
5. Run `scripts/run-folder.ps1` for reconciliation/export when asked (or at major milestones).
6. Commit and push after meaningful edits.

## Professional handoff minimum
- What changed (files + purpose)
- Current state (done / in progress / blocked)
- Evidence and links/paths
- Next 3 actions (ordered)
- Explicit owner

## Quality gates
- No destructive changes without explicit approval.
- Cite sources/paths for recovery claims.
- Distinguish text mentions from true timestamp evidence.
- Keep reports in one format: `updated / still missing / next action` when requested.
