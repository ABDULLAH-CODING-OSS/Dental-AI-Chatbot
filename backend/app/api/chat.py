import re
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, StrictInt, StrictStr, ValidationError
from typing import Optional, List
from app.api.deps import get_current_user
from app.data.database import get_db 
from app.models.models import User, ChatSession, ChatMessage, SystemSettings
from app.models.models import Clinic, ClinicPricing, Doctor, Service, Appointment, Notification
from app.core.scheduling import is_in_the_past, is_within_ranges, parse_time_ranges, time_overlaps, utc_now_naive

def _normalize(text: str) -> str:
    return re.sub(r"[.\s]+", " ", text or "").strip().casefold()

router = APIRouter(prefix="/api/chat", tags=["Chat"])

BOOKING_INTENT = re.compile(
    r"\b(book|booking|appointment|schedule|reserve|slot|available|availability|clinic|doctor|dentist)\b",
    re.IGNORECASE,
)


def get_daily_limit(db: Session) -> int:
    setting = db.query(SystemSettings).filter(SystemSettings.key == "daily_message_limit").first()
    return int(setting.value) if setting else 100


class BookingToolArguments(BaseModel):
    clinic_id: int
    service_id: int
    doctor_id: int
    appointment_date: StrictStr
    patient_name: StrictStr | None = None
    patient_relation: StrictStr | None = None
    patient_age: int | None = None
    notes: StrictStr | None = None


def _validated_booking_arguments(args: dict, booking_state: dict) -> dict:
    validated = BookingToolArguments.model_validate(args)
    values = validated.model_dump(exclude_none=True)
    values["patient_name"] = values.get("patient_name") or booking_state["patient_name"]
    values["patient_relation"] = values.get("patient_relation") or booking_state["relation"] or "Self"
    if booking_state["patient_age"] is not None and "patient_age" not in values:
        values["patient_age"] = booking_state["patient_age"]
    return values


def _parse_local_appointment_datetime(value: str) -> datetime:
    appointment_date = datetime.fromisoformat(value)
    if appointment_date.tzinfo is not None:
        raise ValueError("Appointment times must not include a timezone offset.")
    return appointment_date.replace(second=0, microsecond=0)


def _next_available_slots(db: Session, doctor_id: int, requested: datetime, count: int = 3) -> list[datetime]:
    booked_slots = {
        appointment.appointment_date
        for appointment in db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.status != "cancelled",
        ).all()
    }
    slots = []
    candidate = requested + timedelta(minutes=30)
    while len(slots) < count and candidate <= requested + timedelta(days=14):
        if candidate.weekday() < 5 and 9 <= candidate.hour < 17 and candidate not in booked_slots:
            slots.append(candidate)
        candidate += timedelta(minutes=30)
    return slots


def _booking_state(current_user: User, chat_history: list[dict]) -> dict:
    state = {"patient_name": current_user.full_name, "patient_age": None, "relation": None}
    history = " ".join(message.get("content", "") for message in chat_history)
    age_match = re.search(
        r"\b(?:age\s*(?:is|:)?|aged|I am|I'm)\s*(\d{1,3})\b|\b(\d{1,3})\s+years?\s+old\b",
        history,
        re.IGNORECASE,
    )
    if age_match:
        state["patient_age"] = int(next(group for group in age_match.groups() if group is not None))
    relation_match = re.search(r"\b(Self|Child|Spouse|Parent|Sibling|Partner|Friend)\b", history, re.IGNORECASE)
    if relation_match:
        state["relation"] = relation_match.group(1).capitalize()
    return state

def _needs_booking_tools(message: str, chat_history: list[dict]) -> bool:
    recent_context = " ".join(item.get("content", "") for item in chat_history[-20:])
    return bool(BOOKING_INTENT.search(f"{recent_context} {message}"))

def _available_slots_for_date(db: Session, clinic: Clinic, doctor: Doctor, requested_date: date) -> list[str]:
    try:
        doctor_ranges = parse_time_ranges(doctor.slots, "doctor slots")
        clinic_ranges = parse_time_ranges(clinic.operating_hours, "clinic hours")
    except ValueError:
        return []
    slots = []
    for minute in range(0, 24 * 60, 30):
        candidate = datetime.combine(requested_date, datetime.min.time()) + timedelta(minutes=minute)
        if is_in_the_past(candidate):
            continue
        if doctor_ranges and not is_within_ranges(candidate, doctor_ranges):
            continue
        if clinic_ranges and not is_within_ranges(candidate, clinic_ranges):
            continue
        if not any(time_overlaps(appointment.appointment_date, candidate) for appointment in db.query(Appointment).filter(
            Appointment.clinic_id == clinic.id,
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date >= candidate.replace(hour=0, minute=0),
            Appointment.appointment_date < candidate.replace(hour=0, minute=0) + timedelta(days=1),
            Appointment.status.in_(["confirmed", "pending"]),
        ).all()):
            slots.append(candidate.strftime("%Y-%m-%dT%H:%M:%S"))
    return slots


def _availability_matches(chat_history: list[dict], doctor: Doctor, requested_date: date) -> bool:
    expected_date = requested_date.strftime("%B %d, %Y")
    latest_availability = next(
        (
            message.get("content", "")
            for message in reversed(chat_history)
            if message.get("role") == "assistant" and "Available slots for" in message.get("content", "")
        ),
        "",
    )
    return _normalize(doctor.name) in _normalize(latest_availability) and expected_date in latest_availability

def _availability_is_current(message: str, chat_history: list[dict], doctors: list[Doctor]) -> bool:
    if re.search(
        r"\b(another|different|change|switch)\s+doctor\b|\b(today|tomorrow|day after tomorrow|next week)\b|\b\d{4}-\d{2}-\d{2}\b",
        message,
        re.IGNORECASE,
    ):
        return False

    availability_messages = [
        item.get("content", "")
        for item in chat_history
        if item.get("role") == "assistant" and "Available slots for" in item.get("content", "")
    ]
    if not availability_messages:
        return False

    latest_availability = availability_messages[-1]
    mentioned_doctor = next(
        (doctor for doctor in doctors if _normalize(doctor.name) in _normalize(message)),
        None,
    )
    if mentioned_doctor and _normalize(mentioned_doctor.name) not in _normalize(latest_availability):
        return False

    return True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    context: str
    session_id: int
    receipt: Optional[dict] = None

class SessionRenameRequest(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True

class MessageResponse(BaseModel):
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class QuotaResponse(BaseModel):
    messages_today: int
    limit: int
    remaining: int


@router.get("/quota", response_model=QuotaResponse)
def get_user_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now_utc = datetime.utcnow()
    today = now_utc.date()
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    messages_today = current_user.messages_today or 0
    if last_date != today:
        messages_today = 0

    daily_limit = get_daily_limit(db)
    remaining = max(0, daily_limit - messages_today)
    return QuotaResponse(
        messages_today=messages_today,
        limit=daily_limit,
        remaining=remaining
    )


@router.post("/reset-quota", response_model=QuotaResponse)
def reset_user_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.messages_today = 0
    current_user.last_message_date = datetime.utcnow()
    db.commit()
    daily_limit = get_daily_limit(db)
    return QuotaResponse(
        messages_today=0,
        limit=daily_limit,
        remaining=daily_limit
    )


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(func.coalesce(ChatSession.updated_at, ChatSession.created_at).desc())
        .all()
    )
    return sessions


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session.messages


@router.patch("/sessions/{session_id}")
def rename_session(
    session_id: int,
    request: SessionRenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    session.title = request.title
    session.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Session renamed successfully"}


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}


@router.post("/", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.rag import BOOKING_TOOL, GET_AVAILABLE_SLOTS_TOOL, generate_answer, query_rag

    now_utc = datetime.utcnow()
    today = now_utc.date()
    daily_limit = get_daily_limit(db)
    last_date = current_user.last_message_date.date() if current_user.last_message_date else None

    if last_date != today:
        current_user.messages_today = 0
        current_user.last_message_date = now_utc

    if current_user.messages_today >= daily_limit:
        raise HTTPException(
            status_code=429,
            detail=f"You've reached your daily limit of {daily_limit} messages. Please try again tomorrow or reset your quota.",
        )

    current_user.messages_today += 1
    current_user.last_message_date = now_utc

    # Get or create chat session
    if request.session_id:
        chat_session = db.query(ChatSession).filter(
            ChatSession.id == request.session_id, ChatSession.user_id == current_user.id
        ).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        chat_session.updated_at = now_utc
    else:
        title_snippet = request.message[:30] + "..." if len(request.message) > 30 else request.message
        chat_session = ChatSession(user_id=current_user.id, title=title_snippet, created_at=now_utc, updated_at=now_utc)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    # 1. Grab existing messages in this session for chat memory
    chat_history = []
    if chat_session and chat_session.messages:
        for msg in chat_session.messages[-12:]:
            role = "user" if msg.sender == "user" else "assistant"
            chat_history.append({"role": role, "content": msg.content})

    # 2. Save user message
    user_msg = ChatMessage(session_id=chat_session.id, sender="user", content=request.message, timestamp=now_utc)
    db.add(user_msg)
    chat_session.updated_at = now_utc
    db.commit()

    # 3. RAG + booking context
    context = query_rag(request.message)
    booking_request = _needs_booking_tools(request.message, chat_history)
    booking_state = _booking_state(current_user, chat_history)

    doctors = []
    tools = None
    tool_choice = "auto"

    if booking_request:
        doctors = db.query(Doctor).all()
        clinics = db.query(Clinic).all()
        services = db.query(Service).all()
        
        clinic_list_text = "\n".join(
        f"{clinic.id}. {clinic.name} | Location: {clinic.address} | Hours: {clinic.operating_hours or 'Not specified'}"
        for clinic in clinics
        ) or "No clinics available at the moment."
        service_list_text = "\n".join(
       f"{service.id}. {service.name} | Base Price: ${service.base_price:.2f}"
        for service in services
       ) or "No services available at the moment."
        doctor_list_text = "\n".join(
       f"{doctor.id}. {doctor.name} ({doctor.specialty}) | Consultation Fee: ${doctor.consultation_fee:.2f} | Available Hours: {doctor.slots or 'Not specified'}"
       for doctor in doctors
       ) or "No doctors available at the moment."

   
        context = (
            f"CURRENT DATE: {today.isoformat()} (use this for today/tomorrow references)\n\n"
            f"AVAILABLE CLINICS:\n{clinic_list_text}\n\n"
            f"AVAILABLE SERVICES:\n{service_list_text}\n\n"
            f"AVAILABLE DOCTORS AT SELECTED CLINIC:\n{doctor_list_text}\n\n"
            f"BOOKING STATE (do not ask again for non-null values):\n{booking_state}\n\n"
            f"{context}"
        )

        # Default: give the model both tools, let it decide (asks questions, checks slots, or books)
        tools = [GET_AVAILABLE_SLOTS_TOOL, BOOKING_TOOL]
        tool_choice = "auto"

        # Once we know availability was just confirmed for this doctor/date, force a booking attempt
        if _availability_is_current(request.message, chat_history, doctors):
            tools = [BOOKING_TOOL]
            tool_choice = "auto"

    llm_message = generate_answer(
        request.message,
        context,
        chat_history=chat_history,
        tools=tools,
        tool_choice=tool_choice,
    )

    receipt = None

    if llm_message.tool_calls:
        import json
        tool_call = llm_message.tool_calls[0]
        args = json.loads(tool_call.function.arguments)

        # --- get_available_slots ---
        if tool_call.function.name == "get_available_slots":
            clinic_id = args.get("clinic_id")
            doctor_id = args.get("doctor_id")
            appointment_date_str = args.get("appointment_date")

            if not clinic_id or not doctor_id or not appointment_date_str:
                answer = "I still need a bit more info — please confirm the clinic, doctor, and date you'd like to check."
                assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
                db.add(assistant_msg)
                chat_session.updated_at = datetime.utcnow()
                db.commit()
                return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

            try:
                requested_date = date.fromisoformat(appointment_date_str)
            except ValueError:
                answer = "That date didn't look valid — could you tell me the date again (e.g. today or tomorrow)?"
                assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
                db.add(assistant_msg)
                chat_session.updated_at = datetime.utcnow()
                db.commit()
                return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

            clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
            doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
            if clinic is None or doctor is None:
                answer = "I couldn't find that clinic or doctor. Please choose from the available options."
            else:
                slots = _available_slots_for_date(db, clinic, doctor, requested_date)
                answer = (
                    f"Available slots for {doctor.name} on {requested_date.strftime('%B %d, %Y')}:\n"
                    + "\n".join(f"- {datetime.fromisoformat(slot).strftime('%I:%M %p').lstrip('0')}" for slot in slots)
                    if slots
                    else f"There are no available slots for {doctor.name} on {requested_date.strftime('%B %d, %Y')}."
                )
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)
        

        # --- book_appointment ---
        try:
            args = _validated_booking_arguments(args, booking_state)
        except ValidationError:
            answer = "I couldn't process the booking details. Please provide the clinic, service, doctor, and appointment time again."
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

        clinic = db.query(Clinic).filter(Clinic.id == args.get("clinic_id")).first()
        service = db.query(Service).filter(Service.id == args.get("service_id")).first()
        doctor = db.query(Doctor).filter(Doctor.id == args.get("doctor_id")).first()

        if clinic is None or service is None or doctor is None:
            answer = "I couldn't find that clinic, service, or doctor — could you pick from the available options again?"
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

        try:
            requested_date = _parse_local_appointment_datetime(args["appointment_date"])
        except (TypeError, ValueError):
            answer = "Please choose an available appointment time using the clinic's local date and time, without a timezone."
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

        if not _availability_matches(chat_history, doctor, requested_date.date()):
            answer = f"I need to check {doctor.name} availability for {requested_date.strftime('%B %d, %Y')} first."
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

        available_slots = _available_slots_for_date(db, clinic, doctor, requested_date.date())
        requested_slot = requested_date.strftime("%Y-%m-%dT%H:%M:%S")

        if requested_slot not in available_slots:
            answer = (
                f"The {requested_date.strftime('%I:%M %p').lstrip('0')} slot was unavailable. "
                "Please choose one of the available slots returned by the availability check."
            )
            assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
            db.add(assistant_msg)
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=None)

        service_price = service.base_price
        pricing_override = db.query(ClinicPricing).filter(
            ClinicPricing.clinic_id == clinic.id,
            ClinicPricing.service_id == service.id,
        ).first()
        if pricing_override:
            service_price = pricing_override.price

        same_day_appointments = db.query(Appointment).filter(
            Appointment.clinic_id == clinic.id,
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date >= requested_date.replace(hour=0, minute=0, second=0, microsecond=0),
            Appointment.appointment_date < requested_date.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1),
            Appointment.status.in_(["confirmed", "pending"]),
        ).all()

        slot_taken = next((appt for appt in same_day_appointments if time_overlaps(appt.appointment_date, requested_date)), None)
        duplicate = next(
            (
                appt for appt in same_day_appointments
                if appt.user_id == current_user.id and appt.status == "confirmed" and time_overlaps(appt.appointment_date, requested_date)
            ),
            None,
        )

        if duplicate:
            answer = f"You already have an appointment with {doctor.name} at {requested_date.strftime('%I:%M %p').lstrip('0')} on this date."
        elif slot_taken:
            alternative_slots = _next_available_slots(db, doctor.id, requested_date)
            formatted_slots = "\n".join(f"- {slot.strftime('%A, %B %d at %I:%M %p')}" for slot in alternative_slots)
            answer = (
                f"That slot with {doctor.name} is not available. The next available slots are:\n\n"
                f"{formatted_slots or '- Please ask me for another date.'}\n\n"
                "Would you like to book one of these slots?"
            )
        else:
            appt = Appointment(
                user_id=current_user.id,
                doctor_id=doctor.id,
                clinic_id=clinic.id,
                service_id=service.id,
                dentist_name=doctor.name,
                patient_name=args.get("patient_name") or booking_state["patient_name"],
                patient_relation=args.get("patient_relation") or booking_state["relation"] or "Self",
                patient_age=args.get("patient_age") or booking_state["patient_age"],
                appointment_date=requested_date,
                price=service_price,
                notes=args.get("notes"),
                status="pending",
            )
            db.add(appt)
            db.commit()
            db.refresh(appt)

            db.add(Notification(
                user_id=current_user.id,
                title="Appointment Requested",
                message=f"Your appointment with {doctor.name} on {appt.appointment_date.strftime('%b %d, %Y at %I:%M %p')} is pending confirmation.",
            ))
            db.commit()

            receipt = {
                "confirmation_number": f"APT-{appt.id:06d}",
                "doctor": doctor.name,
                "specialty": doctor.specialty,
                "date": appt.appointment_date.strftime("%B %d, %Y"),
                "time": appt.appointment_date.strftime("%I:%M %p"),
                "price": service_price,
                "status": appt.status,
            }
            answer = (
                f"✅ Your appointment is booked!\n\n"
                f"**Confirmation #:** {receipt['confirmation_number']}\n"
                f"**Doctor:** {doctor.name} ({doctor.specialty})\n"
                f"**Date:** {receipt['date']} at {receipt['time']}\n"
                f"**Fee:** ${service_price:.2f}\n\n"
                f"You'll get a notification once it's confirmed."
            )
    else:
        answer = llm_message.content

    # 4. Save assistant response
    assistant_msg = ChatMessage(session_id=chat_session.id, sender="assistant", content=answer, timestamp=datetime.utcnow())
    db.add(assistant_msg)
    chat_session.updated_at = datetime.utcnow()
    db.commit()

    return ChatResponse(answer=answer, context=context, session_id=chat_session.id, receipt=receipt)

