from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
print("API KEY:", os.getenv("GROQ_API_KEY"))

# Create router
router = APIRouter()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Dental assistant system prompt
SYSTEM_PROMPT = """
You are a professional Dental AI Assistant.

Rules:
- Only answer dental and oral health questions.
- Give educational guidance only.
- Never diagnose with certainty.
- Never prescribe medication.
- Recommend visiting a dentist for serious symptoms.
- Be calm, clear, and professional.
"""

# Request body model
class ChatRequest(BaseModel):
    message: str

# Chat endpoint
@router.post("/chat")
def chat(request: ChatRequest):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": request.message
            }
        ],
        temperature=0.7,
        max_tokens=500
    )

    reply = response.choices[0].message.content

    return {
        "reply": reply
    }