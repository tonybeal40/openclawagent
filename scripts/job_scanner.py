import json
import re
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

BASE = Path(r"C:\Users\tonyb\.openclaw\workspace")
SOURCES_FILE = BASE / "data" / "job_sources.json"
OUT_DIR = BASE / "job_pipeline"
LOG_DIR = BASE / "logs"

OUT_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)


def fetch_json(url: str):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=25) as r:
        return json.loads(r.read().decode("utf-8", errors="ignore"))


def score_match(text: str, keywords):
    t = text.lower()
    return sum(1 for k in keywords if k in t)


def normalize_remotive(payload, keywords):
    out = []
    for j in payload.get("jobs", []):
        title = (j.get("title") or "").strip()
        company = (j.get("company_name") or "").strip()
        url = j.get("url") or ""
        desc = (j.get("description") or "")[:2000]
        s = score_match(f"{title} {desc}", keywords)
        if s > 0:
            out.append({
                "source": "Remotive",
                "title": title,
                "company": company,
                "url": url,
                "score": s,
                "date_found": datetime.utcnow().isoformat() + "Z"
            })
    return out


def normalize_greenhouse(payload, keywords):
    out = []
    for j in payload.get("jobs", []):
        title = (j.get("title") or "").strip()
        company = (payload.get("meta", {}) or {}).get("board_name", "Greenhouse")
        url = j.get("absolute_url") or ""
        dept = (j.get("departments") or [{}])[0].get("name", "") if j.get("departments") else ""
        s = score_match(f"{title} {dept}", keywords)
        if s > 0:
            out.append({
                "source": "Greenhouse",
                "title": title,
                "company": company,
                "url": url,
                "score": s,
                "date_found": datetime.utcnow().isoformat() + "Z"
            })
    return out


def normalize_lever(payload, keywords):
    out = []
    if isinstance(payload, list):
        for j in payload:
            title = (j.get("text") or "").strip()
            company = j.get("categories", {}).get("team", "Lever Company")
            url = j.get("hostedUrl") or ""
            desc = j.get("descriptionPlain") or j.get("description") or ""
            s = score_match(f"{title} {desc}", keywords)
            if s > 0:
                out.append({
                    "source": "Lever",
                    "title": title,
                    "company": company,
                    "url": url,
                    "score": s,
                    "date_found": datetime.utcnow().isoformat() + "Z"
                })
    return out


def normalize_hn(payload, keywords):
    out = []
    for hit in payload.get("hits", []):
        title = (hit.get("title") or "").strip()
        url = hit.get("url") or hit.get("story_url") or "https://news.ycombinator.com/"
        s = score_match(title, keywords)
        if s > 0 or "hiring" in title.lower():
            out.append({
                "source": "HN",
                "title": title,
                "company": "HN",
                "url": url,
                "score": max(s, 1),
                "date_found": datetime.utcnow().isoformat() + "Z"
            })
    return out


def dedupe(items):
    seen = set()
    out = []
    for i in items:
        key = (i.get("title", "").lower(), i.get("company", "").lower(), i.get("url", ""))
        if key in seen:
            continue
        seen.add(key)
        out.append(i)
    return out


def main():
    cfg = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    keywords = cfg.get("keywords", [])
    sources = cfg.get("sources", [])
    jobs = []
    errors = []

    for s in sources:
        try:
            name = s.get("name", "unknown")
            url = s.get("url", "")
            typ = s.get("type", "json")
            if typ != "json":
                continue  # rss handled by PowerShell opportunity scanner
            payload = fetch_json(url)
            lname = name.lower()
            if "remotive" in lname:
                jobs.extend(normalize_remotive(payload, keywords))
            elif "greenhouse" in lname:
                jobs.extend(normalize_greenhouse(payload, keywords))
            elif "lever" in lname:
                jobs.extend(normalize_lever(payload, keywords))
            elif "hacker news" in lname or "algolia" in url:
                jobs.extend(normalize_hn(payload, keywords))
        except Exception as e:
            errors.append({"source": s.get("name", "unknown"), "error": str(e)})

    jobs = dedupe(jobs)
    jobs.sort(key=lambda x: x.get("score", 0), reverse=True)

    stamp = datetime.now().strftime("%Y_%m_%d")
    out_file = OUT_DIR / f"jobs_{stamp}.json"
    out_file.write_text(json.dumps(jobs, indent=2), encoding="utf-8")

    summary = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "count": len(jobs),
        "top_10": jobs[:10],
        "errors": errors
    }
    (OUT_DIR / "jobs_latest_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (LOG_DIR / "job_scanner_last.log").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Saved {len(jobs)} jobs to {out_file}")


if __name__ == "__main__":
    main()
