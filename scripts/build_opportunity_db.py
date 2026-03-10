import sqlite3
from pathlib import Path
from datetime import datetime, UTC

root = Path(r"C:\Users\tonyb\.openclaw\workspace\OpenClawMissionControl")
(root / "data").mkdir(parents=True, exist_ok=True)
db = root / "data" / "opportunity_db.sqlite"

conn = sqlite3.connect(db)
cur = conn.cursor()
cur.execute('''
CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,            -- job|company|lead|signal
  title TEXT NOT NULL,
  source TEXT,
  score REAL DEFAULT 0,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TEXT NOT NULL
)
''')
cur.execute('''
CREATE INDEX IF NOT EXISTS idx_opps_kind_status_score
ON opportunities(kind, status, score DESC)
''')
conn.commit()

stamp = datetime.now(UTC).isoformat()
cur.execute("INSERT INTO opportunities(kind,title,source,score,status,notes,created_at) VALUES (?,?,?,?,?,?,?)",
            ("signal", "System initialized", "bootstrap", 1.0, "new", "DB ready", stamp))
conn.commit()
conn.close()
print(f"DB_READY={db}")
