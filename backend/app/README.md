# 🦷 Denova — AI Dental Consultation Assistant

**Denova** is an intelligent, full-stack AI dental consultation platform designed to provide accessible, instant, and structured dental health guidance. Powered by Retrieval-Augmented Generation (RAG) and conversational memory, Denova offers personal health insights, symptom evaluations, and appointment booking guidance within a modern, responsive user portal.

---

## ✨ Features

- **🤖 AI Dental Assistant:** Delivers expert-informed guidance on oral health, tooth sensitivity, bite alignment, and preventive care.
- **📚 RAG-Enhanced Responses:** Combines user prompts with a specialized dental health knowledge base for accurate educational advice.
- **🧠 Contextual Chat Memory:** Retains session history across turns, allowing the AI to recall patient metadata (name, age, symptoms) within active consultation sessions.
- **🚨 Emergency Red-Flag Warnings:** Highlights urgent symptoms (severe pain, bleeding, swelling) and prompts users to seek immediate professional care.
- **📂 Session Management:** Track past conversations via an interactive sidebar and history page with rename and delete support.
- **📊 User Dashboard & Portal:** Features daily message limits, authentication, and structured response views with copy-to-clipboard functionality.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS, shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React

### **Backend**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** SQLAlchemy ORM (SQLite/PostgreSQL)
- **Authentication:** JWT Bearer Token Authentication
- **AI & LLM Integration:** Groq API / OpenAI API
- **Retrieval Engine:** Custom RAG pipeline (`app/rag.py`)

---

## 🚀 Getting Started

### **Prerequisites**
- Python 3.10+
- Node.js 18+ & npm/pnpm/yarn

---

### **1. Backend Setup (FastAPI)**

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/denova.git](https://github.com/your-username/denova.git)
   cd denova/backend

###  **1. Create and activate a virtual environment:**

Bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### **2. Install dependencies:**

Bash
pip install -r requirements.txt

### **3. Environment Variables:**

Create a .env file in the backend root directory:

Code snippet
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./denova.db.

### **4. Run the FastAPI server:**

Bash
uvicorn app.main:app --reload --port 8000

### **5. Frontend Setup (Next.js)**
Navigate to the frontend directory:

Bash
cd ../frontend

### **6. Install dependencies:**

Bash
npm install

### **7. Environment Variables:**
Create a .env.local file in the frontend root directory:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:8000
Open http://localhost:3000 in your browser.

### **8. Run the development server:**

Bash
npm run dev

### **9. 🔌 API Endpoints Summary**

Method,Endpoint,Description
POST,/api/chat/,Send a user message and receive AI dental advice
GET,/api/chat/sessions,Fetch all chat sessions for the logged-in user
GET,/api/chat/sessions/{id}/messages,Retrieve all past messages for a specific session
PATCH,/api/chat/sessions/{id},Rename a chat session title
DELETE,/api/chat/sessions/{id},Delete a chat session

### **10. 🔒 Disclaimers & Safety**
**Non-Diagnostic:** Denova provides general educational information and is not a substitute for professional clinical diagnosis or treatment.

**Emergency Care:** If experiencing severe pain, swelling, uncontrolled bleeding, or trauma, users are advised to seek immediate professional dental evaluation.

### **📄 License**
This project is licensed under the MIT License.
  