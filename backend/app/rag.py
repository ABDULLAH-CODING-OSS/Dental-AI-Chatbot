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
    "You are a helpful dental health assistant. Answer the user's question "
    "using ONLY the provided context below. If the context doesn't contain "
    "enough information to answer, say so honestly and recommend they see a "
    "dentist rather than guessing. Do not provide specific diagnoses — offer "
    "general education and encourage professional consultation for anything "
    "that sounds urgent or clinical."
)


def generate_answer(query_text: str, context: str) -> str:
    user_prompt = f"Context:\n{context}\n\nQuestion: {query_text}"

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=500,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content