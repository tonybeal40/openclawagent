$ErrorActionPreference = 'Stop'
Write-Host 'Starting OpenClaw gateway...' -ForegroundColor Cyan
openclaw gateway start
Start-Sleep -Seconds 2
Write-Host 'OpenClaw status:' -ForegroundColor Cyan
openclaw status
openclaw gateway status
