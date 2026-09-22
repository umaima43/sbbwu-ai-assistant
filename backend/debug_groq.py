"""Isolated Groq diagnostic - runs a real generation call and prints the exact error."""
import os
import sys
from pathlib import Path

# Load groq.env
env_path = Path(__file__).parent / "groq.env"
for raw in env_path.read_text(encoding="utf-8").splitlines():
    line = raw.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, _, v = line.partition("=")
    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

key = os.getenv("GROQ_API_KEY", "")
print(f"Key loaded: {bool(key)}, prefix: {key[:10]}...")

sys.path.insert(0, str(Path(__file__).parent))
from groq import Groq, APIError, APIConnectionError, RateLimitError

client = Groq(api_key=key)
try:
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a university assistant."},
            {"role": "user",   "content": "Who is the Vice Chancellor of SBBWU?"},
        ],
        max_tokens=200,
        temperature=0.2,
    )
    print("SUCCESS:", resp.choices[0].message.content.strip())
except RateLimitError as e:
    print(f"RATE_LIMIT_ERROR: {e}")
except APIConnectionError as e:
    print(f"CONNECTION_ERROR: {e}")
except APIError as e:
    print(f"API_ERROR [{e.status_code}]: {e.message}")
except Exception as e:
    print(f"UNEXPECTED [{type(e).__name__}]: {e}")
