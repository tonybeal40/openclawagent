# DAILY_OPS

## Morning run order
1. Run/verify `daily-company-research`
2. Run/verify `daily-job-hunt`
3. Calvin coordinator pass (prioritize money opportunities)
4. Worker sequence: Albert -> Sam -> William
5. Build sequence: Bryer/Beckham -> Jared/Azeem -> Saylor -> Bill
6. Kelly QA pass + final summary

## Output expectations
- Top opportunities list (ranked)
- Company + contact enrichment file
- Outreach drafts
- Build changelog per project
- QA checklist

## Guardrails
- Keep reasoning concurrency low.
- Use tools/script operations first; AI reasoning only where needed.
- Persist outputs to files under each project + `workspace/logs`.
- Archive conflicts instead of destructive overwrite.
