# PythonJobs V1 (Revenue-First MVP)

## What this is
A cheap first version of your "AI Pipeline Finder" product:
- Simple website (landing + Stripe checkout)
- FastAPI backend
- Stripe subscription endpoint + webhook stub
- Designed for local-first + GitHub source of truth

## Do you need a website?
Yes, but it can be minimal.
For V1, one page is enough:
1. Clear offer
2. Price
3. Checkout button
4. Contact/onboarding follow-up

## Cost model (monthly, realistic)
- Domain: $1-$2 (first year promos) / ~$1.50 avg monthly equivalent
- Hosting (Render/Railway): $0-$7 starter
- Database (later): $0-$25 (Supabase free -> paid)
- Stripe: no monthly fee; ~2.9% + 30¢ per charge
- Data providers (Apollo etc): biggest cost, start at $49-$99+
- AI API: keep near $10-$75 initially by using deterministic workflows first

### Bare-minimum starting budget
- **$25-$125/mo** without heavy data/API usage
- **$150-$400/mo** once paid data providers are active

## Local run
```bash
cd projects/pythonjobs-v1
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open: http://localhost:8000

## Stripe setup (test mode)
1. Create product "AI Pipeline Finder Starter" in Stripe.
2. Create recurring monthly price.
3. Put `STRIPE_PRICE_ID` and `STRIPE_SECRET_KEY` in `.env`.
4. Install Stripe CLI and forward webhooks:
   - `stripe listen --forward-to localhost:8000/api/stripe/webhook`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
6. Test checkout from homepage.

## Next build steps
1. Add lead table + customer table (Supabase/Postgres)
2. Add auth + customer portal link
3. Add deterministic prospect pipeline scripts
4. Wire Mission Control health + checkpoint outputs
5. Deploy to Render/Railway + connect domain

## Legal/compliance guardrails
- Avoid violating LinkedIn/Indeed terms with scraping automation.
- Prefer approved APIs and user-provided exports.
- Include unsubscribe and sender identity in outbound messages.
- Keep only necessary personal data.
