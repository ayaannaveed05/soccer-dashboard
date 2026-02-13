"""Teams router - handles all team-related endpoints"""

from fastapi import APIRouter, HTTPException

router = APIRouter()

# Placeholder team data (we'll replace with real API data next)
TEAMS = [
    {"id": 1, "name": "Arsenal", "league": "Premier League", "country": "England"},
    {"id": 2, "name": "Chelsea", "league": "Premier League", "country": "England"},
    {"id": 3, "name": "Manchester City", "league": "Premier League", "country": "England"},
    {"id": 4, "name": "Liverpool", "league": "Premier League", "country": "England"},
    {"id": 5, "name": "Real Madrid", "league": "La Liga", "country": "Spain"},
    {"id": 6, "name": "Barcelona", "league": "La Liga", "country": "Spain"},
]

@router.get("/")
def get_teams():
    """Get all teams"""
    return {"teams": TEAMS}

@router.get("/{team_id}")
def get_team(team_id: int):
    """Get single team by ID"""
    # Find team with matching ID
    team = next((t for t in TEAMS if t["id"] == team_id), None)
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return team

@router.get("/search/{query}")
def search_teams(query: str):
    """Search teams by name"""
    # Filter teams where query matches name (case insensitive)
    results = [t for t in TEAMS if query.lower() in t["name"].lower()]
    return {"teams": results}