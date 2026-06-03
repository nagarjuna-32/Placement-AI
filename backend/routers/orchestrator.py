from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import models, database
from routers.auth import get_current_user
from agents.orchestrator import MasterOrchestrator

router = APIRouter(prefix="/orchestrator", tags=["orchestrator"])
orchestrator = MasterOrchestrator()

@router.post("/dispatch")
def dispatch_orchestration(
    req: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    request_type = req.get("request_type")
    payload = req.get("payload", {})
    
    if not request_type:
        raise HTTPException(status_code=400, detail="Missing request_type parameter in payload.")
        
    try:
        res = orchestrator.dispatch(db, current_user.id, request_type, payload)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failure: {str(e)}")
