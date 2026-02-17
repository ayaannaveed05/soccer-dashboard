"""
Teams router.
Fetches and normalizes real team data from football-data.org.
Includes caching and basic rate-limit handling.
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

load_dotenv()

router = APIRouter()

# Football-data.org API configuration
API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"
HEADERS = {"X-Auth-Token": API_KEY}

# Supported league codes and display names
LEAGUE_CODES = ["PL", "PD", "BL1", "SA", "FL1"]
LEAGUE_NAMES = {
    "PL": "Premier League",
    "PD": "La Liga",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "FL1": "Ligue 1",
}

# In-memory cache to avoid repeated API calls
_teams_cache = None


@router.get("/")
async def get_teams():
    """
    Fetch teams from the top 5 European leagues.
    Results are cached after the first request to reduce API usage.
    """
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
                    headers=HEADERS,
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

                elif res.status_code == 429:
                    # Handle API rate limiting by waiting and retrying once
                    await asyncio.sleep(10)
                    res = await client.get(
                        f"{BASE_URL}/competitions/{code}/teams",
                        headers=HEADERS,
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
                # Log error but continue processing other leagues
                print(f"Error fetching league {code}: {e}")

            # Small delay between requests to reduce rate limiting
            await asyncio.sleep(1)

    # Cache results for future requests
    _teams_cache = all_teams
    print(f"Cached {len(all_teams)} teams")

    return {"teams": all_teams}


@router.get("/search/{query}")
async def search_teams(query: str):
    """
    Search cached teams by name or short name.
    """
    all_teams = await get_teams()
    results = [
        team for team in all_teams["teams"]
        if query.lower() in team["name"].lower()
        or query.lower() in team["short_name"].lower()
    ]
    return {"teams": results}


@router.get("/{team_id}")
async def get_team(team_id: int):
    """
    Fetch detailed information for a single team by ID.
    """
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                f"{BASE_URL}/teams/{team_id}",
                headers=HEADERS,
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
