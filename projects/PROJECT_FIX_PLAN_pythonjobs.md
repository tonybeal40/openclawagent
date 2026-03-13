# PythonJobs / GitHub Pages Fix Plan

Date: 2026-03-13 17:42 CDT
Target URL: https://tonybeal40.github.io/pythonjobs-/

## Current state verified
- Live page loads.
- Core assets return 200:
  - /styles.css
  - /script.js
  - /dashboard_data.js
- Browser console errors: none detected on load.

## Structural issue to fix first
There are two different local codebases that look related:
1) `projects/pythonjobs-v1` (Flask-style app/web structure)
2) `_tmp/pythonjobs-/repo` (the actual GitHub Pages site source)

This split is likely causing confusion and drift.

## Priority fixes
1. **Pick canonical source of truth** for pythonjobs site.
2. Move canonical project under `projects/pythonjobs-site`.
3. Archive non-canonical copy into `archive/` (recoverable).
4. Add deploy/readme guardrails so updates always go from one path.
5. Run content/UX cleanup pass on homepage sections and CTA flow.

## Quick technical notes
- `index.html` + large `script.js` monolith is maintainable short-term but should be modularized in later pass.
- Found placeholder/TODO-style markers in app code and page copy; needs targeted cleanup pass once canonical folder is chosen.
