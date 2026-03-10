$ErrorActionPreference='Stop'
$base='C:\Users\tonyb\.openclaw\workspace'
$jobsCsv=Join-Path $base 'outputs\jobs\daily_job_pipeline.csv'
$leadsCsv=Join-Path $base 'outputs\leads\high_value_targets.csv'
$trendsMd=Join-Path $base 'outputs\research\ai_money_trends.md'
$outDir=Join-Path $base 'deliverables\opportunities'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$date=Get-Date -Format 'yyyy-MM-dd'
$out=Join-Path $outDir ("TOP_OPPORTUNITIES_$date.md")

$lines=@()
$lines += "# Top Opportunities - $date"
$lines += "Generated: $(Get-Date -Format o)"
$lines += ""

if(Test-Path $jobsCsv){
  $jobs=Import-Csv $jobsCsv | Sort-Object {[int]$_.score} -Descending | Select-Object -First 15
  $lines += "## Top Jobs (15)"
  foreach($j in $jobs){
    $lines += "- [$($j.source)] $($j.title) @ $($j.company) ($($j.location)) | score=$($j.score) | $($j.url)"
  }
  $lines += ""
}

if(Test-Path $leadsCsv){
  $leads=Import-Csv $leadsCsv | Sort-Object {[int]$_.score} -Descending | Select-Object -First 15
  $lines += "## Top Company Targets (15)"
  foreach($l in $leads){
    $lines += "- $($l.company) | $($l.industry) | employees=$($l.employees) | $($l.website)"
  }
  $lines += ""
}

if(Test-Path $trendsMd){
  $trendLines=Get-Content $trendsMd | Select-Object -First 40
  $lines += "## Trend Signals (excerpt)"
  $lines += $trendLines
  $lines += ""
}

$lines | Set-Content -Path $out -Encoding UTF8
Write-Host "Saved: $out"
