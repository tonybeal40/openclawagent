$ErrorActionPreference='Stop'
$driveRoot='G:\My Drive\openclaw-workspace-main'
$localRoot='C:\Users\tonyb\.openclaw\workspace\inbox\drive-recent'
$ops='C:\Users\tonyb\.openclaw\workspace\ops'
$checkpoints=Join-Path $ops 'checkpoints'
$stateFile=Join-Path $checkpoints 'DRIVE_RECENT_LASTRUN.txt'
$logFile=Join-Path $checkpoints ('DRIVE_RECENT_PULL_' + (Get-Date -Format 'yyyyMMdd') + '.log')
$legacyStateFile=Join-Path $ops 'DRIVE_RECENT_LASTRUN.txt'

New-Item -ItemType Directory -Force -Path $localRoot,$ops,$checkpoints | Out-Null
if(!(Test-Path $stateFile)){ '2026-03-09T14:00:00' | Set-Content $stateFile }
$lastRun=[datetime](Get-Content $stateFile -Raw)

$recent=Get-ChildItem $driveRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $lastRun }

"[$(Get-Date -Format o)] LastRun=$lastRun NewFiles=$($recent.Count)" | Add-Content $logFile

foreach($f in $recent){
  $relative = $f.FullName.Substring($driveRoot.Length).TrimStart('\\')
  $dest = Join-Path $localRoot $relative
  $destDir = Split-Path $dest -Parent
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  Copy-Item $f.FullName $dest -Force
  "COPIED: $($f.FullName) -> $dest" | Add-Content $logFile
}

$nowIso=(Get-Date).ToString('o')
$nowIso | Set-Content $stateFile
# Back-compat mirror for existing dashboards/checks that still read ops root
$nowIso | Set-Content $legacyStateFile
Write-Host "Pulled $($recent.Count) files from recent Drive updates."