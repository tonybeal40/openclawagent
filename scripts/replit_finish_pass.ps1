$ErrorActionPreference='Continue'
$base='C:\Users\tonyb\.openclaw\workspace\projects'
$targets=@('replit-standalone','replit-standalone-ui')
$logDir='C:\Users\tonyb\.openclaw\workspace\logs'
$opsDir='C:\Users\tonyb\.openclaw\workspace\ops'
New-Item -ItemType Directory -Force -Path $logDir,$opsDir | Out-Null
$ts=Get-Date -Format 'yyyyMMdd-HHmmss'
$log=Join-Path $logDir "replit_finish_$ts.log"
$report=Join-Path $opsDir "REPLIT_FINISH_REPORT_$ts.md"

$lines=@()
$lines += "# Replit Finish Report"
$lines += "Generated: $(Get-Date -Format o)"
$lines += ""

foreach($t in $targets){
  $p=Join-Path $base $t
  $lines += "## $t"
  if(!(Test-Path $p)){
    $lines += "- Missing: $p"
    $lines += ""
    continue
  }

  $lines += "- Path: $p"
  $pkg=Join-Path $p 'package.json'
  if(Test-Path $pkg){
    $lines += "- package.json: yes"
    Push-Location $p
    cmd /c "npm install" >> $log 2>&1
    $npmInstallCode=$LASTEXITCODE
    $lines += "- npm install exit: $npmInstallCode"

    $pkgJson=Get-Content $pkg -Raw | ConvertFrom-Json
    $scripts = @{}
    if($pkgJson.scripts){ $scripts = $pkgJson.scripts.PSObject.Properties | ForEach-Object { $_.Name } }
    $lines += "- scripts: $($scripts -join ', ')"

    if($scripts -contains 'build'){
      cmd /c "npm run build" >> $log 2>&1
      $buildCode=$LASTEXITCODE
      $lines += "- npm run build exit: $buildCode"
    } else {
      $lines += "- npm run build: skipped (no build script)"
    }

    if($scripts -contains 'start'){
      $lines += "- npm start: available (not launched in pass)"
    } elseif($scripts -contains 'dev') {
      $lines += "- npm run dev: available (not launched in pass)"
    } else {
      $lines += "- start/dev script: none detected"
    }

    Pop-Location
  } else {
    $lines += "- package.json: no"
  }
  $lines += ""
}

$lines += "Log file: $log"
$lines | Set-Content -Path $report -Encoding UTF8
Write-Host "Report: $report"
Write-Host "Log: $log"
