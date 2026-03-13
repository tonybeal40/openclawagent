#!/usr/bin/env python3
"""Placeholder company scanner."""
from pathlib import Path
import json

root = Path(r"C:\Users\tonyb\.openclaw\workspace\TonyOS")
out = root / "data" / "companies_latest.json"
out.parent.mkdir(parents=True, exist_ok=True)
json.dump([{"name":"Atlas Robotics","signal":"hiring"}], out.open("w", encoding="utf-8"), indent=2)
print(f"WROTE {out}")
