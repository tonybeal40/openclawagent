param(
  [switch]$InstallN8N,
  [switch]$InstallOllama,
  [switch]$InitGit
)

$ErrorActionPreference = 'Stop'

Write-Host "[FREE-STACK] Starting checks..."

# Node check (required for n8n)
try {
  $node = node -v
  $npm = npm -v
  Write-Host "[FREE-STACK] Node OK: $node / npm $npm"
} catch {
  Write-Host "[FREE-STACK] Node missing. Install Node.js LTS first."
}

if ($InstallN8N) {
  Write-Host "[FREE-STACK] Installing n8n globally..."
  npm install -g n8n
  Write-Host "[FREE-STACK] n8n install complete. Run: n8n start"
}

if ($InstallOllama) {
  Write-Host "[FREE-STACK] Ollama install is OS/package-manager dependent."
  Write-Host "[FREE-STACK] On Windows: download from https://ollama.com/download/windows"
  Write-Host "[FREE-STACK] Then run: ollama pull qwen2.5:14b"
}

if ($InitGit) {
  if (-not (Test-Path ".git")) {
    git init | Out-Host
    Write-Host "[FREE-STACK] Initialized local git repo."
  } else {
    Write-Host "[FREE-STACK] Git repo already exists."
  }
}

Write-Host "[FREE-STACK] Done."
