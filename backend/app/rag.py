import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

DB_DIR = "./chroma_db"
DOCS_DIR = "./rag_docs"

def get_vector_store():
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Check if vector DB already exists
    if os.path.exists(DB_DIR) and os.listdir(DB_DIR):
        return Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
    
    # Otherwise load and index documents
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR, exist_ok=True)
        # Create a dummy file if empty
        with open(os.path.join(DOCS_DIR, "default.txt"), "w") as f:
            f.init("Dental AI general knowledge base: Root canals relieve infected pulp pain. Cleanings should happen bi-annually.")

    documents = []
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith(".txt"):
            loader = TextLoader(os.path.join(DOCS_DIR, filename), encoding="utf-8")
            documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    vector_store = Chroma.from_documents(docs, embeddings, persist_directory=DB_DIR)
    return vector_store

def query_rag(query_text: str):
    vector_store = get_vector_store()
    results = vector_store.similarity_search(query_text, k=3)
    context = "\n".join([doc.page_content for doc in results])
    return context