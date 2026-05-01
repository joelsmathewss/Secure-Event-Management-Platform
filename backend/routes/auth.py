import os, random, string, smtplib, jwt
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)

# ── helpers ──────────────────────────────────────────────
def get_db():
    from app import supabase
    return supabase

def gen_otp():
    return "".join(random.choices(string.digits, k=6))

def gen_referral():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

def send_otp_email(to_email, otp, purpose="verification"):
    cfg = current_app.config
    if not cfg.get("MAIL_USERNAME"):
        print(f"\n📧 OTP for {to_email} [{purpose}]: {otp}\n")
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Eventify – Your OTP ({purpose})"
    msg["From"]    = cfg["MAIL_USERNAME"]
    msg["To"]      = to_email
    html = f"""<div style="font-family:sans-serif;max-width:460px;margin:auto;">
        <h2 style="color:#6c63ff;">Your Eventify OTP</h2>
        <p>Use this code for <b>{purpose}</b>. Valid for 10 minutes.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;
                    color:#6c63ff;background:#f0eeff;padding:20px;
                    border-radius:10px;text-align:center;">{otp}</div>
    </div>"""
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(cfg["MAIL_SERVER"], cfg["MAIL_PORT"]) as s:
            s.starttls()
            s.login(cfg["MAIL_USERNAME"], cfg["MAIL_PASSWORD"])
            s.send_message(msg)
    except Exception as e:
        print(f"Mail error: {e}")

def make_token(user_id, email):
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def decode_token(token):
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])

_otp_store = {}
@auth_bp.route("/register/send-otp", methods=["POST"])
def register_send_otp():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    name  = data.get("name", "").strip()
    password = data.get("password", "")

    if not all([email, name, password]):
        return jsonify({"error": "All fields required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be 8+ characters"}), 400

    db = get_db()
    existing = db.table("users").select("id").eq("email", email).execute()
    if existing.data:
        return jsonify({"error": "Email already registered"}), 400

    otp = gen_otp()
    _otp_store[email] = {
        "otp":      otp,
        "expiry":   datetime.utcnow() + timedelta(minutes=10),
        "name":     name,
        "password": generate_password_hash(password),
        "referral": data.get("referral_code", "").strip()
    }
    send_otp_email(email, otp, "registration")
    return jsonify({"message": f"OTP sent to {email}"})


@auth_bp.route("/register/verify-otp", methods=["POST"])
def register_verify_otp():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    otp   = data.get("otp", "").strip()

    record = _otp_store.get(email)
    if not record:
        return jsonify({"error": "No OTP requested for this email"}), 400
    if datetime.utcnow() > record["expiry"]:
        _otp_store.pop(email, None)
        return jsonify({"error": "OTP expired"}), 400
    if otp != record["otp"]:
        return jsonify({"error": "Invalid OTP"}), 400

    db = get_db()

    # Handle referral
    referred_by = None
    if record["referral"]:
        ref = db.table("users").select("id").eq("referral_code", record["referral"]).execute()
        if ref.data:
            referred_by = ref.data[0]["id"]
            db.table("users").update({"referral_count": db.rpc("increment", {"row_id": referred_by})})

    user = db.table("users").insert({
        "name":          record["name"],
        "email":         email,
        "password_hash": record["password"],
        "is_verified":   True,
        "referral_code": gen_referral(),
        "referred_by":   referred_by,
    }).execute()

    _otp_store.pop(email, None)
    u     = user.data[0]
    token = make_token(u["id"], u["email"])
    return jsonify({"token": token, "user": {"id": u["id"], "name": u["name"], "email": u["email"]}})


@auth_bp.route("/login", methods=["POST"])
def login():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    db   = get_db()
    rows = db.table("users").select("*").eq("email", email).execute()
    if not rows.data:
        return jsonify({"error": "Invalid credentials"}), 401
    u = rows.data[0]
    if not check_password_hash(u["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = make_token(u["id"], u["email"])
    return jsonify({"token": token, "user": {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}})


@auth_bp.route("/forgot/send-otp", methods=["POST"])
def forgot_send_otp():
    email = (request.json or {}).get("email", "").strip().lower()
    db    = get_db()
    rows  = db.table("users").select("id").eq("email", email).execute()
    if rows.data:
        otp = gen_otp()
        _otp_store[f"reset_{email}"] = {"otp": otp, "expiry": datetime.utcnow() + timedelta(minutes=10)}
        send_otp_email(email, otp, "password reset")
    return jsonify({"message": "If that email exists, an OTP has been sent"})


@auth_bp.route("/forgot/verify-otp", methods=["POST"])
def forgot_verify_otp():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    otp   = data.get("otp", "").strip()
    key   = f"reset_{email}"
    record = _otp_store.get(key)
    if not record or datetime.utcnow() > record["expiry"] or otp != record["otp"]:
        return jsonify({"error": "Invalid or expired OTP"}), 400
    return jsonify({"message": "OTP verified", "email": email})


@auth_bp.route("/forgot/reset-password", methods=["POST"])
def reset_password():
    data     = request.json or {}
    email    = data.get("email", "").strip().lower()
    otp      = data.get("otp", "").strip()
    password = data.get("password", "")
    key      = f"reset_{email}"
    record   = _otp_store.get(key)
    if not record or otp != record["otp"]:
        return jsonify({"error": "Verification failed"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be 8+ characters"}), 400
    db = get_db()
    db.table("users").update({"password_hash": generate_password_hash(password)}).eq("email", email).execute()
    _otp_store.pop(key, None)
    return jsonify({"message": "Password reset successfully"})


@auth_bp.route("/me", methods=["GET"])
def me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        payload = decode_token(token)
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("users").select("id,name,email,role,avatar,referral_code,referral_count,created_at").eq("id", payload["sub"]).execute()
    if not rows.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify(rows.data[0])