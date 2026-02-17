"""
Matches router - fetches real match data from football-data.org.
Provides upcoming matches, recent results, and league standings.
"""

from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Football-data.org API configuration
API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"
HEADERS = {"X-Auth-Token": API_KEY}

# Cache standings so we don't hit rate limits on repeated requests
_standings_cache = {}


@router.get("/upcoming")
async def get_upcoming():
    """
    Fetch upcoming scheduled matches from selected competitions.
    Limits the number of matches returned per league for dashboard use.
    """
    all_matches = []

    async with httpx.AsyncClient() as client:
        for league_code in ["PL", "PD", "CL"]:
            try:
                # Request upcoming (scheduled) matches for the league
                res = await client.get(
                    f"{BASE_URL}/competitions/{league_code}/matches",
                    headers=HEADERS,
                    params={"status": "SCHEDULED"}
                )

                if res.status_code == 200:
                    data = res.json()
                    # Take only the first few matches to reduce payload size
                    for match in data.get("matches", [])[:5]:
                        all_matches.append({
                            "id": match["id"],
                            "home_team": match["homeTeam"]["name"],
                            "away_team": match["awayTeam"]["name"],
                            "date": match["utcDate"][:10],   # YYYY-MM-DD
                            "time": match["utcDate"][11:16], # HH:MM (UTC)
                            "league": match["competition"]["name"],
                            "status": "upcoming"
                        })

            except Exception as e:
                # Log error but continue processing other leagues
                print(f"Error fetching {league_code}: {e}")

    return {"matches": all_matches}


@router.get("/recent")
async def get_recent():
    """
    Fetch recently finished matches from selected competitions.
    Includes final scores for completed matches.
    """
    all_matches = []

    async with httpx.AsyncClient() as client:
        for league_code in ["PL", "PD", "CL"]:
            try:
                # Request finished matches for the league
                res = await client.get(
                    f"{BASE_URL}/competitions/{league_code}/matches",
                    headers=HEADERS,
                    params={"status": "FINISHED"}
                )

                if res.status_code == 200:
                    data = res.json()
                    # Take the most recent completed matches
                    for match in data.get("matches", [])[-5:]:
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
                # Log error but allow partial results
                print(f"Error fetching {league_code}: {e}")

    return {"matches": all_matches}


@router.get("/")
async def get_matches():
    """
    Combined endpoint that returns both upcoming and recent matches.
    Useful for dashboard-style views that need both datasets.
    """
    upcoming = await get_upcoming()
    recent = await get_recent()
    return {
        "upcoming": upcoming["matches"],
        "recent": recent["matches"]
    }


@router.get("/standings/{league_code}")
async def get_standings(league_code: str):
    """
    Fetch league standings for a given competition code.
    Results are cached in-memory to reduce API usage and rate limiting.

    Special case:
    - Champions League ("CL") standings are grouped by group stage.
    """
    global _standings_cache

    # Allowed competition codes
    valid_leagues = ["PL", "PD", "BL1", "SA", "FL1", "CL"]
    if league_code not in valid_leagues:
        raise HTTPException(status_code=400, detail="Invalid league code")

    # Return cached standings if already fetched
    if league_code in _standings_cache:
        print(f"✓ Returning cached standings for {league_code}")
        return _standings_cache[league_code]

    async with httpx.AsyncClient() as client:
        try:
            # Request standings data for the league
            res = await client.get(
                f"{BASE_URL}/competitions/{league_code}/standings",
                headers=HEADERS,
                timeout=15.0
            )

            if res.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limited - please wait a moment and try again"
                )

            if res.status_code != 200:
                raise HTTPException(
                    status_code=res.status_code,
                    detail="Failed to fetch standings"
                )

            data = res.json()

            # Champions League standings are split into multiple groups
            if league_code == "CL":
                groups = []

                for standing in data['standings']:
                    group = {
                        "group": standing.get('group', ''),
                        "table": []
                    }

                    for row in standing['table']:
                        group['table'].append({
                            "position": row['position'],
                            "team": row['team']['name'],
                            "crest": row['team']['crest'],
                            "played": row['playedGames'],
                            "won": row['won'],
                            "drawn": row['draw'],
                            "lost": row['lost'],
                            "gf": row['goalsFor'],
                            "ga": row['goalsAgainst'],
                            "gd": row['goalDifference'],
                            "points": row['points'],
                        })

                    groups.append(group)

                result = {
                    "league": data['competition']['name'],
                    "standings": [],
                    "groups": groups
                }

            else:
                # Most leagues return a single main standings table
                table = data['standings'][0]['table']
                standings = []

                for row in table:
                    standings.append({
                        "position": row['position'],
                        "team": row['team']['name'],
                        "crest": row['team']['crest'],
                        "played": row['playedGames'],
                        "won": row['won'],
                        "drawn": row['draw'],
                        "lost": row['lost'],
                        "gf": row['goalsFor'],
                        "ga": row['goalsAgainst'],
                        "gd": row['goalDifference'],
                        "points": row['points'],
                    })

                result = {
                    "league": data['competition']['name'],
                    "standings": standings,
                    "groups": []
                }

            # Cache standings for future requests
            _standings_cache[league_code] = result
            print(f"✓ Cached standings for {league_code}")
            return result

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
