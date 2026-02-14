"""Matches router - fetches real match data from football-data.org"""

from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv()  # Load API key from .env file

router = APIRouter()

# API configuration
API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"
HEADERS = {"X-Auth-Token": API_KEY}  # Required auth header for football-data.org

# League codes we support
LEAGUES = {
    "premier_league": "PL",
    "la_liga": "PD",
    "champions_league": "CL",
    "bundesliga": "BL1",
    "serie_a": "SA",
}


@router.get("/upcoming")
async def get_upcoming():
    """Fetch upcoming matches from Premier League and La Liga"""
    
    all_matches = []
    
    async with httpx.AsyncClient() as client:
        # Fetch from Premier League and La Liga
        for league_code in ["PL", "PD"]:
            try:
                res = await client.get(
                    f"{BASE_URL}/competitions/{league_code}/matches",
                    headers=HEADERS,
                    params={"status": "SCHEDULED"}  # Only upcoming matches
                )
                
                if res.status_code == 200:
                    data = res.json()
                    matches = data.get("matches", [])
                    
                    # Take first 5 upcoming matches from each league
                    for match in matches[:5]:
                        all_matches.append({
                            "id": match["id"],
                            "home_team": match["homeTeam"]["name"],
                            "away_team": match["awayTeam"]["name"],
                            "date": match["utcDate"][:10],  # Just the date part
                            "time": match["utcDate"][11:16],  # Just the time part
                            "league": match["competition"]["name"],
                            "status": "upcoming"
                        })
            except Exception as e:
                print(f"Error fetching {league_code}: {e}")
    
    return {"matches": all_matches}


@router.get("/recent")
async def get_recent():
    """Fetch recently finished matches"""
    
    all_matches = []
    
    async with httpx.AsyncClient() as client:
        for league_code in ["PL", "PD"]:
            try:
                res = await client.get(
                    f"{BASE_URL}/competitions/{league_code}/matches",
                    headers=HEADERS,
                    params={"status": "FINISHED"}  # Only finished matches
                )
                
                if res.status_code == 200:
                    data = res.json()
                    matches = data.get("matches", [])
                    
                    # Take last 5 finished matches from each league
                    for match in matches[-5:]:
                        all_matches.append({
                            "id": match["id"],
                            "home_team": match["homeTeam"]["name"],
                            "away_team": match["awayTeam"]["name"],
                            "date": match["utcDate"][:10],
                            "league": match["competition"]["name"],
                            "status": "finished",
                            "home_score": match["score"]["fullTime"]["home"],
                            "away_score": match["score"]["fullTime"]["away"],
                        })
            except Exception as e:
                print(f"Error fetching {league_code}: {e}")
    
    return {"matches": all_matches}


@router.get("/")
async def get_matches():
    """Fetch both upcoming and recent matches"""
    
    upcoming = await get_upcoming()
    recent = await get_recent()
    
    return {
        "upcoming": upcoming["matches"],
        "recent": recent["matches"]
    }