# Tony Beal Site Deploy

## Netlify settings
- Build command: none
- Publish directory: `.`
- Functions directory: not used
- Redirects or framework preset: none

## Pre-deploy checks
- Confirm `index.html`, `style.css`, `script.js`, and `headshot.jpg` are present in the site root.
- Confirm resume pages load with relative links:
  - `resume.html`
  - `resume-revops.html`
  - `resume-business-development.html`
  - `resume-sales-operations.html`
- Confirm SEO/social image points to `https://tonybeal.net/headshot.jpg`.

## 2-minute QA checklist
1. Open `index.html` at roughly 360px wide and confirm the hero, cards, CTA strip, and contact block remain readable without horizontal scrolling.
2. Open the mobile nav and confirm it closes after selecting a link and on `Esc`.
3. Click every resume link from the homepage and confirm each page returns to `index.html` or `resume.html` correctly.
4. Confirm the email link opens `mailto:tonybeal40@gmail.com` and LinkedIn opens the correct profile.
5. Confirm there are no homepage or resume links pointing to non-existent media files.
