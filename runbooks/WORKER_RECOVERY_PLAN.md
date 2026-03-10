# WORKER RECOVERY PLAN

## Objective
Restore reliable worker/project execution from canonical local roots using non-destructive, copy-first recovery.

## Guardrails
- No deletes.
- No in-place destructive sync.
- Copy to `_restore_staging` first, verify, then copy into canonical project path.

## Recovery Stages

### Stage 0 - Snapshot + Lock Baseline (safe)
```powershell
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force "C:\Users\tonyb\.openclaw\workspace\archive\recovery-$ts" | Out-Null
Get-ChildItem "C:\Users\tonyb\.openclaw\workspace\projects" -Force | Out-File "C:\Users\tonyb\.openclaw\workspace\archive\recovery-$ts\projects-dirlist.txt"
```

### Stage 1 - Hydrate from Drive mirrors into staging
```powershell
$stage = "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging"
New-Item -ItemType Directory -Force $stage | Out-Null

robocopy "G:\My Drive\openclaw-workspace-main\TonyOS" "$stage\TonyOS" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\replit-standalone" "$stage\replit-standalone" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\replit-standalone-ui" "$stage\replit-standalone-ui" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\marketing-genius" "$stage\marketing-genius" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\swing-analyzer" "$stage\swing-analyzer" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\dinner-app" "$stage\dinner-app" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
robocopy "G:\My Drive\openclaw-workspace-main\linkedin-background" "C:\Users\tonyb\.openclaw\workspace\reference\linkedin-assets" /E /R:1 /W:1 /NFL /NDL /NJH /NJS
```

### Stage 2 - Verify staged content before promoting
```powershell
Get-ChildItem "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging" -Directory |
  ForEach-Object {
    $count = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue).Count
    "{0}`t{1}" -f $_.Name, $count
  }
```

### Stage 3 - Promote to canonical roots (copy only)
```powershell
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\TonyOS" "C:\Users\tonyb\.openclaw\workspace\projects\TonyOS" /E /XO /R:1 /W:1
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\replit-standalone" "C:\Users\tonyb\.openclaw\workspace\projects\replit-standalone" /E /XO /R:1 /W:1
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\replit-standalone-ui" "C:\Users\tonyb\.openclaw\workspace\projects\replit-standalone-ui" /E /XO /R:1 /W:1
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\marketing-genius" "C:\Users\tonyb\.openclaw\workspace\projects\marketing-genius" /E /XO /R:1 /W:1
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\swing-analyzer" "C:\Users\tonyb\.openclaw\workspace\projects\swing-analyzer" /E /XO /R:1 /W:1
robocopy "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\dinner-app" "C:\Users\tonyb\.openclaw\workspace\projects\dinner-app" /E /XO /R:1 /W:1
```

### Stage 4 - Worker readiness checks
```powershell
# Project root health
Get-ChildItem "C:\Users\tonyb\.openclaw\workspace\projects" -Directory | Select Name,LastWriteTime

# Core worker docs/scripts
Test-Path "C:\Users\tonyb\.openclaw\workspace\ops\WORKER_ROSTER.md"
Test-Path "C:\Users\tonyb\.openclaw\workspace\scripts\run-daily-pipeline.ps1"
Test-Path "C:\Users\tonyb\.openclaw\workspace\runbooks\OPENCLAW_MASTER_RUNBOOK.md"
```

## Decision Notes
- `job_pipeline` remains canonical outside `projects/` due to existing active outputs.
- `openclaw-full-main` is treated as system-state backup source, not primary project restore source.
