param(
  [string]$FromDate = "2026-02-12",
  [string]$ToDate = "2026-03-10"
)

$ErrorActionPreference = "Stop"
Set-Location "C:\Users\tonyb\.openclaw\workspace"

Write-Host "[RUN-FOLDER] Starting recovery/update pass ($FromDate -> $ToDate)"

# 1) Pull chat memory/events (Python-first for nested JSONL reliability)
if (Test-Path ".\scripts\pull_chat_memory.py") {
  python .\scripts\pull_chat_memory.py | Out-Host
} else {
  Write-Host "[RUN-FOLDER] pull_chat_memory.py not found, skipping extraction"
}

# 2) Refresh timeline artifacts if generator scripts exist
if (Test-Path ".\scripts\build_tony_profile.py") {
  python .\scripts\build_tony_profile.py | Out-Host
}

# 3) Stamp durable daily memory note (append only)
$today = Get-Date -Format "yyyy-MM-dd"
$mem = ".\memory\$today.md"
if (!(Test-Path ".\memory")) { New-Item -ItemType Directory -Path ".\memory" | Out-Null }
if (!(Test-Path $mem)) { New-Item -ItemType File -Path $mem | Out-Null }
Add-Content -Path $mem -Value "`n## run-folder execution ($((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')))`n- Executed scripts/run-folder.ps1 for recovery/update sweep.`n- Date scope requested: $FromDate -> $ToDate.`n- Non-destructive mode: append/update only; no deletes."

# 4) Export sessions into long-term archive
if (Test-Path ".\scripts\export_sessions.ps1") {
  powershell -ExecutionPolicy Bypass -File .\scripts\export_sessions.ps1 | Out-Host
} else {
  Write-Host "[RUN-FOLDER] export_sessions.ps1 not found, skipping session export"
}

# 5) Run backup snapshot (latest + optional zip)
if (Test-Path ".\scripts\backup_openclaw.ps1") {
  powershell -ExecutionPolicy Bypass -File .\scripts\backup_openclaw.ps1 -ZipSnapshot | Out-Host
} else {
  Write-Host "[RUN-FOLDER] backup_openclaw.ps1 not found, skipping backup"
}

# 6) Snapshot via git if repo is present
$insideGit = $false
try {
  git rev-parse --is-inside-work-tree *> $null
  if ($LASTEXITCODE -eq 0) { $insideGit = $true }
} catch {}

if ($insideGit) {
  git add -A
  git commit -m "run-folder: recovery/update sweep $FromDate to $ToDate" | Out-Host
} else {
  Write-Host "[RUN-FOLDER] Not a git repository here; skipped commit"
}

Write-Host "[RUN-FOLDER] Complete"