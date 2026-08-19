from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.core.scheduling import parse_time_ranges
from app.data.database import get_db
from app.models.models import Appointment, Clinic, ClinicPricing, Service, User


router = APIRouter(tags=["Services and Clinics"])


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float = Field(ge=0)


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = Field(default=None, ge=0)


class ServiceResponse(ServiceCreate):
    id: int

    class Config:
        from_attributes = True


class ClinicCreate(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None


class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None


class ClinicResponse(ClinicCreate):
    id: int

    class Config:
        from_attributes = True


class ClinicPricingCreate(BaseModel):
    clinic_id: int
    service_id: int
    price: float = Field(ge=0)


class ClinicPricingResponse(ClinicPricingCreate):
    id: int

    class Config:
        from_attributes = True


def _validate_hours(value: str | None, field_name: str):
    try:
        parse_time_ranges(value, field_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/api/services/", response_model=ServiceResponse)
def create_service(request: ServiceCreate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    service = Service(**request.model_dump())
    db.add(service)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Service name already exists.") from None
    db.refresh(service)
    return service


@router.get("/api/services/", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return db.query(Service).order_by(Service.name).all()


@router.patch("/api/services/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, request: ServiceUpdate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found.")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Service name already exists.") from None
    db.refresh(service)
    return service


@router.delete("/api/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found.")
    if db.query(Appointment).filter(Appointment.service_id == service_id).first():
        raise HTTPException(status_code=409, detail="Cannot delete service with existing appointments.")
    db.query(ClinicPricing).filter(ClinicPricing.service_id == service_id).delete(synchronize_session=False)
    db.delete(service)
    db.commit()
    return {"message": "Service deleted."}


@router.post("/api/clinics/", response_model=ClinicResponse)
def create_clinic(request: ClinicCreate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    _validate_hours(request.operating_hours, "clinic hours")
    clinic = Clinic(**request.model_dump())
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic


@router.get("/api/clinics/", response_model=list[ClinicResponse])
def list_clinics(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return db.query(Clinic).order_by(Clinic.name).all()


@router.patch("/api/clinics/{clinic_id}", response_model=ClinicResponse)
def update_clinic(clinic_id: int, request: ClinicUpdate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    if "operating_hours" in request.model_dump(exclude_unset=True):
        _validate_hours(request.operating_hours, "clinic hours")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(clinic, field, value)
    db.commit()
    db.refresh(clinic)
    return clinic


@router.delete("/api/clinics/{clinic_id}")
def delete_clinic(clinic_id: int, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    if db.query(Appointment).filter(Appointment.clinic_id == clinic_id).first():
        raise HTTPException(status_code=409, detail="Cannot delete clinic with existing appointments.")
    db.query(ClinicPricing).filter(ClinicPricing.clinic_id == clinic_id).delete(synchronize_session=False)
    db.delete(clinic)
    db.commit()
    return {"message": "Clinic deleted."}


@router.post("/api/clinic-pricing/", response_model=ClinicPricingResponse)
def set_clinic_pricing(request: ClinicPricingCreate, db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    if db.query(Clinic).filter(Clinic.id == request.clinic_id).first() is None:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    if db.query(Service).filter(Service.id == request.service_id).first() is None:
        raise HTTPException(status_code=404, detail="Service not found.")
    pricing = db.query(ClinicPricing).filter(
        ClinicPricing.clinic_id == request.clinic_id,
        ClinicPricing.service_id == request.service_id,
    ).first()
    if pricing is None:
        pricing = ClinicPricing(**request.model_dump())
        db.add(pricing)
    else:
        pricing.price = request.price
    db.commit()
    db.refresh(pricing)
    return pricing


@router.get("/api/clinic-pricing/", response_model=list[ClinicPricingResponse])
def list_clinic_pricing(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)):
    return db.query(ClinicPricing).order_by(ClinicPricing.clinic_id, ClinicPricing.service_id).all()
