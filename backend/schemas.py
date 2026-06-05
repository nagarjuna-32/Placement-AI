from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Authentication schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "student"
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    subscription_tier: str
    streak: int
    xp: int
    career_health_score: int
    referral_code: Optional[str] = None
    referred_by: Optional[str] = None
    portfolio_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None

# Resume schemas
class ResumeOut(BaseModel):
    id: int
    user_id: int
    filename: str
    ats_score: int
    quality_score: int
    grammar_report: Optional[str] = None
    extracted_skills: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    projects_analysis: Optional[List[Dict[str, Any]]] = []
    missing_keywords: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []

    class Config:
        from_attributes = True

# Job schemas
class JobMatchOut(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    mode: Optional[str] = None
    salary: Optional[str] = None
    required_skills: Optional[List[str]] = []
    match_score: int
    missing_skills: Optional[List[str]] = []
    why_matches: Optional[str] = None
    apply_url: Optional[str] = None

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    mode: Optional[str] = None
    salary: Optional[str] = None
    required_skills: List[str]

# Interview schemas
class InterviewCreate(BaseModel):
    level: int
    score: int
    feedback: Optional[str] = None
    video_analysis: Optional[Dict[str, Any]] = None
    communication_metrics: Optional[Dict[str, Any]] = None

class InterviewOut(BaseModel):
    id: int
    user_id: int
    level: int
    score: int
    feedback: Optional[str] = None
    video_analysis: Optional[Dict[str, Any]] = None
    communication_metrics: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Roadmap schemas
class RoadmapOut(BaseModel):
    id: int
    user_id: int
    target_role: str
    schedule: Optional[List[Dict[str, Any]]] = None
    skill_gaps: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Job Application schemas (NEW)
class JobApplicationCreate(BaseModel):
    company: str
    position: str
    status: str
    applied_date: Optional[str] = None
    salary_expectation: Optional[str] = None
    interview_date: Optional[str] = None

class JobApplicationOut(BaseModel):
    id: int
    user_id: int
    company: str
    position: str
    status: str
    applied_date: Optional[str] = None
    salary_expectation: Optional[str] = None
    interview_date: Optional[str] = None

    class Config:
        from_attributes = True

# GitHub Analysis schemas (NEW)
class GithubAnalysisOut(BaseModel):
    id: int
    user_id: int
    developer_score: int
    project_score: int
    readiness_score: int
    repo_count: int
    commits_chart: Optional[List[Dict[str, Any]]] = None
    programming_languages: Optional[Dict[str, float]] = None
    improvements: Optional[List[str]] = None

    class Config:
        from_attributes = True

# LinkedIn Optimization schemas (NEW)
class LinkedinOptimizationOut(BaseModel):
    id: int
    user_id: int
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills_suggestions: Optional[List[str]] = None
    experience_critique: Optional[List[str]] = None

    class Config:
        from_attributes = True

# Job Alert schemas (NEW)
class JobAlertOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Branding Helper schemas (NEW)
class BrandingRequest(BaseModel):
    role: str
    topic: str

class BrandingResponse(BaseModel):
    post_content: str
    professional_bio: str

# Certificate schemas
class CertificateOut(BaseModel):
    id: str
    user_id: int
    title: str
    type: str
    skill_completed: str
    issue_date: datetime
    completion_score: int
    status: str
    verification_url: str

    class Config:
        from_attributes = True

class CertificateVerifyOut(BaseModel):
    id: str
    student_name: str
    title: str
    skill_completed: str
    issue_date: datetime
    completion_score: int
    status: str
    verification_url: str

class CertificateClaim(BaseModel):
    type: str

# Adaptive Interview schemas
class AdaptiveAnswerInput(BaseModel):
    question: str
    answer: str
    speech_duration: Optional[float] = None
    filler_count: Optional[int] = None
    clarity_score: Optional[float] = None
    hesitation_detected: Optional[bool] = None

class AdaptiveState(BaseModel):
    difficulty: str  # easy, medium, hard, expert
    current_topic: str
    topics_asked: List[str]
    consecutive_correct: int
    consecutive_wrong: int
    scores: Dict[str, float]

class AdaptiveNextRequest(BaseModel):
    target_role: str
    history: List[AdaptiveAnswerInput]
    current_state: AdaptiveState

class AdaptiveReport(BaseModel):
    technical_score: int
    communication_score: int
    confidence_score: int
    problem_solving_score: int
    project_score: int
    strong_areas: List[str]
    moderate_areas: List[str]
    weak_areas: List[str]
    behavior_analysis: str
    topics_to_revise: List[str]
    recommended_projects: List[str]
    practice_questions: List[str]
    readiness_score: int

class AdaptiveNextResponse(BaseModel):
    next_question: Optional[str] = None
    is_finished: bool
    updated_state: AdaptiveState
    report: Optional[AdaptiveReport] = None
