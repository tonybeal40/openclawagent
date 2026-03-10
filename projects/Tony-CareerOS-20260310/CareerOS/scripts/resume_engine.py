import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build_resume_recommendations():
    achievements = load_json(DATA_DIR / "achievement_bank.json")
    master = load_json(DATA_DIR / "resume_master.json")

    recommendations = {
        "candidate": master["candidate"],
        "base_summary": master["base_summary"],
        "top_wins": achievements["quantified_wins"][:4],
        "tool_stack": master["tool_stack"],
        "resume_angles": achievements["resume_angles"],
        "positioning": achievements["core_positioning"],
        "next_step": "Use fit_scorer.py output to select the best resume angle for each role."
    }

    output_path = DATA_DIR / "resume_recommendations.json"
    output_path.write_text(json.dumps(recommendations, indent=2), encoding="utf-8")
    print(f"Wrote resume recommendations to {output_path}")


if __name__ == "__main__":
    build_resume_recommendations()
