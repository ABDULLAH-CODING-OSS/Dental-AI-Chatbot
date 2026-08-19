# 🦷 Denova - Dental AI Chatbot & Booking Agent

Denova is a premium HealthTech SaaS platform designed to provide medically sound, instant dental guidance and seamless appointment scheduling. By leveraging an advanced Retrieval-Augmented Generation (RAG) architecture and Agentic API tool-calling, Denova grounds its AI responses in verified medical data while autonomously managing clinic schedules, patient histories, and service pricing

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

### 📅 Agentic Booking System
* **Intelligent Tool Calling:** The AI agent extracts parameters (date, time, service, clinic) to autonomously trigger backend API tools.
* **Smart Validation:** Automatically checks requested times against specific doctor availability (`slots`), clinic operating hours, and double-booking conflicts.
* **Dynamic Alternatives:** Suggests the next 3 available time slots if a requested appointment time is unavailable.
* **Comprehensive Schema:** Built on a relational database supporting multi-clinic architectures, dynamic service pricing overrides, and strict deletion safeguards.

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
* SQLAlchemy (ORM for relational database management)

---

## 📂 Project Structure

```text
Dental-AI-Chatbot/
├── frontend/                 # Next.js Web Application
│   ├── app/                  # Route handlers and pages
│   ├── components/           # Reusable UI components
│   └── package.json          # Frontend dependencies
├── backend/                  # FastAPI & RAG Application
│   ├── app/
│   │   ├── api/              # API routes (appointments, clinics, services)
│   │   └── models/           # SQLAlchemy DB models & schema
│   ├── main.py               # API entry point
│   ├── chat.py               # Chat streaming logic & Agent tools
│   ├── rag.py                # ChromaDB retrieval logic
│   ├── process_medlineplus.py# XML parsing and chunking script
│   └── mplus_topics.xml      # Raw medical data source
```


## ⚙️ Getting Started
**Prerequisites** 
* Node.js (v18 or higher)

* Python (v3.10 or higher)

Git

### **1. Clone the Repository**
* git clone [https://github.com/your-username/Dental-AI-Chatbot.git](https://github.com/your-username/Dental-AI-Chatbot.git)
* cd Dental-AI-Chatbot
** 2. Backend Setup (FastAPI + ChromaDB) **
* Set up your Python virtual environment and initialize the vector database.

**Bash**
# Navigate to the backend directory (or stay in root if your venv is at root)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies from the root directory
pip install -r requirements.txt

# Navigate to backend and process the MedlinePlus data to build the ChromaDB vector store
cd backend
python process_medlineplus.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000

The API server will run at http://localhost:8000. You can view the Swagger UI documentation at http://localhost:8000/docs.

3. Frontend Setup (Next.js)
*  Open a new terminal window and set up the web application.

*  Bash
# Navigate to the frontend directory
*  cd frontend

# Install Node modules
*  npm install

# Start the development server
* npm run dev
* The web application will run at http://localhost:3000.

🔐 Environment Variables
You will need to configure environment variables for both the frontend and backend.

Backend (backend/.env):

Code snippet
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./denova.db  # Or your PostgreSQL connection string

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:8000
🛡️ Version Control Notes
To prevent repository bloat, the generated RAG artifacts (rag_docs/*.txt) and the local vector database directory (chroma_db/) are explicitly excluded from version control via .gitignore. You must run the process_medlineplus.py script locally after cloning to regenerate the required database.

Built with ❤️ for better dental health.