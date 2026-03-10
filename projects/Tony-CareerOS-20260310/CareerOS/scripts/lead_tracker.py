import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
LEADS_PATH = DATA_DIR / "leads.csv"


def ensure_file():
    if LEADS_PATH.exists():
        return
    LEADS_PATH.write_text(
        "name,company,role,linkedin,email,stage,notes,last_contact,next_action\n",
        encoding="utf-8",
    )


def main():
    ensure_file()
    with LEADS_PATH.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        leads = list(reader)
    print(f"Lead tracker ready: {len(leads)} leads in {LEADS_PATH}")


if __name__ == "__main__":
    main()
