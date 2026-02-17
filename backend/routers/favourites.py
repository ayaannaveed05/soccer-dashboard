"""Favourites router - save and retrieve favourite teams"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Favourite
from auth import get_current_user

router = APIRouter()


class FavouriteRequest(BaseModel):
    """
    Request body for adding a favourite team.
    Stores basic team information so favourites can be displayed
    without additional API calls.
    """
    team_id: int        # Football API team ID
    team_name: str      # Team name
    team_crest: str     # Team logo URL
    team_league: str    # League name


@router.get("/")
def get_favourites(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all favourite teams for the currently authenticated user.
    """

    # Query favourites belonging only to the current user
    favourites = db.query(Favourite).filter(
        Favourite.user_id == user_id
    ).all()

    # Return a simplified, frontend-friendly response
    return {
        "favourites": [
            {
                "id": f.id,
                "team_id": f.team_id,
                "team_name": f.team_name,
                "team_crest": f.team_crest,
                "team_league": f.team_league
            }
            for f in favourites
        ]
    }


@router.post("/")
def add_favourite(
    request: FavouriteRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a team to the current user's favourites.
    Prevents duplicate favourites for the same user.
    """

    # Check if the team is already favourited by the user
    existing = db.query(Favourite).filter(
        Favourite.user_id == user_id,
        Favourite.team_id == request.team_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Team already in favourites"
        )

    # Create new favourite entry
    favourite = Favourite(
        user_id=user_id,
        team_id=request.team_id,
        team_name=request.team_name,
        team_crest=request.team_crest,
        team_league=request.team_league
    )

    # Save favourite to database
    db.add(favourite)
    db.commit()

    return {
        "message": f"{request.team_name} added to favourites"
    }


@router.delete("/{team_id}")
def remove_favourite(
    team_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a team from the current user's favourites.
    """

    # Look up the favourite for this user and team
    favourite = db.query(Favourite).filter(
        Favourite.user_id == user_id,
        Favourite.team_id == team_id
    ).first()

    if not favourite:
        raise HTTPException(
            status_code=404,
            detail="Favourite not found"
        )

    # Delete favourite entry
    db.delete(favourite)
    db.commit()

    return {"message": "Removed from favourites"}
