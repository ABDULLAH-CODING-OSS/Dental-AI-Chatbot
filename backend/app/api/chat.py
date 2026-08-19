import os
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from app.rag import query_rag, generate_answer
from app.api.deps import get_current_user
from app.data.database import get_db 
from app.models.models import User, ChatSession, ChatMessage
from app.rag import query_rag, generate_answer, BOOKING_TOOL
from app.models.models import Doctor, Appointment, Notification

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Configurable daily message limit with generous default (100 messages/day)
DAILY_MESSAGE_LIMIT = int(os.environ.get("DAILY_MESSAGE_LIMIT", "100"))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    context: str
    session_id: int
    receipt: Optional[dict] = None

class SessionRenameRequest(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True

class MessageResponse(BaseModel):
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class QuotaResponse(BaseModel):
    messages_today: int
    limit: int
    remaining: int


@router.get("/quota", response_model=QuotaResponse)
def get_user_quota(
    current_user: User = Depends(get_current_user),
):
    now_utc = datetime.utcnow()
    today = now_utc.date()
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    messages_today = current_user.messages_today or 0
    if last_date != today:
        messages_today = 0

    remaining = max(0, DAILY_MESSAGE_LIMIT - messages_today)
    return QuotaResponse(
        messages_today=messages_today,
        limit=DAILY_MESSAGE_LIMIT,
        remaining=remaining
    )


@router.post("/reset-quota", response_model=QuotaResponse)
def reset_user_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.messages_today = 0
    current_user.last_message_date = datetime.utcnow()
    db.commit()
    return QuotaResponse(
        messages_today=0,
        limit=DAILY_MESSAGE_LIMIT,
        remaining=DAILY_MESSAGE_LIMIT
    )


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(func.coalesce(ChatSession.updated_at, ChatSession.created_at).desc())
        .all()
    )
    return sessions


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session.messages


@router.patch("/sessions/{session_id}")
def rename_session(
    session_id: int,
    request: SessionRenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    session.title = request.title
    session.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Session renamed successfully"}


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}


@router.post("/", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now_utc = datetime.utcnow()
    today = now_utc.date()
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    if last_date != today:
        current_user.messages_today = 0
        current_user.last_message_date = now_utc

    if current_user.messages_today >= DAILY_MESSAGE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You've reached your daily limit of {DAILY_MESSAGE_LIMIT} messages. Please try again tomorrow or reset your quota.",
        )

    current_user.messages_today += 1
    current_user.last_message_date = now_utc

    # Get or create chat session
    if request.session_id:
        chat_session = db.query(ChatSession).filter(ChatSession.id == request.session_id, ChatSession.user_id == current_user.id).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        chat_session.updated_at = now_utc
    else:
        # Create a new session with title from first message snippet
        title_snippet = request.message[:30] + "..." if len(request.message) > 30 else request.message
        chat_session = ChatSession(user_id=current_user.id, title=title_snippet, created_at=now_utc, updated_at=now_utc)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    # 1. Grab existing messages in this session and map them to role/content dicts for chat memory
    chat_history = []
    if chat_session and chat_session.messages:
        for msg in chat_session.messages:
            role = "user" if msg.sender == "user" else "assistant"
            chat_history.append({"role": role, "content": msg.content})

    # 2. Save user message to database
    user_msg = ChatMessage(session_id=chat_session.id, sender="user", content=request.message, timestamp=now_utc)
    db.add(user_msg)
    chat_session.updated_at = now_utc
    db.commit()
    

    # 3. RAG Retrieval & Generation with Chat History/Memory passed in
    # context = query_rag(request.message)
    # answer = generate_answer(request.message, context, chat_history=chat_history)

    # # 4. Save assistant response to database
    # assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
    # db.add(assistant_msg)
    # chat_session.updated_at = datetime.utcnow()
    # db.commit()

    # return ChatResponse(answer=answer, context=context, session_id=chat_session.id)
    doctors= db.query(Doctor).all()
    doctor_list_text="\n".join([f"{d.id}. {d.name} ({d.specialty}) -${d.consultation_fee:.2f}" for d in doctors]) or "No doctors available at the moment."
    
    context = query_rag(request.message)
    context = f"AVAILABLE DOCTORS:\n{doctor_list_text}\n\n{context}"
    llm_message = generate_answer(request.message, context, chat_history=chat_history, tools=[BOOKING_TOOL])

    receipt = None
    if llm_message.tool_calls:
        import json
        tool_call = llm_message.tool_calls[0]
        args = json.loads(tool_call.function.arguments)

        doctor = db.query(Doctor).filter(Doctor.id == args.get("doctor_id")).first()
        if doctor is None:
            answer = "I couldn't find that doctor — could you pick from the available options again?"
        else:
            appt = Appointment(
                user_id=current_user.id,
                doctor_id=doctor.id,
                dentist_name=doctor.name,
                patient_name=args.get("patient_name") or current_user.full_name,
                patient_relation=args.get("patient_relation", "Self"),
                patient_age=args.get("patient_age"),
                appointment_date=datetime.fromisoformat(args["appointment_date"]),
                price=doctor.consultation_fee,
                notes=args.get("notes"),
                status="pending",
            )
            db.add(appt)
            db.commit()
            db.refresh(appt)

            db.add(Notification(
                user_id=current_user.id,
                title="Appointment Requested",
                message=f"Your appointment with {doctor.name} on {appt.appointment_date.strftime('%b %d, %Y at %I:%M %p')} is pending confirmation.",
            ))
            db.commit()

            receipt = {
                "confirmation_number": f"APT-{appt.id:06d}",
                "doctor": doctor.name,
                "specialty": doctor.specialty,
                "date": appt.appointment_date.strftime("%B %d, %Y"),
                "time": appt.appointment_date.strftime("%I:%M %p"),
                "price": doctor.consultation_fee,
                "status": appt.status,
            }
            answer = (
                f"✅ Your appointment is booked!\n\n"
                f"**Confirmation #:** {receipt['confirmation_number']}\n"
                f"**Doctor:** {doctor.name} ({doctor.specialty})\n"
                f"**Date:** {receipt['date']} at {receipt['time']}\n"
                f"**Fee:** ${doctor.consultation_fee:.2f}\n\n"
                f"You'll get a notification once it's confirmed."
            )
    else:
        answer = llm_message.content

    return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=receipt)


