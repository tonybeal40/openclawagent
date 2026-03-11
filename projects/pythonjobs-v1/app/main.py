import os
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "app.db"
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="PythonJobs V1", version="0.2.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "web"), name="static")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")
SUCCESS_URL = os.getenv("SUCCESS_URL", "http://localhost:8000/success")
CANCEL_URL = os.getenv("CANCEL_URL", "http://localhost:8000/cancel")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

SESSION_TOKENS: dict[str, str] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = db()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            status TEXT NOT NULL DEFAULT 'paid',
            access_code TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS onboarding (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_email TEXT NOT NULL,
            target_role TEXT,
            current_income REAL,
            target_income REAL,
            start_timeline_days INTEGER,
            notes TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/", response_class=HTMLResponse)
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "web" / "index.html")


@app.get("/portal", response_class=HTMLResponse)
def portal() -> FileResponse:
    return FileResponse(BASE_DIR / "web" / "portal.html")


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


@app.post("/api/auth/login")
def login(payload: dict):
    email = (payload.get("email") or "").strip().lower()
    code = (payload.get("code") or "").strip()
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code required")

    conn = db()
    cur = conn.cursor()
    row = cur.execute(
        "SELECT email FROM customers WHERE email = ? AND access_code = ? AND status = 'paid'",
        (email, code),
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid login")

    token = secrets.token_urlsafe(24)
    SESSION_TOKENS[token] = email
    return {"token": token, "email": email}


@app.post("/api/onboarding")
def onboarding(payload: dict):
    token = (payload.get("token") or "").strip()
    email = SESSION_TOKENS.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Login required")

    conn = db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO onboarding(customer_email, target_role, current_income, target_income, start_timeline_days, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            email,
            payload.get("target_role"),
            payload.get("current_income"),
            payload.get("target_income"),
            payload.get("start_timeline_days"),
            payload.get("notes"),
            now_iso(),
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/mission-control/status")
def mission_control_status():
    conn = db()
    cur = conn.cursor()
    paid_customers = cur.execute("SELECT COUNT(*) AS c FROM customers WHERE status='paid'").fetchone()["c"]
    onboarding_count = cur.execute("SELECT COUNT(*) AS c FROM onboarding").fetchone()["c"]
    conn.close()

    # Placeholder MRR estimate based on current offer
    mrr = paid_customers * 499
    return {
        "paid_customers": paid_customers,
        "onboarding_completed": onboarding_count,
        "estimated_mrr": mrr,
        "target_mrr": 5000,
        "gap_to_target": max(0, 5000 - mrr),
    }


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
        email = (session.get("customer_details") or {}).get("email") or session.get("customer_email")
        stripe_customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        access_code = secrets.token_hex(3).upper()

        if email:
            conn = db()
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO customers(email, stripe_customer_id, stripe_subscription_id, status, access_code, created_at)
                VALUES (?, ?, ?, 'paid', ?, ?)
                ON CONFLICT(email) DO UPDATE SET
                  stripe_customer_id=excluded.stripe_customer_id,
                  stripe_subscription_id=excluded.stripe_subscription_id,
                  status='paid',
                  access_code=excluded.access_code
                """,
                (email.lower(), stripe_customer_id, subscription_id, access_code, now_iso()),
            )
            conn.commit()
            conn.close()
            print(f"Paid signup: {email} | access code: {access_code}")

    return JSONResponse({"received": True})


@app.get("/success", response_class=HTMLResponse)
def success():
    return "<h2>Payment successful. Check your onboarding login code from admin logs.</h2>"


@app.get("/cancel", response_class=HTMLResponse)
def cancel():
    return "<h2>Checkout canceled.</h2>"
