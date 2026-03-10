# SYSTEM ARCHITECTURE

Internet/Sources
↓
Scanner Scripts (job/company/signal)
↓
Data Files (`outputs/`, `job_pipeline/`, `data/`)
↓
AI Ranking + Summaries (mini/standard models)
↓
Outreach + Action Queue
↓
Mission Control Dashboard + Daily Report

## Core control plane
- OpenClaw Gateway (`127.0.0.1:18789`)
- Main agent + role-mapped workers
- Scheduled tasks + cron one-shots

## Design rules
- Automation first, AI second.
- Scripts collect. AI summarizes/ranks/writes.
- Keep context bounded and outputs file-based.
