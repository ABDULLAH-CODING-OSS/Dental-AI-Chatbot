from app.data.database import SessionLocal
from app.models.models import User
from app.core.security import hash_password

db = SessionLocal()

existing = db.query(User).filter(User.email == "admin@denovadental.com").first()
if existing:
    print("Admin already exists.")
else:
    admin = User(
        email="admin@denovadental.com",
        hashed_password=hash_password("password"),
        role="admin",
        full_name="Abdullah Javed",
    )
    db.add(admin)
    db.commit()
    print("Admin created successfully.")

db.close()