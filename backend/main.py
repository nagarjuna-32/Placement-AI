from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
import database
from routers import (
    auth, 
    resume, 
    jobs, 
    interview, 
    profile, 
    career_agent, 
    tracker, 
    alerts, 
    github_linkedin, 
    market, 
    hr_panel,
    orchestrator,
    certificates
)

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# Auto seed default demo users on startup
from database import get_db
from routers.auth import seed_database
try:
    db = next(get_db())
    seed_database(db)
    print("Database auto-seeded successfully with demo accounts.")
except Exception as e:
    print(f"Auto-seed warning: {e}")

app = FastAPI(
    title="PlaceMate AI API",
    description="Backend API services for PlaceMate AI - Career Operating System",
    version="2.0.0"
)

# Configure CORS so Next.js frontend can communicate with FastAPI
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(interview.router)
app.include_router(profile.router)
app.include_router(career_agent.router)
app.include_router(tracker.router)
app.include_router(alerts.router)
app.include_router(github_linkedin.router)
app.include_router(market.router)
app.include_router(hr_panel.router)
app.include_router(orchestrator.router)
app.include_router(certificates.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "PlaceMate AI Backend Service - V2 (Career OS)",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
