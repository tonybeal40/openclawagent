$ErrorActionPreference = 'Stop'
$base = 'C:\Users\tonyb\.openclaw\workspace'
$outDir = Join-Path $base 'job_pipeline'
$logDir = Join-Path $base 'logs'
New-Item -ItemType Directory -Force -Path $outDir,$logDir | Out-Null

$feeds = @(
  @{ Name='TechCrunch'; Url='https://techcrunch.com/feed/' },
  @{ Name='YCombinator'; Url='https://www.ycombinator.com/blog/feed' },
  @{ Name='HN Frontpage'; Url='https://hnrss.org/frontpage' }
)

$keywords = @('hiring','funding','raised','series a','series b','revops','sales operations','automation','manufacturing','industrial')
$items = @()

foreach($f in $feeds){
  try {
    $xml = Invoke-RestMethod -Uri $f.Url -Method Get -TimeoutSec 30
    $channelItems = @($xml.rss.channel.item)
    foreach($i in $channelItems){
      $title = [string]$i.title
      $link = [string]$i.link
      $desc = [string]$i.description
      $score = 0
      foreach($k in $keywords){ if(($title + ' ' + $desc).ToLower().Contains($k)){ $score++ } }
      if($score -gt 0){
        $items += [pscustomobject]@{
          source = $f.Name
          title = $title
          link = $link
          score = $score
          date_found = (Get-Date).ToString('o')
        }
      }
    }
  } catch {
    Add-Content -Path (Join-Path $logDir 'opportunity_scanner_errors.log') -Value "[$(Get-Date -Format o)] $($f.Name): $($_.Exception.Message)"
  }
}

$items = $items | Sort-Object score -Descending -Unique
$stamp = Get-Date -Format 'yyyy_MM_dd'
$out = Join-Path $outDir "opportunities_$stamp.json"
$summary = Join-Path $outDir 'opportunities_latest_summary.json'

$items | ConvertTo-Json -Depth 5 | Set-Content -Path $out -Encoding UTF8
($items | Select-Object -First 20) | ConvertTo-Json -Depth 5 | Set-Content -Path $summary -Encoding UTF8

Write-Host "Saved $($items.Count) opportunities to $out"
