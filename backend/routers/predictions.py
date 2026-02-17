"""
Predictions router - handles ML-based match predictions and
historical head-to-head (H2H) statistics using a trained model.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from predictor import predict_match, get_available_teams, _df

router = APIRouter()


class PredictionRequest(BaseModel):
    """
    Request body for match prediction.
    """
    home_team: str
    away_team: str


@router.post("/predict")
def predict(request: PredictionRequest):
    """
    Predict the outcome of a match using a trained Random Forest model.
    Only supports predictions between teams from the same league.
    """

    import pandas as pd
    from predictor import _df

    # Build a list of all known teams from historical data
    all_teams = pd.concat([_df['home_team'], _df['away_team']]).unique()

    # Perform case-insensitive matching for user input
    home_match = next(
        (t for t in all_teams if t.lower() == request.home_team.lower()),
        None
    )
    away_match = next(
        (t for t in all_teams if t.lower() == request.away_team.lower()),
        None
    )

    # Validate that both teams exist in the dataset
    if not home_match or not away_match:
        return {"error": "One or both teams not found in dataset"}

    # Determine league for each team
    home_league = (
        _df[_df['home_team'] == home_match]['league'].iloc[0]
        if len(_df[_df['home_team'] == home_match]) > 0
        else None
    )
    away_league = (
        _df[_df['away_team'] == away_match]['league'].iloc[0]
        if len(_df[_df['away_team'] == away_match]) > 0
        else None
    )

    # Disallow cross-league predictions
    if home_league != away_league:
        return {
            "error": (
                f"Cross-league predictions not supported. "
                f"{home_match} ({home_league}) vs {away_match} ({away_league}) "
                f"- our model is trained only on league matches."
            )
        }

    # Run ML model prediction
    result = predict_match(request.home_team, request.away_team)
    return result


@router.get("/teams")
def available_teams():
    """
    Return all teams supported by the prediction model.
    """
    teams = get_available_teams()
    return {"teams": teams}


@router.get("/h2h")
def head_to_head(home_team: str, away_team: str):
    """
    Return the last 5 head-to-head matches between two teams.
    Results are from the perspective of the home_team.
    """

    import pandas as pd

    # Perform case-insensitive team matching
    all_teams = pd.concat([_df['home_team'], _df['away_team']]).unique()
    home_match = next(
        (t for t in all_teams if t.lower() == home_team.lower()),
        None
    )
    away_match = next(
        (t for t in all_teams if t.lower() == away_team.lower()),
        None
    )

    # If either team is not found, return empty result
    if not home_match or not away_match:
        return {"matches": []}

    # Filter historical matches involving both teams
    h2h = _df[
        (
            ((_df['home_team'] == home_match) & (_df['away_team'] == away_match)) |
            ((_df['home_team'] == away_match) & (_df['away_team'] == home_match))
        )
    ].sort_values('Date', ascending=False).head(5)

    matches = []

    for _, row in h2h.iterrows():
        # Determine result from the perspective of home_match
        if row['home_team'] == home_match:
            if row['home_goals'] > row['away_goals']:
                result = 'W'
            elif row['home_goals'] < row['away_goals']:
                result = 'L'
            else:
                result = 'D'
        else:
            if row['away_goals'] > row['home_goals']:
                result = 'W'
            elif row['away_goals'] < row['home_goals']:
                result = 'L'
            else:
                result = 'D'

        matches.append({
            "date": row['Date'].strftime('%d %b %Y'),
            "home_team": row['home_team'],
            "away_team": row['away_team'],
            "home_goals": int(row['home_goals']),
            "away_goals": int(row['away_goals']),
            "result": result  # W/L/D from home_team perspective
        })

    return {
        "matches": matches,
        "team": home_match
    }
