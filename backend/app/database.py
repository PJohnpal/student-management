import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_connection():
    try:
        result = supabase.table("users").select("count", count="exact").execute()
        print("✅ Supabase connected successfully!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

# Test connection on import
test_connection()