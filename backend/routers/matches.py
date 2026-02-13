"""Matches router - handles all match-related endpoints"""

from fastapi import APIRouter

router = APIRouter()

# Placeholder match data
MATCHES = [
    {"id": 1, "home_team": "Arsenal", "away_team": "Chelsea", 
     "date": "2026-02-15", "league": "Premier League", "status": "upcoming"},
    {"id": 2, "home_team": "Real Madrid", "away_team": "Barcelona",
     "date": "2026-02-16", "league": "La Liga", "status": "upcoming"},
    {"id": 3, "home_team": "Manchester City", "away_team": "Liverpool",
     "date": "2026-02-10", "league": "Premier League", 
     "status": "finished", "home_score": 2, "away_score": 1},
]

@router.get("/")
def get_matches():
    """Get all matches"""
    return {"matches": MATCHES}

@router.get("/upcoming")
def get_upcoming():
    """Get upcoming matches only"""
    upcoming = [m for m in MATCHES if m["status"] == "upcoming"]
    return {"matches": upcoming}

@router.get("/recent")
def get_recent():
    """Get recently finished matches"""
    recent = [m for m in MATCHES if m["status"] == "finished"]
    return {"matches": recent}