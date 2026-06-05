from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/career-agent", tags=["career-agent"])

@router.get("/recommendations", response_model=dict)
def get_agent_recommendations(
    role: str = "AI Software Engineer",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    role_lower = role.lower()
    if "data" in role_lower or "analyst" in role_lower:
        courses = [
            {"title": "Google Data Analytics Professional Certificate", "platform": "Coursera", "duration": "3 Months", "url": "https://coursera.org"},
            {"title": "Data Science MicroMasters Program", "platform": "edX", "duration": "6 Months", "url": "https://edx.org"}
        ]
        videos = [
            {"title": "SQL for Data Analysis Tutorial", "channel": "freeCodeCamp.org", "duration": "4 Hours", "url": "https://youtube.com"},
            {"title": "Python Pandas Data Science Crash Course", "channel": "Keith Galli", "duration": "2 Hours", "url": "https://youtube.com"}
        ]
        certs = [
            "Tableau Desktop Certified Associate",
            "Microsoft Certified: Power BI Data Analyst Associate"
        ]
    elif "frontend" in role_lower or "web" in role_lower or "react" in role_lower:
        courses = [
            {"title": "Meta Front-End Developer Professional Certificate", "platform": "Coursera", "duration": "4 Months", "url": "https://coursera.org"},
            {"title": "Next.js Dev-to-Prod Course", "platform": "Vercel Academy", "duration": "2 Weeks", "url": "https://nextjs.org"}
        ]
        videos = [
            {"title": "TypeScript Crash Course for Beginners", "channel": "Traversy Media", "duration": "1.5 Hours", "url": "https://youtube.com"},
            {"title": "Framer Motion React Animation Guide", "channel": "Net Ninja", "duration": "1 Hour", "url": "https://youtube.com"}
        ]
        certs = [
            "AWS Certified Developer - Associate",
            "W3Schools Front-End Certification"
        ]
    else:
        # Default AI / ML Software Engineer
        courses = [
            {"title": "Deep Learning Specialization", "platform": "Coursera (Andrew Ng)", "duration": "3 Months", "url": "https://coursera.org"},
            {"title": "AWS Certified Machine Learning - Specialty Course", "platform": "Udemy", "duration": "2 Months", "url": "https://udemy.com"}
        ]
        videos = [
            {"title": "PyTorch Tutorial for Deep Learning in Python", "channel": "Aladdin Persson", "duration": "6 Hours", "url": "https://youtube.com"},
            {"title": "FastAPI Web App Development Tutorial", "channel": "Coding with Rohan", "duration": "3 Hours", "url": "https://youtube.com"}
        ]
        certs = [
            "Google Professional Machine Learning Engineer",
            "AWS Certified Solutions Architect - Associate"
        ]

    # Increase User XP for career review
    current_user.xp += 50
    db.commit()

    return {
        "recommended_courses": courses,
        "recommended_videos": videos,
        "recommended_certifications": certs,
        "next_actions": [
            "Integrate these certifications into your resume and regenerate ATS scores.",
            "Complete Exercise 2 in Speech Coach to improve technical storytelling.",
            "Post a project breakdown on LinkedIn to enhance branding metrics."
        ]
    }

@router.post("/branding", response_model=schemas.BrandingResponse)
def generate_branding_content(
    req: schemas.BrandingRequest,
    current_user: models.User = Depends(get_current_user)
):
    post_content = (
        f"🚀 Excited to share my latest study sprint on #{req.topic.replace(' ', '')}! "
        f"I've been diving deep into backend pipelines, structural database schemas, and AI prompts architectures. "
        f"Building scalable systems requires a solid balance between runtime execution speeds and codebase readability.\n\n"
        f"As I focus on building my credentials as an aspiring {req.role}, I'm keen to connect with recruiters and engineering leaders working on next-gen tech. "
        f"Check out my profile or drop a comment! #CareerDevelopment #SoftwareEngineering #TechGrowth"
    )
    
    bio = (
        f"Aspiring {req.role} | Passionate about building high performance backends, "
        f"generative AI workflows, and SQL architectures. Certified in cloud-practicing parameters. "
        f"Open to junior developer roles."
    )
    
    return {
        "post_content": post_content,
        "professional_bio": bio
    }

@router.get("/networking", response_model=dict)
def get_networking_recommendations(
    role: str = "AI Software Engineer",
    current_user: models.User = Depends(get_current_user)
):
    return {
        "recruiters": [
            {"name": "Sarah Jenkins", "company": "Google Tech Recruiting", "role": "Senior Talent Acquisition", "linkedin": "https://linkedin.com"},
            {"name": "Rahul Verma", "company": "Razorpay HR Team", "role": "Lead Talent Partner", "linkedin": "https://linkedin.com"},
            {"name": "Amit Saxena", "company": "Nvidia Technical Recruitment", "role": "University Recruiter", "linkedin": "https://linkedin.com"}
        ],
        "hackathons": [
            {"name": "Smart India Hackathon 2026", "platform": "Unstop", "date": "July 12, 2026", "url": "https://unstop.com"},
            {"name": "Gemini Generative AI Hackathon", "platform": "Google Developers", "date": "June 25, 2026", "url": "https://devpost.com"},
            {"name": "Next.js Frontend Build Sprint", "platform": "Vercel Devs", "date": "June 30, 2026", "url": "https://devpost.com"}
        ],
        "events": [
            {"name": "AWS Cloud Day Bangalore", "type": "Conference", "date": "June 18, 2026"},
            {"name": "FastAPI Creator Webinar", "type": "Virtual Event", "date": "June 22, 2026"}
        ]
    }

@router.get("/coach-directive", response_model=schemas.CoachDirective)
def get_coach_directive(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Analyze previous interview attempts to find weak topics
    weak_topics = []
    attempts = db.query(models.InterviewAttempt).filter(models.InterviewAttempt.user_id == current_user.id).all()
    
    for attempt in attempts:
        # If user struggled (score < 75), inspect individual replay items if available
        if attempt.score < 75:
            if attempt.video_analysis and "replay" in attempt.video_analysis:
                for item in attempt.video_analysis["replay"]:
                    feedback = item.get("feedback", "").lower()
                    q = item.get("question", "").lower()
                    # Mark topic as weak if critique was negative
                    if "generic" in feedback or "brief" in feedback or "could add more detail" in feedback:
                        if "python" in q or "list" in q or "decorator" in q or "generator" in q:
                            weak_topics.append("Python Programming")
                        elif "sql" in q or "join" in q or "index" in q or "transaction" in q:
                            weak_topics.append("SQL Databases")
                        elif "model" in q or "regression" in q or "forest" in q or "overfit" in q:
                            weak_topics.append("Machine Learning")
                        elif "fastapi" in q or "async" in q or "depends" in q or "dependency" in q:
                            weak_topics.append("FastAPI Microservices")
                        elif "react" in q or "state" in q or "render" in q or "dom" in q or "next.js" in q:
                            weak_topics.append("React Frontend")
                        elif "project" in q or "architecture" in q or "scale" in q:
                            weak_topics.append("System Architecture & Design")
                            
    # Deduplicate weak topics
    weak_topics = list(dict.fromkeys(weak_topics))
    if not weak_topics:
        weak_topics = ["SQL Query Optimization", "System Architecture Scales"]
        
    # 2. Synthesize recommendations based on weak topics
    next_goals = []
    recommended_projects = []
    recommended_certs = []
    
    for wt in weak_topics:
        if wt == "SQL Databases" or wt == "SQL Query Optimization":
            next_goals.append("Master relational schema normalization, B-Tree indexing, and query plans.")
            recommended_projects.append("Write a high-performance transactional SQL ledger with Redis cache layer.")
            recommended_certs.append("Microsoft Certified: Power BI Data Analyst Associate")
        elif wt == "Python Programming":
            next_goals.append("Understand Python memory layouts, generators, closure mechanisms, and the GIL.")
            recommended_projects.append("Implement a custom asynchronous task runner from scratch using yield.")
            recommended_certs.append("HackerRank Problem Solving (Gold)")
        elif wt == "React Frontend":
            next_goals.append("Master React reconciliation, virtual DOM list rendering, and Next.js hydration loops.")
            recommended_projects.append("Develop a drag-and-drop workflow dashboard using Framer Motion.")
            recommended_certs.append("Meta Front-End Developer Professional Certificate")
        elif wt == "Machine Learning":
            next_goals.append("Study bias-variance tradeoffs, decision trees, and ensemble classifiers.")
            recommended_projects.append("Train and deploy a dynamic user churn prediction classifier in scikit-learn.")
            recommended_certs.append("Google Professional Machine Learning Engineer")
        elif wt == "FastAPI Microservices" or wt == "System Architecture & Design" or wt == "System Architecture Scales":
            next_goals.append("Understand API rate-limiting, token validation cycles, and ASGI concurrency.")
            recommended_projects.append("Design a distributed URL shortener service supporting 10k requests/min.")
            recommended_certs.append("AWS Certified Solutions Architect - Associate")
            
    # Guarantee at least 2 goals/projects/certs
    if len(next_goals) < 2:
        next_goals.extend(["Review advanced algorithm complexities.", "Complete weekly mock interviews."])
    if len(recommended_projects) < 2:
        recommended_projects.extend(["Create an online collaboration portal using WebSocket protocols."])
    if len(recommended_certs) < 2:
        recommended_certs.extend(["HackerRank Problem Solving (Gold)"])
        
    next_goals = list(dict.fromkeys(next_goals))[:3]
    recommended_projects = list(dict.fromkeys(recommended_projects))[:3]
    recommended_certs = list(dict.fromkeys(recommended_certs))[:3]
    
    # 3. Pull recommended jobs matching user skills
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    user_skills = resume.extracted_skills if (resume and resume.extracted_skills) else ["Python", "SQL", "FastAPI"]
    
    all_jobs = db.query(models.JobMatch).all()
    jobs_out = []
    
    for job in all_jobs:
        req_skills = job.required_skills or []
        common = set(user_skills).intersection(set(req_skills))
        match_score = int((len(common) / len(req_skills)) * 100) if req_skills else 70
        missing = list(set(req_skills) - set(user_skills))
        
        jobs_out.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "type": job.type,
            "mode": job.mode,
            "salary": job.salary,
            "required_skills": req_skills,
            "match_score": max(50, min(100, match_score)),
            "missing_skills": missing,
            "why_matches": f"Matches {len(common)} of your resume skills.",
            "apply_url": job.apply_url
        })
        
    jobs_out.sort(key=lambda x: x["match_score"], reverse=True)
    
    return schemas.CoachDirective(
        weak_topics=weak_topics,
        next_goals=next_goals,
        recommended_projects=recommended_projects,
        recommended_certs=recommended_certs,
        recommended_jobs=jobs_out[:3]
    )

