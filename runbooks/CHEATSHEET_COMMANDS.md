# OpenClaw Cheat Sheet Commands

## Core health
```powershell
openclaw status
openclaw doctor
openclaw gateway status
openclaw models
```

## Gateway control
```powershell
openclaw gateway stop
openclaw gateway start
openclaw gateway restart
openclaw gateway install
openclaw gateway uninstall
```

## Backup/reset
```powershell
openclaw backup create --verify
openclaw reset --dry-run
openclaw reset
openclaw uninstall --dry-run
openclaw uninstall --all --yes
```

## Onboarding/auth
```powershell
openclaw onboard --install-daemon
openclaw onboard --auth-choice openai-api-key
openclaw onboard --auth-choice openai-codex
```

## Model default
```powershell
openclaw config set agents.defaults.model.primary openai-codex/gpt-5.3-codex
openclaw gateway restart
```

## Dashboard
```powershell
openclaw dashboard
```

## TonyOS core stack scripts
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME/.openclaw/workspace/projects/TonyOS/scripts/start-core.ps1"
powershell -ExecutionPolicy Bypass -File "$HOME/.openclaw/workspace/projects/TonyOS/scripts/stop-core.ps1"
```
