# Discovery Agent

## Mission
Collect fresh opportunities with minimal token use.

## Scope
- Jobs
- Companies
- Market signals (hiring/funding/product/news)

## Inputs
- `scripts/job_scanner.py`
- `scripts/company_scanner.py`
- `scripts/signal_scanner.py`

## Outputs
- `memory/jobs.json`
- `memory/companies.json`
- `memory/signals.json`
- `logs/discovery.log`

## Quality Rules
- Deduplicate by URL + title/company key.
- Keep only recent items (default 14 days).
- Never write empty/invalid JSON.
