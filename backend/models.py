import json
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")  # student, recruiter, admin
    subscription_tier = Column(String, default="free")  # free, basic, pro, premium
    streak = Column(Integer, default=0)
    xp = Column(Integer, default=0)
    
    # Career OS Additions
    career_health_score = Column(Integer, default=70)
    referral_code = Column(String, unique=True, nullable=True)
    referred_by = Column(String, nullable=True)
    portfolio_data = Column(JSON, nullable=True)
    
    # Production Auth & Soft-Delete Fields
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewAttempt", back_populates="user", cascade="all, delete-orphan")
    subscription_usage = relationship("SubscriptionUsage", back_populates="user", uselist=False, cascade="all, delete-orphan")
    payment_logs = relationship("PaymentLog", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("UserRoadmap", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    github_analyses = relationship("GithubAnalysis", back_populates="user", cascade="all, delete-orphan")
    linkedin_optimizations = relationship("LinkedinOptimization", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("JobAlert", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    ats_score = Column(Integer, default=0)
    quality_score = Column(Integer, default=0)
    grammar_report = Column(Text, nullable=True)
    extracted_skills = Column(JSON, nullable=True)  # List of skills
    certifications = Column(JSON, nullable=True)
    projects_analysis = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="resumes")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    type = Column(String, nullable=True)  # internship, fresher, full-time
    mode = Column(String, nullable=True)  # remote, hybrid, onsite
    salary = Column(String, nullable=True)
    required_skills = Column(JSON, nullable=True)
    match_score = Column(Integer, default=0)
    missing_skills = Column(JSON, nullable=True)
    why_matches = Column(Text, nullable=True)
    apply_url = Column(String, nullable=True)

class InterviewAttempt(Base):
    __tablename__ = "interview_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level = Column(Integer, nullable=False)
    score = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    video_analysis = Column(JSON, nullable=True)       # expressions, eye contact, etc.
    communication_metrics = Column(JSON, nullable=True) # speed, filler words, pronunciation, confidence
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="interviews")

class UserRoadmap(Base):
    __tablename__ = "user_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    schedule = Column(JSON, nullable=True)             # Monthly breakdown
    skill_gaps = Column(JSON, nullable=True)           # Current match % and missing skills

    user = relationship("User", back_populates="roadmaps")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    status = Column(String, default="applied")  # applied, under_review, assessment, interview, selected, rejected
    applied_date = Column(String, nullable=True)
    salary_expectation = Column(String, nullable=True)
    interview_date = Column(String, nullable=True)

    user = relationship("User", back_populates="applications")

class GithubAnalysis(Base):
    __tablename__ = "github_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    developer_score = Column(Integer, default=0)
    project_score = Column(Integer, default=0)
    readiness_score = Column(Integer, default=0)
    repo_count = Column(Integer, default=0)
    commits_chart = Column(JSON, nullable=True)        # Array of weekly commit counts
    programming_languages = Column(JSON, nullable=True) # Dict of languages -> percentage
    improvements = Column(JSON, nullable=True)         # List of strings

    user = relationship("User", back_populates="github_analyses")

class LinkedinOptimization(Base):
    __tablename__ = "linkedin_optimizations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    headline = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    skills_suggestions = Column(JSON, nullable=True)
    experience_critique = Column(JSON, nullable=True)

    user = relationship("User", back_populates="linkedin_optimizations")

class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    skill_completed = Column(String, nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    completion_score = Column(Integer, default=0)
    status = Column(String, default="valid")
    verification_url = Column(String, nullable=False)

    user = relationship("User", back_populates="certificates")

class SubscriptionUsage(Base):
    __tablename__ = "subscription_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    resume_analyses_used = Column(Integer, default=0)
    interviews_used = Column(Integer, default=0)
    gd_used = Column(Integer, default=0)
    
    resume_analyses_limit = Column(Integer, default=3)
    interviews_limit = Column(Integer, default=3)
    gd_limit = Column(Integer, default=3)
    
    expiry_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="subscription_usage")

class PaymentLog(Base):
    __tablename__ = "payment_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(String, nullable=False, index=True)
    payment_id = Column(String, nullable=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="created")  # created, captured, failed
    plan_tier = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payment_logs")

class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_name = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")
