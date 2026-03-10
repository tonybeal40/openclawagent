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

## 2026-02-12 to 2026-02-22 (newly verified evidence)
- Verified presence of pre-2026-02-23 records in local session archive:
  - `C:\Users\tonyb\.openclaw\agents\main\sessions\bd744386-6688-4943-bda5-94ee286ce883.jsonl`
- Day-level date hits found for each day from `2026-02-12` through `2026-02-22`.
- Reconciliation subset exported to:
  - `outputs/memory/session_bd744386_feb12_22.jsonl`
  - `outputs/memory/reconciliation_feb12_22.md`
- Named target recovery in this window is confirmed (Calvin, Jared, Azeem, Breyer, Saylor, Beckham, Albert).

## Remaining gap
- The primary generated pull file `outputs/memory/user_messages_all.csv` still starts at ~`2026-02-23T01:00:05Z`, so pre-2/23 records are not yet fully merged into that consolidated CSV pipeline.
- Next pass should merge `session_bd744386_feb12_22.jsonl` into canonical extraction outputs and regenerate rollup stats.
