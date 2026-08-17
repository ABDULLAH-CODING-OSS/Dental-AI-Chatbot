from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.rag import query_rag, generate_answer
from app.api.deps import get_current_user
from app.data.database import get_db
from app.models.models import User

router = APIRouter(prefix="/api/chat", tags=["Chat"])

DAILY_MESSAGE_LIMIT = 20


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    context: str

@router.post("/", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.utcnow().date()
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    if last_date != today:
        # new day — reset counter
        current_user.messages_today = 0
        current_user.last_message_date = datetime.utcnow()

    if current_user.messages_today >= DAILY_MESSAGE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You've reached your daily limit of {DAILY_MESSAGE_LIMIT} messages. Please try again tomorrow.",
        )

    current_user.messages_today += 1
    current_user.last_message_date = datetime.utcnow()
    db.commit()

    context = query_rag(request.message)
    answer = generate_answer(request.message, context)
    return ChatResponse(answer=answer, context=context)