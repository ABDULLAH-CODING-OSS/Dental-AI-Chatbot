from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.data.database import get_db
from app.models.models import Appointment, User
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


class AppointmentCreate(BaseModel):
    dentist_name: str
    appointment_date: datetime
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    dentist_name: str
    appointment_date: datetime
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: str  # "pending" | "confirmed" | "cancelled"


@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    request: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = Appointment(
        user_id=current_user.id,
        dentist_name=request.dentist_name,
        appointment_date=request.appointment_date,
        notes=request.notes,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
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
    return {"message": "Appointment cancelled."}


# --- Admin-only endpoints ---

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
    return appt