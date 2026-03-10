# SAFE BACKGROUND EXECUTION SCHEDULE (RECOMMENDED)

## Principles
- Read-only checks by default.
- Copy-first sync only when explicitly triggered.
- No delete/mirror flags (`/MIR`) in scheduled jobs.

## Scheduled Tasks (Windows Task Scheduler)

### 1) Daily inventory snapshot (08:15)
```powershell
schtasks /Create /TN "OpenClaw\DailyInventorySnapshot" /SC DAILY /ST 08:15 /TR "powershell -NoProfile -ExecutionPolicy Bypass -Command \"$ts=Get-Date -Format yyyyMMdd-HHmm; $out='C:\Users\tonyb\.openclaw\workspace\ops\inventory-'+$ts+'.txt'; Get-ChildItem 'C:\Users\tonyb\.openclaw\workspace' -Recurse -File -ErrorAction SilentlyContinue | Select FullName,Length,LastWriteTime | Out-File $out\"" /F
```

### 2) Daily job pipeline health check (08:30)
```powershell
schtasks /Create /TN "OpenClaw\DailyJobPipelineHealth" /SC DAILY /ST 08:30 /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\tonyb\.openclaw\workspace\scripts\run-daily-pipeline.ps1" /F
```

### 3) Twice-daily worker readiness check (09:00, 17:00)
```powershell
schtasks /Create /TN "OpenClaw\WorkerReadinessAM" /SC DAILY /ST 09:00 /TR "powershell -NoProfile -ExecutionPolicy Bypass -Command \"Test-Path 'C:\Users\tonyb\.openclaw\workspace\ops\WORKER_ROSTER.md'; Test-Path 'C:\Users\tonyb\.openclaw\workspace\runbooks\OPENCLAW_MASTER_RUNBOOK.md' | Out-File 'C:\Users\tonyb\.openclaw\workspace\logs\worker-readiness-am.log'\"" /F

schtasks /Create /TN "OpenClaw\WorkerReadinessPM" /SC DAILY /ST 17:00 /TR "powershell -NoProfile -ExecutionPolicy Bypass -Command \"Test-Path 'C:\Users\tonyb\.openclaw\workspace\ops\WORKER_ROSTER.md'; Test-Path 'C:\Users\tonyb\.openclaw\workspace\runbooks\OPENCLAW_MASTER_RUNBOOK.md' | Out-File 'C:\Users\tonyb\.openclaw\workspace\logs\worker-readiness-pm.log'\"" /F
```

### 4) Weekly mirror verification (Sunday 07:45, read-only)
```powershell
schtasks /Create /TN "OpenClaw\WeeklyMirrorVerify" /SC WEEKLY /D SUN /ST 07:45 /TR "powershell -NoProfile -ExecutionPolicy Bypass -Command \"Get-ChildItem 'G:\My Drive\openclaw-workspace-main' -Directory | Select Name,LastWriteTime | Out-File 'C:\Users\tonyb\.openclaw\workspace\ops\weekly-mirror-verify.txt'\"" /F
```

## Optional On-Demand Safe Copy Task (manual trigger only)
```powershell
robocopy "G:\My Drive\openclaw-workspace-main\TonyOS" "C:\Users\tonyb\.openclaw\workspace\archive\_restore_staging\TonyOS" /E /XO /R:1 /W:1
```

## Do-Not-Use in automation
- `robocopy /MIR`
- any command that deletes source or destination content
