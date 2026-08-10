# uvicorn api:app --reload# bot-trial/api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat_engine import ChatEngine

app = FastAPI()

# Allow your Next.js frontend (port 3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ChatEngine()  # loaded once at startup

class ChatRequest(BaseModel):
    session_id: str
    message: str

class FeedbackRequest(BaseModel):
    message_id: int
    positive: bool

@app.post("/chat")
def chat(req: ChatRequest):
    result = engine.handle_message(req.session_id, req.message)
    return {
        "answer": result.answer,
        "message_id": result.message_id,
        "sources": result.sources,
        "confidence": result.confidence,
        "intent": result.intent,
    }

@app.post("/feedback")
def feedback(req: FeedbackRequest):
    engine.record_feedback(req.message_id, req.positive)
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}