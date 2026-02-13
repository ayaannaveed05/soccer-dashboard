"""Predictions router - handles ML model predictions"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Request body model for prediction
class PredictionRequest(BaseModel):
    home_team: str  # Name of home team
    away_team: str  # Name of away team

@router.post("/predict")
def predict_match(request: PredictionRequest):
    """
    Predict match outcome
    Placeholder for now - we'll integrate your ML model next week
    """
    
    # Placeholder response (we'll replace with real model)
    return {
        "home_team": request.home_team,
        "away_team": request.away_team,
        "prediction": "Home Win",
        "probabilities": {
            "home_win": 0.45,
            "draw": 0.25,
            "away_win": 0.30
        },
        "confidence": 0.45
    }