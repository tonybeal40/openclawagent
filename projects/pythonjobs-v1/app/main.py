import os
from pathlib import Path

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="PythonJobs V1", version="0.1.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "web"), name="static")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")
SUCCESS_URL = os.getenv("SUCCESS_URL", "http://localhost:8000/success")
CANCEL_URL = os.getenv("CANCEL_URL", "http://localhost:8000/cancel")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


@app.get("/", response_class=HTMLResponse)
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "web" / "index.html")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "pythonjobs-v1"}


@app.post("/api/create-checkout-session")
def create_checkout_session(payload: dict):
    email = payload.get("email")
    if not stripe.api_key or not PRICE_ID:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": PRICE_ID, "quantity": 1}],
            customer_email=email,
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            allow_promotion_codes=True,
            metadata={"product": "pythonjobs-v1"},
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    if not WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # TODO: persist paid account in database
        print(f"Paid signup: {session.get('customer_email')}")

    return JSONResponse({"received": True})


@app.get("/success", response_class=HTMLResponse)
def success():
    return "<h2>Payment successful. We will onboard you shortly.</h2>"


@app.get("/cancel", response_class=HTMLResponse)
def cancel():
    return "<h2>Checkout canceled.</h2>"
