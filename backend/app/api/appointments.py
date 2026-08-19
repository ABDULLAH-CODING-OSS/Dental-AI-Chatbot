from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.data.database import get_db
from app.models.models import Appointment, Doctor, User, Notification
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: datetime
    patient_name: Optional[str] = None
    patient_relation: Optional[str] = "Self"
    patient_age: Optional[int] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    doctor_id: Optional[int]
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


@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    request: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    appt = Appointment(
        user_id=current_user.id,
        doctor_id=doctor.id,
        dentist_name=doctor.name,
        patient_name=request.patient_name or current_user.full_name,
        patient_relation=request.patient_relation,
        patient_age=request.patient_age,
        appointment_date=request.appointment_date,
        price=doctor.consultation_fee,
        notes=request.notes,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    _notify(
        db, current_user.id,
        "Appointment Requested",
        f"Your appointment with {doctor.name} on {appt.appointment_date.strftime('%b %d, %Y at %I:%M %p')} is pending confirmation.",
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