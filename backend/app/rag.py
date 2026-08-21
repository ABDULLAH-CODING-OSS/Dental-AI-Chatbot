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
    "You are Denova, a dental health AI assistant. Your ONLY job is to help with:\n"
    "1. Dental/oral health questions (symptoms, treatments, prevention)\n"
    "2. Appointment booking at dental clinics\n\n"

    "CRITICAL RULES:\n"
    "- NEVER mention internal reasoning like 'Did the user already tell me this?' — just answer naturally.\n"
    "- NEVER ask questions unless the user asked something unclear.\n"
    "- NEVER offer help on topics unrelated to dental health (rickets, herpes, spider bites, etc.).\n"
    "- For non-dental questions: politely decline and redirect: 'That's outside my area. Is there anything dental-related I can help with?'\n"
    "- For dental questions: answer directly from RETRIEVED CONTEXT. If context missing, say so.\n"
    "- Always recommend a dentist for diagnosis or serious symptoms.\n"
    "- Red flags (severe swelling, breathing trouble, bleeding, fever with dental pain): strongly encourage emergency care.\n\n"

    "BOOKING FLOW:\n"
    "- Only start booking if user says 'book', 'appointment', 'schedule', etc.\n"
    "- Ask for: service, clinic, doctor, date, time (only if missing)\n"
    "- Use get_available_slots tool to check real availability\n"
    "- Use book_appointment tool only after user confirms all details\n"
    "- After booking: the system sends confirmation — you just say 'Done!'\n\n"

    "TONE: Professional, friendly, brief. Answer what was asked. No rambling.\n"
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
