import csv
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DASHBOARD_DATA_DIR = ROOT.parent / "AI-Job-Dashboard" / "data"

LEADS_PATH = DATA_DIR / "leads.csv"
COMPANIES_PATH = DATA_DIR / "companies.csv"
JOBS_PATH = DATA_DIR / "jobs.csv"

OUT_JSON = DASHBOARD_DATA_DIR / "linkedin_creator_queue.json"
OUT_CSV = DASHBOARD_DATA_DIR / "linkedin_creator_queue.csv"


def read_csv(path: Path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def to_int(value, default=0):
    try:
        return int(float(value or 0))
    except Exception:
        return default


def build_note(person: str, company: str, context: str):
    context = (context or "revenue operations + pipeline execution").strip()
    return f"Hi {person}, I’m impressed by {company}. I help teams scale {context}. Open to connecting?"


def main():
    DASHBOARD_DATA_DIR.mkdir(parents=True, exist_ok=True)

    leads = read_csv(LEADS_PATH)
    companies = read_csv(COMPANIES_PATH)
    jobs = read_csv(JOBS_PATH)

    job_by_company = {}
    for j in jobs:
        c = (j.get("company") or "").strip()
        if not c:
            continue
        if c not in job_by_company or to_int(j.get("score"), 0) > to_int(job_by_company[c].get("score"), 0):
            job_by_company[c] = j

    rows = []

    for lead in leads:
        stage = (lead.get("stage") or "").strip().lower()
        if stage in {"connected", "accepted", "replied", "do-not-contact"}:
            continue
        company = (lead.get("company") or "").strip()
        person = (lead.get("name") or "").strip() or "there"
        role = (lead.get("role") or "").strip() or "Leader"
        context = (lead.get("notes") or "").strip()
        job = job_by_company.get(company, {})

        priority_score = to_int(job.get("score"), 0)
        priority = "High" if priority_score >= 85 else "Medium" if priority_score >= 70 else "Low"

        rows.append({
            "person": person,
            "company": company,
            "title": role,
            "linkedin_url": (lead.get("linkedin") or "").strip(),
            "priority": priority,
            "priority_score": priority_score,
            "status": "Not Sent" if not stage else stage.title(),
            "note": build_note(person, company or "your team", context),
            "reason": (job.get("signals") or lead.get("next_action") or "Strong fit based on current targeting."),
        })

    if not rows:
        for company in sorted(companies, key=lambda c: to_int(c.get("score"), 0), reverse=True)[:20]:
            company_name = (company.get("company") or "").strip()
            if not company_name:
                continue
            role_hint = "RevOps / Business Development"
            score = to_int(company.get("score"), 0)
            priority = "High" if score >= 85 else "Medium" if score >= 70 else "Low"
            rows.append({
                "person": "Hiring Leader",
                "company": company_name,
                "title": role_hint,
                "linkedin_url": "",
                "priority": priority,
                "priority_score": score,
                "status": "Not Sent",
                "note": build_note("there", company_name, company.get("revops_maturity_gap") or "pipeline and GTM execution"),
                "reason": company.get("hiring_signal") or "Priority target company",
            })

    rows.sort(key=lambda r: (0 if r["priority"] == "High" else 1 if r["priority"] == "Medium" else 2, -r["priority_score"], r["company"]))
    rows = rows[:25]

    payload = {
        "generated_at": date.today().isoformat(),
        "count": len(rows),
        "items": rows,
    }

    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["person", "company", "title", "linkedin_url", "priority", "priority_score", "status", "note", "reason"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote LinkedIn creator queue: {OUT_JSON} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
