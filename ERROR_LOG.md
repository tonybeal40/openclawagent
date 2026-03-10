# ERROR LOG

## 2026-03-09
- Issue: `RUN_ALL_WORKERS.ps1` parse failure due to escaped apostrophe in single-quoted strings (`today\'s`).
- Fix: Replaced with PowerShell-safe `today''s` quoting.
- Result: Script executes and prints full worker relaunch plan.

- Issue: Attempted to run Python scripts through `powershell -File` caused extension error.
- Fix: Execute `.py` via Python directly (`python.exe script.py`).
- Result: trend/job/lead pipelines ran successfully.
