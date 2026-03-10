$ErrorActionPreference = "Stop"
$source = "C:\Users\tonyb\.openclaw"
$dest = "C:\Users\tonyb\.openclaw\snapshots\$(Get-Date -Format yyyy-MM-dd)"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
robocopy $source $dest /E /R:1 /W:1 /XD snapshots
