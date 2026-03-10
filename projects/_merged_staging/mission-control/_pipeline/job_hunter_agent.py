import csv
import json
import re
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

BASE = Path(r"C:\Users\tonyb\.openclaw\workspace")
OUT_DIR = BASE / "outputs" / "jobs"
OUT_DIR.mkdir(parents=True, exist_ok=True)

KEYWORDS = [
    "sales operations", "revops", "revenue operations", "sales enablement",
    "ai sales", "business development", "sales strategy"
]

LOCATION_HINTS = ["remote", "united states", "st louis", "missouri", "illinois"]


def fetch_json(url: str):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8", errors="ignore"))


def score(text: str):
    t = text.lower()
    s = sum(1 for k in KEYWORDS if k in t)
    l = sum(1 for l in LOCATION_HINTS if l in t)
    return s * 3 + l


def remotive_jobs():
    payload = fetch_json("https://remotive.com/api/remote-jobs")
    rows = []
    for j in payload.get("jobs", []):
        title = (j.get("title") or "").strip()
        company = (j.get("company_name") or "").strip()
        location = (j.get("candidate_required_location") or "").strip()
        url = j.get("url") or ""
        desc = re.sub(r"<[^>]+>", " ", (j.get("description") or ""))
        text = f"{title} {desc} {location}"
        sc = score(text)
        if sc > 0:
            rows.append({
                "title": title,
                "company": company,
                "location": location,
                "source": "Remotive",
                "url": url,
                "score": sc,
                "found_at": datetime.utcnow().isoformat() + "Z"
            })
    return rows


def yc_jobs_feed():
    # HN "Who is hiring" as YC-adjacent signal
    payload = fetch_json("https://hn.algolia.com/api/v1/search?query=who%20is%20hiring&tags=story")
    rows = []
    for h in payload.get("hits", []):
        title = (h.get("title") or "").strip()
        if not title:
            continue
        rows.append({
            "title": title,
            "company": "HN/YC",
            "location": "varies",
            "source": "HackerNews",
            "url": h.get("url") or h.get("story_url") or "https://news.ycombinator.com/",
            "score": 1,
            "found_at": datetime.utcnow().isoformat() + "Z"
        })
    return rows


def dedupe(rows):
    seen = set()
    out = []
    for r in sorted(rows, key=lambda x: x["score"], reverse=True):
        k = (r["title"].lower(), r["company"].lower(), r["url"])
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


def write_csv(rows, path: Path):
    fields = ["title", "company", "location", "source", "url", "score", "found_at"]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main():
    rows = []
    rows.extend(remotive_jobs())
    rows.extend(yc_jobs_feed())
    rows = dedupe(rows)

    daily = OUT_DIR / f"daily_job_pipeline_{datetime.now().strftime('%Y_%m_%d')}.csv"
    latest = OUT_DIR / "daily_job_pipeline.csv"
    write_csv(rows, daily)
    write_csv(rows, latest)

    summary = OUT_DIR / "daily_job_pipeline_summary.json"
    summary.write_text(json.dumps({
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "count": len(rows),
        "top_20": rows[:20]
    }, indent=2), encoding="utf-8")

    print(f"Saved {len(rows)} jobs to {latest}")


if __name__ == "__main__":
    main()
