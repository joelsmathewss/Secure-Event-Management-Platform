import os, uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from routes.auth import decode_token

events_bp = Blueprint("events", __name__)

def get_db():
    from app import supabase
    return supabase

def current_user_id():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        return decode_token(token)["sub"]
    except Exception:
        return None

# in-memory OTP store for host publish verification
_host_otp = {}

@events_bp.route("/", methods=["GET"])
def list_events():
    db  = get_db()
    q   = db.table("events").select("*").eq("status", "published")
    keyword  = request.args.get("q", "")
    category = request.args.get("category", "")
    date     = request.args.get("date", "")
    if category:
        q = q.eq("category", category)
    if date:
        q = q.eq("date", date)
    rows = q.order("date").execute()
    events = rows.data
    if keyword:
        kw = keyword.lower()
        events = [e for e in events if kw in e.get("title","").lower()
                  or kw in e.get("description","").lower()
                  or kw in e.get("location","").lower()]
    return jsonify(events)


@events_bp.route("/<event_id>", methods=["GET"])
def get_event(event_id):
    db   = get_db()
    rows = db.table("events").select("*").eq("id", event_id).execute()
    if not rows.data:
        return jsonify({"error": "Event not found"}), 404
    event = rows.data[0]
    booked = db.table("bookings").select("id").eq("event_id", event_id).eq("status", "confirmed").execute()
    event["booked_count"] = len(booked.data)
    return jsonify(event)


@events_bp.route("/my", methods=["GET"])
def my_events():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("events").select("*").eq("host_id", uid).order("created_at", desc=True).execute()
    return jsonify(rows.data)


@events_bp.route("/host/send-otp", methods=["POST"])
def host_send_otp():
    from routes.auth import gen_otp, send_otp_email
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("users").select("email,name").eq("id", uid).execute()
    email = rows.data[0]["email"]
    otp   = gen_otp()
    _host_otp[uid] = {"otp": otp, "expiry": datetime.utcnow().__class__.utcnow() if False else __import__("datetime").datetime.utcnow() + __import__("datetime").timedelta(minutes=10)}
    send_otp_email(email, otp, "event publishing")
    return jsonify({"message": f"OTP sent to {email}"})


@events_bp.route("/host/verify-otp", methods=["POST"])
def host_verify_otp():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    otp    = (request.json or {}).get("otp", "").strip()
    record = _host_otp.get(uid)
    if not record:
        return jsonify({"error": "No OTP requested"}), 400
    if __import__("datetime").datetime.utcnow() > record["expiry"]:
        _host_otp.pop(uid, None)
        return jsonify({"error": "OTP expired"}), 400
    if otp != record["otp"]:
        return jsonify({"error": "Invalid OTP"}), 400
    _host_otp.pop(uid, None)
    _host_otp[f"verified_{uid}"] = True
    return jsonify({"message": "Verified"})


@events_bp.route("/", methods=["POST"])
def create_event():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    data    = request.json or {}
    publish = data.get("publish", False)
    status  = "draft"
    if publish:
        if not _host_otp.pop(f"verified_{uid}", False):
            return jsonify({"error": "Host OTP verification required to publish"}), 403
        status = "published"
    db   = get_db()
    user = db.table("users").select("name").eq("id", uid).execute()
    doc  = {
        "title":       data.get("title", "").strip(),
        "description": data.get("description", "").strip(),
        "category":    data.get("category", ""),
        "date":        data.get("date", ""),
        "time":        data.get("time", ""),
        "location":    data.get("location", "").strip(),
        "capacity":    int(data.get("capacity", 0)),
        "price":       float(data.get("price", 0)),
        "image":       data.get("image", ""),
        "host_id":     uid,
        "host_name":   user.data[0]["name"] if user.data else "",
        "status":      status,
    }
    result = db.table("events").insert(doc).execute()
    return jsonify(result.data[0]), 201


@events_bp.route("/<event_id>", methods=["PUT"])
def update_event(event_id):
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("events").select("host_id,status").eq("id", event_id).execute()
    if not rows.data or rows.data[0]["host_id"] != uid:
        return jsonify({"error": "Forbidden"}), 403
    data    = request.json or {}
    publish = data.get("publish", False)
    current_status = rows.data[0]["status"]
    new_status = current_status
    if publish and current_status == "draft":
        if not _host_otp.pop(f"verified_{uid}", False):
            return jsonify({"error": "Host OTP verification required to publish"}), 403
        new_status = "published"
    update = {k: data[k] for k in ["title","description","category","date","time","location","capacity","price","image"] if k in data}
    update["status"] = new_status
    result = db.table("events").update(update).eq("id", event_id).execute()
    return jsonify(result.data[0])


@events_bp.route("/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("events").select("host_id").eq("id", event_id).execute()
    if not rows.data or rows.data[0]["host_id"] != uid:
        return jsonify({"error": "Forbidden"}), 403
    db.table("events").update({"status": "deleted"}).eq("id", event_id).execute()
    return jsonify({"message": "Event deleted"})


@events_bp.route("/categories", methods=["GET"])
def categories():
    return jsonify(["Music","Technology","Business","Arts & Culture",
                    "Sports & Fitness","Food & Drink","Education",
                    "Networking","Health & Wellness","Entertainment","Other"])