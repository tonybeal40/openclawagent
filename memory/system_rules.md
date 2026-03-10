# System Rules

Workspace root:
`C:\Users\tonyb\.openclaw`

Maintain this folder structure:
- agents
- archive
- knowledge
- logs
- memory
- sessions
- snapshots
- automation
- workspace

Rules:
- Prefer append/update over overwrite.
- Keep recovery artifacts and runbooks as source of truth.
- Use startup routine: `python C:\Users\tonyb\.openclaw\automation\organize_workspace.py`
- Use manual snapshot: `powershell C:\Users\tonyb\.openclaw\automation\snapshot.ps1`
