from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[schemas.JobAlertOut])
def get_alerts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    alerts = db.query(models.JobAlert).filter(models.JobAlert.user_id == current_user.id).order_by(models.JobAlert.id.desc()).all()
    # Seed default alerts if empty
    if not alerts:
        seeds = [
            models.JobAlert(user_id=current_user.id, title="New High Match Job Posted", message="Google just posted a new 'AI Software Engineer' role that matches 92% of your resume skills! Check matching list.", read=False),
            models.JobAlert(user_id=current_user.id, title="Salary Increase Alert", message="Market average salary for 'Data Analyst' positions increased by 8% in Bangalore area.", read=False),
            models.JobAlert(user_id=current_user.id, title="Profile Audit Complete", message="Your GitHub developer score was evaluated at 85/100. Check suggestions to improve.", read=True)
        ]
        db.bulk_save_objects(seeds)
        db.commit()
        alerts = db.query(models.JobAlert).filter(models.JobAlert.user_id == current_user.id).order_by(models.JobAlert.id.desc()).all()
    return alerts

@router.post("/read/{alert_id}", response_model=dict)
def mark_read(
    alert_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    alert = db.query(models.JobAlert).filter(
        models.JobAlert.id == alert_id, 
        models.JobAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.read = True
    db.commit()
    return {"message": "Alert marked as read."}
