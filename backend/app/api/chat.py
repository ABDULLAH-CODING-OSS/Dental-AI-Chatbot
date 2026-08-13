from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.data.database import get_db
from app.models.models import ChatSession, ChatMessage
from app.rag import query_rag

# Load environment variables
load_dotenv()

# Create router with prefixing
router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Dental assistant base rules
BASE_SYSTEM_PROMPT = """
You are a professional Dental AI Assistant.

Rules:
- Only answer dental and oral health questions.
- Give educational guidance only.
- Never diagnose with certainty.
- Never prescribe medication.
- Recommend visiting a dentist for serious symptoms.
- Be calm, clear, and professional.
"""

# Request body model supporting sessions and user scoping
class ChatRequest(BaseModel):
    session_id: int | None = None
    message: str
    user_id: int = 1  # Default to user 1 for development testing

# Chat endpoint with database memory and RAG context retrieval
@router.post("/")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 1. Manage Chat Session & Memory
        if not request.session_id:
            session = ChatSession(user_id=request.user_id, title=request.message[:30] + "...")
            db.add(session)
            db.commit()
            db.refresh(session)
            session_id = session.id
        else:
            session_id = request.session_id
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")

        # Save user message to database
        user_msg = ChatMessage(session_id=session_id, sender="user", content=request.message)
        db.add(user_msg)
        db.commit()

        # 2. Retrieve relevant medical/clinic context from the RAG vector store
        rag_context = query_rag(request.message)

        # 3. Build dynamic messages payload with System Prompt + RAG context + Rolling History
        system_content = f"{BASE_SYSTEM_PROMPT}\n\nVerified Reference Knowledge:\n{rag_context}"
        
        messages_payload = [
            {"role": "system", "content": system_content}
        ]

        # Pull recent chat history for session memory (last 6 messages)
        history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
        for msg in history[-6:]:
            role = "user" if msg.sender == "user" else "assistant"
            messages_payload.append({"role": role, "content": msg.content})

        # 4. Request completion from Groq Llama model
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_payload,
            temperature=0.3,
            max_tokens=600
        )

        reply = response.choices[0].message.content

        # Save assistant response to database history
        assistant_msg = ChatMessage(session_id=session_id, sender="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

        return {
            "session_id": session_id,
            "reply": reply,
            "rag_sources_active": bool(rag_context)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))