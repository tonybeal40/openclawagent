# MASTER_INDEX.md

## SYSTEM OVERVIEW
- Gateway: OpenClaw local gateway (`127.0.0.1:18789`)
- Agents: main + named worker roster in `workspace\ops\WORKER_ROSTER.md`
- Jobs: cron schedule in `.openclaw\cron\jobs.json`
- Tools: file ops, exec, browser, cron, memory

## FOLDER STRUCTURE
- `workspace\projects` active projects
- `workspace\ops` restore/backup/inventory reports
- `workspace\runbooks` operational guides
- `workspace\scripts` automation scripts
- `workspace\logs` runtime logs
- `workspace\memory` daily durable notes

## COMMON COMMANDS
- `openclaw status`
- `openclaw status --deep`
- `openclaw gateway start|stop|restart`
- `openclaw update status`
- `openclaw security audit --deep`
- `openclaw doctor --fix`

## RECOVERY PROCEDURES
1. Restart gateway: `openclaw gateway restart`
2. Verify status: `openclaw status --deep`
3. Restore projects (copy-first) from Drive mirror
4. Check reports in `workspace\ops\RESTORE_REPORT_*.md`

## API PROVIDERS
- OpenAI Codex OAuth (`openai-codex/gpt-5.3-codex`)
- Optional free/local alternatives (Kimi/Ollama) by policy

## TROUBLESHOOTING QUICK HITS
- Gateway unreachable: ensure service running + loopback bind + token auth
- API quota reached: throttle workloads; use fallback model; wait reset window
- Missing workers: use `WORKER_ROSTER.md` + relaunch map script
- Project missing: restore from Drive mirror + check archive trail
