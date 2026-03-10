# CareerOS

Local automation workspace for Tony Beal's job search system.

## Structure

- `config/targets.json`: role, industry, location, and scoring preferences
- `config/sources.json`: approved public sources for jobs and company scans
- `data/`: generated outputs
- `scripts/`: Python automation scripts

## Core scripts

- `job_scanner.py`: collects and scores jobs from approved feeds
- `company_scanner.py`: collects company-level intelligence from approved sources
- `lead_tracker.py`: manages local outreach pipeline data
- `daily_digest.py`: builds a daily summary report
- `run_all.py`: runs the full morning workflow

## Run

```powershell
cd C:\Users\tonyb\CareerOS
python .\scripts\run_all.py
```

## Notes

- These scripts use local files first and avoid third-party APIs by default.
- External scanning should be limited to public, approved sources only.
