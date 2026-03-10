# OPENCLAW MASTER RUNBOOK

Updated: 2026-03-09
Owner: Tony

## 0) Mission
Keep OpenClaw stable on main computer, recover fast when broken, and run job/opportunity intelligence daily.

## 1) Golden rules
1. Backup before major change.
2. Change one thing at a time.
3. Keep gateway local (`loopback`).
4. Keep one primary model default.
5. Log decisions in memory files.

## 2) Health check (daily)
```powershell
openclaw status
openclaw doctor
openclaw gateway status
openclaw models
```

## 3) Fast recovery sequence
### If gateway is down
```powershell
openclaw gateway stop
openclaw gateway start
openclaw gateway status
openclaw status
```

### If config errors appear
```powershell
openclaw backup create --verify
openclaw doctor --fix
openclaw gateway restart
openclaw status
```

### If setup is messy but recoverable
```powershell
openclaw reset --dry-run
openclaw reset
openclaw onboard --install-daemon
```

### If setup is severely broken
```powershell
openclaw uninstall --dry-run
openclaw uninstall --all --yes
openclaw onboard --install-daemon
```

## 4) Auth/model switching protocol
### Mode A (API budget mode)
- Auth: `openai-api-key`
- Model target: `openai/gpt-4.1-mini`

```powershell
openclaw onboard --auth-choice openai-api-key
```

### Mode B (subscription mode)
- Auth: `openai-codex`
- Model target: `openai-codex/gpt-5.3-codex`

```powershell
openclaw onboard --auth-choice openai-codex
```

### Set primary model explicitly
```powershell
openclaw config set agents.defaults.model.primary openai-codex/gpt-5.3-codex
openclaw gateway restart
```

## 5) Workspace & memory hygiene
- Keep active work in `workspace/projects/*`.
- Keep runbooks in `workspace/runbooks/*`.
- Keep daily notes in `workspace/memory/YYYY-MM-DD.md`.
- Archive before destructive cleanup.

## 6) Weekly maintenance
```powershell
openclaw backup create --verify
openclaw status --deep
```
- Review `memory/weekly-lessons.md`
- Update `MEMORY.md` with durable lessons
- Remove dead workflows/jobs

## 7) Laptop later (secondary)
- Keep desktop primary.
- Do migration only after main is stable.
- Verify after move:
```powershell
openclaw status
openclaw doctor
```
