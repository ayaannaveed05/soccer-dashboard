"""Teams router - fetches real team data from football-data.org"""

from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"
HEADERS = {"X-Auth-Token": API_KEY}

LEAGUE_CODES = ["PL", "PD", "BL1", "SA", "FL1"]
LEAGUE_NAMES = {
    "PL": "Premier League",
    "PD": "La Liga",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "FL1": "Ligue 1"
}

# Cache so we don't hit API every request
_teams_cache = None


@router.get("/")
async def get_teams():
    """Fetch teams from all 5 leagues, cached after first request"""
    
    global _teams_cache
    
    # Return cached data if available
    if _teams_cache is not None:
        return {"teams": _teams_cache}
    
    all_teams = []
    
    async with httpx.AsyncClient() as client:
        for code in LEAGUE_CODES:
            try:
                res = await client.get(
                    f"{BASE_URL}/competitions/{code}/teams",
                    headers=HEADERS
                )
                
                if res.status_code == 200:
                    data = res.json()
                    for team in data.get("teams", []):
                        all_teams.append({
                            "id": team["id"],
                            "name": team["name"],
                            "short_name": team["shortName"],
                            "crest": team["crest"],
                            "league": LEAGUE_NAMES[code],
                            "country": team.get("area", {}).get("name", ""),
                            "founded": team.get("founded"),
                            "venue": team.get("venue"),
                        })
            except Exception as e:
                print(f"Error fetching {code}: {e}")
    
    # Store in cache
    _teams_cache = all_teams
    print(f"✓ Cached {len(all_teams)} teams")
    
    return {"teams": all_teams}


@router.get("/search/{query}")
async def search_teams(query: str):
    """Search teams by name"""
    all_teams = await get_teams()
    results = [
        t for t in all_teams["teams"]
        if query.lower() in t["name"].lower() or query.lower() in t["short_name"].lower()
    ]
    return {"teams": results}


@router.get("/{team_id}")
async def get_team(team_id: int):
    """Get single team details"""
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                f"{BASE_URL}/teams/{team_id}",
                headers=HEADERS
            )
            
            if res.status_code != 200:
                raise HTTPException(status_code=404, detail="Team not found")
            
            data = res.json()
            return {
                "id": data["id"],
                "name": data["name"],
                "crest": data["crest"],
                "founded": data.get("founded"),
                "venue": data.get("venue"),
                "website": data.get("website"),
                "coach": data.get("coach", {}).get("name"),
            }
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))