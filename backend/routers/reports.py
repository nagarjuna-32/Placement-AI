from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import models, database
from routers.auth import get_current_user
from utils.pdf_generator import (
    generate_resume_report_pdf,
    generate_interview_report_pdf,
    generate_communication_report_pdf,
    generate_readiness_report_pdf
)

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/resume/{resume_id}")
def download_resume_report(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id,
        models.Resume.is_deleted == False
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")
        
    pdf_bytes = generate_resume_report_pdf(resume)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=PlaceMate_Resume_{resume_id}_Report.pdf"}
    )

@router.get("/interview/{attempt_id}")
def download_interview_report(
    attempt_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    attempt = db.query(models.InterviewAttempt).filter(
        models.InterviewAttempt.id == attempt_id,
        models.InterviewAttempt.user_id == current_user.id,
        models.InterviewAttempt.is_deleted == False
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Interview attempt not found.")
        
    pdf_bytes = generate_interview_report_pdf(attempt)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=PlaceMate_Interview_{attempt_id}_Report.pdf"}
    )

@router.get("/communication/{attempt_id}")
def download_communication_report(
    attempt_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    attempt = db.query(models.InterviewAttempt).filter(
        models.InterviewAttempt.id == attempt_id,
        models.InterviewAttempt.user_id == current_user.id,
        models.InterviewAttempt.is_deleted == False
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Interview attempt not found.")
        
    pdf_bytes = generate_communication_report_pdf(attempt)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=PlaceMate_Communication_{attempt_id}_Report.pdf"}
    )

@router.get("/readiness")
def download_readiness_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id,
        models.Resume.is_deleted == False
    ).order_by(models.Resume.id.desc()).first()
    
    latest_interview = db.query(models.InterviewAttempt).filter(
        models.InterviewAttempt.user_id == current_user.id,
        models.InterviewAttempt.is_deleted == False
    ).order_by(models.InterviewAttempt.id.desc()).first()
    
    pdf_bytes = generate_readiness_report_pdf(current_user, latest_resume, latest_interview)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=PlaceMate_Readiness_Report.pdf"}
    )
