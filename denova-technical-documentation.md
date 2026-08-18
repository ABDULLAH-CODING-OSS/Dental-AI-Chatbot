# Denova — Technical Documentation

## 1. Project Overview

Denova is a full-stack, RAG-powered dental health consultation platform. It combines a curated clinical knowledge base with a low-latency LLM to deliver grounded, structured dental guidance through a premium web interface — with authentication, rate limiting, session history, and appointment booking built on top.

This document covers the system architecture, data pipeline, and every implementation decision made to get from prototype to a client-deliverable product.

---

## 2. Architecture Overview

```
┌─────────────────┐        ┌──────────────────┐        ┌────────────────────┐
│   Next.js UI     │───────▶│   FastAPI Backend │───────▶│   Groq Inference    │
│  (App Router)    │◀───────│   (REST API)      │◀───────│   (Llama / GPT-OSS) │
└─────────────────┘        └─────────┬─────────┘        └────────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                 ┌───────────┐ ┌────────────┐ ┌─────────────┐
                 │  ChromaDB │ │  SQLite DB │ │  JWT Auth   │
                 │ (Vector   │ │ (Users,    │ │ (bcrypt/    │
                 │  Store)   │ │ Sessions,  │ │  argon2)    │
                 │           │ │ Appts)     │ │             │
                 └───────────┘ └────────────┘ └─────────────┘
```

---

## 3. Data Sources & Knowledge Base

The RAG knowledge base is built from public, reputable health data sources — filtered down to dental/oral-health-relevant content only:

| Source | Type | Link |
|---|---|---|
| **MedlinePlus Health Topic XML** (NIH/NLM) | Bulk downloadable, reuse-licensed structured health topic data | https://medlineplus.gov/xml.html |
| **CDC Oral Health Data & Fact Sheets** | Public domain (U.S. government work) | https://www.cdc.gov/oral-health/data/index.html |
| **NIDCR Health Info** | Public domain federal fact sheets on oral/craniofacial conditions | https://www.nidcr.nih.gov/health-info |

### Data Pipeline
1. Downloaded the daily-generated **MedlinePlus Compressed Health Topic XML** file (all English/Spanish health topics).
2. Parsed the XML (`health-topic` elements, `title` attribute, `full-summary` child element) into individual `.txt` documents.
3. **Filtered the full corpus down to dental-relevant topics only**, using a dental keyword match (tooth, gum, oral, cavity, orthodontic, periodontal, etc.) against both filename and content — reducing a multi-thousand-topic general health corpus to a focused dental knowledge base.
4. Rebuilt the vector index from the filtered document set only, to prevent semantic drift toward unrelated health topics (mental health, nutrition, etc.) during retrieval.

---

## 4. Retrieval-Augmented Generation (RAG) Pipeline

- **Chunking:** `RecursiveCharacterTextSplitter` (LangChain) — 400-character chunks, 40-character overlap.
- **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` via HuggingFace, loaded once as a singleton at server startup.
- **Vector Store:** ChromaDB, persisted locally (`chroma_db/`), loaded into memory on boot; rebuilt automatically if the persisted index is missing.
- **Retrieval:** Top-k (k=3) similarity search per query.
- **Generation:** Retrieved chunks + conversation history + system instructions are passed to the LLM as grounding context.

### LLM Provider
- **Groq API** — chosen for its high-throughput, low-latency inference.
- Model: `openai/gpt-oss-20b` (migrated from the since-deprecated `llama-3.3-70b-versatile` following Groq's June 2026 model lifecycle update).

### System Prompt Design
The system prompt was iteratively refined to solve three real production issues encountered during testing:
1. **Over-refusal bug** — the assistant initially refused meta/conversational questions (e.g. "what's my name?") because they weren't "dental topics." Fixed by explicitly distinguishing RAG-grounded clinical questions from conversation-history questions, and allowing both.
2. **RAG vs. memory conflict** — "answer using ONLY the provided context" caused the model to ignore earlier conversation turns. Fixed by defining "context" as two sources: retrieved knowledge base content AND active session history.
3. **Hallucination during refusals** — the model invented unrelated topics (e.g. "I can't discuss eye exams or RSV") to justify declining a question. Fixed by instructing the model to decline generically without referencing invented specifics.

The final prompt also enforces: clean Markdown output (no raw HTML), honest "I don't have that data" responses for business-detail questions (pricing, staff names) instead of false refusals, and explicit red-flag emergency symptom callouts.

---

## 5. Backend

- **Framework:** FastAPI (Python)
- **Database ORM:** SQLAlchemy, SQLite for development
- **Auth:** JWT (python-jose), password hashing via passlib (bcrypt/argon2)
- **Rate limiting:** 20 messages/user/day, tracked via `messages_today` + `last_message_date` columns, reset daily
- **Role-based access:** `role` field on the `User` model (`patient` / `admin`); admin login uses the same form with a role-check flag validated server-side (never trusted from the frontend alone)

### Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new patient account |
| POST | `/api/auth/login` | Authenticate, returns JWT + role |
| POST | `/api/chat/` | Send a message, returns RAG-grounded answer + retrieved context |
| POST | `/api/appointments/` | Create a booking request |
| GET | `/api/appointments/me` | List the current user's appointments |
| GET | `/api/appointments/admin/all` | (Admin only) view all appointments |
| PATCH | `/api/appointments/admin/{id}/status` | (Admin only) update booking status |

---

## 6. Frontend

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion (scroll reveals, chat "thinking" state, auth page transitions)
- **Markdown rendering:** react-markdown + remark-gfm (for tables/GFM syntax in AI responses)
- **State/Auth:** React Context (in-memory JWT storage, no localStorage/sessionStorage)

### Pages
- Public landing page (marketing, FAQ, how-it-works)
- Auth (login/signup, with admin-login toggle)
- Patient dashboard (chat, chat history, appointments, notifications, FAQ, settings)
- Admin panel (analytics/overview, users, chat logs, appointments, clinics, settings) — role-gated, no visibility from the patient side

---

## 7. Security Notes

- Admin access is never inferred from a frontend checkbox alone — the backend independently verifies `role == "admin"` against the database on every admin-flagged login attempt and every admin-route request.
- Passwords are hashed (never stored in plaintext).
- JWT tokens are held in memory via React Context only — not persisted to localStorage/sessionStorage, reducing XSS token-theft exposure (traded off against session persistence across reloads).
- No vendor/infrastructure names (Groq, Llama, RAG, ChromaDB) are exposed in end-user or admin-facing UI copy — these are internal implementation details only.

---

## 8. Known Limitations / Next Steps

- The chatbot can *recommend* booking an appointment conversationally but does not yet have function-calling/tool access to directly create a booking through the `/api/appointments/` endpoint — this is the planned **Part 2** of the project (see below).
- No production-grade migration tooling yet (schema changes currently require recreating the SQLite file in development).
- JWT secret and provider API keys must be set via environment variables before deployment; defaults are for local development only.

---

## 9. Repository

GitHub: https://github.com/ABDULLAH-CODING-OSS/Dental-AI-Chatbot.git
