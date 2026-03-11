# TonyBeal Site Deploy Checklist

## What was fixed now (local)
- `index.html`
  - `og:image` switched from `/og-image.jpg` (missing) to `/headshot.jpg` (exists)
  - `twitter:image` switched from `/og-image.jpg` to `/headshot.jpg`
  - Primary CTA changed from missing `/TonyBeal_Resume.pdf` to existing `/resume.html`
  - Removed stray literal `` `r`n `` artifacts in HTML
- `resume.html`
  - Primary CTA changed from missing `/TonyBeal_Resume.pdf` to `/resume.html`

## Still recommended to add later
- `og-image.jpg` (1200x630 social card)
- `TonyBeal_Resume.pdf` (final downloadable PDF)

## Deploy steps
1. Publish from this folder: `tonybeal-site`
2. Purge CDN/host cache
3. Hard refresh browser (`Ctrl+F5`)
4. Verify:
   - `/` returns 200
   - `/headshot.jpg` returns 200
   - `/resume.html` returns 200
   - Homepage renders headshot and resume CTA works

## Optional final polish after asset upload
- Switch `og:image` back to `/og-image.jpg`
- Switch resume CTA labels/links back to PDF if desired
