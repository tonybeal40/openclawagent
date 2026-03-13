$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$required = @(
  'index.html',
  'style.css',
  'headshot-final.png',
  'assets/linkedin-background-banner.png',
  'assets/linkedin-article-cover.png'
)

$missing = @()
foreach ($f in $required) {
  if (-not (Test-Path $f)) { $missing += $f }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing required files:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$html = Get-Content index.html -Raw
$checks = @(
  'mailto:tonybeal40@gmail.com',
  'https://www.linkedin.com/in/tony-beal40/',
  'assets/linkedin-background-banner.png',
  'assets/linkedin-article-cover.png'
)

$bad = @()
foreach ($c in $checks) {
  if ($html -notmatch [regex]::Escape($c)) { $bad += $c }
}

if ($bad.Count -gt 0) {
  Write-Host "Missing required references in index.html:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "Predeploy check PASSED" -ForegroundColor Green
