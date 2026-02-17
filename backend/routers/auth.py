"""Auth router - register, login, user profile"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


class RegisterRequest(BaseModel):
    """
    Request body for user registration.
    Password is received in plaintext but is hashed before storing.
    """
    email: str  # User email
    username: str  # Display name
    password: str  # Plain text password (will be hashed)


class LoginRequest(BaseModel):
    """
    Request body for user login.
    """
    email: str  # Login with email
    password: str  # Plain text password


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    - Ensures email/username uniqueness
    - Hashes the password before saving
    - Returns a JWT so the user is logged in immediately
    """

    # Prevent duplicate accounts by email
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Prevent duplicate accounts by username
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new user record with hashed password (never store plaintext passwords)
    user = User(
        email=request.email,
        username=request.username,
        hashed_password=hash_password(request.password)
    )

    # Save user to database
    db.add(user)
    db.commit()
    db.refresh(user)  # Refresh to load generated fields like user.id

    # Generate JWT token (sub = user id)
    token = create_access_token({"sub": str(user.id)})

    # Return token + basic user profile info for the frontend
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user by email and password.
    Returns a JWT token if credentials are valid.
    """

    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Validate credentials (email exists and password matches stored hash)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token (sub = user id)
    token = create_access_token({"sub": str(user.id)})

    # Return token + basic user info
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }


@router.get("/me")
def get_me(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Return the profile of the currently authenticated user.
    Requires a valid JWT (Authorization: Bearer <token>).
    """

    # Look up user in database using the user_id extracted from the token
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return full profile data used by the frontend
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at
    }
