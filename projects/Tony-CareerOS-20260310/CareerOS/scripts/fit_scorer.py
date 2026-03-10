import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_csv(path: Path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def get_resume_angle(industry: str, title: str) -> str:
    industry_lower = industry.lower()
    title_lower = title.lower()

    if "manufacturing" in industry_lower or "industrial" in industry_lower:
        return "industrial_manufacturing"
    if "pharma" in industry_lower or "nutraceutical" in industry_lower:
        return "pharma_nutraceutical"
    if "revops" in title_lower or "sales operations" in title_lower or "revenue operations" in title_lower:
        return "revops_salesops"
    if "ai" in industry_lower or "software" in industry_lower:
        return "ai_software"
    return "revops_salesops"


def main():
    achievements = load_json(DATA_DIR / "achievement_bank.json")
    jobs = read_csv(DATA_DIR / "jobs.csv")
    companies = read_csv(DATA_DIR / "companies.csv")

    scored = []
    for job in jobs:
        angle_key = get_resume_angle(job.get("industry", ""), job.get("title", ""))
        scored.append(
            {
                "company": job.get("company", ""),
                "title": job.get("title", ""),
                "score": job.get("score", ""),
                "resume_angle_key": angle_key,
                "resume_angle": achievements["resume_angles"].get(angle_key, []),
                "top_win": achievements["quantified_wins"][0]["statement"]
            }
        )

    output = {
        "top_jobs": scored[:10],
        "top_companies": companies[:10]
    }

    output_path = DATA_DIR / "fit_scores.json"
    output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Wrote fit scores to {output_path}")


if __name__ == "__main__":
    main()
