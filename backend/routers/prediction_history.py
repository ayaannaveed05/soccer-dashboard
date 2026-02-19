"""Prediction history router - track user predictions and accuracy"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import PredictionHistory
from auth import get_current_user

router = APIRouter()


@router.post("/")
def save_prediction(
    home_team: str,
    away_team: str,
    predicted_outcome: str,
    home_win_prob: float,
    draw_prob: float,
    away_win_prob: float,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a prediction to user's history"""
    
    prediction = PredictionHistory(
        user_id=user_id,
        home_team=home_team,
        away_team=away_team,
        predicted_outcome=predicted_outcome,
        home_win_prob=home_win_prob,
        draw_prob=draw_prob,
        away_win_prob=away_win_prob
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return {"message": "Prediction saved", "id": prediction.id}


@router.get("/")
def get_prediction_history(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's prediction history with accuracy stats"""
    
    predictions = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == user_id
    ).order_by(PredictionHistory.created_at.desc()).all()
    
    # Calculate stats
    total = len(predictions)
    correct = sum(1 for p in predictions if p.was_correct is True)
    pending = sum(1 for p in predictions if p.was_correct is None)
    
    accuracy = (correct / (total - pending) * 100) if (total - pending) > 0 else 0
    
    return {
        "predictions": [
            {
                "id": p.id,
                "home_team": p.home_team,
                "away_team": p.away_team,
                "predicted_outcome": p.predicted_outcome,
                "probabilities": {
                    "home_win": p.home_win_prob,
                    "draw": p.draw_prob,
                    "away_win": p.away_win_prob
                },
                "actual_outcome": p.actual_outcome,
                "was_correct": p.was_correct,
                "created_at": p.created_at.isoformat()
            }
            for p in predictions
        ],
        "stats": {
            "total": total,
            "correct": correct,
            "pending": pending,
            "accuracy": round(accuracy, 1)
        }
    }