# Overnight Artifact Ledger Template

Date: {{YYYY-MM-DD}}
Window: {{START_LOCAL}} -> {{END_LOCAL}} (America/Chicago)
Run ID: {{RUN_ID}}

## Summary
- Total changed files: {{COUNT}}
- Primary pipelines run: {{PIPELINES}}
- Overall status: {{OK|PARTIAL|FAILED}}

## Changed Files (artifact-proof)
| # | Path | LastWriteTime (local) | Size (bytes) | Proof note |
|---|------|-----------------------|--------------|------------|
| 1 | {{path}} | {{time}} | {{size}} | {{what changed}} |

## Key Outputs
- {{output_1}}
- {{output_2}}
- {{output_3}}

## Blockers / Risks
- {{blocker_1}}
- {{blocker_2}}

## First Actions for Morning
1. {{action_1}}
2. {{action_2}}
3. {{action_3}}

## Validation Checks
- [ ] At least 5 files changed in target dirs (`outputs/`, `deliverables/`, `OpenClawMissionControl/`)
- [ ] No critical script errors in logs
- [ ] Summary posted to morning handoff
