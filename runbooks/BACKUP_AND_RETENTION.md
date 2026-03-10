# BACKUP_AND_RETENTION

## Goal
Never lose project files/workspace state.

## Standard workflow
1. Work locally in `C:\Users\tonyb\.openclaw\workspace`
2. Run backup script to Drive after major changes.
3. Keep restore reports in `workspace/ops`.

## Backup commands
### Incremental copy (safe default)
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\tonyb\.openclaw\workspace\scripts\backup-workspace.ps1
```

### Mirror mode (careful)
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\tonyb\.openclaw\workspace\scripts\backup-workspace.ps1 -Mirror
```

## Restore safety policy
- Copy-first restore.
- Backup existing local folder into `workspace/archive/...` before overwrite.
- Write report to `workspace/ops/RESTORE_REPORT_*.md`.

## Verification checklist
- `workspace/projects` list matches expected projects.
- Latest backup log exists in `workspace/ops/BACKUP_RUN_*.log`.
- Drive path `G:\My Drive\openclaw-workspace-main` updated recently.

## Recommended cadence
- Quick backup after each major coding block.
- End-of-day backup always.
- Weekly restore drill on 1 project folder.
