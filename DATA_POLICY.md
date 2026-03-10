# DATA_POLICY.md

## Data Stored
- Project source files, scripts, runbooks
- Session/transcript artifacts
- Logs/reports and backup manifests

## Temporary vs Durable
- Temporary: transient tool outputs, intermediate run files
- Durable: project code, runbooks, memory notes, restore/backup reports

## Retention Rules
- Keep operational logs needed for troubleshooting and audit.
- Archive before overwrite/delete operations.
- Periodically prune stale temporary files.

## Log Handling
- Logs live under `workspace\logs` and `workspace\ops`.
- Do not include secrets in logs.

## Anonymization
- Redact personal or sensitive identifiers in shared summaries.
- Keep external sharing minimal and approved.

## Consent
- Process user personal data only with explicit user direction.
