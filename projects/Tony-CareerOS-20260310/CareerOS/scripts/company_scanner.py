import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def score_company(company: dict, targets: dict) -> int:
    score = 0
    industry = company.get("industry", "").lower()
    notes = " ".join(
        [
            company.get("hiring_signal", ""),
            company.get("revops_maturity_gap", ""),
            company.get("notes", ""),
        ]
    ).lower()

    for industry_name in targets["preferred_industries"]:
        if industry_name.lower() in industry:
            score += targets["score_signals"]["industry_match"]
            break

    if "revops" in notes or "pipeline" in notes or "sales" in notes:
        score += targets["score_signals"]["revops_maturity_gap"]

    if company.get("hiring_signal"):
        score += targets["score_signals"]["hiring_signal"]

    if "systems" in notes or "workflow" in notes:
        score += targets["score_signals"]["systems_fit"]

    return score


def main():
    targets = load_json(CONFIG_DIR / "targets.json")
    sources = load_json(CONFIG_DIR / "sources.json")
    companies = []

    for source in sources["companies"]:
        if not source.get("enabled"):
            continue
        if source.get("type") != "file":
            continue
        loaded = load_json(ROOT / source["path"])
        for item in loaded:
            item["source"] = source["name"]
            companies.append(item)

    for company in companies:
        company["score"] = score_company(company, targets)

    companies.sort(key=lambda item: item["score"], reverse=True)

    output_path = DATA_DIR / "companies.csv"
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "company",
                "website",
                "industry",
                "score",
                "hiring_signal",
                "revops_maturity_gap",
                "notes",
                "source",
            ],
        )
        writer.writeheader()
        writer.writerows(companies)

    print(f"Wrote {len(companies)} companies to {output_path}")


if __name__ == "__main__":
    main()
