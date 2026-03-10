# QA Report for Company Intel Dashboard V3

## Critical Issues
- index.html references missing styles.css instead of style.css. No style.css file found. Dashboard will render unstyled.
- index.html references app.js but actual script file is script.js. This breaks script loading.
- script.js uses incorrect element IDs (`search` and `decisionFilter`) which do not match index.html IDs (`q` and `verdictFilter`). UI filtering controls broken.
- Field names inconsistent between companies.v3.json and script.js (`verdict` vs `decision`, `riskScore` vs `risk`).
- companies.v3.json lacks some fields (tasks, pros, cons) expected by script, may cause runtime errors.

## Medium Issues
- LocalStorage saving and task toggling features depend on presence of tasks data which JSON currently lacks.
- Some HTML content (role, fit scores) relies on exact field mappings; inconsistent names increase maintenance risk.

## Quick Wins
- Rename references in index.html: change styles.css → style.css and app.js → script.js.
- Update script.js to use correct element IDs: `q` and `verdictFilter`.
- Update script.js to use JSON field names: `verdict` (instead of `decision`), `riskScore` (instead of `risk`).
- Add default empty arrays for tasks, pros, and cons in script to avoid errors.

## Pass/Fail Recommendation
- Fail in current state due to critical file and naming mismatches.
- Pass after fixes applied as above, ensuring alignment between HTML, script, and JSON data.

---

This concludes QA for the overnight build. Please apply fixes for stability and usability in morning run.
