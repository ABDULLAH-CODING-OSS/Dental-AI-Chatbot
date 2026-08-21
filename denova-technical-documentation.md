# Denova Technical Documentation

## 1. System Overview

Denova is a dental consultation and appointment-booking application with:

- A Next.js and React frontend in `frontend/`.
- A FastAPI backend in `backend/`.
- SQLite and SQLAlchemy for transactional application data.
- ChromaDB and a retrieval-augmented generation pipeline for dental knowledge.
- Agent tool calls for clinic, service, doctor, availability, and booking workflows.

The backend is the source of truth for authentication, appointments, chat history, notifications, administrative data, settings, and rate limits. The frontend renders that data and manages client-side interaction state.

## 2. Current Product Behavior

### Patient experience

- Sign up and log in through `/api/auth/signup` and `/api/auth/login`.
- Ask dental questions through the chat page.
- Receive answers grounded in the configured dental knowledge base.
- View citations/source snippets returned with chat responses.
- See appointment confirmations as receipt cards when the response includes a structured `receipt` object.
- Select available appointment times through clickable slot chips. Selecting a chip sends the time through the existing chat flow.
- See clinic, doctor, and service responses as structured cards instead of raw internal fields.
- Review and cancel appointments.
- Review, continue, and delete consultation sessions.
- View notifications and mark them as read.
- Change the account password from dashboard settings.

### Administrative experience

- Review real patient users and suspend/reactivate or delete eligible patients.
- Review chat sessions and open read-only transcripts.
- Review and update appointments.
- Manage doctors, clinics, services, and clinic-specific pricing.
- Update daily message limits and clinical safety toggles.
- View overview metrics for users, chat activity, messages, pending appointments, and daily message volume.
- The Top Dental Topics chart is intentionally hidden. Topic categorization has not been implemented yet.

## 3. Repository Structure

```text
Dental-AI-Chatbot/
├── backend/
│   ├── main.py                 FastAPI application and router registration
│   ├── requirements.txt        Python dependencies are maintained at repository root
│   ├── app/
│   │   ├── api/                FastAPI routers
│   │   ├── core/               Security and scheduling helpers
│   │   ├── data/               Database engine and migrations
│   │   ├── models/             SQLAlchemy models
│   │   ├── rag.py              Retrieval and answer generation
│   │   └── dental_knowledge.txt
│   ├── data_sources/           Source datasets
│   ├── rag_docs/               Processed retrieval documents
│   └── chroma_db/              Local ChromaDB data
├── frontend/
│   ├── app/                    Next.js routes and page components
│   ├── components/             Shared UI, dashboard, admin, and chat components
│   ├── lib/                    Client helpers and auth utilities
│   ├── public/                 Static assets
│   └── package.json            Frontend scripts and dependencies
├── denova-technical-documentation.md
├── README.md
└── requirements.txt
```

## 4. Technology Stack

### Frontend

- Next.js `16.2.6` with the App Router.
- React `19.2.4`.
- Tailwind CSS v4 using `@tailwindcss/postcss`.
- Recharts for administrative analytics charts.
- Framer Motion for transitions and animated states.
- Radix/shadcn UI primitives.
- Axios for authenticated API requests.
- React Markdown and remark-gfm for chat answer rendering.

### Backend

- Python 3.10 or newer.
- FastAPI and Uvicorn.
- SQLAlchemy ORM.
- SQLite by default.
- bcrypt/JWT authentication.
- ChromaDB, Groq, and the retrieval pipeline for dental answers.

## 5. Backend Router Map

All routers are registered in `backend/main.py`.

### Authentication: `/api/auth`

| Method | Path | Purpose |
|---|---|---|
| POST | `/signup` | Create a patient account. |
| POST | `/login` | Authenticate a patient or administrator. |
| GET | `/me` | Return the authenticated account summary. |
| PATCH | `/me` | Verify the current password and replace it with a new hashed password. |

Password update body:

```json
{
	"current_password": "current password",
	"new_password": "new password"
}
```

### Patient chat: `/api/chat`

| Method | Path | Purpose |
|---|---|---|
| GET | `/quota` | Return the authenticated user's current message usage and dynamic limit. |
| POST | `/reset-quota` | Reset the authenticated user's daily message counter. |
| GET | `/sessions` | List the user's consultation sessions. |
| GET | `/sessions/{session_id}/messages` | Load messages for one owned session. |
| PATCH | `/sessions/{session_id}` | Rename one owned session. |
| DELETE | `/sessions/{session_id}` | Delete one owned session. |
| POST | `/` | Send a chat message and run answer/booking logic. |

The chat endpoint can return `answer`, `context`, `session_id`, and an optional structured `receipt` object.

### Appointments: `/api/appointments`

| Method | Path | Purpose |
|---|---|---|
| POST | `/validate-slot` | Validate a requested appointment slot. |
| POST | `/` | Create an appointment. |
| GET | `/me` | List the authenticated user's appointments. |
| DELETE | `/{appointment_id}` | Cancel an owned appointment. |
| GET | `/admin/all` | List appointments for administrators. |
| PATCH | `/admin/{appointment_id}/status` | Change an appointment status as an administrator. |

### Administrative users: `/api/admin/users`

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List patient users with status, creation date, and chat count. |
| PATCH | `/{user_id}/suspend` | Toggle a patient's suspended state. |
| DELETE | `/{user_id}` | Delete a patient unless pending or confirmed appointments exist. |

### Administrative chat analytics: `/api/admin/chats`

| Method | Path | Purpose |
|---|---|---|
| GET | `/sessions` | List all chat sessions with patient and message-count summaries. |
| GET | `/sessions/{session_id}/transcript` | Return a read-only transcript. |
| GET | `/stats` | Return total sessions, total messages, and active chats today. |
| GET | `/daily-volume?days=N` | Return daily message counts as `{ "date": "YYYY-MM-DD", "count": N }`. |

The daily-volume endpoint returns a complete date range, including zero-count dates:

```json
[
	{ "date": "2026-08-15", "count": 5 },
	{ "date": "2026-08-16", "count": 3 },
	{ "date": "2026-08-17", "count": 8 }
]
```

### Administrative settings: `/api/admin/settings`

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Return daily limit and clinical safety settings. |
| PATCH | `/` | Persist only the supplied changed settings. |

Settings are stored in the `system_settings` table through the `SystemSettings` model. The `daily_message_limit` value is read from the database on every quota and chat request; it is not cached as a module-level startup constant.

### Other administrative data routers

- Doctors: `/api/doctors/`
- Services: `/api/services/`
- Clinics: `/api/clinics/`
- Clinic pricing: `/api/clinic-pricing/`
- Notifications: `/api/notifications`

## 6. Frontend Rendering Details

### Chat structured content

The chat UI uses `frontend/components/chat/messageParser.ts` and `EnhancedMessageBubble.tsx` to detect existing backend response formats:

- `ReceiptCard.tsx` renders confirmation number, doctor, specialty, date, time, price, and status.
- `SlotPicker.tsx` renders available times as clickable buttons. It calls the existing chat send flow; it does not add a booking endpoint.
- `ListingsCard.tsx` renders clinics, doctors, and services while hiding numeric internal IDs from visible labels.
- Raw Markdown is omitted when a slot list is successfully converted to a picker, preventing duplicate slot display.

### Administrative dashboard

- `frontend/app/admin/page.tsx` fetches appointments, admin users, chat stats, and daily volume.
- The daily-volume chart uses Recharts and the `count` field from `/api/admin/chats/daily-volume`.
- The Top Dental Topics card is preserved in code but hidden with a TODO conditional until topic categorization is available.
- `frontend/app/admin/settings/page.tsx` submits only changed settings fields.

### Typography

Global Tailwind v4 typography tokens are defined in `frontend/app/globals.css`. The current scale prioritizes readable body text and regular weights. Component-specific classes may still intentionally set emphasis for labels, controls, or headings.

## 7. Data Model Summary

Core SQLAlchemy models in `backend/app/models/models.py`:

- `User`: account, role, suspension state, daily usage counter.
- `ChatSession`: consultation title, owner, timestamps.
- `ChatMessage`: sender, content, timestamp, session relationship.
- `Appointment`: patient, doctor, clinic, service, time, price, status.
- `Doctor`: specialty, consultation fee, availability slots.
- `Clinic`: address, phone, coordinates, operating hours.
- `Service`: description and base price.
- `ClinicPricing`: clinic-specific service price override.
- `Notification`: patient notification and read state.
- `SystemSettings`: key/value configuration records.

## 8. Local Setup

### Prerequisites

- Node.js 18 or newer.
- Python 3.10 or newer.
- A configured Groq API key for answer generation.

### Backend

From the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the API from `backend/`:

```powershell
cd backend
uvicorn main:app --reload --port 8000
```

The API is available at `http://127.0.0.1:8000`. Swagger documentation is at `/docs`.

### Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`.

Useful production checks:

```powershell
npm run lint
npm run build
```

### Environment variables

Backend:

```text
GROQ_API_KEY=your_groq_api_key
JWT_SECRET_KEY=replace-with-a-secret-in-deployment
```

Frontend:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8000/api/chat/
```

## 9. Operational Notes

- Do not commit API keys or production secrets.
- `backend/chroma_db/` and generated retrieval documents can be regenerated from the source data and should not be treated as application source code.
- The default SQLite database is local to the backend working directory unless the database configuration is changed.
- Administrative routes require an administrator bearer token.
- Password changes require the current password and never return or expose password hashes.
- Booking and cancellation operations remain backend-authoritative; frontend state updates occur only after successful responses.
