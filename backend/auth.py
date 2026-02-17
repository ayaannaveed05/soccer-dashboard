"""
Authentication utilities:
- Password hashing/verification (bcrypt via Passlib)
- JWT creation and validation
- FastAPI dependency for extracting the current user from a bearer token
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

# Configure password hashing (bcrypt is widely used and secure for password storage)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Extracts tokens from "Authorization: Bearer <token>"
# tokenUrl is used by Swagger UI to understand where login happens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# JWT settings (keep SECRET_KEY private and out of version control)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    Store the returned hash in the database (never store plaintext passwords).
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored bcrypt hash.
    Returns True if the password matches.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    Create a signed JWT access token from a payload dict.
    Expected to include a subject claim.
    """
    to_encode = data.copy()

    # Add expiration claim
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Sign and encode the token
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Raises 401 if the token is invalid or expired.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> int:
    """
    FastAPI dependency that returns the current user's ID from a JWT.
    Expects the token payload to contain a 'sub' claim (subject) with the user ID.
    """
    payload = decode_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return int(user_id)
