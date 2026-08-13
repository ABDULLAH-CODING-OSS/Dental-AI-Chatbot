from fastapi import APIRouter
from pydantic import BaseModel
from app.rag import query_rag, generate_answer

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    context: str

@router.post("/", response_model=ChatResponse)
def send_message(request: ChatRequest):
    context = query_rag(request.message)
    answer = generate_answer(request.message, context)
    return ChatResponse(answer=answer, context=context)