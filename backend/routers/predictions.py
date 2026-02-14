"""Predictions router - ML model predictions"""

from fastapi import APIRouter
from pydantic import BaseModel
from predictor import predict_match, get_available_teams

router = APIRouter()

class PredictionRequest(BaseModel):
    home_team: str  # Home team name
    away_team: str  # Away team name

@router.post("/predict")
def predict(request: PredictionRequest):
    """Predict match outcome using Random Forest model"""
    result = predict_match(request.home_team, request.away_team)
    return result

@router.get("/teams")
def available_teams():
    """Get all teams available for prediction"""
    teams = get_available_teams()
    return {"teams": teams}