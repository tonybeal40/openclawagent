# Weekly Lessons

## Week of 2026-03-09

### Wins
- OpenClaw recovered and stable on main machine.
- Memory artifacts recovered and timeline rebuilt.
- TonyOS normalized and cleaned; Natoli-specific files removed.
- Core service scripts added (`start-core.ps1` / `stop-core.ps1`).

### Lessons learned
- Invalid config keys can crash gateway startup.
- Keep config changes minimal and schema-safe.
- Archive-first cleanup prevents irreversible mistakes.
- Separate auth modes/process reduces drift and confusion.

### Rules to keep
- Backup before destructive ops.
- Keep gateway local/loopback.
- Lock one default model and verify after restart.
- Log major changes in memory files same day.

### Improve next week
- Build autonomous job intelligence workflow.
- Add run history + KPI tracking (outreach to interview conversion).
- Prepare laptop secondary-node plan only after main is stable.
