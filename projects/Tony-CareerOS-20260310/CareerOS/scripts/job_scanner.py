import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def score_job(job: dict, targets: dict) -> int:
    score = 0
    title = job.get("title", "").lower()
    industry = job.get("industry", "").lower()
    location = job.get("location", "").lower()
    salary = int(job.get("salary_base", 0) or 0)
    signals_text = " ".join(job.get("signals", [])).lower()

    for excluded in targets["excluded_roles"]:
        if excluded.lower() in title:
            return 0

    for role in targets["priority_roles"]:
        if role.lower() in title:
            score += targets["score_signals"]["role_match"]
            break

    for role in targets["secondary_roles"]:
        if role.lower() in title:
            score += int(targets["score_signals"]["role_match"] * 0.6)
            break

    for industry_name in targets["preferred_industries"]:
        if industry_name.lower() in industry:
            score += targets["score_signals"]["industry_match"]
            break

    for location_pref in targets["candidate"]["location_preferences"]:
        if location_pref.lower() in location:
            score += targets["score_signals"]["location_match"]
            break

    if salary >= targets["candidate"]["minimum_base_salary"]:
        score += targets["score_signals"]["salary_match"]

    if "revops" in title or "sales operations" in title or "revenue operations" in title:
        score += targets["score_signals"]["systems_fit"]

    if "pipeline" in signals_text or "hiring" in signals_text or "growing sales team" in signals_text:
        score += targets["score_signals"]["hiring_signal"]

    return score


def main():
    targets = load_json(CONFIG_DIR / "targets.json")
    sources = load_json(CONFIG_DIR / "sources.json")
    jobs = []

    for source in sources["jobs"]:
        if not source.get("enabled"):
            continue
        if source.get("type") != "file":
            continue
        jobs.extend(load_json(ROOT / source["path"]))

    scored_jobs = []
    for job in jobs:
        job["score"] = score_job(job, targets)
        job["signals"] = " | ".join(job.get("signals", []))
        scored_jobs.append(job)

    scored_jobs.sort(key=lambda item: item["score"], reverse=True)

    output_path = DATA_DIR / "jobs.csv"
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["title", "company", "location", "industry", "salary_base", "score", "url", "source", "signals"],
        )
        writer.writeheader()
        writer.writerows(scored_jobs)

    print(f"Wrote {len(scored_jobs)} jobs to {output_path}")


if __name__ == "__main__":
    main()
