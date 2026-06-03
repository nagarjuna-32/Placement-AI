from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/hr-panel", tags=["hr-panel"])

@router.get("/questions", response_model=dict)
def get_panel_questions():
    return {
        "panel_members": [
            {"name": "Dinesh Kumar", "role": "Technical Lead", "focus": "System Design & Algorithms"},
            {"name": "Elena Rostova", "role": "Project Manager", "focus": "Agile Delivery & Conflict Resolution"},
            {"name": "Sarah Jenkins", "role": "HR Manager", "focus": "Culture Fit & Salary Alignment"}
        ],
        "questions": [
            {
                "interviewer": "Dinesh Kumar (Tech Lead)",
                "question": "How would you design a caching strategy for a microservice backend serving 50,000 requests per minute? When would you invalidate keys?"
            },
            {
                "interviewer": "Elena Rostova (Project Manager)",
                "question": "Describe a scenario where a critical client requirement changed 2 days before deployment. How did you coordinate with your team?"
            },
            {
                "interviewer": "Sarah Jenkins (HR Manager)",
                "question": "Why do you want to transition from your current position? What are your salary expectations for this role?"
            }
        ]
    }

@router.post("/submit", response_model=dict)
def submit_panel_responses(
    responses: dict, # {"answers": ["ans1", "ans2", "ans3"]}
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    ans_list = responses.get("answers", [])
    if len(ans_list) < 3:
        raise HTTPException(status_code=400, detail="Must submit answers for all 3 panel questions.")
    
    # Generate interactive reviews from each panel member
    tech_feedback = (
        "Technical answer shows foundational key concepts (Redis cache, caching limits). "
        "However, could detail key expiration parameters and eviction policies (like LRU) more clearly."
    )
    
    pm_feedback = (
        "Agile coordination response was excellent. Highlighting sprint retro adjustments "
        "and task isolation demonstrates good team communication skills."
    )
    
    hr_feedback = (
        "Spoke with confidence. Standard career trajectory aligns with our teams. "
        "Filler words count was low. Cultural fit is highly recommended."
    )
    
    # Calculate average panel score
    tech_score = 82
    pm_score = 88
    hr_score = 85
    overall_score = (tech_score + pm_score + hr_score) // 3
    
    decision = "Hire" if (overall_score >= 80) else "Hold"

    # Increase User XP for completing HR Mock panel
    current_user.xp += 300
    db.commit()

    return {
        "overall_score": overall_score,
        "panel_reviews": [
            {"interviewer": "Dinesh Kumar (Tech Lead)", "score": tech_score, "feedback": tech_feedback},
            {"interviewer": "Elena Rostova (Project Manager)", "score": pm_score, "feedback": pm_feedback},
            {"interviewer": "Sarah Jenkins (HR Manager)", "score": hr_score, "feedback": hr_feedback}
        ],
        "consolidated_decision": decision,
        "hiring_status_tag": "Strong Candidate - Direct Shortlist Recommendation"
    }
