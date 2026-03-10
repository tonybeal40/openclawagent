param(
  [Parameter(Mandatory=$true)]
  [string]$Url
)

$ErrorActionPreference='Stop'
$base='C:\Users\tonyb\.openclaw\workspace'
$outDir=Join-Path $base 'outputs\company_scans'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
$html = $resp.Content

$title = ''
if($html -match '<title>(.*?)</title>'){ $title = $matches[1] }
$metaDesc = ''
if($html -match 'name="description"\s+content="([^"]+)"'){ $metaDesc = $matches[1] }

$host = ([uri]$Url).Host.Replace('www.','').Replace('.','_')
$out = Join-Path $outDir ("${host}_report.md")

$report = @()
$report += "# Company Intelligence Report"
$report += ""
$report += "- URL: $Url"
$report += "- Title: $title"
$report += "- Meta Description: $metaDesc"
$report += "- Scanned At: $(Get-Date -Format o)"
$report += ""
$report += "## Sales Strategy Draft"
$report += "- Customer hypothesis: derive from product/category language on site"
$report += "- Problem hypothesis: growth, ops efficiency, pipeline consistency"
$report += "- Competition hypothesis: identify peers in same category"
$report += "- Buying triggers: hiring growth, new launches, funding/news"
$report += "- Sales angle: RevOps automation + outbound intelligence"
$report += "- Decision maker targets: VP Sales, RevOps, Sales Ops, COO"

$report -join "`n" | Set-Content -Path $out -Encoding UTF8
Write-Host "Saved report to $out"
