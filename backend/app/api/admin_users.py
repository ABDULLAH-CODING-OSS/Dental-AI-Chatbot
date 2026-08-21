from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.data.database import get_db
from app.models.models import User, ChatSession, Appointment
from app.api.deps import get_current_admin

router = APIRouter(prefix="/api/admin/users", tags=["Admin - Users"])


class UserResponse(BaseModel):
    id: int
    full_name: str | None
    email: str
    role: str
    is_suspended: bool
    created_at: datetime
    chat_count: int

    class Config:
        from_attributes = True


@router.get("/", response_model=list[UserResponse])
def list_patients(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    patients = db.query(User).filter(User.role == "patient").order_by(User.created_at.desc()).all()
    result = []
    for u in patients:
        chat_count = db.query(ChatSession).filter(ChatSession.user_id == u.id).count()
        result.append(UserResponse(
            id=u.id, full_name=u.full_name, email=u.email, role=u.role,
            is_suspended=bool(u.is_suspended), created_at=u.created_at, chat_count=chat_count,
        ))
    return result


@router.patch("/{user_id}/suspend")
def toggle_suspend(user_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == "patient").first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient not found.")
    user.is_suspended = 0 if user.is_suspended else 1
    db.commit()
    return {"message": "Suspended" if user.is_suspended else "Reactivated", "is_suspended": bool(user.is_suspended)}


@router.delete("/{user_id}")
def delete_patient(user_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == "patient").first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient not found.")
    # Block deletion if the patient has active (pending/confirmed) appointments
    active_appts = db.query(Appointment).filter(
        Appointment.user_id == user_id, Appointment.status.in_(["pending", "confirmed"])
    ).count()
    if active_appts > 0:
        raise HTTPException(status_code=409, detail="Cannot delete a patient with active appointments.")
    db.delete(user)
    db.commit()
    return {"message": "Patient deleted."}