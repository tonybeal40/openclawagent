from pathlib import Path
root=Path(r"C:\Users\tonyb\.openclaw\workspace\TonyOS")
out=root/"docs"/"MASTER_INDEX.md"
exts={".md",".txt",".html",".json",".py",".ps1"}
files=sorted([p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in exts])
lines=["# MASTER_INDEX","",f"Generated from: {root}","","## Files"]
for p in files:
    rel=p.relative_to(root).as_posix()
    lines.append(f"- `{rel}`")
out.write_text("\n".join(lines),encoding='utf-8')
print(out)
