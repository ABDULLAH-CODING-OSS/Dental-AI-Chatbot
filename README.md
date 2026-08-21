# Denova Dental AI

Denova is a dental consultation and appointment-booking application. It combines a Next.js patient/admin interface with a FastAPI service, SQLAlchemy data model, and retrieval-augmented dental knowledge pipeline.

## Features

- Authenticated patient and administrator accounts.
- AI dental consultation with retrieved clinical context and source snippets.
- Appointment discovery and booking through chat tool calls.
- Availability validation across doctor slots, clinic hours, and existing appointments.
- Structured appointment receipts, clickable availability slots, and clinic/doctor/service cards.
- Patient appointment, consultation-history, notification, and password-management pages.
- Admin management for patients, chat transcripts, appointments, doctors, clinics, services, and pricing.
- Admin settings for daily message limits, clinical disclaimers, and emergency triage.
- Admin overview metrics and a real daily message-volume chart.
- The Top Dental Topics chart is intentionally hidden until topic categorization is implemented.

## Technology

### Frontend

- Next.js `16.2.6` App Router
- React `19.2.4`
- Tailwind CSS v4
- Recharts
- Framer Motion
- Axios
- Radix/shadcn UI primitives
- React Markdown with GitHub Flavored Markdown support

### Backend

- Python 3.10+
- FastAPI and Uvicorn
- SQLAlchemy
- SQLite by default
- JWT authentication with bcrypt password hashing
- ChromaDB and retrieval-augmented generation
- Groq-backed answer generation

## Project Layout

```text
Dental-AI-Chatbot/
├── backend/
│   ├── main.py
│   ├── app/api/
│   ├── app/core/
│   ├── app/data/
│   ├── app/models/
│   ├── app/rag.py
│   ├── rag_docs/
│   └── chroma_db/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── requirements.txt
├── README.md
└── denova-technical-documentation.md
```

## Setup

### 1. Backend

From the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the API from the backend directory:

```powershell
cd backend
uvicorn main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`.

Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The web application runs at `http://localhost:3000`.

For a production validation:

```powershell
npm run lint
npm run build
npm start
```

## Environment Variables

Create the backend environment configuration with the required model and token settings:

```text
GROQ_API_KEY=your_groq_api_key
JWT_SECRET_KEY=replace-with-a-secret-in-deployment
```

The frontend can use these optional API URL settings:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8000/api/chat/
```

## Important API Areas

- `/api/auth`: signup, login, account information, and password changes.
- `/api/chat`: consultation messages, quota, session history, rename, and deletion.
- `/api/appointments`: slot validation, booking, patient appointments, cancellation, and admin status updates.
- `/api/admin/users`: patient listing, suspension/reactivation, and deletion.
- `/api/admin/chats`: session summaries, transcripts, aggregate statistics, and daily volume.
- `/api/admin/settings`: daily message limit and clinical safety settings.
- `/api/doctors`: doctor directory management.
- `/api/services`: service and clinic-pricing data.
- `/api/clinics`: clinic directory management.
- `/api/notifications`: patient notification listing and read state.

For request/response details and architecture notes, see [denova-technical-documentation.md](denova-technical-documentation.md).

## Security Notes

- Keep Groq and JWT secrets out of source control.
- Administrative endpoints require an administrator bearer token.
- Password changes verify the current password and store only a bcrypt hash.
- Appointment ownership and status validation are enforced by the backend.
- The frontend does not treat local state changes as persistence until the backend request succeeds.

## Documentation

The full technical reference covers the router map, data model, frontend rendering behavior, configuration storage, setup, and operational notes:

- [Denova Technical Documentation](denova-technical-documentation.md)
