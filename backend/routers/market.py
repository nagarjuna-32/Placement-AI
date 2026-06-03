from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import models, schemas

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/trends", response_model=dict)
def get_market_trends():
    return {
        "demanded_skills": [
            {"skill": "Artificial Intelligence (LLMs, PyTorch)", "demand_index": 98, "growth": "+22% YoY"},
            {"skill": "Cloud Engineering (AWS, Kubernetes)", "demand_index": 92, "growth": "+15% YoY"},
            {"skill": "Data Engineering (Spark, Airflow)", "demand_index": 89, "growth": "+18% YoY"},
            {"skill": "Cybersecurity & OAuth protocols", "demand_index": 85, "growth": "+12% YoY"},
            {"skill": "TypeScript / Next.js", "demand_index": 82, "growth": "+10% YoY"}
        ],
        "fastest_growing_roles": [
            {"title": "Generative AI Engineer", "growth_rate": "145% Growth", "avg_salary": "₹18L - ₹32L"},
            {"title": "MLES / Platform Architect", "growth_rate": "88% Growth", "avg_salary": "₹22L - ₹36L"},
            {"title": "Cloud Solutions Developer", "growth_rate": "65% Growth", "avg_salary": "₹14L - ₹24L"},
            {"title": "Fullstack Developer (Next.js)", "growth_rate": "42% Growth", "avg_salary": "₹10L - ₹18L"}
        ],
        "top_hiring_companies": [
            "Google", "NVIDIA", "Razorpay", "Zomato", "Microsoft", "TCS"
        ]
    }

@router.post("/predict-salary", response_model=dict)
def predict_salary(req: dict): # {"role": "", "experience": 0, "location": "", "skills": []}
    role = req.get("role", "AI Software Engineer").lower()
    exp = req.get("experience", 0)
    loc = req.get("location", "Remote").lower()
    skills = req.get("skills", [])
    
    # Calculate base expected salary (in Lakhs INR)
    base = 6.0
    if "ai" in role or "machine learning" in role:
        base = 12.0
    elif "backend" in role or "python" in role:
        base = 8.0
        
    # Experience modifier
    exp_modifier = exp * 2.5
    
    # Skills modifier
    skill_modifier = len(skills) * 0.8
    if any(s.lower() in ["pytorch", "aws", "docker", "kubernetes", "system design"] for s in skills):
        skill_modifier += 3.0
        
    # Location modifier
    loc_modifier = 1.0
    if "bangalore" in loc or "remote" in loc:
        loc_modifier = 1.25
    elif "mumbai" in loc or "gurugram" in loc:
        loc_modifier = 1.15
        
    min_est = round((base + exp_modifier + skill_modifier) * loc_modifier, 1)
    max_est = round(min_est * 1.4, 1)
    market_avg = round((min_est + max_est) / 2.0, 1)
    
    return {
        "expected_salary_range": f"₹{min_est}L - ₹{max_est}L",
        "market_average": f"₹{market_avg}L",
        "growth_potential": "High" if (min_est > 15) else "Moderate",
        "factors": [
            f"Role multiplier applied for {role.capitalize()}.",
            f"Experience weight calculated for {exp} years.",
            f"Location premium evaluated for {loc.capitalize()} area."
        ]
    }
