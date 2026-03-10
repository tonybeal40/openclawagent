# HiringSignalAgent

## Purpose

Detect companies likely to hire RevOps / Sales Ops before the role is posted and surface the most probable outreach target.

## Inputs

- `CareerOS/data/jobs.csv`
- `CareerOS/data/companies.csv`
- `CareerOS/config/targets.json`

## Signals

- SDR hiring
- AE hiring
- Marketing Ops hiring
- Sales Enablement hiring
- Funding events
- New VP Sales / sales leadership
- Sales team expansion

## Outputs

- `CareerOS/data/hiring_signals.json`
- `CareerOS/data/daily_outreach_targets.json`
- `AI-Job-Dashboard/top_targets_today.json`

## Run Order

1. `job_scanner.py`
2. `company_scanner.py`
3. `hiring_signal_agent.py`
4. `outreach_targets.py`
5. `fit_scorer.py`
6. `dashboard_sync.py`
