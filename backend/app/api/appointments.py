from datetime import date, datetime, time, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.data.database import get_db
from app.core.scheduling import is_within_ranges, parse_time_ranges
from app.models.models import Appointment, Clinic, ClinicPricing, Doctor, Service, User, Notification
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


class AppointmentCreate(BaseModel):
    doctor_id: Optional[int] = None
    service_id: Optional[int] = None
    clinic_id: Optional[int] = None
    appointment_date: datetime
    patient_name: Optional[str] = None
    patient_relation: Optional[str] = "Self"
    patient_age: Optional[int] = None
    notes: Optional[str] = None


class SlotValidationRequest(BaseModel):
    clinic_id: int
    doctor_id: int
    service_id: int
    appointment_date: date
    appointment_time: time


class SlotValidationResponse(BaseModel):
    available: bool
    message: str
    next_available_slots: list[str]

class AppointmentResponse(BaseModel):
    id: int
    doctor_id: Optional[int]
    service_id: Optional[int]
    clinic_id: Optional[int]
    dentist_name: str
    patient_name: Optional[str]
    patient_relation: Optional[str]
    patient_age: Optional[int]
    appointment_date: datetime
    status: str
    price: float
    notes: Optional[str]

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: str  # "pending" | "confirmed" | "cancelled"


def _notify(db: Session, user_id: int, title: str, message: str):
    db.add(Notification(user_id=user_id, title=title, message=message))
    db.commit()


def _resolved_booking_data(
    db: Session,
    clinic_id: int,
    doctor_id: int,
    service_id: int,
    appointment_date: datetime,
) -> tuple[Doctor, Clinic, Service, float, bool, str, list[str]]:
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    service = db.query(Service).filter(Service.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found.")

    try:
        doctor_ranges = parse_time_ranges(doctor.slots, "doctor slots")
        clinic_ranges = parse_time_ranges(clinic.operating_hours, "clinic hours")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    reason = "This slot is available."
    available = True
    if doctor_ranges and not is_within_ranges(appointment_date, doctor_ranges):
        available = False
        reason = "Requested time is outside the doctor's available slots."
    elif clinic_ranges and not is_within_ranges(appointment_date, clinic_ranges):
        available = False
        reason = "Requested time is outside the clinic's operating hours."
    elif db.query(Appointment).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status == "confirmed",
    ).first():
        available = False
        reason = "This slot is already booked."

    price = service.base_price
    override = db.query(ClinicPricing).filter(
        ClinicPricing.clinic_id == clinic_id,
        ClinicPricing.service_id == service_id,
    ).first()
    if override:
        price = override.price

    next_available_slots = [] if available else _next_available_slots(
        db, doctor, clinic, appointment_date, doctor_ranges, clinic_ranges
    )
    return doctor, clinic, service, price, available, reason, next_available_slots


def _next_available_slots(
    db: Session,
    doctor: Doctor,
    clinic: Clinic,
    requested: datetime,
    doctor_ranges: list[tuple[time, time]],
    clinic_ranges: list[tuple[time, time]],
) -> list[str]:
    booked = {
        appointment.appointment_date
        for appointment in db.query(Appointment).filter(
            Appointment.clinic_id == clinic.id,
            Appointment.doctor_id == doctor.id,
            Appointment.status == "confirmed",
        ).all()
    }
    candidates = []
    start = requested.replace(second=0, microsecond=0) + timedelta(minutes=30)
    end = requested + timedelta(days=30)
    candidate = start
    while candidate <= end and len(candidates) < 3:
        doctor_available = not doctor_ranges or is_within_ranges(candidate, doctor_ranges)
        clinic_available = not clinic_ranges or is_within_ranges(candidate, clinic_ranges)
        if doctor_available and clinic_available and candidate not in booked:
            candidates.append(candidate.strftime("%Y-%m-%dT%H:%M:%S"))
        candidate += timedelta(minutes=30)
    return candidates


@router.post("/validate-slot", response_model=SlotValidationResponse)
def validate_slot(
    request: SlotValidationRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    appointment_datetime = datetime.combine(request.appointment_date, request.appointment_time)
    _, _, _, _, available, message, next_available_slots = _resolved_booking_data(
        db, request.clinic_id, request.doctor_id, request.service_id, appointment_datetime
    )
    return SlotValidationResponse(
        available=available,
        message=message,
        next_available_slots=next_available_slots,
    )


@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    request: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first() if request.doctor_id else None
    if request.doctor_id and doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    service = db.query(Service).filter(Service.id == request.service_id).first() if request.service_id else None
    if request.service_id and service is None:
        raise HTTPException(status_code=404, detail="Service not found.")
    clinic = db.query(Clinic).filter(Clinic.id == request.clinic_id).first() if request.clinic_id else None
    if request.clinic_id and clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    price = doctor.consultation_fee if doctor else (service.base_price if service else 0.0)
    if clinic and service:
        override = db.query(ClinicPricing).filter(
            ClinicPricing.clinic_id == clinic.id,
            ClinicPricing.service_id == service.id,
        ).first()
        if override:
            price = override.price

    if doctor and clinic and service:
        _, _, _, price, available, message, next_available_slots = _resolved_booking_data(
            db, clinic.id, doctor.id, service.id, request.appointment_date
        )
        if not available:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": message,
                    "next_available_slots": next_available_slots,
                },
            )

    appt = Appointment(
        user_id=current_user.id,
        doctor_id=doctor.id if doctor else None,
        service_id=service.id if service else None,
        clinic_id=clinic.id if clinic else None,
        dentist_name=doctor.name if doctor else (clinic.name if clinic else "Dental appointment"),
        patient_name=request.patient_name or current_user.full_name,
        patient_relation=request.patient_relation,
        patient_age=request.patient_age,
        appointment_date=request.appointment_date,
        price=price,
        notes=request.notes,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    _notify(
        db, current_user.id,
        "Appointment Requested",
        f"Your appointment on {appt.appointment_date.strftime('%b %d, %Y at %I:%M %p')} is pending confirmation.",
    )
    return appt


@router.get("/me", response_model=list[AppointmentResponse])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Appointment).filter(Appointment.user_id == current_user.id).order_by(Appointment.appointment_date.desc()).all()


@router.delete("/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if appt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can't modify this appointment.")
    appt.status = "cancelled"
    db.commit()
    _notify(db, current_user.id, "Appointment Cancelled", f"Your appointment on {appt.appointment_date.strftime('%b %d, %Y')} was cancelled.")
    return {"message": "Appointment cancelled."}


@router.get("/admin/all", response_model=list[AppointmentResponse])
def all_appointments(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return db.query(Appointment).order_by(Appointment.appointment_date.desc()).all()


@router.patch("/admin/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    request: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    if request.status not in ("pending", "confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status value.")
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    appt.status = request.status
    db.commit()
    db.refresh(appt)

    _notify(db, appt.user_id, f"Appointment {request.status.capitalize()}", f"Your appointment on {appt.appointment_date.strftime('%b %d, %Y')} is now {request.status}.")
    return appt