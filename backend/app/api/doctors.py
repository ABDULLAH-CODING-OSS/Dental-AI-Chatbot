from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.data.database import get_db
from app.models.models import Appointment, Doctor, User
from app.api.deps import get_current_user, get_current_admin
from app.core.scheduling import parse_time_ranges

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


class DoctorCreate(BaseModel):
    name: str
    specialty: str
    email: str
    phone: Optional[str] = None
    consultation_fee: float = 50.0
    slots: Optional[str] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    consultation_fee: Optional[float] = None
    slots: Optional[str] = None

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialty: str
    email: str
    phone: Optional[str]
    consultation_fee: float
    slots: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=list[DoctorResponse])
def list_doctors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Any logged-in user can view doctors (needed for booking flow)
    return db.query(Doctor).all()


@router.post("/", response_model=DoctorResponse)
def create_doctor(request: DoctorCreate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    try:
        parse_time_ranges(request.slots, "doctor slots")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if db.query(Doctor).filter(Doctor.email == request.email).first() is not None:
        raise HTTPException(status_code=400, detail="Email already in use")
    doctor = Doctor(**request.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.patch("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: int, request: DoctorUpdate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    updates = request.model_dump(exclude_unset=True)
    if "slots" in updates:
        try:
            parse_time_ranges(updates["slots"], "doctor slots")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    if "email" in updates and db.query(Doctor).filter(Doctor.email == updates["email"], Doctor.id != doctor_id).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    for field, value in updates.items():
        setattr(doctor, field, value)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    if db.query(Appointment).filter(Appointment.doctor_id == doctor_id).first():
        raise HTTPException(status_code=409, detail="Cannot delete doctor with existing appointments")
    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted."}