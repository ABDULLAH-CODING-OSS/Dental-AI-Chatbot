# from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from app.data.database import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     full_name = Column(String, nullable=True)
#     email = Column(String, unique=True, index=True, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     role = Column(String, default="patient")  # 'patient' or 'admin'
#     created_at = Column(DateTime, default=datetime.utcnow)

#     sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
#     appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")

#     messages_today = Column(Integer, default=0)
#     last_message_date = Column(DateTime, nullable=True)

# class ChatSession(Base):
#     __tablename__ = "chat_sessions"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     title = Column(String, default="New Consultation")
#     created_at = Column(DateTime, default=datetime.utcnow)

#     user = relationship("User", back_populates="sessions")
#     messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

# class ChatMessage(Base):
#     __tablename__ = "chat_messages"

#     id = Column(Integer, primary_key=True, index=True)
#     session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
#     sender = Column(String, nullable=False)  # 'user' or 'assistant'
#     content = Column(Text, nullable=False)
#     timestamp = Column(DateTime, default=datetime.utcnow)

#     session = relationship("ChatSession", back_populates="messages")

# class Appointment(Base):
#     __tablename__ = "appointments"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     dentist_name = Column(String, nullable=False)
#     appointment_date = Column(DateTime, nullable=False)
#     status = Column(String, default="pending")  # 'pending', 'confirmed', 'cancelled'
#     notes = Column(Text, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)

#     user = relationship("User", back_populates="appointments")

# class LocalClinic(Base):
#     __tablename__ = "local_clinics"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     address = Column(String, nullable=False)
#     contact_number = Column(String, nullable=False)
#     specialty = Column(String, nullable=True)

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.data.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")  # 'patient' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")

    messages_today = Column(Integer, default=0)
    last_message_date = Column(DateTime, nullable=True)
    is_suspended = Column(Integer, default=0)  # 0/1 boolean flag

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Consultation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    consultation_fee = Column(Float, default=50.0)
    slots = Column(String, nullable=True)

    appointments = relationship("Appointment", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    dentist_name = Column(String, nullable=False) # Keep for backward compatibility or map from doctor
    
    # Patient specific booking details requested in scope
    patient_name = Column(String, nullable=True)
    patient_relation = Column(String, nullable=True)  # e.g., 'Self', 'Child', 'Spouse'
    patient_age = Column(Integer, nullable=True)
    
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # 'pending', 'confirmed', 'cancelled'
    price = Column(Float, default=0.0)  # For the receipt display
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    clinic = relationship("Clinic", back_populates="appointments")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="service")
    clinic_pricing = relationship("ClinicPricing", back_populates="service")

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    operating_hours = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="clinic")
    clinic_pricing = relationship("ClinicPricing", back_populates="clinic")

class ClinicPricing(Base):
    __tablename__ = "clinic_pricing"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    clinic = relationship("Clinic", back_populates="clinic_pricing")
    service = relationship("Service", back_populates="clinic_pricing")

class LocalClinic(Base):
    __tablename__ = "local_clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    specialty = Column(String, nullable=True)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)  # e.g., 'daily_message_limit', 'clinic_name'
    value = Column(String, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Integer, default=0)  # 0/1 as boolean flag
    created_at = Column(DateTime, default=datetime.utcnow)