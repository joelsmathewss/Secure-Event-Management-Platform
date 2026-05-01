from flask import Flask
from flask_cors import CORS
from config import Config
from supabase import create_client

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

supabase = create_client(
    app.config["SUPABASE_URL"],
    app.config["SUPABASE_SERVICE_KEY"]
)

from routes.auth import auth_bp
from routes.events import events_bp
from routes.bookings import bookings_bp
from routes.referrals import referrals_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(events_bp, url_prefix="/api/events")
app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
app.register_blueprint(referrals_bp, url_prefix="/api/referrals")

@app.route("/api/health")
def health():
    return {"status": "ok", "app": "Eventify"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)