import os
from types import SimpleNamespace
import groq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from groq import Groq

DB_DIR = "./chroma_db"
DOCS_DIR = "./rag_docs"

print("Loading HuggingFace Embeddings model into memory...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("Initializing Groq client...")
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
BOOKING_TOOL = {
    "type": "function",
    "function": {
        "name": "book_appointment",
        "description": "Book a dental appointment only after get_available_slots has returned the exact requested time as available and the user has confirmed it. appointment_date must be a local clinic time in YYYY-MM-DDTHH:MM:SS format without a timezone offset or Z. Preserve the exact appointment_date requested by the user; never substitute another time.",
        "parameters": {
            "type": "object",
            "properties": {
                "clinic_id": {"type": "integer", "description": "The ID of the chosen clinic"},
                "service_id": {"type": "integer", "description": "The ID of the chosen dental service"},
                "doctor_id": {"type": "integer", "description": "The ID of the chosen doctor"},
                "appointment_date": {"type": "string", "description": "ISO date-time, e.g. 2026-08-25T14:30:00"},
                "patient_name": {"type": "string", "description": "Patient name; omit when not provided"},
                "patient_relation": {"type": "string", "description": "Self, Child, Spouse, etc.; use Self when booking for the user", "default": "Self"},
                "patient_age": {"type": "integer"},
                "notes": {"type": "string", "description": "Additional booking notes; omit when not provided"},
            },
            "required": ["clinic_id", "service_id", "doctor_id", "appointment_date"],
        },
    },
}

GET_AVAILABLE_SLOTS_TOOL = {
    "type": "function",
    "function": {
        "name": "get_available_slots",
        "description": "Check real appointment availability before discussing or booking a doctor or time slot. Never claim availability without calling this tool.",
        "parameters": {
            "type": "object",
            "properties": {
                "clinic_id": {"type": "integer"},
                "doctor_id": {"type": "integer"},
                "appointment_date": {"type": "string", "description": "Local date in YYYY-MM-DD format"},
            },
            "required": ["clinic_id", "doctor_id", "appointment_date"],
        },
    },
}


def generate_answer(
    query_text: str,
    context: str,
    chat_history: list = None,
    tools: list = None,
    tool_choice: str | dict = "auto",
):
    user_prompt = f"Context:\n{context}\n\nQuestion: {query_text}"
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if chat_history:
        for msg in chat_history:
            if isinstance(msg, dict):
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": user_prompt})

    kwargs = {"model": "openai/gpt-oss-20b", "max_tokens": 1500, "messages": messages}
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = tool_choice

    try:
        response = groq_client.chat.completions.create(**kwargs)
    except groq.BadRequestError as e:
        print("GROQ 400 (first attempt):", e.response.text if hasattr(e, "response") else e)
        if "tools" in kwargs:
            kwargs["tool_choice"] = "auto"  # relax instead of removing tools entirely
        try:
            response = groq_client.chat.completions.create(**kwargs)
        except groq.BadRequestError as e:
            print("GROQ 400 (second attempt):", e.response.text if hasattr(e, "response") else e)
            return SimpleNamespace(
                content="I ran into an issue checking availability — could you tell me the clinic, doctor, and date again?",
                tool_calls=None,
            )
    return response.choices[0].message

def _initialize_or_load_db():
    if os.path.exists(DB_DIR) and len(os.listdir(DB_DIR)) > 0:
        print("Loading existing ChromaDB index into RAM...")
        return Chroma(persist_directory=DB_DIR, embedding_function=embeddings)

    print("Building new ChromaDB index from rag_docs/...")
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR, exist_ok=True)
        with open(os.path.join(DOCS_DIR, "default.txt"), "w", encoding="utf-8") as f:
            f.write("Dental AI general knowledge base: Root canals relieve infected pulp pain.")

    loader = DirectoryLoader(
        DOCS_DIR,
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=40)
    docs = text_splitter.split_documents(documents)

    vector_store = Chroma.from_documents(docs, embeddings, persist_directory=DB_DIR)
    print(f"ChromaDB indexing complete! Indexed {len(docs)} text chunks.")
    return vector_store


vector_store = _initialize_or_load_db()


def query_rag(query_text: str) -> str:
    if not query_text or not query_text.strip():
        return ""
    results = vector_store.similarity_search(query_text, k=3)
    return "\n\n".join([doc.page_content for doc in results])

SYSTEM_PROMPT = (
    "You are Denova, a dental health AI assistant. You have two sources of information available to you:\n"
    "1. RETRIEVED CONTEXT — clinical/educational content provided below each question.\n"
    "2. CONVERSATION HISTORY — everything the user has told you earlier (name, age, symptoms, previous turns).\n\n"

    "ADAPTIVE VERBOSITY & FORMATTING (CRITICAL):\n"
    "- Match response depth to the query. For simple questions (e.g., 'What is my name?'), keep it short and direct. "
    "For complex clinical concerns, use a structured, detailed format.\n"
    "- Markdown Tables: If you use a table, format it strictly with clean pipe separators ('|'). "
    "Do not use messy spacing. If a table is not essential for clarity, use bullet points instead to avoid rendering errors.\n"
    "- Never output raw HTML (no <br>, <div>, etc.). Use Markdown line breaks.\n\n"

    "HOW TO USE SOURCES:\n"
    "- For clinical questions: Ground your answer in the RETRIEVED CONTEXT. If missing, say so honestly — do not guess.\n"
    "- For conversational questions (name, age, past solutions, repetition): Answer directly from CONVERSATION HISTORY. "
    "These are always ON-TOPIC and should never be refused.\n"
    "- For combined questions: Use history for personal details and context for clinical information.\n\n"

    "WHAT COUNTS AS ON-TOPIC (always answer these):\n"
    "- Dental, oral, and jaw health; practical use of the Denova app.\n"
    "- Any meta-questions about the current session (e.g., 'What was my age?', 'Repeat what you said').\n"
    "- If a query is about app data not in your knowledge base (pricing, hours), state you lack that specific data "
    "and point the user to the app's booking flow.\n\n"

    "WHAT COUNTS AS OFF-TOPIC (politely decline):\n"
    "- Subjects with no connection to dental health or this session (e.g., coding, general history, non-dental medical advice).\n"
    "- When declining, give a general redirect to dental topics. Do NOT name specific unrelated topics (like eye exams or RSV) "
    "unless the user specifically asked about them.\n\n"

    "CLINICAL GUARDRAILS:\n"
    "- Offer general education, not a diagnosis. Always recommend professional consultation.\n"
    "- If symptoms are serious, name specific red-flag signs (e.g., severe swelling, breathing difficulty, uncontrolled bleeding, numbness).\n"
    "- If symptoms suggest professional evaluation is needed, always encourage booking an appointment via the app.\n\n"

    "BOOKING FLOW:\n"
    "- Booking checklist: before finalizing, collect patient name, appointment date, exact time slot, and service type. Treat all appointment times as local clinic times; do not ask for or convert timezones. Use the current date context from the conversation and do not invent dates or clinic hours.\n"
    "- Before saying a doctor or time slot is available, you MUST call get_available_slots and use its returned slots. Never infer availability from clinic hours, doctor slots, or context text alone.\n"
    "- If the user changes the clinic, doctor, date, or requested time after availability was checked, discard the previous availability result and call get_available_slots again for the new selection.\n"
    "- When calling book_appointment, appointment_date must exactly match the user's requested time and the time returned by get_available_slots. Never silently substitute an alternative. If a returned booking time differs, do not claim success; explain the difference and ask whether to keep it or choose another time.\n"
    "- Appointment times are local to the selected clinic. Never ask for PST, EST, IST, or any other timezone, and never convert the selected time.\n"
    "- When the user wants to book, show available clinics (with locations and hours), available services (with base prices), "
    "and available doctors at that clinic. Have the user confirm clinic → service → doctor → time slot. Only call the tool "
    "once all are selected AND the user confirms.\n"
    "- Do not repeat the available-slot list after the user has already selected an exact time and provided their preferences. Acknowledge the selected time and continue with only the missing checklist item.\n"
    "- After an availability list is shown for the selected doctor and date, a user's time reply such as 10:00, 22:00, 1:00 PM, or 5:30 means they are selecting that listed slot: call book_appointment, do not call get_available_slots again.\n"
    "- Check the conversation history and booking_state before asking questions. If name, date, time, or service is already known, do not ask for it again. If patient_name, patient_age, or relation is non-null in booking_state, never ask for that value again.\n"
    "- When all required booking details are present, move to a concise confirmation summary and trigger book_appointment rather than looping back to slot selection. If the user repeats a chosen time emphatically, acknowledge it and proceed; do not treat it as a new availability search.\n"
    "- Only ever reference clinics, services, and doctors that appear in the booking context. Never invent names, locations, "
    "hours, prices, specialties, or fees.\n"
    "- If the selected time slot is unavailable, apologize, show next 3 available slots, and ask if they prefer one of those instead.\n"
    "- Gather only missing details. Never call the book_appointment tool without "
    "explicit confirmation.\n\n"

    "CRITICAL BOOKING RULE: You must NEVER write a booking confirmation, confirmation number, or receipt-style "
    "message yourself. A booking is only real if you actually call the book_appointment tool — the system "
    "generates the confirmation message for you after the tool succeeds. If you have not called the tool, do not "
    "claim an appointment is booked, confirmed, or scheduled under any circumstance."
)

# def generate_answer(query_text: str, context: str) -> str:
#     user_prompt = f"Context:\n{context}\n\nQuestion: {query_text}"

#     response = groq_client.chat.completions.create(
#         model="openai/gpt-oss-20b",
#         max_tokens=500,
#         messages=[
#             {"role": "system", "content": SYSTEM_PROMPT},
#             {"role": "user", "content": user_prompt},
#         ],
#     )
#     return response.choices[0].message.content
#_______________________________________________________________________________________________________________________________________________________________________________________________________
# def generate_answer(query_text: str, context: str, chat_history: list = None) -> str:
#     user_prompt = f"Context:\n{context}\n\nQuestion: {query_text}"
    
#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
#     # Append past chat history for conversational memory
#     if chat_history:
#         for msg in chat_history:
#             # Since chat_history contains dictionaries passed from the route:
#             # msg is expected to be a dict with keys 'role' and 'content'
#             if isinstance(msg, dict):
#                 messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
#             else:
#                 # Fallback just in case raw SQLAlchemy models are passed directly elsewhere
#                 role = "user" if getattr(msg, "sender", "user") == "user" else "assistant"
#                 content = getattr(msg, "content", "")
#                 messages.append({"role": role, "content": content})
            
#     messages.append({"role": "user", "content": user_prompt})

#     response = groq_client.chat.completions.create(
#         model="openai/gpt-oss-20b", # or your configured model name
#         max_tokens=1500,
#         messages=messages,
#     )
#     return response.choices[0].message.content
