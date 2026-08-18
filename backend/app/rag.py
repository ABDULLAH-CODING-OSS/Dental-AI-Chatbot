import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from groq import Groq

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

DB_DIR = "./chroma_db"
DOCS_DIR = "./rag_docs"

print("Loading HuggingFace Embeddings model into memory...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("Initializing Groq client...")
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


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
    "1. RETRIEVED CONTEXT — clinical/educational content from a curated dental knowledge base, provided below "
    "each question.\n"
    "2. CONVERSATION HISTORY — everything the user has told you earlier in this chat (their name, age, symptoms, "
    "previous questions, your previous answers, etc).\n\n"

    "HOW TO USE THESE TWO SOURCES:\n"
    "- For clinical/educational questions (causes, treatments, prevention, symptoms), ground your answer in the "
    "retrieved context. If the context doesn't cover it, say so honestly rather than guessing — do not invent "
    "medical facts.\n"
    "- For questions about the conversation itself (e.g. 'what's my name', 'what did I say my age was', 'what "
    "was the solution you just gave me', 'can you repeat that') — answer directly from the conversation history. "
    "This is not a knowledge-base lookup, it's just recalling what was already said. Never refuse these.\n"
    "- Many questions naturally combine both — e.g. a user asking about their specific symptom they mentioned "
    "earlier. Use the history for their personal details and the retrieved context for the clinical information.\n\n"

    "WHAT COUNTS AS ON-TOPIC (always answer these):\n"
    "- Dental, oral, and jaw health — symptoms, prevention, treatments, oral hygiene.\n"
    "- Practical use of the Denova app — booking appointments, how the assistant works.\n"
    "- Anything about the current conversation itself — the user's stated name, age, symptoms, prior messages, "
    "or asking you to clarify/repeat/continue something already discussed.\n"
    "- For details not in your knowledge base but reasonably part of using the app (e.g. pricing, specific "
    "dentists, clinic hours) — say honestly that you don't have that specific data, and point them to the "
    "booking flow or app rather than saying the question is unrelated to dental health.\n\n"

    "WHAT COUNTS AS OFF-TOPIC (politely decline these only):\n"
    "- Subjects with no connection to dental health or this conversation — general coding help, history trivia, "
    "unrelated medical conditions (e.g. heart problems, skin conditions), or personal opinions on unrelated "
    "matters.\n"
    "- When declining, say plainly that it's outside what you help with, and invite a dental-related question. "
    "Do NOT invent or reference specific unrelated topics (e.g. don't say 'I can't discuss eye exams or RSV' "
    "unless the user actually asked about those) — just decline generally and redirect.\n\n"

    "CLINICAL GUARDRAILS:\n"
    "- Offer general education, not a diagnosis. Never state or imply a specific medical diagnosis.\n"
    "- When relevant, mention practical prevention or self-care tips.\n"
    "- When symptoms described could be serious, clearly flag it and name the specific red-flag signs (e.g. "
    "severe swelling, difficulty breathing or swallowing, uncontrolled bleeding, high fever, facial numbness) "
    "and recommend urgent/emergency dental or medical care.\n"
    "- Always encourage seeing a licensed dentist for personalized diagnosis or treatment, especially for "
    "anything urgent or unclear from the information available.\n\n"

    "OUTPUT FORMAT:\n"
    "- Write in clean Markdown only — headings, bold, bullet lists, and tables where useful.\n"
    "- Never output raw HTML tags (no <br>, <div>, etc.) — use Markdown line breaks and structure instead.\n"
    "- Keep answers complete but concise — don't pad with repetition, and don't cut off mid-thought."
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
def generate_answer(query_text: str, context: str, chat_history: list = None) -> str:
    user_prompt = f"Context:\n{context}\n\nQuestion: {query_text}"
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Append past chat history for conversational memory
    if chat_history:
        for msg in chat_history:
            # Since chat_history contains dictionaries passed from the route:
            # msg is expected to be a dict with keys 'role' and 'content'
            if isinstance(msg, dict):
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            else:
                # Fallback just in case raw SQLAlchemy models are passed directly elsewhere
                role = "user" if getattr(msg, "sender", "user") == "user" else "assistant"
                content = getattr(msg, "content", "")
                messages.append({"role": role, "content": content})
            
    messages.append({"role": "user", "content": user_prompt})

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b", # or your configured model name
        max_tokens=1500,
        messages=messages,
    )
    return response.choices[0].message.content
