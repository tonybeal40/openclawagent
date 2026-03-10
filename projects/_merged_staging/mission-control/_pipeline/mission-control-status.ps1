$ErrorActionPreference='Stop'
$base='C:\Users\tonyb\.openclaw\workspace'
$outDir=Join-Path $base 'deliverables\mission-control'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$out=Join-Path $outDir 'mission_control_status.md'

$tasks=@('OpenClawTrendScanner_0700','OpenClawJobHunter_0800','OpenClawLeadBuilder_0900','OpenClawJobHunter_1400','OpenClawJobHunter_2000','OpenClawTopOpportunities_2045','OpenClawWorkspaceBackupMidday','OpenClawWorkspaceBackupDaily')
$lines=@()
$lines += '# Mission Control Status'
$lines += "Generated: $(Get-Date -Format o)"
$lines += ''
$lines += '## Projects'
Get-ChildItem (Join-Path $base 'projects') -Directory | Sort-Object Name | ForEach-Object { $lines += "- $($_.Name)" }
$lines += ''
$lines += '## Scheduled Tasks'
foreach($t in $tasks){
  $q = schtasks /Query /TN $t /FO LIST /V 2>$null
  if($LASTEXITCODE -eq 0){
    $next = ($q | Select-String 'Next Run Time').ToString().Split(':',2)[1].Trim()
    $status = ($q | Select-String '^Status:').ToString().Split(':',2)[1].Trim()
    $lines += "- $t | $status | next: $next"
  } else {
    $lines += "- $t | NOT FOUND"
  }
}
$lines += ''
$lines += '## Output files snapshot'
Get-ChildItem (Join-Path $base 'outputs') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 20 | ForEach-Object { $lines += "- $($_.FullName) | $($_.LastWriteTime)" }

$lines | Set-Content -Path $out -Encoding UTF8
Write-Host "Saved: $out"
