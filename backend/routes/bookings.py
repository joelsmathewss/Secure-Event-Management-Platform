import random, string, io, base64, smtplib, qrcode
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from flask import Blueprint, request, jsonify, current_app
from routes.auth import decode_token

bookings_bp = Blueprint("bookings", __name__)

def get_db():
    from app import supabase
    return supabase

def current_user_id():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        return decode_token(token)["sub"]
    except Exception:
        return None

def gen_ref(n=12):
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=n))

def make_qr(data):
    qr  = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1a1a2e", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()

def send_booking_email(to_email, name, event, booking_ref, qr_b64):
    cfg = current_app.config
    if not cfg.get("MAIL_USERNAME"):
        print(f"\n📧 Booking confirmed for {to_email} — Ref: {booking_ref}\n")
        return
    msg = MIMEMultipart()
    msg["Subject"] = f"🎟️ Booking Confirmed – {event['title']}"
    msg["From"]    = cfg["MAIL_USERNAME"]
    msg["To"]      = to_email
    html = f"""<div style="font-family:sans-serif;max-width:500px;margin:auto;">
        <h2 style="color:#6c63ff;">Booking Confirmed! 🎉</h2>
        <p>Hi <b>{name}</b>, your ticket for <b>{event['title']}</b> is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#888;padding:6px;">Date</td><td>{event.get('date','')}</td></tr>
          <tr><td style="color:#888;padding:6px;">Venue</td><td>{event.get('location','')}</td></tr>
          <tr><td style="color:#888;padding:6px;">Booking Ref</td><td style="color:#6c63ff;font-weight:700;">{booking_ref}</td></tr>
        </table>
        <p style="margin-top:20px;color:#555;">Your QR ticket is attached. Show it at the venue.</p>
    </div>"""
    msg.attach(MIMEText(html, "html"))
    qr_bytes = base64.b64decode(qr_b64)
    part = MIMEBase("application", "octet-stream")
    part.set_payload(qr_bytes)
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", 'attachment; filename="eventify_ticket.png"')
    msg.attach(part)
    try:
        with smtplib.SMTP(cfg["MAIL_SERVER"], cfg["MAIL_PORT"]) as s:
            s.starttls()
            s.login(cfg["MAIL_USERNAME"], cfg["MAIL_PASSWORD"])
            s.send_message(msg)
    except Exception as e:
        print(f"Mail error: {e}")


@bookings_bp.route("/", methods=["POST"])
def book_event():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    data     = request.json or {}
    event_id = data.get("event_id")
    if not event_id:
        return jsonify({"error": "event_id required"}), 400

    db    = get_db()
    event_rows = db.table("events").select("*").eq("id", event_id).eq("status", "published").execute()
    if not event_rows.data:
        return jsonify({"error": "Event not found"}), 404
    event = event_rows.data[0]

    if event["host_id"] == uid:
        return jsonify({"error": "Cannot book your own event"}), 400

    existing = db.table("bookings").select("id").eq("event_id", event_id).eq("user_id", uid).eq("status", "confirmed").execute()
    if existing.data:
        return jsonify({"error": "Already booked"}), 400

    if event["capacity"] > 0:
        booked = db.table("bookings").select("id").eq("event_id", event_id).eq("status", "confirmed").execute()
        if len(booked.data) >= event["capacity"]:
            return jsonify({"error": "Event is fully booked"}), 400

    user_rows = db.table("users").select("name,email").eq("id", uid).execute()
    user      = user_rows.data[0]
    ref       = gen_ref()
    qr_data   = f"EVENTIFY|{ref}|{event_id}|{uid}"
    qr_b64    = make_qr(qr_data)

    booking = db.table("bookings").insert({
        "booking_ref":  ref,
        "event_id":     event_id,
        "user_id":      uid,
        "user_name":    user["name"],
        "user_email":   user["email"],
        "event_title":  event["title"],
        "qr_code":      qr_b64,
        "status":       "confirmed",
    }).execute()

    send_booking_email(user["email"], user["name"], event, ref, qr_b64)
    return jsonify({"message": "Booked!", "booking": booking.data[0], "qr_code": qr_b64}), 201


@bookings_bp.route("/my", methods=["GET"])
def my_bookings():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("bookings").select("*").eq("user_id", uid).eq("status", "confirmed").order("booked_at", desc=True).execute()
    return jsonify(rows.data)


@bookings_bp.route("/<booking_id>/cancel", methods=["PUT"])
def cancel_booking(booking_id):
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db = get_db()
    db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).eq("user_id", uid).execute()
    return jsonify({"message": "Booking cancelled"})