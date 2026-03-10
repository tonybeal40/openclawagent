$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')
$proj = Resolve-Path (Join-Path $PSScriptRoot '..')
$dataDir = Join-Path $proj 'data'
New-Item -ItemType Directory -Force $dataDir | Out-Null

# Memories (daily)
$memDir = Join-Path $root 'memory'
$memories = @()
if (Test-Path $memDir) {
  Get-ChildItem $memDir -Filter '*.md' -File | Sort-Object Name -Descending | Select-Object -First 20 | ForEach-Object {
    $txt = Get-Content $_.FullName -Raw
    $first = ($txt -split "`r?`n" | Where-Object { $_.Trim() -ne '' } | Select-Object -First 1)
    if ($null -eq $first) { $first = '' }
    $memories += [pscustomobject]@{ day = $_.BaseName; note = $first }
  }
}
$memories | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $dataDir 'memories.json')

# Long-term memory snapshot
$lt = Join-Path $root 'MEMORY.md'
if (Test-Path $lt) {
  $ltRaw = Get-Content $lt -Raw
  [pscustomobject]@{ title='MEMORY.md'; excerpt = ($ltRaw.Substring(0, [Math]::Min(1200, $ltRaw.Length))) } | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $dataDir 'longterm-memory.json')
}

# Team from roster markdown (simple line parse)
$team = @()
$roster = Join-Path $root 'ops\WORKER_ROSTER.md'
if (Test-Path $roster) {
  $lines = Get-Content $roster
  foreach ($line in $lines) {
    if ($line -match '^\- \*\*(.+?)\*\*') {
      $team += [pscustomobject]@{ name = $matches[1]; role = 'Worker' }
    }
  }
}
$team | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $dataDir 'team.json')

# Docs index (md/txt in runbooks, outputs, memory)
$docs = @()
$docRoots = @('runbooks','outputs','memory') | ForEach-Object { Join-Path $root $_ }
foreach ($dr in $docRoots) {
  if (Test-Path $dr) {
    Get-ChildItem $dr -Recurse -File -Include *.md,*.txt,*.json -ErrorAction SilentlyContinue | Select-Object -First 200 | ForEach-Object {
      $docs += [pscustomobject]@{ title = $_.BaseName; category = $_.Directory.Name; path = $_.FullName.Replace($root.Path + '\\','') }
    }
  }
}
$docs | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $dataDir 'docs.json')

# Cron jobs snapshot via OpenClaw CLI optional (best effort)
$cronOut = Join-Path $dataDir 'jobs.json'
try {
  $json = openclaw cron list --json 2>$null
  if ($LASTEXITCODE -eq 0 -and $json) { $json | Set-Content $cronOut }
  else { '[]' | Set-Content $cronOut }
} catch { '[]' | Set-Content $cronOut }

Write-Output "Exported data to $dataDir"