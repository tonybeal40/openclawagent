import csv
import json
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

BASE = Path(r"C:\Users\tonyb\.openclaw\workspace")
OUT_DIR = BASE / "outputs" / "leads"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def fetch_json(url: str):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8", errors="ignore"))


def get_yc_companies():
    data = fetch_json("https://api.ycombinator.com/v0.1/companies")
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for k in ["companies", "items", "data"]:
            if isinstance(data.get(k), list):
                return data[k]
    return []


def build_targets():
    targets = []
    yc = get_yc_companies()
    for c in yc[:500]:
        if not isinstance(c, dict):
            continue
        name = c.get("name") or ""
        website = c.get("website") or c.get("app_url") or ""
        industry = c.get("industry") or c.get("subindustry") or ""
        if not website:
            continue
        targets.append({
            "company": name,
            "website": website,
            "industry": industry,
            "estimated_revenue": "unknown",
            "employees": c.get("team_size") or c.get("employees") or "unknown",
            "linkedin": "",
            "decision_makers": "VP Sales; RevOps; Sales Ops",
            "score": 1
        })
    return targets


def main():
    rows = build_targets()
    keep = []
    for r in rows:
        txt = (r["industry"] or "").lower()
        if any(k in txt for k in ["saas", "software", "enterprise", "b2b", "data", "analytics", "ai"]):
            r["score"] = 2
        else:
            r["score"] = 1
        keep.append(r)

    fields = ["company","website","industry","estimated_revenue","employees","linkedin","decision_makers","score"]
    daily = OUT_DIR / f"high_value_targets_{datetime.now().strftime('%Y_%m_%d')}.csv"
    latest = OUT_DIR / "high_value_targets.csv"

    for p in [daily, latest]:
        with p.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(keep)

    (OUT_DIR / "high_value_targets_summary.json").write_text(json.dumps({
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "count": len(keep),
        "top_25": keep[:25]
    }, indent=2), encoding="utf-8")

    print(f"Saved {len(keep)} targets to {latest}")


if __name__ == "__main__":
    main()
