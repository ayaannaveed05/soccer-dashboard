"""
Database models for users and favourite teams.
Defines table schemas and relationships using SQLAlchemy ORM.
"""

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class User(Base):
    """
    User account model.
    Stores authentication and profile information.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # One-to-many relationship: one user can have many favourites
    favourites = relationship("Favourite", back_populates="user")
    predictions = relationship("PredictionHistory", back_populates="user", cascade="all, delete-orphan")


class Favourite(Base):
    """
    Model representing a user's favourite football teams.
    """

    __tablename__ = "favourites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    team_id = Column(Integer, nullable=False)
    team_name = Column(String, nullable=False)
    team_crest = Column(String)
    team_league = Column(String)

    created_at = Column(DateTime, server_default=func.now())

    # Reference back to the owning user
    user = relationship("User", back_populates="favourites")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    predicted_outcome = Column(String, nullable=False)  # "Home Win", "Away Win", "Draw"
    home_win_prob = Column(Float, nullable=False)
    draw_prob = Column(Float, nullable=False)
    away_win_prob = Column(Float, nullable=False)
    actual_outcome = Column(String, nullable=True)  # Filled in later when match finishes
    was_correct = Column(Boolean, nullable=True)  # True/False/None (pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")

# Also add to User model - find the User class and add this line after favourites relationship:
