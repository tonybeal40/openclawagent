# Mission Control (JS)

Lightweight JavaScript Mission Control inspired by the transcript you shared.

## Screens included
- Task Board (Kanban + activity)
- Calendar (scheduled jobs)
- Projects (progress + priority)
- Memories (daily + long-term)
- Docs (searchable)
- Team (roles + mission)
- Office (fun activity wall)

## Run
Open `index.html` directly, or serve this folder:

```powershell
cd projects/mission-control-js
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Data
Everything uses localStorage for now so you can prototype quickly.

## Next integration steps
1. Wire cron jobs via OpenClaw `cron.list` / `cron.runs` export
2. Wire memory files from `memory/*.md` and `MEMORY.md`
3. Wire docs index from project markdown/doc outputs
4. Add worker sync from `ops/WORKER_ROSTER.md`
