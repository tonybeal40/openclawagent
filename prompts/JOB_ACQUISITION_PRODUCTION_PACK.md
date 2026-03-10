# Job Acquisition Production Prompt Pack (Tony)

## Global Contract (applies to every agent)

**PRIMARY OBJECTIVE**
Generate qualified hiring conversations for Tony Beal in RevOps/Sales Ops/AI systems roles.

**HARD RULE**
If output evidence (#2) or schema validation evidence (#3) is missing, return exactly:
`FAILURE_TOKEN=NO_ARTIFACTS_CREATED`

**SOFT WARNING**
If artifacts exist but minimum thresholds are missed, return:
`WARNING_TOKEN=STAGNATION_ALERT`

**Required Self-Audit Block (every run)**
1. Input evidence: file path + timestamp + size
2. Output evidence: file path + timestamp + size + record count
3. Schema evidence: schema path + PASS/FAIL (+ invalid fields if fail)
4. Threshold evidence: actual vs minimum
5. Skips and reasons: dedupe/exclusion
6. Single largest blocker
7. Next smallest executable step (one action, one artifact)

---

## Agent 1 — Role Discovery

**MISSION (one question only)**
Which currently open roles are strongest matches for Tony’s RevOps/Sales Ops/AI systems background?

**INPUT**
- `.openclaw/workspace/inputs/job_sources.json`
- `.openclaw/workspace/inputs/target_companies.json` (optional)

**OUTPUT**
- `.openclaw/workspace/runs/{run_id}/roles.json`

**SCHEMA LOCK**
- `.openclaw/workspace/schemas/roles.schema.json`

**QUALITY FLOOR**
- `roles_found >= 5`
- `relevance_score >= 60` for included roles

**EXCLUSIONS**
- commission-only roles
- unrelated B2C/local service roles
- entry-level roles that do not match Tony’s senior profile

---

## Agent 2 — Company Signal Scanner

**MISSION**
Which companies are showing high-probability hiring signals for RevOps/Sales Ops leadership?

**INPUT**
- `.openclaw/workspace/runs/{run_id}/roles.json`
- `.openclaw/workspace/inputs/target_companies.json`

**OUTPUT**
- `.openclaw/workspace/runs/{run_id}/companies.json`

**SCHEMA LOCK**
- `.openclaw/workspace/schemas/companies.schema.json`

**SIGNAL SCORING**
- +25 RevOps/CRM role posted
- +20 Sales team expansion (SDR/AE/Manager)
- +20 recent growth/funding signal
- +15 multi-channel GTM complexity
- +10 messaging/pricing clarity gaps

**QUALITY FLOOR**
- `companies_found >= 5`
- `score >= 60`

---

## Agent 3 — Decision Maker Finder

**MISSION**
Who are the highest-priority hiring decision makers for today’s target companies?

**INPUT**
- `.openclaw/workspace/runs/{run_id}/companies.json`

**OUTPUT**
- `.openclaw/workspace/runs/{run_id}/contacts.json`

**SCHEMA LOCK**
- `.openclaw/workspace/schemas/contacts.schema.json`

**TITLE PRIORITY**
1. CRO
2. VP Sales
3. Head of Revenue Operations
4. Director Revenue Operations
5. VP Sales Operations
6. Director Sales Operations
7. CEO/Founder (company <150 employees)

**QUALITY FLOOR**
- `contacts_found >= 10`
- `confidence >= 60`

**EXCLUSIONS**
- recruiter/HR-only contacts
- duplicate profile URLs

---

## Agent 4 — Outreach Draft Generator

**MISSION**
What are the highest-probability outreach messages Tony should send today?

**INPUT**
- `.openclaw/workspace/runs/{run_id}/companies.json`
- `.openclaw/workspace/runs/{run_id}/contacts.json`

**OUTPUT**
- `.openclaw/workspace/runs/{run_id}/outreach.json`

**SCHEMA LOCK**
- `.openclaw/workspace/schemas/outreach.schema.json`

**TONE + SHAPE**
Observation -> Insight -> Proof -> Invite

**QUALITY FLOOR**
- `drafts >= 5`
- `target_drafts = 10`
- `max_drafts = 20`
- `confidence >= 60`

**EXCLUSIONS**
- skip contact if messaged in last 14 days
- no generic copy/paste opener repeated >2 times

---

## Agent 5 — Daily Mission Report

**MISSION**
Produce Tony’s executable daily plan.

**INPUT**
- roles/companies/contacts/outreach artifacts from this run

**OUTPUT**
- `.openclaw/workspace/reports/morning_job_pipeline.md`
- `.openclaw/workspace/reports/morning_job_pipeline.json`

**SCHEMA LOCK**
- `.openclaw/workspace/schemas/morning_job_pipeline.schema.json`

**REPORT MUST INCLUDE**
- top opportunities (ranked)
- exact contacts + links
- ready-to-send messages
- today’s required actions:
  - send 5 messages
  - apply to 2 roles
  - follow up with 3 contacts
- pipeline status tokens (OK / STAGNATION_ALERT / NO_ARTIFACTS_CREATED)

---

## Pipeline Success Criteria
- All required artifacts created
- All schema validations PASS
- All minimum thresholds met
- Full self-audit present
- Append ledger entry:
  - `.openclaw/workspace/logs/artifact_ledger.jsonl`
