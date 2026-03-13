# Recovered Timeline (Phase 2)

## 2026-03-04 (evening)
- Desktop established as main OpenClaw machine.
- Telegram token/channel reliability work completed; status ON/OK.
- Workspace + full-profile mirror workflows set up with Google Drive.
- Full mirror pushed to `G:\My Drive\openclaw-full-main`.

## 2026-03-05 (day)
- Goal reinforced: desktop main, laptop secondary/synced, Telegram reliable.
- Workspace inventory and parity checks completed.
- Browser Relay extension installed/refreshed and attached successfully.
- Live browser automation verified (snapshot/navigation/field extraction).
- Laptop pairing remained a blocker at that time.

## 2026-03-05 (evening outage period)
- Session transcript records repeated provider limit errors:
  - "You have hit your ChatGPT usage limit (plus plan)."
- This aligns with the reported period where responses stopped / service appeared down.

## 2026-03-09 (recovery)
- OpenClaw confirmed back up and responsive.
- Full file and memory pull requested.
- Memory artifacts confirmed present in workspace.
- Long-term memory rebuilt into `MEMORY.md`.

## Primary memory locations now
- Long-term memory: `MEMORY.md`
- Daily memory: `memory/2026-03-05.md`, `memory/2026-03-09.md`
- Recovery context files: `memory/tonight-state-summary.md`, `memory/full-history-dump.md`
- Large raw export: `recovery-memory-export.json`
- Session transcripts: `C:\Users\tonyb\.openclaw\agents\main\sessions\*.jsonl`

## 2026-02-12 to 2026-02-22 (status correction)
- Prior "verified evidence" claim was based on date strings appearing in message text, not on true message timestamps.
- Re-check using parsed user-event timestamps across local sessions shows earliest true record at:
  - `2026-02-23T01:00:05.635000+00:00`
- Local sessions currently contain **0** true user-timestamped rows for `2026-02-12` through `2026-02-22`.
- Drive mirrors checked (`openclaw-workspace-main`, `openclaw-full-main`) also contain **0** true user-timestamped rows for that window.

## Remaining gap
- Confirmed unresolved true-timestamp gap: `2026-02-12` -> `2026-02-22`.
- Existing extracted subset files (`outputs/memory/session_bd744386_feb12_22.jsonl`, `outputs/memory/reconciliation_feb12_22.md`) are text-date match artifacts and should not be treated as canonical timestamp evidence.
- 2026-03-12 19:38 CDT re-audit: local main sessions + workspace memory outputs still show no canonical user-event timestamps in this window.
- Closure requirement: ingest alternate historical sources (older backups/zips/offline laptop snapshots) and re-run timestamp-first reconciliation.
