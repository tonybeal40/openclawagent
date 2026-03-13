# README_OPENCLAW

## Goal
Collect opportunities, rank opportunities, generate outreach, create pipeline.

## Start/Stop
- Start: `powershell -File scripts/start_openclaw.ps1`
- Stop: `powershell -File scripts/stop_openclaw.ps1`

## Daily loop
1. Run scanners (scripts)
2. Refresh mission control
3. Build top opportunities
4. Generate daily report

## Key files
- Dashboard: `OpenClawMissionControl/dashboard/mission_control.html`
- DB: `OpenClawMissionControl/data/opportunity_db.sqlite`
- Daily report: `OpenClawMissionControl/reports/daily_opportunity_report.txt`
