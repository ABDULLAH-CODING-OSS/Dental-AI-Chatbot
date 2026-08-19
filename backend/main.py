
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.data.database import engine, Base, run_migrations
from app.api import chat, auth, appointments
from app.models.models import User, ChatSession, ChatMessage, Appointment, LocalClinic

from app.api import chat, auth, appointments, notifications, doctors, services



Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(title="Dental AI Chatbot API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notifications.router)
app.include_router(doctors.router)
app.include_router(services.router)

app.include_router(chat.router)
app.include_router(appointments.router)

@app.get("/")
def read_root():
    return {"message": "Dental AI RAG Backend is running successfully!"}