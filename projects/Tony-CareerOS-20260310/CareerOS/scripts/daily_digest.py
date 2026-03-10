import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def read_csv(path: Path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def main():
    jobs = read_csv(DATA_DIR / "jobs.csv")
    companies = read_csv(DATA_DIR / "companies.csv")
    leads = read_csv(DATA_DIR / "leads.csv")
    fit_scores_path = DATA_DIR / "fit_scores.json"
    fit_scores = []

    if fit_scores_path.exists():
        fit_scores = __import__("json").loads(fit_scores_path.read_text(encoding="utf-8")).get("top_jobs", [])

    top_jobs = jobs[:5]
    top_companies = companies[:5]

    lines = [
        "# Tony Beal Daily Digest",
        "",
        f"- Jobs scored: {len(jobs)}",
        f"- Companies scored: {len(companies)}",
        f"- Leads tracked: {len(leads)}",
        "",
        "## Top Jobs",
    ]

    if top_jobs:
        for job in top_jobs:
            lines.append(
                f"- {job['company']} | {job['title']} | score {job['score']} | {job['location']}"
            )
    else:
        lines.append("- No jobs yet")

    lines.extend(["", "## Top Companies"])

    if top_companies:
        for company in top_companies:
            lines.append(
                f"- {company['company']} | score {company['score']} | {company['industry']}"
            )
    else:
        lines.append("- No companies yet")

    lines.extend(["", "## Resume Angles"])

    if fit_scores:
        for item in fit_scores[:3]:
            first_angle = item.get("resume_angle", ["No angle available"])[0]
            lines.append(
                f"- {item['company']} | {item['title']} | {first_angle}"
            )
    else:
        lines.append("- No fit scoring yet")

    output_path = DATA_DIR / "daily_digest.md"
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote digest to {output_path}")


if __name__ == "__main__":
    main()
