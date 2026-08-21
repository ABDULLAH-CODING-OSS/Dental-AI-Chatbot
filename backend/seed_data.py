"""
Seed script — populates demo data for Denova.
Run from backend/ with venv active: python seed_data.py
Safe to re-run; skips creating duplicates where reasonably possible.
"""

from datetime import datetime, timedelta
import random

from app.data.database import SessionLocal
from app.models.models import (
    User, Doctor, Clinic, Service, ClinicPricing,
    Appointment, ChatSession, ChatMessage, Notification
)
from app.core.security import hash_password

db = SessionLocal()

print("Seeding Denova demo data...\n")

# ---------- 1. CLINICS ----------
clinics_data = [
    {"name": "KM Dental House", "address": "Wahdat Road, P Block GHQ-41", "phone": "042-111-2233", "operating_hours": "09:00-18:00", "latitude": 31.5204, "longitude": 74.3587},
    {"name": "RGB Dental Clinic", "address": "Iqbal Town", "phone": "042-222-3344", "operating_hours": "10:00-19:00", "latitude": 31.5100, "longitude": 74.3200},
    {"name": "Ashfaq Dental Home", "address": "Wapda Town", "phone": "042-333-4455", "operating_hours": "09:00-17:00", "latitude": 31.4700, "longitude": 74.2700},
    {"name": "Cantt Dental Care", "address": "Lahore Cantt", "phone": "042-444-5566", "operating_hours": "08:00-16:00", "latitude": 31.5500, "longitude": 74.3800},
]

clinics = []
for c in clinics_data:
    existing = db.query(Clinic).filter(Clinic.name == c["name"]).first()
    if existing:
        clinics.append(existing)
        continue
    clinic = Clinic(**c)
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    clinics.append(clinic)
print(f"✔ Clinics: {len(clinics)}")

# ---------- 2. SERVICES ----------
services_data = [
    {"name": "Dental Consultation & Examination", "description": "General checkup and diagnosis", "base_price": 30.0},
    {"name": "Scaling and Polishing", "description": "Professional teeth cleaning", "base_price": 50.0},
    {"name": "Composite Filling", "description": "Tooth-colored cavity filling", "base_price": 75.0},
    {"name": "Simple Tooth Extraction", "description": "Standard tooth removal", "base_price": 60.0},
    {"name": "Surgical Wisdom Tooth Removal", "description": "Surgical extraction of impacted wisdom teeth", "base_price": 250.0},
    {"name": "Deep Root Canal Surgery", "description": "Root canal treatment", "base_price": 300.0},
    {"name": "Dental Crown", "description": "Crown placement", "base_price": 400.0},
    {"name": "Dental Bridge", "description": "Fixed bridge restoration", "base_price": 600.0},
    {"name": "Dental Implants", "description": "Single implant placement", "base_price": 1200.0},
    {"name": "Teeth Whitening", "description": "Professional whitening treatment", "base_price": 150.0},
    {"name": "Dental Veneers", "description": "Porcelain veneer per tooth", "base_price": 350.0},
]

services = []
for s in services_data:
    existing = db.query(Service).filter(Service.name == s["name"]).first()
    if existing:
        services.append(existing)
        continue
    service = Service(**s)
    db.add(service)
    db.commit()
    db.refresh(service)
    services.append(service)
print(f"✔ Services: {len(services)}")

# ---------- 3. CLINIC PRICING OVERRIDES (sample) ----------
overrides_added = 0
for clinic in clinics[:2]:  # only first 2 clinics have overrides
    for service in random.sample(services, 3):
        existing = db.query(ClinicPricing).filter(
            ClinicPricing.clinic_id == clinic.id, ClinicPricing.service_id == service.id
        ).first()
        if existing:
            continue
        override_price = round(service.base_price * random.uniform(0.9, 1.3), 2)
        db.add(ClinicPricing(clinic_id=clinic.id, service_id=service.id, price=override_price))
        overrides_added += 1
db.commit()
print(f"✔ Clinic pricing overrides: {overrides_added}")

# ---------- 4. DOCTORS ----------
doctors_data = [
    {"name": "Dr. Sarah Lee", "specialty": "General Dentistry", "email": "sarah.lee@denova.com", "phone": "0300-1234567", "consultation_fee": 75.0, "slots": "09:00-12:00,14:00-18:00"},
    {"name": "Dr. Hamid Raza", "specialty": "Periodontics", "email": "hamid.raza@denova.com", "phone": "0300-2345678", "consultation_fee": 100.0, "slots": "10:00-13:00,15:00-19:00"},
    {"name": "Dr. Faria Khan", "specialty": "Oral & Maxillofacial Surgery", "email": "faria.khan@denova.com", "phone": "0300-3456789", "consultation_fee": 150.0, "slots": "09:00-12:00,17:00-21:00"},
    {"name": "Dr. Danish Ahmed", "specialty": "Endodontics", "email": "danish.ahmed@denova.com", "phone": "0300-4567890", "consultation_fee": 120.0, "slots": "08:00-12:00"},
    {"name": "Dr. Zain Malik", "specialty": "Operative Dentistry", "email": "zain.malik@denova.com", "phone": "0300-5678901", "consultation_fee": 90.0, "slots": "12:00-16:00,18:00-22:00"},
]

doctors = []
for d in doctors_data:
    existing = db.query(Doctor).filter(Doctor.email == d["email"]).first()
    if existing:
        doctors.append(existing)
        continue
    doctor = Doctor(**d)
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    doctors.append(doctor)
print(f"✔ Doctors: {len(doctors)}")

# ---------- 5. ADMIN ACCOUNT ----------
admin = db.query(User).filter(User.email == "admin@denovadental.com").first()
if not admin:
    admin = User(
        email="admin@denovadental.com",
        hashed_password=hash_password("Admin123!"),
        role="admin",
        full_name="Dr. Aris Thorne",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("✔ Admin account created (admin@denovadental.com / Admin123!)")
else:
    print("✔ Admin account already exists")

# ---------- 6. TEST PATIENTS ----------
patients_data = [
    {"email": "sarah.jenkins@gmail.com", "full_name": "Sarah Jenkins"},
    {"email": "michael.chang@gmail.com", "full_name": "Michael Chang"},
    {"email": "elena.rostova@gmail.com", "full_name": "Elena Rostova"},
    {"email": "sophia.martinez@gmail.com", "full_name": "Sophia Martinez"},
    {"email": "david.kim@gmail.com", "full_name": "David Kim"},
    {"email": "raj.malhotra@gmail.com", "full_name": "Raj Malhotra"},
]

patients = []
for p in patients_data:
    existing = db.query(User).filter(User.email == p["email"]).first()
    if existing:
        patients.append(existing)
        continue
    patient = User(
        email=p["email"],
        hashed_password=hash_password("Patient123!"),
        role="patient",
        full_name=p["full_name"],
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    patients.append(patient)
print(f"✔ Test patients: {len(patients)} (all password: Patient123!)")

# ---------- 7. APPOINTMENTS ----------
statuses = ["pending", "confirmed", "confirmed", "cancelled"]
appointments_created = 0
for patient in patients:
    num_appts = random.randint(1, 3)
    for _ in range(num_appts):
        doctor = random.choice(doctors)
        clinic = random.choice(clinics)
        service = random.choice(services)
        days_offset = random.randint(-10, 15)  # mix of past and future
        appt_date = datetime.utcnow() + timedelta(days=days_offset, hours=random.randint(9, 18))

        appt = Appointment(
            user_id=patient.id,
            doctor_id=doctor.id,
            clinic_id=clinic.id,
            service_id=service.id,
            dentist_name=doctor.name,
            patient_name=patient.full_name,
            patient_relation="Self",
            patient_age=random.randint(18, 60),
            appointment_date=appt_date,
            status=random.choice(statuses),
            price=doctor.consultation_fee,
            notes="Seeded demo appointment",
        )
        db.add(appt)
        appointments_created += 1
db.commit()
print(f"✔ Appointments: {appointments_created}")

# ---------- 8. CHAT SESSIONS + MESSAGES ----------
sample_conversations = [
    [("user", "Hi, I've had a toothache for two days"),
     ("assistant", "I'm sorry to hear that. Can you describe the pain — is it sharp, throbbing, or constant? And does it get worse with hot or cold food?")],
    [("user", "How often should I floss?"),
     ("assistant", "Dentists recommend flossing at least once a day, ideally before brushing at night, to remove plaque between teeth that brushing alone can't reach.")],
    [("user", "What causes gum bleeding?"),
     ("assistant", "Bleeding gums are often an early sign of gingivitis caused by plaque buildup. Other causes include brushing too hard, vitamin deficiencies, or certain medications. If it persists, a dental checkup is recommended.")],
]

sessions_created = 0
for patient in patients:
    num_sessions = random.randint(1, 2)
    for _ in range(num_sessions):
        convo = random.choice(sample_conversations)
        session = ChatSession(
            user_id=patient.id,
            title=convo[0][1][:30] + "...",
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 20)),
            updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 5)),
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        for sender, content in convo:
            db.add(ChatMessage(session_id=session.id, sender=sender, content=content, timestamp=session.created_at))
        db.commit()
        sessions_created += 1
print(f"✔ Chat sessions: {sessions_created}")

# ---------- 9. NOTIFICATIONS ----------
notif_count = 0
for patient in patients:
    db.add(Notification(
        user_id=patient.id,
        title="Welcome to Denova",
        message="Thanks for joining! Start a chat anytime to get dental guidance or book an appointment.",
        read=random.choice([0, 1]),
    ))
    notif_count += 1
db.commit()
print(f"✔ Notifications: {notif_count}")

db.close()

print("\n✅ Seeding complete!")
print("Admin login: admin@denovadental.com / Admin123!")
print("Patient logins: any email above / Patient123!")