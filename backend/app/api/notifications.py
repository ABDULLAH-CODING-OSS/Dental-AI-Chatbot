from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.models import Notification, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/me")
def my_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notes = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [{"id": n.id, "title": n.title, "message": n.message, "read": bool(n.read), "created_at": n.created_at} for n in notes]


@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Not found.")
    note.read = 1
    db.commit()
    return {"message": "Marked as read."}