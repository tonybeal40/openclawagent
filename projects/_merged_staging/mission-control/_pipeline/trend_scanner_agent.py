import json
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

BASE = Path(r"C:\Users\tonyb\.openclaw\workspace")
OUT = BASE / "outputs" / "research" / "ai_money_trends.md"
OUT.parent.mkdir(parents=True, exist_ok=True)

KEYS = ["ai automation", "ai saas", "ai marketing", "ai sales", "lead generation", "ai agents", "revops"]


def fetch_text(url: str):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")


def fetch_json(url: str):
    return json.loads(fetch_text(url))


def collect_hn():
    data = fetch_json("https://hn.algolia.com/api/v1/search?query=AI&tags=story")
    hits = []
    for h in data.get("hits", [])[:150]:
        title = (h.get("title") or "")
        t = title.lower()
        if any(k in t for k in KEYS):
            hits.append(("Hacker News", title, h.get("url") or h.get("story_url") or "https://news.ycombinator.com/"))
    return hits


def collect_rss(name, url):
    out = []
    try:
        xml_txt = fetch_text(url)
        root = ET.fromstring(xml_txt)
        for item in root.findall(".//item")[:120]:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            t = title.lower()
            if any(k in t for k in KEYS):
                out.append((name, title, link))
    except Exception:
        pass
    return out


def main():
    items = []
    items += collect_hn()
    items += collect_rss("TechCrunch", "https://techcrunch.com/feed/")
    items += collect_rss("YCombinator Blog", "https://www.ycombinator.com/blog/feed")

    seen = set()
    deduped = []
    for src, t, u in items:
        k = (t.lower(), u)
        if k in seen:
            continue
        seen.add(k)
        deduped.append((src, t, u))

    lines = [
        f"# AI Money Trends - {datetime.now().strftime('%Y-%m-%d')}",
        "",
        f"Generated: {datetime.utcnow().isoformat()}Z",
        f"Total signals: {len(deduped)}",
        "",
        "## Signals",
    ]
    for src, t, u in deduped[:150]:
        lines.append(f"- [{src}] {t} -> {u}")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Saved trend report: {OUT}")


if __name__ == "__main__":
    main()
