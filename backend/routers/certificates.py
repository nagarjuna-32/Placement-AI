import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, database
from routers.auth import get_current_user, verify_user_role

router = APIRouter(prefix="/certificates", tags=["certificates"])

def generate_certificate_id(cert_type: str) -> str:
    abbr = {
        "resume_ready": "RES",
        "communication_skills": "COM",
        "mock_interview": "INT",
        "coding_interview": "COD",
        "placement_ready": "RDY",
        "career_readiness": "CAR"
    }.get(cert_type, "GEN")
    unique_suffix = uuid.uuid4().hex[:8].upper()
    return f"PMC-{abbr}-{unique_suffix}"

def evaluate_milestones(user: models.User, db: Session) -> Dict[str, Dict[str, Any]]:
    # 1. Resume Ready Milestone (ats_score >= 80)
    latest_resume = db.query(models.Resume).filter(models.Resume.user_id == user.id).order_by(models.Resume.id.desc()).first()
    resume_score = latest_resume.ats_score if latest_resume else 0
    resume_eligible = resume_score >= 80

    # 2. Communication Skills Milestone
    # Check if user has high career health score or mock interview communication fluency/metrics >= 75
    comm_eligible = user.career_health_score >= 75
    latest_interview = db.query(models.InterviewAttempt).filter(models.InterviewAttempt.user_id == user.id).order_by(models.InterviewAttempt.id.desc()).first()
    comm_score = 75 # default mock score if eligible
    if latest_interview:
        metrics = latest_interview.communication_metrics or {}
        # Try to extract fluency or confidence score
        pron = metrics.get("pronunciation", 70)
        conf = metrics.get("confidence", 70)
        fluency = metrics.get("fluency", 70)
        avg = (pron + conf + fluency) // 3
        if avg >= 75:
            comm_eligible = True
            comm_score = avg
        elif user.career_health_score >= 75:
            comm_score = user.career_health_score

    # 3. Mock Interview Completion Milestone (Level >= 5, score >= 75)
    high_level_interview = db.query(models.InterviewAttempt).filter(
        models.InterviewAttempt.user_id == user.id,
        models.InterviewAttempt.level >= 5,
        models.InterviewAttempt.score >= 75
    ).order_by(models.InterviewAttempt.score.desc()).first()
    interview_eligible = high_level_interview is not None
    interview_score = high_level_interview.score if high_level_interview else 0

    # 4. Coding Interview Completion Milestone (Github readiness_score >= 75 or project_score >= 75)
    latest_github = db.query(models.GithubAnalysis).filter(models.GithubAnalysis.user_id == user.id).order_by(models.GithubAnalysis.id.desc()).first()
    coding_eligible = False
    coding_score = 0
    if latest_github:
        if latest_github.readiness_score >= 75 or latest_github.project_score >= 75:
            coding_eligible = True
            coding_score = max(latest_github.readiness_score, latest_github.project_score)
    # Default fallback: if user has XP >= 1200 and has solved challenges (represented by career health)
    if not coding_eligible and user.xp >= 1200:
        coding_eligible = True
        coding_score = min(90, 75 + (user.xp - 1000) // 50)

    # 5. Placement Ready Milestone (All 4 core certificates are eligible)
    placement_eligible = resume_eligible and comm_eligible and interview_eligible and coding_eligible
    placement_score = (resume_score + comm_score + interview_score + coding_score) // 4 if placement_eligible else 0

    # 6. AI Career Readiness Milestone (career_health_score >= 85)
    career_eligible = user.career_health_score >= 85
    career_score = user.career_health_score

    return {
        "resume_ready": {
            "eligible": resume_eligible,
            "score": resume_score,
            "title": "Resume Ready Certificate",
            "skill": "AI Resume Optimization & ATS Audits",
            "requirement": "Achieve an ATS score of 80% or higher inside the AI Resume Analyzer."
        },
        "communication_skills": {
            "eligible": comm_eligible,
            "score": comm_score,
            "title": "Communication Skills Certificate",
            "skill": "Verbal Communication & Fluency Training",
            "requirement": "Achieve a speech confidence/fluency score of 75% or higher inside the AI Speech Coach."
        },
        "mock_interview": {
            "eligible": interview_eligible,
            "score": interview_score,
            "title": "Mock Interview Completion Certificate",
            "skill": "10-Level Mock Placement Program - Intermediate Stage",
            "requirement": "Pass Level 5 (or higher) in AI Interviews with a score of 75% or higher."
        },
        "coding_interview": {
            "eligible": coding_eligible,
            "score": coding_score,
            "title": "Coding Interview Completion Certificate",
            "skill": "AI-Grade Project Code Audit & Sandbox Execution",
            "requirement": "Achieve a project audit or coding readiness rating of 75% or higher."
        },
        "placement_ready": {
            "eligible": placement_eligible,
            "score": placement_score,
            "title": "Placement Ready Certificate",
            "skill": "Placement Readiness Program",
            "requirement": "Unlock all four foundational AI preparation certificates (Resume, Speech, Mock Interview, and Coding)."
        },
        "career_readiness": {
            "eligible": career_eligible,
            "score": career_score,
            "title": "AI Career Readiness Certificate",
            "skill": "AI Career Readiness & Profile Orchestration",
            "requirement": "Achieve an overall Career Health Score of 85% or higher on your dashboard."
        }
    }

@router.get("/", response_model=List[dict])
def get_user_certificates(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    milestones = evaluate_milestones(current_user, db)
    existing_certs = db.query(models.Certificate).filter(models.Certificate.user_id == current_user.id).all()
    existing_map = {c.type: c for c in existing_certs}

    results = []
    # Loop over types and auto-generate if eligible but doesn't exist yet
    for c_type, m_info in milestones.items():
        cert_record = existing_map.get(c_type)
        
        # Auto-issue if eligible but not in DB
        if m_info["eligible"] and not cert_record:
            cert_id = generate_certificate_id(c_type)
            new_cert = models.Certificate(
                id=cert_id,
                user_id=current_user.id,
                title=m_info["title"],
                type=c_type,
                skill_completed=m_info["skill"],
                issue_date=datetime.utcnow(),
                completion_score=m_info["score"],
                status="valid",
                verification_url=f"/verify-certificate/{cert_id}"
            )
            db.add(new_cert)
            db.commit()
            db.refresh(new_cert)
            cert_record = new_cert

        results.append({
            "type": c_type,
            "title": m_info["title"],
            "skill_completed": m_info["skill"],
            "requirement": m_info["requirement"],
            "eligible": m_info["eligible"],
            "is_unlocked": cert_record is not None,
            "certificate_id": cert_record.id if cert_record else None,
            "issue_date": cert_record.issue_date if cert_record else None,
            "completion_score": cert_record.completion_score if cert_record else m_info["score"],
            "status": cert_record.status if cert_record else "locked",
            "verification_url": cert_record.verification_url if cert_record else None
        })

    return results

@router.post("/claim/{cert_type}", response_model=schemas.CertificateOut)
def claim_certificate(
    cert_type: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    milestones = evaluate_milestones(current_user, db)
    m_info = milestones.get(cert_type)
    if not m_info:
        raise HTTPException(status_code=400, detail="Invalid certificate type.")
    
    if not m_info["eligible"]:
        raise HTTPException(status_code=400, detail="You do not meet the milestone criteria to claim this certificate.")

    # Check if already exists
    existing = db.query(models.Certificate).filter(
        models.Certificate.user_id == current_user.id,
        models.Certificate.type == cert_type
    ).first()

    if existing:
        return existing

    cert_id = generate_certificate_id(cert_type)
    new_cert = models.Certificate(
        id=cert_id,
        user_id=current_user.id,
        title=m_info["title"],
        type=cert_type,
        skill_completed=m_info["skill"],
        issue_date=datetime.utcnow(),
        completion_score=m_info["score"],
        status="valid",
        verification_url=f"/verify-certificate/{cert_id}"
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.get("/verify/{certificate_id}", response_model=schemas.CertificateVerifyOut)
def verify_certificate(
    certificate_id: str,
    db: Session = Depends(database.get_db)
):
    cert = db.query(models.Certificate).filter(models.Certificate.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate validation record not found.")

    student = db.query(models.User).filter(models.User.id == cert.user_id).first()
    student_name = student.full_name if student else "Unknown Candidate"

    return {
        "id": cert.id,
        "student_name": student_name,
        "title": cert.title,
        "skill_completed": cert.skill_completed,
        "issue_date": cert.issue_date,
        "completion_score": cert.completion_score,
        "status": cert.status,
        "verification_url": cert.verification_url
    }

@router.get("/admin/list", response_model=List[schemas.CertificateOut])
def admin_list_certificates(
    current_user: models.User = Depends(verify_user_role(["admin"])),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Certificate).all()

@router.post("/admin/revoke/{certificate_id}", response_model=schemas.CertificateOut)
def admin_revoke_certificate(
    certificate_id: str,
    current_user: models.User = Depends(verify_user_role(["admin"])),
    db: Session = Depends(database.get_db)
):
    cert = db.query(models.Certificate).filter(models.Certificate.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate validation record not found.")
    
    cert.status = "revoked"
    db.commit()
    db.refresh(cert)
    return cert
