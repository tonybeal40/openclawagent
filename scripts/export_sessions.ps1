param(
  [string]$Source = "C:\Users\tonyb\.openclaw\agents\main\sessions",
  [string]$Dest = "C:\Users\tonyb\.openclaw\archive\sessions"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
robocopy $Source $Dest /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NP | Out-Null
Write-Output "Session export complete: $Dest"