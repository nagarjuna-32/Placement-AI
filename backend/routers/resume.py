import random
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/analyze", response_model=schemas.ResumeOut)
def analyze_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, or TXT resumes are supported.")
    
    # Read filename or content to extract basic parameters (Simulated parsed resume)
    # We will generate rich realistic feedback based on simulated analysis
    name_hint = file.filename.lower()
    
    # Pre-canned profiles for testing based on filename hints
    if "data" in name_hint or "analyst" in name_hint:
        skills = ["Python", "SQL", "Pandas", "Tableau", "PowerBI", "R"]
        missing = ["Spark", "Airflow", "AWS"]
        certifications = ["Google Data Analytics Professional", "Tableau Desktop Certified"]
        projects = [
            {"title": "E-Commerce Sales Dashboard", "description": "Designed a Tableau dashboard visualization tracking dynamic vendor revenue across 5 channels."},
            {"title": "Churn Prediction Model", "description": "Trained a logistic regression classifier in Scikit-Learn yielding 88% precision score."}
        ]
        recs = [
            "Add distributed computing keywords like Hadoop or Apache Spark.",
            "Quantify dashboard impacts (e.g., 'reduced reporting overhead by 15%').",
            "Detail data cleaning and ETL pipeline architectures rather than just dashboard graphics."
        ]
        ats_score = random.randint(75, 85)
        quality_score = ats_score + random.randint(-5, 5)
    elif "frontend" in name_hint or "react" in name_hint or "web" in name_hint:
        skills = ["JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS", "Next.js"]
        missing = ["Docker", "GraphQL", "Jest", "CI/CD"]
        certifications = ["Meta Front-End Developer Professional Certificate"]
        projects = [
            {"title": "Portfolio Web Application", "description": "Created a responsive Next.js portfolio website using Tailwind CSS and Framer Motion."},
            {"title": "SaaS Admin Dashboard", "description": "Built a React dashboard incorporating ChartJS charts and JWT-based session security."}
        ]
        recs = [
            "Add automated testing keywords like Jest, Cypress, or React Testing Library.",
            "Incorporate state-management frameworks like Redux Toolkit or Zustand.",
            "Highlight performance optimizations such as image lazy loading and server-side rendering."
        ]
        ats_score = random.randint(80, 90)
        quality_score = ats_score + random.randint(-5, 5)
    else:
        # Default Fullstack / Python general profile
        skills = ["Python", "SQL", "FastAPI", "JavaScript", "HTML/CSS", "Machine Learning"]
        missing = ["Docker", "AWS", "CI/CD", "Kubernetes"]
        certifications = ["AWS Certified Cloud Practitioner", "HackerRank Problem Solving (Gold)"]
        projects = [
            {"title": "Online Quiz Portal", "description": "Engineered a collaborative testing hub using FastAPI backend API services and React UI."},
            {"title": "Smart Job Portal Backend", "description": "Constructed a relational database schema supporting applicant filtering and session security."}
        ]
        recs = [
            "Improve project descriptions with quantifiable impacts (e.g. 'boosted response times by 30%').",
            "Integrate cloud deployment experience (e.g. AWS ECS, S3, or Docker orchestration).",
            "Incorporate a dedicated 'Developer Tools' section with Git, CI/CD, and testing practices."
        ]
        ats_score = random.randint(78, 88)
        quality_score = ats_score + random.randint(-5, 5)

    # Save to Database
    db_resume = models.Resume(
        user_id=current_user.id,
        filename=file.filename,
        ats_score=ats_score,
        quality_score=quality_score,
        grammar_report="Excellent grammar. Identified 2 minor passive voice issues in project bullet points. Active voice action verbs recommended.",
        extracted_skills=skills,
        certifications=certifications,
        projects_analysis=projects,
        missing_keywords=missing,
        recommendations=recs
    )
    
    # Increase user XP for taking action
    current_user.xp += 150
    if current_user.streak == 0:
        current_user.streak = 1
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("/latest", response_model=schemas.ResumeOut)
def get_latest_resume(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet.")
    return resume
