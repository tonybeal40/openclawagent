import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCRIPTS = [
    "job_scanner.py",
    "company_scanner.py",
    "lead_tracker.py",
    "resume_engine.py",
    "fit_scorer.py",
    "linkedin_creator_queue.py",
    "daily_digest.py",
]


def main():
    for script_name in SCRIPTS:
        script_path = ROOT / script_name
        print(f"Running {script_name}...")
        subprocess.run([sys.executable, str(script_path)], check=True)
    print("CareerOS morning workflow complete.")


if __name__ == "__main__":
    main()
