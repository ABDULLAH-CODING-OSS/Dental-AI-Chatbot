# from datetime import datetime, date
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from pydantic import BaseModel
# from app.rag import query_rag, generate_answer
# from app.api.deps import get_current_user
# from app.data.database import get_db
# from app.models.models import User

# router = APIRouter(prefix="/api/chat", tags=["Chat"])

# DAILY_MESSAGE_LIMIT = 20


# class ChatRequest(BaseModel):
#     message: str

# class ChatResponse(BaseModel):
#     answer: str
#     context: str

# @router.post("/", response_model=ChatResponse)
# def send_message(
#     request: ChatRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     today = datetime.utcnow().date()
#     last_date = current_user.last_message_date.date() if current_user.last_message_date else None

#     if last_date != today:
#         # new day — reset counter
#         current_user.messages_today = 0
#         current_user.last_message_date = datetime.utcnow()

#     if current_user.messages_today >= DAILY_MESSAGE_LIMIT:
#         raise HTTPException(
#             status_code=429,
#             detail=f"You've reached your daily limit of {DAILY_MESSAGE_LIMIT} messages. Please try again tomorrow.",
#         )

#     current_user.messages_today += 1
#     current_user.last_message_date = datetime.utcnow()
#     db.commit()

#     context = query_rag(request.message)
#     answer = generate_answer(request.message, context)
#     return ChatResponse(answer=answer, context=context)
# ________________________________________________________________________________________________________________________________________________________________________________________________________
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.rag import query_rag, generate_answer
from app.api.deps import get_current_user
from app.data.database import get_db 
from app.models.models import User, ChatSession, ChatMessage

router = APIRouter(prefix="/api/chat", tags=["Chat"])

DAILY_MESSAGE_LIMIT = 20

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    context: str
    session_id: int

class SessionRenameRequest(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        orm_mode = True

class MessageResponse(BaseModel):
    sender: str
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
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


# @router.post("/", response_model=ChatResponse)
# def send_message(
#     request: ChatRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     today = datetime.utcnow().date()
#     last_date = current_user.last_message_date.date() if current_user.last_message_date else None

#     if last_date != today:
#         current_user.messages_today = 0
#         current_user.last_message_date = datetime.utcnow()

#     if current_user.messages_today >= DAILY_MESSAGE_LIMIT:
#         raise HTTPException(
#             status_code=429,
#             detail=f"You've reached your daily limit of {DAILY_MESSAGE_LIMIT} messages. Please try again tomorrow.",
#         )

#     current_user.messages_today += 1
#     current_user.last_message_date = datetime.utcnow()

#     # Get or create chat session
#     if request.session_id:
#         chat_session = db.query(ChatSession).filter(ChatSession.id == request.session_id, ChatSession.user_id == current_user.id).first()
#         if not chat_session:
#             raise HTTPException(status_code=404, detail="Chat session not found")
#     else:
#         # Create a new session with title from first message snippet
#         title_snippet = request.message[:30] + "..." if len(request.message) > 30 else request.message
#         chat_session = ChatSession(user_id=current_user.id, title=title_snippet)
#         db.add(chat_session)
#         db.commit()
#         db.refresh(chat_session)

#     # Save user message
#     user_msg = ChatMessage(session_id=chat_session.id, sender="user", content=request.message)
#     db.add(user_msg)
#     db.commit()

#     # RAG Retrieval & Generation
#     context = query_rag(request.message)
#     answer = generate_answer(request.message, context)

#     # Save assistant message
#     assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer)
#     db.add(assistant_msg)
#     db.commit()

#     return ChatResponse(answer=answer, context=context, session_id=chat_session.id)
@router.post("/", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.utcnow().date()
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    if last_date != today:
        current_user.messages_today = 0
        current_user.last_message_date = datetime.utcnow()

    if current_user.messages_today >= DAILY_MESSAGE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You've reached your daily limit of {DAILY_MESSAGE_LIMIT} messages. Please try again tomorrow.",
        )

    current_user.messages_today += 1
    current_user.last_message_date = datetime.utcnow()

    # Get or create chat session
    if request.session_id:
        chat_session = db.query(ChatSession).filter(ChatSession.id == request.session_id, ChatSession.user_id == current_user.id).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        # Create a new session with title from first message snippet
        title_snippet = request.message[:30] + "..." if len(request.message) > 30 else request.message
        chat_session = ChatSession(user_id=current_user.id, title=title_snippet)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    # 1. Grab existing messages in this session BEFORE adding the new user message (for chat memory)
    existing_messages = chat_session.messages if chat_session else []

    # 2. Save user message to database
    user_msg = ChatMessage(session_id=chat_session.id, sender="user", content=request.message)
    db.add(user_msg)
    db.commit()

    # 3. RAG Retrieval & Generation with Chat History/Memory passed in
    context = query_rag(request.message)
    answer = generate_answer(request.message, context, chat_history=existing_messages)

    # 4. Save assistant response to database
    assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer)
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(answer=answer, context=context, session_id=chat_session.id)