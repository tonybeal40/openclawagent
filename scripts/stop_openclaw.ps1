$ErrorActionPreference = 'Stop'
Write-Host 'Stopping OpenClaw gateway...' -ForegroundColor Yellow
openclaw gateway stop
Start-Sleep -Seconds 1
openclaw gateway status
