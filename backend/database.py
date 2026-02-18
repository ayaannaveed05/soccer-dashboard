"""
Database configuration and session management.
Handles database connection, ORM base, and request-scoped sessions.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

# Retrieve database connection URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
# Create SQLAlchemy engine


# Create a session factory for database interactions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session.
    Ensures the session is properly closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
