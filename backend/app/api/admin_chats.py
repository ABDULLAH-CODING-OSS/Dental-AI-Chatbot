from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime
from app.data.database import get_db
from app.models.models import ChatSession, ChatMessage, User
from app.api.deps import get_current_admin

router = APIRouter(prefix="/api/admin/chats", tags=["Admin - Chat Logs"])


class SessionSummary(BaseModel):
    id: int
    title: str
    patient_name: str | None
    patient_email: str
    message_count: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


@router.get("/sessions", response_model=list[SessionSummary])
def list_all_sessions(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    sessions = db.query(ChatSession).order_by(func.coalesce(ChatSession.updated_at, ChatSession.created_at).desc()).all()
    result = []
    for s in sessions:
        user = db.query(User).filter(User.id == s.user_id).first()
        msg_count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
        result.append(SessionSummary(
            id=s.id, title=s.title, patient_name=user.full_name if user else None,
            patient_email=user.email if user else "unknown", message_count=msg_count,
            created_at=s.created_at, updated_at=s.updated_at,
        ))
    return result


@router.get("/sessions/{session_id}/transcript")
def get_transcript(session_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
    return [{"sender": m.sender, "content": m.content, "timestamp": m.timestamp} for m in messages]


@router.get("/stats")
def chat_stats(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()
    today = datetime.utcnow().date()
    active_today = db.query(ChatSession).filter(func.date(ChatSession.updated_at) == today).count()
    return {"total_sessions": total_sessions, "total_messages": total_messages, "active_chats_today": active_today}