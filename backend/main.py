from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.data.database import engine, Base
from app.api.chat import chat
from app.models.models import User, ChatSession, ChatMessage, Appointment, LocalClinic  # Imports models so they register on creation

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dental AI Chatbot API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Dental AI RAG Backend is running successfully!"}