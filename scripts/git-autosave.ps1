$ErrorActionPreference = "Stop"

$repo = "C:\Users\tonyb\.openclaw\workspace"
Set-Location $repo

# Pull first to reduce push rejects from remote-first edits
try {
  git pull --rebase --autostash origin master | Out-Null
} catch {
  # continue; commit/push may still work
}

$status = git status --porcelain
if (-not $status) {
  Write-Output "NO_CHANGES"
  exit 0
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$msg = "autosave: checkpoint $stamp"

git add -A

try {
  git commit -m $msg | Out-Null
} catch {
  # if nothing commit-worthy after add (edge case), stop cleanly
  Write-Output "NOTHING_TO_COMMIT"
  exit 0
}

# Try push once; if rejected, rebase and retry once
try {
  git push origin master | Out-Null
  Write-Output "PUSHED"
} catch {
  try {
    git pull --rebase --autostash origin master | Out-Null
    git push origin master | Out-Null
    Write-Output "PUSHED_AFTER_REBASE"
  } catch {
    Write-Output "PUSH_FAILED"
    exit 1
  }
}
