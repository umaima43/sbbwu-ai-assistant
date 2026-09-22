
import os
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------------

# backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# backend/groq.env
GROQ_ENV_PATH = BASE_DIR / "groq.env"

# ---------------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------------

load_dotenv(GROQ_ENV_PATH)

# ---------------------------------------------------------------------------
# Get API key
# ---------------------------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
