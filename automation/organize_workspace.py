import os
import shutil
from datetime import datetime

base = r"C:\Users\tonyb\.openclaw"
folders = [
    "agents", "archive", "knowledge", "logs", "memory",
    "sessions", "snapshots", "automation", "workspace"
]

for f in folders:
    os.makedirs(os.path.join(base, f), exist_ok=True)

# Safe archive: copy *.log to archive\logs\YYYY-MM-DD (does not delete originals)
logs = os.path.join(base, "logs")
archive_logs = os.path.join(base, "archive", "logs", datetime.now().strftime("%Y-%m-%d"))
os.makedirs(archive_logs, exist_ok=True)

if os.path.isdir(logs):
    for name in os.listdir(logs):
        src = os.path.join(logs, name)
        if os.path.isfile(src) and name.lower().endswith(".log"):
            dst = os.path.join(archive_logs, name)
            if not os.path.exists(dst):
                shutil.copy2(src, dst)

print("Workspace checked and organized:", datetime.now().isoformat())
