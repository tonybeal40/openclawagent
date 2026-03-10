$ErrorActionPreference = 'Stop'
$out = 'C:\Users\tonyb\.openclaw\workspace\OpenClawMissionControl\reports\daily_opportunity_report.txt'
$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$jobsJson = Get-ChildItem 'C:\Users\tonyb\.openclaw\workspace\job_pipeline' -Filter 'jobs_*.json' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$jobsCount = 0
if ($jobsJson) {
  try { $jobsCount = (Get-Content $jobsJson.FullName -Raw | ConvertFrom-Json).Count } catch { $jobsCount = 0 }
}

@"
DAILY REPORT
Generated: $now

Jobs Found
$jobsCount

Companies Hiring
(see latest company research output)

Funding News
(see trend scanner output)

Best Opportunity
(see TOP_OPPORTUNITIES file)
"@ | Set-Content -Path $out -Encoding UTF8

Write-Host "REPORT_READY=$out"
