# COST_GUARDRAILS.md

## Objective
Reduce runaway usage and preserve model quota.

## Guardrails
- Keep reasoning concurrency low (`maxConcurrent` minimal).
- Prefer tools/scripts first, AI reasoning second.
- Avoid unattended loops without stop conditions.
- Run project-by-project, not whole-workspace context.

## Operational Limits (policy)
- Max active reasoning streams: 1
- Trigger warning on large sessions / repeated retries
- Stop and review if repeated quota errors appear

## Monitoring
- Review usage dashboard daily.
- Log expensive runs to `workspace\ops`.
- Keep backup and restore logs current.
