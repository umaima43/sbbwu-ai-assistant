import os
from dotenv import load_dotenv

# Load your groq.env file
load_dotenv("groq.env")

# Get API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print(GROQ_API_KEY)   # only for testing, remove later