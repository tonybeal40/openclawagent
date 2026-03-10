$ErrorActionPreference = 'Stop'
$base='C:\Users\tonyb\.openclaw\workspace'
$pyCandidates = @(
  'C:\Users\tonyb\AppData\Local\Programs\Python\Python312\python.exe',
  'py',
  'python'
)

$scanner = Join-Path $base 'scripts\job_scanner.py'
$opp = Join-Path $base 'scripts\opportunity_scanner.ps1'

Write-Host '=== Daily Pipeline Start ===' -ForegroundColor Cyan

$ranPython = $false
foreach($p in $pyCandidates){
  try {
    if($p -eq 'py' -or $p -eq 'python'){
      & $p $scanner
    } else {
      if(Test-Path $p){ & $p $scanner } else { continue }
    }
    $ranPython = $true
    break
  } catch {
    continue
  }
}

if(-not $ranPython){
  throw 'Python not found for job_scanner.py execution.'
}

& powershell -ExecutionPolicy Bypass -File $opp

Write-Host '=== Daily Pipeline Complete ===' -ForegroundColor Green
Write-Host 'Outputs:'
Write-Host '- C:\Users\tonyb\.openclaw\workspace\job_pipeline\jobs_YYYY_MM_DD.json'
Write-Host '- C:\Users\tonyb\.openclaw\workspace\job_pipeline\opportunities_YYYY_MM_DD.json'
