from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/tracker", tags=["tracker"])

@router.get("/applications", response_model=List[schemas.JobApplicationOut])
def get_applications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    apps = db.query(models.JobApplication).filter(models.JobApplication.user_id == current_user.id).all()
    # If empty, let's insert standard seed tracking data for immediate feedback
    if not apps:
        seeds = [
            models.JobApplication(user_id=current_user.id, company="Google", position="AI Engineer", status="applied", applied_date="2026-06-01", salary_expectation="₹28L"),
            models.JobApplication(user_id=current_user.id, company="Nvidia", position="ML Specialist", status="interview", applied_date="2026-05-20", salary_expectation="₹32L", interview_date="2026-06-10"),
            models.JobApplication(user_id=current_user.id, company="Razorpay", position="FastAPI Dev", status="assessment", applied_date="2026-05-28", salary_expectation="₹15L"),
            models.JobApplication(user_id=current_user.id, company="Zomato", position="Web Developer", status="rejected", applied_date="2026-05-15", salary_expectation="₹12L")
        ]
        db.bulk_save_objects(seeds)
        db.commit()
        apps = db.query(models.JobApplication).filter(models.JobApplication.user_id == current_user.id).all()
    return apps

@router.post("/applications", response_model=schemas.JobApplicationOut)
def create_application(
    app_in: schemas.JobApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    new_app = models.JobApplication(
        user_id=current_user.id,
        company=app_in.company,
        position=app_in.position,
        status=app_in.status,
        applied_date=app_in.applied_date or "2026-06-02",
        salary_expectation=app_in.salary_expectation,
        interview_date=app_in.interview_date
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.put("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def update_application(
    app_id: int,
    app_in: schemas.JobApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    app = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id, 
        models.JobApplication.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    
    app.company = app_in.company
    app.position = app_in.position
    app.status = app_in.status
    app.applied_date = app_in.applied_date
    app.salary_expectation = app_in.salary_expectation
    app.interview_date = app_in.interview_date

    db.commit()
    db.refresh(app)
    return app

@router.delete("/applications/{app_id}", response_model=dict)
def delete_application(
    app_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    app = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id, 
        models.JobApplication.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    db.delete(app)
    db.commit()
    return {"message": "Application deleted."}

@router.get("/stats", response_model=dict)
def get_application_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    apps = db.query(models.JobApplication).filter(models.JobApplication.user_id == current_user.id).all()
    if not apps:
        return {"total_applications": 0, "success_rate": 0, "active_interviews": 0, "offers_received": 0}
        
    total = len(apps)
    offers = len([a for a in apps if a.status == "selected"])
    interviews = len([a for a in apps if a.status == "interview" or a.status == "assessment"])
    rejected = len([a for a in apps if a.status == "rejected"])
    
    # Simple success rate metric = selected / total active or closed apps (excluding current applied)
    closed_apps = len([a for a in apps if a.status in ["selected", "rejected"]])
    success_rate = int((offers / closed_apps) * 100) if closed_apps > 0 else 0

    return {
        "total_applications": total,
        "success_rate": success_rate,
        "active_interviews": interviews,
        "offers_received": offers
    }
