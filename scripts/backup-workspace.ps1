param(
  [string]$Source = "C:\Users\tonyb\.openclaw\workspace",
  [string]$BackupRoot = "G:\My Drive\openclaw-workspace-main",
  [switch]$Mirror
)

$ErrorActionPreference = 'Stop'
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$logDir = "C:\Users\tonyb\.openclaw\workspace\ops"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$mode = if($Mirror){"/MIR"} else {"/E"}
$exclude = @('/XD','node_modules','.git','archive','logs')
$cmd = @('robocopy',"`"$Source`"", "`"$BackupRoot`"", $mode, '/R:1','/W:1','/FFT','/Z','/XA:SH','/NFL','/NDL','/NP') + $exclude

$log = Join-Path $logDir "BACKUP_RUN_$ts.log"
"Running: $($cmd -join ' ')" | Set-Content $log
& robocopy $Source $BackupRoot $mode /R:1 /W:1 /FFT /Z /XA:SH /NFL /NDL /NP /XD node_modules .git archive logs | Tee-Object -FilePath $log -Append | Out-Null

$exit = $LASTEXITCODE
"Robocopy exit code: $exit" | Add-Content $log
Write-Host "Backup complete. Log: $log | ExitCode: $exit"
