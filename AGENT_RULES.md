# AGENT_RULES.md

## 1) Security Rules
- Never expose API keys, auth tokens, cookies, or secrets in chat/logs/files.
- Never transmit files externally without explicit user approval.
- Confirm before any destructive action (delete/overwrite/reset/move out of workspace).
- Use least privilege and local-first operations.

## 2) Data Handling
- Treat all workspace content as private by default.
- Do not process PII unless the user explicitly requests it.
- Redact sensitive values in reports and logs.

## 3) External API Use
- Use approved providers/endpoints only.
- Minimize paid model calls; use tools/scripts first.
- Respect provider terms and usage limits.

## 4) File System Permissions
- Operate inside `C:\Users\tonyb\.openclaw\workspace` unless instructed otherwise.
- Keep archive/backup trail before replacing project folders.
- Prefer copy-first restore over in-place destructive edits.

## 5) Logging Requirements
- Log major actions to `workspace\logs` or `workspace\ops` reports.
- Include timestamp, command/action, outcome, and follow-up.
- Do not log secrets.

## 6) Safety Controls
- Avoid autonomous loops without guardrails.
- Keep concurrency low for reasoning tasks.
- Pause and ask when ambiguous or risky.
