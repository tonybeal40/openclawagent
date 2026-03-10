# SECURITY.md

## Secrets and Keys
- Store keys in secure config/env locations only.
- Never commit keys/tokens to Git.
- Rotate exposed tokens immediately.

## Network Security
- Keep gateway bound to loopback unless LAN access is explicitly required.
- Keep gateway auth enabled (token mode).
- Avoid exposing management ports publicly.

## Local Host Hygiene
- Keep OS updates current.
- Use endpoint protection and firewall defaults.
- Use disk encryption where available.

## Backup Security
- Use copy-first backups and archive trails.
- Keep at least two daily backup points (midday + nightly).
- Verify backups with logs and restore checks.

## Incident Response (if a key leaks)
1. Revoke/rotate leaked key/token.
2. Update local config/secret store.
3. Restart affected services.
4. Audit logs for suspicious usage.
5. Document incident in `workspace\ops`.
