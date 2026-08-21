from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.data.database import get_db
from app.models.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    admin_login: bool = False  # frontend "Login as Admin" checkbox — NOT trusted alone


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str


@router.post("/signup", response_model=AuthResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        role="patient",  # signup always creates patients; admins are provisioned separately
    )
    # If your User model has a full_name column, set it here — adjust if the column name differs
    if hasattr(user, "full_name"):
        user.full_name = request.full_name

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return AuthResponse(access_token=token, role=user.role, full_name=request.full_name)


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Your account has been suspended. Please contact support.")

    # Key security check: the "Login as Admin" checkbox is a UI hint only.
    # We independently verify the account's real role in the database.
    # A patient checking this box does NOT get admin access.
    if request.admin_login and user.role != "admin":
        raise HTTPException(status_code=403, detail="This account does not have admin access.")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    full_name = getattr(user, "full_name", user.email.split("@")[0])
    return AuthResponse(access_token=token, role=user.role, full_name=full_name)
@router.get("/me", response_model=AuthResponse)
def get_current_user_data(current_user: User = Depends(get_current_user)):
    full_name = getattr(current_user, "full_name", current_user.email.split("@")[0])
    # Note: If your AuthResponse expects just an access token, you can also return a custom UserProfile schema.
    # To keep it simple, we can return a dedicated response or include user details:
    return {
        "access_token": "", # optional for /me, or you can create a separate UserProfile schema
        "role": current_user.role,
        "full_name": full_name,
        "email": current_user.email
    }


@router.patch("/me")
def update_password(
    request: PasswordUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if request.current_password == request.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from the current password.")
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password updated successfully."}