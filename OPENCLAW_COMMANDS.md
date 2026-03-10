# OPENCLAW COMMANDS (Quick Start)

## Health / Status
```powershell
openclaw status
openclaw gateway status
openclaw doctor --non-interactive
openclaw logs --follow
```

## Restart
```powershell
openclaw gateway restart
```

## Fast operator checks (20-second loop)
```powershell
openclaw status
openclaw gateway status
openclaw doctor --non-interactive
```

## Token/efficiency discipline
- Use scripts for collection, AI for summarize/rank/write only.
- Prefer short, task-bounded sessions.
- Keep outputs in files (`deliverables/`, `outputs/`, `ops/`).

## Worker workflow files
- `ops/RUN_ALL_WORKERS.ps1`
- `runbooks/DAILY_OPS.md`
- `runbooks/SCHEDULE.md`
