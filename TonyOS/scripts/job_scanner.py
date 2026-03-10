#!/usr/bin/env python3
"""Placeholder job scanner."""
from pathlib import Path
import json

root = Path(r"C:\Users\tonyb\.openclaw\workspace\TonyOS")
out = root / "data" / "jobs_latest.json"
out.parent.mkdir(parents=True, exist_ok=True)
json.dump([{"title":"Sample RevOps Role","company":"Atlas Robotics"}], out.open("w", encoding="utf-8"), indent=2)
print(f"WROTE {out}")
