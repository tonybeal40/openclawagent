# SCHEDULE (Token-Safe, Low-AI)

## Daily Runtime Plan
- 07:00 AM — `OpenClawTrendScanner_0700`
- 08:00 AM — `OpenClawJobHunter_0800`
- 09:00 AM — `OpenClawLeadBuilder_0900`
- 12:30 PM — `OpenClawWorkspaceBackupMidday`
- 02:00 PM — `OpenClawJobHunter_1400`
- 08:00 PM — `OpenClawJobHunter_2000`
- 08:45 PM — `OpenClawTopOpportunities_2045`
- 09:30 PM — `OpenClawWorkspaceBackupDaily`

## Operating Rule
- Scripts collect/filter data.
- AI is used only for final ranking/writing when explicitly requested.

## Manual commands
- Run full pipeline now:
  `powershell -ExecutionPolicy Bypass -File C:\Users\tonyb\.openclaw\workspace\scripts\run-daily-pipeline.ps1`
- Build top opportunities report now:
  `powershell -ExecutionPolicy Bypass -File C:\Users\tonyb\.openclaw\workspace\scripts\build_top_opportunities.ps1`
