from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import urllib.parse
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=schemas.JobMatchOut)
def post_job(
    job_in: schemas.JobCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "recruiter" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only recruiters or admins can post jobs.")
    
    new_job = models.JobMatch(
        title=job_in.title,
        company=job_in.company,
        description=job_in.description,
        location=job_in.location,
        type=job_in.type,
        mode=job_in.mode,
        salary=job_in.salary,
        required_skills=job_in.required_skills,
        match_score=80, # default mock baseline
        missing_skills=[],
        why_matches="Posted by recruiter for candidates fitting these skills.",
        apply_url="mailto:recruiter@company.com"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/matches", response_model=List[schemas.JobMatchOut])
def get_job_matches(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Fetch user's latest resume to get skills
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    user_skills = resume.extracted_skills if (resume and resume.extracted_skills) else ["Python", "SQL", "FastAPI"]
    
    all_jobs = db.query(models.JobMatch).all()
    results = []
    
    for job in all_jobs:
        # Calculate dynamic match score based on common skills
        req_skills = job.required_skills or []
        if not req_skills:
            match_pct = 70
            missing = []
        else:
            common = set(user_skills).intersection(set(req_skills))
            match_pct = int((len(common) / len(req_skills)) * 100)
            missing = list(set(req_skills) - set(user_skills))
        
        # Override fields for output representation
        job.match_score = max(50, min(100, match_pct))
        job.missing_skills = missing
        job.why_matches = f"You share {len(set(user_skills).intersection(set(req_skills)))} skills out of {len(req_skills)} required, including {', '.join(list(set(user_skills).intersection(set(req_skills)))[:2])}."
        
        results.append(job)
        
    # Sort by match score descending
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results

@router.get("/search-links")
def get_search_links(role: str):
    escaped_role = urllib.parse.quote(role)
    
    return {
        "linkedin": f"https://www.linkedin.com/jobs/search/?keywords={escaped_role}",
        "naukri": f"https://www.naukri.com/{escaped_role.replace('%20', '-')}-jobs",
        "unstop": f"https://unstop.com/jobs?search={escaped_role}",
        "internshala": f"https://internshala.com/internships/keywords-{escaped_role}",
        "indeed": f"https://in.indeed.com/jobs?q={escaped_role}",
        "foundit": f"https://www.foundit.in/s/jobs?keyword={escaped_role}"
    }
