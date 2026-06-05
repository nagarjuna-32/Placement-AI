from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import os
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
    certificates,
    payments,
    reports
)
from utils.rate_limit import RateLimitingMiddleware

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

# Secure HTTP Headers Middleware
class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
        response.headers["Content-Security-Policy"] = "default-src 'self' * data: blob: 'unsafe-inline' 'unsafe-eval' ws: wss:"
        return response

# Register Middleware in proper ASGI execution order
app.add_middleware(SecureHeadersMiddleware)
app.add_middleware(RateLimitingMiddleware, limit=100, window=60) # 100 requests per minute

# Configure CORS
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

# Mount local uploader static directory
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

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
app.include_router(payments.router)
app.include_router(reports.router)

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
