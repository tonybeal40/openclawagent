import csv
import json
import re
import datetime
from pathlib import Path

csv.field_size_limit(10**8)
root = Path(r"C:\Users\tonyb\.openclaw\workspace")
p = root / "outputs" / "memory" / "user_messages_all.csv"
rows = list(csv.DictReader(p.open(encoding="utf-8")))
def clean_text(s: str) -> str:
    s = re.sub(r"\s+", " ", (s or "").strip())
    # Strip common wrappers/noise
    noise_markers = [
        "Sender (untrusted metadata)",
        "Conversation info (untrusted metadata)",
        "System:",
        "[Post-compaction context refresh]",
        "iVBORw0KGgo",
        "message_id",
        "sender_id",
    ]
    if any(m.lower() in s.lower() for m in noise_markers):
        return ""
    # remove huge binary-ish chunks
    if len(re.findall(r"[A-Za-z0-9+/]{80,}", s)) > 0:
        return ""
    return s

texts = []
for r in rows:
    raw = (r.get("text") or "").strip()
    if not raw:
        continue
    c = clean_text(raw)
    if c:
        texts.append((r.get("timestamp", ""), c))


def pick(patterns, limit=12):
    out = []
    seen = set()
    for ts, t in texts:
        tl = t.lower()
        if any(p in tl for p in patterns):
            k = t[:280]
            if k not in seen:
                seen.add(k)
                out.append({"timestamp": ts, "quote": k})
        if len(out) >= limit:
            break
    return out


profile = {
    "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "source": {"file": str(p), "messageCount": len(texts)},
    "identity": {
        "name": "Tony Beal",
        "preferredAddress": "Tony",
        "mode": "action-first execution",
        "style": ["direct", "high-energy", "low-fluff"],
    },
    "stressTriggers": [
        "Ambiguous ownership or unclear team coverage",
        "Perceived lack of progress visibility",
        "Data loss / recovery uncertainty",
        "Tooling friction that blocks execution",
    ],
    "fastRegulators": [
        "One concise status line + next executable step",
        "Evidence blocks (paths, counts, timestamps)",
        "Clear go/no-go recommendation",
        "Silent execution windows when requested",
    ],
    "communicationRules": [
        "Keep responses direct and practical",
        "Prioritize artifacts over explanation",
        "When blocked: state blocker + smallest next step",
        "When complete: show concrete outputs with file paths",
    ],
    "decisionStyleUnderLoad": [
        "Rapid delegation with expectation of autonomous execution",
        "Bias toward immediate shipping and iterative refinement",
        "Prefers decisive recommendations over hedging",
    ],
    "nonNegotiables": [
        "Ask before destructive actions",
        "Ask before external communications",
        "Protect private data",
        "Respect explicit quiet-mode directives (e.g., no overnight updates)",
    ],
    "spiralProtocol": {
        "triggerSignals": ["friction loops", "repeated status questions", "urgency escalation"],
        "assistantResponseOrder": [
            "Acknowledge pressure in one line",
            "Provide exact current state in 3 bullets max",
            "Give one recommended next action",
            "Execute immediately and report only evidence",
        ],
        "doNotDo": [
            "Do not over-explain",
            "Do not ask broad open-ended questions mid-urgency",
            "Do not send frequent non-urgent updates when quiet mode requested",
        ],
    },
    "evidence": {
        "stress": pick(["blocked", "stuck", "outage", "failed", "error", "need this"], 10),
        "regulate": pick(["quick", "fast", "just do it", "do it", "action", "start now"], 10),
        "boundaries": pick(["dont replace", "don't replace", "find only", "no need for updates until the morning", "lock it in"], 10),
        "decision": pick(["build this now", "do it", "start", "go", "next"], 10),
    },
}

jpath = root / "memory" / "tony-patterns.json"
jpath.parent.mkdir(parents=True, exist_ok=True)
jpath.write_text(json.dumps(profile, indent=2), encoding="utf-8")

md = []
md.append("# TONY_LIVED_PROFILE")
md.append("")
md.append("_Grounded from your own chat language and operating patterns (Feb→now recoverable window)._")
md.append("")
md.append("## Identity Snapshot")
md.append("- Name: **Tony Beal**")
md.append("- Preferred address: **Tony**")
md.append("- Operating mode: **action-first execution**")
md.append("- Style: **direct, high-energy, low-fluff**")
md.append("")
md.append("## Stress Triggers / Pressure Patterns")
for x in profile["stressTriggers"]:
    md.append(f"- {x}")
md.append("")
md.append("## What Regulates Fast")
for x in profile["fastRegulators"]:
    md.append(f"- {x}")
md.append("")
md.append("## Communication Rules That Work")
for x in profile["communicationRules"]:
    md.append(f"- {x}")
md.append("")
md.append("## Decision Style Under Load")
for x in profile["decisionStyleUnderLoad"]:
    md.append(f"- {x}")
md.append("")
md.append("## Non-Negotiables / Boundaries")
for x in profile["nonNegotiables"]:
    md.append(f"- {x}")
md.append("")
md.append("## \"When I'm Spiraling, Do This\" Protocol")
md.append("1. Acknowledge pressure in one line.")
md.append("2. Give exact state in max 3 bullets.")
md.append("3. Recommend one next action.")
md.append("4. Execute + report evidence only (paths/counts/timestamps).")
md.append("")
md.append("## Evidence Snippets (from user messages)")
for bucket in ["stress", "regulate", "boundaries", "decision"]:
    md.append(f"### {bucket.title()}")
    for e in profile["evidence"][bucket][:5]:
        ts = e["timestamp"] or "unknown"
        md.append(f"- [{ts}] {e['quote']}")
    md.append("")

mpath = root / "TONY_LIVED_PROFILE.md"
mpath.write_text("\n".join(md), encoding="utf-8")

print(mpath)
print(jpath)
