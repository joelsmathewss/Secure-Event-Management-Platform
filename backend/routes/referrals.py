from flask import Blueprint, jsonify
from routes.auth import decode_token
from flask import request

referrals_bp = Blueprint("referrals", __name__)

def get_db():
    from app import supabase
    return supabase

def current_user_id():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        return decode_token(token)["sub"]
    except Exception:
        return None

@referrals_bp.route("/my", methods=["GET"])
def my_referrals():
    uid = current_user_id()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    db   = get_db()
    rows = db.table("users").select("id,name,email,referral_code,referral_count").eq("id", uid).execute()
    user = rows.data[0] if rows.data else {}
    referred = db.table("users").select("id,name,email,created_at").eq("referred_by", uid).execute()
    return jsonify({"user": user, "referred_users": referred.data})