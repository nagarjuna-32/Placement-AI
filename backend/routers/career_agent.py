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
