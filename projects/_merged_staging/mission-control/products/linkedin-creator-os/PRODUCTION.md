# LinkedIn Creator OS - Production Notes

## Canonical Path
- `projects/_merged_staging/mission-control/products/linkedin-creator-os/frontend/index.html`

## Local run (no build required)
Use Python static server:
```powershell
cd C:\Users\tonyb\.openclaw\workspace\projects\_merged_staging\mission-control\products\linkedin-creator-os\frontend
C:\Users\tonyb\AppData\Local\Programs\Python\Python312\python.exe -m http.server 8088
```
Open: `http://127.0.0.1:8088`

## Production hardening checklist
1. Move OpenAI key calls behind backend (never expose key in browser).
2. Add auth (Supabase/Firebase/Clerk).
3. Add Stripe checkout + webhook.
4. Add rate limits and abuse controls.
5. Add error logging and uptime checks.

## Next MVP gates
- [ ] Core editor works
- [ ] Carousel export works
- [ ] Post writer/analyzer works
- [ ] Save/import library works
- [ ] API key removed from frontend
