# 🦷 Denova - Dental AI Chatbot

Denova is a premium HealthTech SaaS platform designed to provide medically sound, instant dental guidance. By leveraging an advanced Retrieval-Augmented Generation (RAG) architecture, Denova grounds its AI responses in verified medical data extracted from MedlinePlus, ensuring accurate, trustworthy, and context-aware information for patients.

---

## 🚀 Key Features

### 🖥️ Premium User Experience
* **Modern Interface:** Built with Next.js 14 and React for a lightning-fast, highly responsive App Router experience.
* **Fluid Animations:** Utilizes Framer Motion for tactile, glassmorphic UI elements and smooth state transitions.
* **Responsive Design:** Styled with Tailwind CSS v4, ensuring flawless rendering across desktop, tablet, and mobile devices.
* **Interactive Chat:** Features streaming AI responses, intelligent "thinking" states, auto-scrolling, and inline source citations.

### 🧠 Advanced AI & RAG Pipeline
* **Knowledge Retrieval:** Employs ChromaDB as a local vector store to retrieve highly relevant context from MedlinePlus documentation.
* **Precision AI Generation:** Utilizes LangChain to orchestrate the LLM, seamlessly blending retrieved medical context with natural language generation.
* **Automated Data Ingestion:** Includes a custom Python ETL pipeline to parse, chunk, and vectorize raw MedlinePlus XML datasets.

---

## 🛠️ Technology Stack

**Frontend:**
* Next.js 14 (App Router)
* React
* Tailwind CSS v4
* Framer Motion
* Shadcn/UI Components

**Backend:**
* Python 3.10+
* FastAPI (High-performance API routing)
* Uvicorn (ASGI web server)

**AI & Data:**
* LangChain & OpenAI Embeddings
* ChromaDB (Vector Database)
* BeautifulSoup4 & lxml (Data processing)

---

## 📂 Project Structure

```text
Dental-AI-Chatbot/
├── frontend/                 # Next.js Web Application
│   ├── app/                  # Route handlers and pages
│   ├── components/           # Reusable UI components
│   └── package.json          # Frontend dependencies
├── backend/                  # FastAPI & RAG Application
│   ├── main.py               # API entry point
│   ├── chat.py               # Chat streaming logic
│   ├── rag.py                # ChromaDB retrieval logic
│   ├── process_medlineplus.py# XML parsing and chunking script
│   └── mplus_topics.xml      # Raw medical data source
└── requirements.txt          # Root Python dependencies