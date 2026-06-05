from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/readiness", response_model=dict)
def get_readiness_score(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Fetch user's latest resume
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    resume_score = resume.ats_score if resume else 70
    
    # Fetch interview attempts
    attempts = db.query(models.InterviewAttempt).filter(models.InterviewAttempt.user_id == current_user.id).all()
    if attempts:
        interview_score = sum(a.score for a in attempts) // len(attempts)
        # Average communication fluency
        comm_score = sum(a.communication_metrics.get("fluency", 75) if a.communication_metrics else 75 for a in attempts) // len(attempts)
    else:
        interview_score = 65
        comm_score = 70
        
    # Coding score (simulated average)
    coding_score = 75
    
    # Calculate final readiness
    final_score = int(
        (resume_score * 0.3) +
        (interview_score * 0.3) +
        (comm_score * 0.2) +
        (coding_score * 0.2)
    )
    
    # Assess status
    if final_score >= 85:
        status = "Placement Ready"
    elif final_score >= 70:
        status = "Interview Ready"
    else:
        status = "Needs Preparation"
        
    return {
        "resume_score": resume_score,
        "communication_score": comm_score,
        "technical_score": interview_score,
        "coding_score": coding_score,
        "readiness_score": final_score,
        "status": status,
        "xp": current_user.xp,
        "streak": current_user.streak
    }

@router.get("/roadmap", response_model=schemas.RoadmapOut)
def get_roadmap(
    role: str = "AI Software Engineer",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Check if a roadmap already exists
    existing = db.query(models.UserRoadmap).filter(
        models.UserRoadmap.user_id == current_user.id,
        models.UserRoadmap.target_role == role
    ).first()
    
    if existing:
        return existing
        
    # Generate roadmap dynamically based on role
    # Pre-canned tracks
    role_lower = role.lower()
    if "data" in role_lower or "analyst" in role_lower:
        schedule = [
            {"month": "Month 1", "topic": "Python Fundamentals & Advanced SQL Queries", "details": "Master subqueries, window functions, and pandas data structures."},
            {"month": "Month 2", "topic": "Data Cleaning & Exploratory Analysis", "details": "Practice cleaning nulls, outliers, and charting distributions in Seaborn."},
            {"month": "Month 3", "topic": "Dashboarding & BI tools", "details": "Construct a dynamic sales performance dashboard in Tableau or PowerBI."},
            {"month": "Month 4", "topic": "Applied Machine Learning basics", "details": "Train regression and clustering algorithms with Scikit-Learn."},
            {"month": "Month 5", "topic": "SQL & Case-Study Practice", "details": "Solve HackerRank SQL challenges and practice talking through metrics."},
            {"month": "Month 6", "topic": "Job Applications & Mock Interviews", "details": "Tailor resume highlights, practice level 3 & 4 tests, and apply."}
        ]
        gaps = {
            "current_match": 75,
            "missing_skills": ["Spark", "Airflow", "AWS"],
            "learning_time": "6 Weeks"
        }
    elif "frontend" in role_lower or "web" in role_lower or "react" in role_lower:
        schedule = [
            {"month": "Month 1", "topic": "JavaScript & TypeScript Deep Dive", "details": "Understand closures, event loops, promises, and interface types."},
            {"month": "Month 2", "topic": "React Hooks & Dynamic State Management", "details": "Master useEffect, custom hooks, and store libraries like Zustand."},
            {"month": "Month 3", "topic": "Next.js Framework & Server Components", "details": "Understand Server Side Rendering, Static Site Generation, and Routing."},
            {"month": "Month 4", "topic": "Testing UI Components & API Mocking", "details": "Write unit tests using Jest, React Testing Library, and Cypress."},
            {"month": "Month 5", "topic": "CSS layouts, Glassmorphism & Framer Motion", "details": "Build complex grids, animations, and micro-interactions."},
            {"month": "Month 6", "topic": "Portfolio Polish & Applications", "details": "Integrate responsive design, write clean readmes, and network."}
        ]
        gaps = {
            "current_match": 70,
            "missing_skills": ["Docker", "GraphQL", "Jest", "CI/CD"],
            "learning_time": "8 Weeks"
        }
    else:
        # Default AI Software Engineer roadmap
        schedule = [
            {"month": "Month 1", "topic": "Advanced Python & Object Oriented Design", "details": "Master list comprehensions, decorators, multi-threading, and design patterns."},
            {"month": "Month 2", "topic": "Database Architecture & FastAPI Service APIs", "details": "Build schemas, write raw SQL queries, and implement JWT-secure APIs."},
            {"month": "Month 3", "topic": "Machine Learning Fundamentals & PyTorch", "details": "Understand gradient descent, loss functions, and neural layers."},
            {"month": "Month 4", "topic": "AI Application Orchestration (LangChain/Gemini)", "details": "Design chat interfaces, implement RAG systems, and parse files."},
            {"month": "Month 5", "topic": "Docker Containers & Cloud Deployment (AWS)", "details": "Containerize python endpoints, push to registries, deploy to cloud services."},
            {"month": "Month 6", "topic": "Full System Practice & Mock Portals", "details": "Practice level coding challenges, mock interviews, and submit applications."}
        ]
        gaps = {
            "current_match": 72,
            "missing_skills": ["Docker", "AWS", "Git", "System Design"],
            "learning_time": "6 Weeks"
        }
        
    new_roadmap = models.UserRoadmap(
        user_id=current_user.id,
        target_role=role,
        schedule=schedule,
        skill_gaps=gaps
    )
    
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    
    return new_roadmap

@router.get("/subscription", response_model=schemas.SubscriptionUsageOut)
def get_user_subscription_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    usage = db.query(models.SubscriptionUsage).filter(models.SubscriptionUsage.user_id == current_user.id).first()
    if not usage:
        usage = models.SubscriptionUsage(
            user_id=current_user.id,
            resume_analyses_limit=3,
            interviews_limit=3,
            gd_limit=3
        )
        db.add(usage)
        db.commit()
    return {
        "plan_tier": current_user.subscription_tier or "free",
        "resume_analyses_used": usage.resume_analyses_used,
        "interviews_used": usage.interviews_used,
        "gd_used": usage.gd_used,
        "resume_analyses_limit": usage.resume_analyses_limit,
        "interviews_limit": usage.interviews_limit,
        "gd_limit": usage.gd_limit,
        "expiry_date": usage.expiry_date
    }
