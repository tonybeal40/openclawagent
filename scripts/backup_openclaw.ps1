param(
  [string]$SourceRoot = "C:\Users\tonyb\.openclaw",
  [string]$BackupRoot = "C:\Users\tonyb\OpenClawBackups",
  [switch]$ZipSnapshot
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$latest = Join-Path $BackupRoot "latest"
$snaps = Join-Path $BackupRoot "snapshots"
$logs = Join-Path $BackupRoot "logs"

New-Item -ItemType Directory -Force -Path $latest,$snaps,$logs | Out-Null

$targets = @("workspace","agents","cron","memory")

foreach ($t in $targets) {
  $src = Join-Path $SourceRoot $t
  if (Test-Path $src) {
    $dst = Join-Path $latest $t
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
    robocopy $src $dst /MIR /FFT /R:2 /W:2 /XD ".git" "node_modules" ".venv" "__pycache__" /NFL /NDL /NP | Out-Null
  }
}

$manifest = Join-Path $logs ("manifest-" + $ts + ".txt")
Get-ChildItem $latest -Recurse -File | Select-Object FullName,Length,LastWriteTime | Sort-Object FullName | Out-File -FilePath $manifest -Encoding utf8

if ($ZipSnapshot) {
  $zip = Join-Path $snaps ("openclaw-" + $ts + ".zip")
  if (Test-Path $zip) { Remove-Item $zip -Force }
  Compress-Archive -Path (Join-Path $latest "*") -DestinationPath $zip -CompressionLevel Fastest
}

Write-Output "Backup complete: $latest"
Write-Output "Manifest: $manifest"
