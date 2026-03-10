import json, re, csv
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime

ROOT = Path(r"C:\Users\tonyb\.openclaw\workspace")
SOURCES = [
    ROOT / "archive" / "chat-archive-20260309-123705",
    Path(r"C:\Users\tonyb\.openclaw\agents\main\sessions"),
]
OUT = ROOT / "outputs" / "memory"
OUT.mkdir(parents=True, exist_ok=True)


def extract_text(x):
    if x is None:
        return ""
    if isinstance(x, str):
        return x
    if isinstance(x, list):
        return "\n".join([extract_text(i) for i in x if extract_text(i)])
    if isinstance(x, dict):
        # common content block patterns
        if "text" in x and isinstance(x["text"], str):
            return x["text"]
        if "content" in x:
            return extract_text(x["content"])
        return "\n".join([extract_text(v) for v in x.values() if extract_text(v)])
    return str(x)


def detect_user_record(obj):
    role = str(obj.get("role", "")).lower()
    if role == "user":
        text = extract_text(obj.get("content") or obj.get("text") or obj.get("message"))
        ts = obj.get("created_at") or obj.get("timestamp") or obj.get("time")
        return ts, text

    # nested shapes
    for key in ["message", "event", "data", "payload"]:
        if key in obj and isinstance(obj[key], dict):
            nested = obj[key]
            nrole = str(nested.get("role", "")).lower()
            if nrole == "user":
                text = extract_text(nested.get("content") or nested.get("text") or nested.get("message"))
                ts = nested.get("created_at") or nested.get("timestamp") or obj.get("timestamp")
                return ts, text

    return None, None


def normalize_ts(ts):
    if not ts:
        return ""
    s = str(ts)
    for fmt in [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
    ]:
        try:
            return datetime.strptime(s, fmt).isoformat()
        except Exception:
            pass
    return s


user_rows = []
file_counts = {}
for src in SOURCES:
    if not src.exists():
        continue
    for f in src.rglob("*.jsonl*"):
        if f.is_dir():
            continue
        hits = 0
        try:
            with f.open("r", encoding="utf-8", errors="ignore") as fh:
                for ln, line in enumerate(fh, 1):
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                    except Exception:
                        continue
                    ts, text = detect_user_record(obj)
                    if text and text.strip():
                        user_rows.append({
                            "timestamp": normalize_ts(ts),
                            "source_file": str(f),
                            "line": ln,
                            "text": re.sub(r"\s+", " ", text).strip(),
                        })
                        hits += 1
        except Exception:
            pass
        if hits:
            file_counts[str(f)] = hits

user_rows.sort(key=lambda r: (r["timestamp"], r["source_file"], r["line"]))

csv_path = OUT / "user_messages_all.csv"
with csv_path.open("w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=["timestamp", "source_file", "line", "text"])
    w.writeheader()
    for r in user_rows:
        w.writerow(r)

# lightweight profile extraction
all_text = " ".join(r["text"].lower() for r in user_rows)
keywords = [
    "job", "pipeline", "mission control", "dashboard", "recovery", "memory", "agent", "worker",
    "replit", "linkedin", "quality", "fast", "direct", "action", "tonight", "morning", "lock it in"
]
counts = Counter()
for k in keywords:
    counts[k] = all_text.count(k)

by_day = defaultdict(int)
for r in user_rows:
    day = (r["timestamp"][:10] if r["timestamp"] else "unknown")
    by_day[day] += 1

md = []
md.append("# Tony Chat Memory Pull\n")
md.append(f"- Total extracted user messages: **{len(user_rows)}**")
md.append(f"- Source files with user content: **{len(file_counts)}**")
md.append("\n## Top signal terms\n")
for k, v in counts.most_common():
    if v > 0:
        md.append(f"- {k}: {v}")
md.append("\n## Activity by day (user messages)\n")
for day, c in sorted(by_day.items()):
    md.append(f"- {day}: {c}")
md.append("\n## Most recent 20 user messages\n")
for r in user_rows[-20:]:
    md.append(f"- [{r['timestamp'] or 'unknown'}] {r['text'][:220]}")

profile_path = OUT / "tony_memory_pull.md"
profile_path.write_text("\n".join(md), encoding="utf-8")

print(f"Wrote: {csv_path}")
print(f"Wrote: {profile_path}")
print(f"Extracted messages: {len(user_rows)}")
