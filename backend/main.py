"""Main FastAPI application entry point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import teams, matches, predictions

# Initialize FastAPI app
app = FastAPI(title="Soccer Dashboard API", version="1.0.0")

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

# Health check endpoint
@app.get("/")
def root():
    return {"status": "ok", "message": "Soccer Dashboard API is running"}