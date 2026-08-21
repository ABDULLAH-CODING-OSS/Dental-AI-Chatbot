from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.data.database import get_db
from app.models.models import SystemSettings
from app.api.deps import get_current_admin

router = APIRouter(prefix="/api/admin/settings", tags=["Admin - Settings"])

DEFAULTS = {
    "daily_message_limit": "100",
    "clinical_disclaimer_enabled": "true",
    "emergency_triage_enabled": "true",
}


class SettingsResponse(BaseModel):
    daily_message_limit: int
    clinical_disclaimer_enabled: bool
    emergency_triage_enabled: bool


class SettingsUpdate(BaseModel):
    daily_message_limit: int | None = None
    clinical_disclaimer_enabled: bool | None = None
    emergency_triage_enabled: bool | None = None


def _get_value(db: Session, key: str) -> str:
    row = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    return row.value if row else DEFAULTS[key]


def _set_value(db: Session, key: str, value: str):
    row = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    if row:
        row.value = value
    else:
        db.add(SystemSettings(key=key, value=value))
    db.commit()


@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    return SettingsResponse(
        daily_message_limit=int(_get_value(db, "daily_message_limit")),
        clinical_disclaimer_enabled=_get_value(db, "clinical_disclaimer_enabled") == "true",
        emergency_triage_enabled=_get_value(db, "emergency_triage_enabled") == "true",
    )


@router.patch("/", response_model=SettingsResponse)
def update_settings(request: SettingsUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if request.daily_message_limit is not None:
        _set_value(db, "daily_message_limit", str(request.daily_message_limit))
    if request.clinical_disclaimer_enabled is not None:
        _set_value(db, "clinical_disclaimer_enabled", "true" if request.clinical_disclaimer_enabled else "false")
    if request.emergency_triage_enabled is not None:
        _set_value(db, "emergency_triage_enabled", "true" if request.emergency_triage_enabled else "false")
    return get_settings(db, _admin)