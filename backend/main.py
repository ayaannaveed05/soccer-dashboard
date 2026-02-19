"""Main FastAPI application entry point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import teams, matches, predictions, auth, favourites
from database import engine
import models
from pipeline import start_scheduler, run_pipeline, pipeline_status

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Soccer Dashboard API", version="1.0.0")

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://soccerpredictions.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(favourites.router, prefix="/api/favourites", tags=["favourites"])


@app.on_event("startup")
async def startup_event():
    """Start the pipeline scheduler when server starts"""
    start_scheduler()


@app.get("/")
def root():
    return {"status": "ok", "message": "Soccer Dashboard API is running"}


@app.get("/api/pipeline/status")
def get_pipeline_status():
    """Check when pipeline last ran and its status"""
    return pipeline_status


@app.post("/api/pipeline/run")
def trigger_pipeline():
    """Manually trigger the pipeline - useful for testing"""
    import threading
    thread = threading.Thread(target=run_pipeline)
    thread.start()
    return {"message": "Pipeline started in background"}