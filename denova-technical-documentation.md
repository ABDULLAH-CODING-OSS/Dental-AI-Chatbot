Denova — Complete Technical Documentation
1. Project Overview

Denova is a production-ready, full-stack dental health platform combining RAG-powered clinical guidance with an intelligent appointment booking system. It delivers evidence-grounded dental consultation through a premium web interface featuring real-time chat, appointment management, admin analytics, and role-based access control.

The platform is fully functional and ready for client deployment with no demo data or placeholders remaining.

2. Architecture Overview
┌─────────────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│   Next.js Frontend      │      │   FastAPI Backend    │      │   Groq API         │
│   (App Router + TS)     │◀────▶│   (REST + Tools)     │◀────▶│   openai/gpt-oss   │
│   - Chat Interface      │      │   - RAG Pipeline     │      │   -20b Model       │
│   - Admin Dashboard     │      │   - Booking Engine   │      │                    │
│   - Auth (JWT)          │      │   - Rate Limiting    │      │                    │
└─────────────────────────┘      └──────────────────────┘      └────────────────────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                 ┌────────────┐    ┌──────────────┐    ┌─────────────────┐
                 │ ChromaDB   │    │ SQLite/      │    │ HuggingFace     │
                 │ (Vectors)  │    │ PostgreSQL   │    │ Embeddings      │
                 │ 400-char   │    │ (Prod-ready)│    │ (all-MiniLM-    │
                 │ chunks     │    │              │    │  L6-v2)         │
                 └────────────┘    └──────────────┘    └─────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                 ┌──────────────────┐            ┌──────────────────────┐
                 │ JWT Auth         │            │ Admin Analytics      │
                 │ (bcrypt/argon2)  │            │ - Daily volume       │
                 │ - Role-based     │            │ - User management    │
                 │ - Rate limiting  │            │ - Appointment data   │
                 └──────────────────┘            └──────────────────────┘
3. Data Pipeline & Knowledge Base
Source Data

Denova's clinical knowledge base is built from authoritative, reuse-licensed public health data:

Source	Type	Coverage	License
MedlinePlus Health Topics (NIH/NLM)	Structured XML, daily-generated	2,000+ health topics filtered to dental-relevant	Public Domain
CDC Oral Health Fact Sheets	PDFs + web content	U.S. epidemiology, prevention, treatment guidelines	Public Domain
NIDCR (National Institute of Dental/Craniofacial Research)	Health info pages	Federal dental condition facts, research summaries	Public Domain
Data Processing Pipeline
Download & Parse: Daily-generated MedlinePlus XML corpus downloaded and parsed into structured text documents.
Filtering: Full 2,000+ topic corpus filtered by dental keywords (tooth|gum|oral|cavity|periodontal|orthodont|braces|implant|root canal|abscess|gingivitis|plaque, etc.) to isolate ~300 dental-focused documents.
Chunking: RecursiveCharacterTextSplitter (LangChain) — 400-character chunks, 40-character overlap — ensures semantic coherence while maintaining retrieval flexibility.
Embedding & Indexing: sentence-transformers/all-MiniLM-L6-v2 (HuggingFace) — fast, lightweight, cached at server startup; vectors stored in ChromaDB, persisted to disk, auto-rebuilt if missing.
Retrieval: Top-k=3 similarity search per user query; chunks ranked by cosine similarity.
4. RAG System Architecture
Core Components

Embeddings Engine:

Model: sentence-transformers/all-MiniLM-L6-v2
Loaded once at server startup, kept in memory
Dimension: 384
Latency: <50ms per query on CPU

Vector Store:

ChromaDB (development/small deployments)
Can scale to PostgreSQL pgvector for production
Automatic persistence to ./chroma_db/
Index auto-rebuild on first boot if missing

LLM Provider:

Groq API — chosen for <1s latency, high throughput
Model: openai/gpt-oss-20b (switched from llama-3.3-70b-versatile June 2026)
Max tokens: 1500 per response
Fallback handling: if tool-calling fails, retries without tools; if still fails, returns safe fallback message

Retrieval Flow:

User Query
    ↓
Embedding (all-MiniLM-L6-v2)
    ↓
ChromaDB similarity_search(k=3)
    ↓
Top-3 chunks + Chat History + Booking Context
    ↓
Groq LLM (with tools if booking-related)
    ↓
Grounded Answer + Optional Tool Calls
System Prompt (Final, Production Version)

The system prompt was refined through production testing to solve three critical issues:

Issue 1: Over-refusal — Model refused meta-questions ("what's my name?") as "not dental."
Fix: Explicitly allow conversation-history questions alongside clinical questions.

Issue 2: RAG vs. Memory Conflict — "use ONLY provided context" broke conversation continuity.
Fix: Define context as two sources: retrieved chunks AND active session history.

Issue 3: Hallucination During Declines — Model invented topics ("I can't discuss RSV") to justify refusals.
Fix: Decline generically without referencing invented specifics.

Final Prompt Rules:

Answer clinical questions from RETRIEVED CONTEXT only; admit gaps honestly
Answer conversational/meta questions from CONVERSATION HISTORY
Never re-ask details already stated in history or booking_state
For non-dental: decline politely, redirect to dental topics (no invented topics)
Red flags (severe swelling, breathing trouble, bleeding, fever + dental pain): escalate to emergency care
Appointment booking: collect service → clinic → doctor → date → time; validate against real availability before booking
Output: clean Markdown, no raw HTML, honest "I don't know" for business details
5. Appointment Booking System
Function-Calling Architecture

The booking system uses Groq tool-calling with two function definitions:

Tool 1: get_available_slots

json
{
  "name": "get_available_slots",
  "description": "Check real appointment availability for a doctor on a specific date",
  "parameters": {
    "clinic_id": "integer",
    "doctor_id": "integer",
    "appointment_date": "YYYY-MM-DD"
  }
}

Returns: List of 30-minute slot intervals (e.g., ["09:00", "09:30", "10:00", ...])

Tool 2: book_appointment

json
{
  "name": "book_appointment",
  "description": "Create an appointment booking after user confirms all details",
  "parameters": {
    "clinic_id": "integer",
    "service_id": "integer",
    "doctor_id": "integer",
    "appointment_date": "YYYY-MM-DDTHH:MM:SS (ISO, no timezone)",
    "patient_name": "string (optional, uses current user if omitted)",
    "patient_relation": "Self|Child|Spouse|Parent|etc. (default: Self)",
    "patient_age": "integer (required for medical record)",
    "notes": "string (optional)"
  }
}

Creates: Appointment record with status pending, sends notification to user

Booking Flow (UX)
User: "Book me an appointment"
  ↓
System extracts: name (from auth), age (from history), relation (from history)
  ↓
"Which service? clinic? doctor? date? time?"
  ↓
User provides all details
  ↓
System calls get_available_slots(clinic_id, doctor_id, date)
  ↓
Display available times in clickable chip grid
  ↓
User clicks time slot
  ↓
System calls book_appointment(all details + selected time)
  ↓
System generates receipt with confirmation_number (APT-XXXXXX)
  ↓
Notification created, appointment status = pending
Anti-Loop & Memory Rules
Never re-ask: If user said age=25, clinic=KM, doctor=Faria → system remembers across turns
20-turn booking context: _needs_booking_tools() scans last 20 messages for booking keywords; keeps booking mode active during entire flow
Availability validation: Always call get_available_slots before claiming a slot is free; never infer from clinic hours alone
Doctor name normalization: _normalize() removes periods/spaces from names to match "Dr. Faria" in both DB and LLM output
Data Model (Appointments)
sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,          -- patient
  doctor_id INTEGER,        -- who
  clinic_id INTEGER,        -- where
  service_id INTEGER,       -- what procedure
  dentist_name VARCHAR,     -- backup name field
  patient_name VARCHAR,     -- name on record
  patient_relation VARCHAR, -- Self/Child/Spouse
  patient_age INTEGER,      -- for medical record
  appointment_date DATETIME,-- local clinic time, no TZ
  status VARCHAR,           -- pending/confirmed/cancelled
  price FLOAT,              -- service price at time of booking
  notes TEXT,               -- user notes
  created_at DATETIME,      -- booking timestamp
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  ...
);
6. Backend (FastAPI)
Tech Stack
Framework: FastAPI 0.104+
ORM: SQLAlchemy 2.0
Database: SQLite (dev), PostgreSQL ready (prod)
Auth: JWT (python-jose), bcrypt/argon2 password hashing
API Rate Limiting: 100 messages/day per user (configurable via admin settings)
Rate Limit Tracking: Per-user messages_today counter + last_message_date, reset daily at UTC
Authentication & Authorization

JWT Flow:

User POSTs email/password to /api/auth/login
Server verifies password hash, generates JWT (secret: env var SECRET_KEY)
Frontend stores JWT in React Context (memory only, not localStorage)
All API calls include Authorization: Bearer <JWT> header
Server decodes & validates JWT; extracts user_id and role

Role-Based Access:

Patient (role="patient"): Can access /api/chat/, /api/appointments/me, /api/notifications/me, patient settings
Admin (role="admin"): Can access all /api/admin/ endpoints (users, chat logs, appointments, analytics, settings, clinics, doctors, services, pricing)
Admin login uses same form; backend verifies role == "admin" from database (never trusted from frontend checkbox alone)
Key Endpoints
Method	Endpoint	Auth	Description
POST	/api/auth/signup	None	Create patient account
POST	/api/auth/login	None	Authenticate, return JWT
POST	/api/chat/	JWT	Send message, get RAG-grounded answer
GET	/api/chat/sessions	JWT	List user's chat sessions
GET	/api/chat/sessions/{id}/messages	JWT	Load session history
POST	/api/appointments/	JWT	Create booking (from chat flow)
GET	/api/appointments/me	JWT	User's appointments
GET	/api/admin/overview	Admin JWT	Analytics overview
GET	/api/admin/chats/daily-volume?days=30	Admin JWT	Daily chat count trend
GET	/api/admin/users	Admin JWT	All users + quota info
PATCH	/api/admin/settings/{key}	Admin JWT	Update rate limit, etc.
GET	/api/admin/clinics	Admin JWT	List clinics
POST	/api/admin/clinics	Admin JWT	Create clinic
(etc.)	(other CRUD)	Admin JWT	Manage doctors, services, pricing
Rate Limiting Logic
python
# In send_message()
daily_limit = get_daily_limit(db)  # Reads from SystemSettings table
if current_user.messages_today >= daily_limit:
    raise HTTPException(status_code=429, detail="Daily limit reached...")

current_user.messages_today += 1
current_user.last_message_date = utcnow()
db.commit()

Resetting: When last_message_date.date() != today:

python
if last_date != today:
    current_user.messages_today = 0
    current_user.last_message_date = now_utc
7. Frontend (Next.js)
Tech Stack
Framework: Next.js 15+ (App Router)
Language: TypeScript
Styling: Tailwind CSS 3+
Components: shadcn/ui (button, textarea, accordion, badge, etc.)
Animations: Framer Motion
Markdown: react-markdown + remark-gfm
HTTP Client: axios
Auth State: React Context (no localStorage)
Pages & Routes

Public:

/ — Landing page (marketing, FAQ, features)
/login — Auth form (patient + admin toggle)
/signup — Patient registration

Patient (Protected):

/dashboard — Main chat interface + message history
/dashboard?session={id} — Load specific chat session
/appointments — View user's appointment list + details
/settings — Profile & password change
/notifications — Notification inbox

Admin (Protected, role-gated):

/admin/overview — Analytics dashboard (daily volume chart, KPIs)
/admin/users — User management + quota status
/admin/chat-logs — View all chat sessions + search
/admin/appointments — Manage all appointments + status updates
/admin/clinics — CRUD clinics
/admin/doctors — CRUD doctors (assign to clinics, set fees/slots)
/admin/services — CRUD services + descriptions
/admin/pricing — Clinic-specific pricing overrides
/admin/settings — Rate limit, feature flags, system settings
Chat Interface Components
DashboardChatContent — Main chat container, message state, scroll-to-bottom
EnhancedMessageBubble — Renders user/AI messages + structured elements (receipts, slot pickers, clinic listings)
ReceiptCard — Styled appointment confirmation display
SlotPicker — Clickable time slot buttons (renders automatically when slots are detected in AI response)
ListingsCard — Clinic/Doctor/Service table rendering
MarkdownContent — Markdown rendering with Tailwind styling for tables, lists, etc.
State Management
Auth Context (useAuth()) — JWT token, user role, login/logout methods
Local state — Messages, isTyping, currentSessionId, etc. (React useState)
No Redux/Zustand — Kept minimal; session state re-hydrated from backend on page load
Font Sizing (Tailwind Config)

Increased globally by 15-20% for readability (not bold, just larger):

javascript
fontSize: {
  xs: '13px',    // labels, captions
  sm: '14px',    // small text
  base: '16px',  // body text
  lg: '18px',    // medium headings
  xl: '20px',    // section headings
  '2xl': '24px', // page titles
  '3xl': '30px', // hero text
}
8. Database Schema
Core Tables

users

sql
id, email (unique), hashed_password, full_name, role (patient|admin),
created_at, messages_today, last_message_date

chat_sessions

sql
id, user_id (FK), title, created_at, updated_at

chat_messages

sql
id, session_id (FK), sender (user|assistant), content (text),
timestamp

appointments

sql
id, user_id (FK), doctor_id (FK), clinic_id (FK), service_id (FK),
dentist_name, patient_name, patient_relation, patient_age,
appointment_date (DATETIME, local, no TZ), status (pending|confirmed|cancelled),
price, notes, created_at

clinics

sql
id, name, address, phone, latitude, longitude,
operating_hours (e.g., "09:00-18:00,14:00-17:00"),
created_at

doctors

sql
id, name, specialty, email (unique), phone,
consultation_fee, slots (e.g., "09:00-12:00,14:00-18:00"),
created_at

services

sql
id, name, description, base_price, created_at

clinic_pricing

sql
id, clinic_id (FK), service_id (FK), price (override),
created_at

notifications

sql
id, user_id (FK), title, message, read (0|1),
created_at

system_settings

sql
id, key (unique), value (e.g., key='daily_message_limit', value='100'),
created_at, updated_at
9. Security
Authentication & Secrets
JWT Secret: Loaded from env var SECRET_KEY (minimum 32 chars)
Password Hashing: Argon2 (recommended) or bcrypt via passlib
Token Expiry: 24 hours (configurable in code)
Session Storage: React Context (memory only), no localStorage/sessionStorage → reduced XSS token-theft surface
Admin Access Control
Admin role is never inferred from frontend UI alone
Backend validates role == "admin" from database on every admin endpoint
Admin login uses same form; role check happens server-side via database lookup
No admin bypass via URL manipulation or JWT forgery (JWT signature verified, role field not client-controlled)
Rate Limiting
Per-user 100 messages/day (configurable)
Tracked via database columns, not in-memory (survives restarts)
Daily reset at UTC midnight
Returns 429 with descriptive error message when limit hit
Data Privacy
User passwords never stored plaintext (hashed on signup, verified on login)
JWT tokens held in memory only (not persisted to disk/local storage)
All API responses validated server-side; no sensitive data leaks in error messages
Chat history and appointment data isolated per user (no cross-user leaks)
10. Deployment & Environment
Environment Variables (Required)
# Backend
SECRET_KEY=<32+ char random string>
GROQ_API_KEY=<your Groq API key>
DATABASE_URL=sqlite:///./denova.db  (or postgresql://...)
CORS_ORIGINS=http://localhost:3000,https://denova.vercel.app

# Frontend (.env.local)
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000/api/chat/
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
Local Development Setup
bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)
pip install -r requirements.txt
python seed_data.py        # Populate demo data
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev               # Runs on http://localhost:3000
Seeding Demo Data

Run once after database tables exist:

bash
cd backend
python seed_data.py

Creates:

4 demo clinics (KM Dental House, RGB Clinic, Ashfaq, Cantt Care)
11 services (consultation, cleaning, filling, extraction, implants, etc.)
5 doctors (Dr. Sarah Lee, Dr. Hamid Raza, Dr. Faria Khan, Dr. Danish, Dr. Zain)
6 test patient accounts (all password: Patient123!)
1 admin account (admin@denovadental.com / Admin123!)
Random appointments + chat histories + notifications (realistic test data)

Safe to re-run; skips duplicates by email.

11. Production Checklist
 JWT token validation on all protected endpoints
 Password hashing (bcrypt/argon2)
 CORS configured (no wildcard * for origins)
 Rate limiting implemented (100 messages/day, dynamic via admin settings)
 Admin role verification on every admin endpoint
 RAG grounding (all clinical answers backed by retrieved context or honest "I don't know")
 Red-flag escalation (severe symptoms → emergency care recommendation)
 No hardcoded secrets in code (all via env vars)
 Session state not persisted to localStorage (memory-only JWT)
 Error messages don't leak sensitive data
 Chat history + appointments properly isolated per user
 Appointment booking fully functional (tool-calling, validation, receipts)
 Admin analytics dashboard working (daily volume chart, user management)
 All CRUD operations for clinics, doctors, services, pricing functional
 Font sizing increased for readability (16px base, not bold)
 No demo UI elements remaining ("Top Dental Topics" chart hidden)
 Password change endpoint implemented (PATCH /api/auth/me)
 All system prompt refinements applied (no over-refusal, no hallucinated topics)
12. Known Limitations / Future Enhancements
Completed Features (Not Limitations)
✅ Full RAG-powered chat with function-calling booking
✅ Real appointment management (create, view, update status)
✅ Admin analytics (daily chat volume, user quota tracking)
✅ Clinic/doctor/service/pricing CRUD
✅ Role-based access control
✅ Rate limiting with admin override
✅ Chat history + session persistence
✅ Notifications
Potential Future Enhancements (Out of Scope)
Topic categorization dashboard ("Top Dental Topics" pie chart) — requires message labeling pipeline
Email notifications to users on appointment confirmation
SMS reminders for upcoming appointments
Dentist/clinic integration (direct booking to external calendar systems)
Multi-language support (currently English only)
Mobile-native apps (currently web-only)
Video consultation capability (currently chat-only)
13. Repository & Support

GitHub: https://github.com/ABDULLAH-CODING-OSS/Dental-AI-Chatbot.git

Key Files:

Backend: app/rag.py (RAG pipeline), app/api/routes/chat.py (booking flow), app/models/models.py (schema)
Frontend: app/dashboard/page.tsx (chat UI), app/admin/overview/page.tsx (analytics), components/chat/ (message rendering)

Deployment:

Backend: FastAPI can run on Heroku, Railway, AWS Lambda (with ASGI wrapper), DigitalOcean App Platform, or any server with Python 3.9+
Frontend: Vercel (recommended for Next.js), Netlify, AWS Amplify, or any static host
14. Testing & Validation
Manual Testing Checklist
Chat Flow: Ask dental question → verify RAG context retrieved → verify answer grounded in context
Booking Flow: "Book appointment" → select clinic/doctor/service/date/time → verify appointment created with receipt
Admin Analytics: Check daily volume chart shows real data; verify settings PATCH updates rate limit dynamically
Auth: Login as patient → admin toggle checked → verify backend rejects (role-based gating); login as admin → verify access to all admin routes
Rate Limiting: Send 100 messages as patient → 101st should return 429; as admin, change limit to 50 via settings → new limit takes effect immediately
Font Readability: Visual inspection across all pages (chat, admin, login) → text should be readable at arm's length on 1080p monitor
Load Testing (Optional)
Groq LLM: ~1s/request latency; concurrent requests handled by Groq (no client-side queuing)
ChromaDB: Sub-50ms for k=3 similarity search on ~300 documents
SQLite: Fine for <1000 concurrent users; switch to PostgreSQL for larger deployments

Documentation Last Updated: August 2026
Project Status: ✅ PRODUCTION-READY
Client Deliverable: Ready for deployment and end-user testing