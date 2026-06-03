from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(tags=["github-linkedin"])

@router.post("/github/analyze", response_model=schemas.GithubAnalysisOut)
def analyze_github(
    profile_url: dict, # JSON: {"url": "github.com/username"}
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    url = profile_url.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="Valid GitHub profile URL or username required.")
    
    # Extract username for mock diversity
    username = url.split("/")[-1] or "developer"
    
    # Generate high quality mock analysis data
    languages = {
        "Python": 55.0,
        "TypeScript": 25.0,
        "JavaScript": 15.0,
        "HTML/CSS": 5.0
    }
    
    commits = [
        {"week": "Week 1", "commits": 12},
        {"week": "Week 2", "commits": 24},
        {"week": "Week 3", "commits": 18},
        {"week": "Week 4", "commits": 30},
        {"week": "Week 5", "commits": 42},
        {"week": "Week 6", "commits": 35}
    ]
    
    dev_score = 85
    proj_score = 80
    readiness = int((dev_score * 0.6) + (proj_score * 0.4))
    
    analysis = models.GithubAnalysis(
        user_id=current_user.id,
        developer_score=dev_score,
        project_score=proj_score,
        readiness_score=readiness,
        repo_count=18,
        commits_chart=commits,
        programming_languages=languages,
        improvements=[
            "Increase README details in your top 2 repository projects to include installation guidelines.",
            "Integrate automated testing (GitHub Actions workflows) to showcase CI/CD practices.",
            "Consolidate small commits into structured pull requests with clear descriptions."
        ]
    )

    # Award XP for profile audits
    current_user.xp += 100
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

@router.post("/linkedin/optimize", response_model=schemas.LinkedinOptimizationOut)
def optimize_linkedin(
    profile_data: dict, # {"headline": "", "summary": ""}
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    headline = profile_data.get("headline", "")
    summary = profile_data.get("summary", "")
    
    optimized_headline = (
        "Software Engineer | FastAPI & Next.js Developer | Generative AI & Microservices Specialist"
    )
    
    optimized_summary = (
        "Detail-oriented Software Engineer specializing in scalable API services and dynamic frontends. "
        "Proficient in Python (FastAPI, PyTorch), JavaScript/TypeScript (React, Next.js), and database schemas. "
        "Experienced in deploying Dockerized cloud services and setting up CI/CD automation pipelines. "
        "Passionate about optimizing codebase execution metrics and building clean solutions."
    )
    
    opt = models.LinkedinOptimization(
        user_id=current_user.id,
        headline=optimized_headline,
        summary=optimized_summary,
        skills_suggestions=[
            "Generative AI",
            "FastAPI (Web Framework)",
            "System Design",
            "Docker Containers"
        ],
        experience_critique=[
            "Rewrite previous job descriptions using standard 'Action Verb + Metric + Outcome' format.",
            "List specific tech stacks under each experience entry to pass ATS keyword checks."
        ]
    )

    current_user.xp += 100
    db.add(opt)
    db.commit()
    db.refresh(opt)
    return opt
