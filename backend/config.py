import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY         = os.getenv("SECRET_KEY", "dev-secret")
    SUPABASE_URL       = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY  = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    MAIL_SERVER        = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT          = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME      = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD      = os.getenv("MAIL_PASSWORD")