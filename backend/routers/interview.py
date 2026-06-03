from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])

# Hardcoded level questions for demonstration
LEVEL_QUESTIONS = {
    1: {
        "title": "Self Introduction",
        "intro": "Tell me about yourself, your educational background, and your career goals.",
        "questions": ["Can you introduce yourself in 2 minutes?", "Why did you choose this field?", "What are your primary interests outside of engineering?"]
    },
    2: {
        "title": "Communication Round",
        "intro": "Speak clearly and confidently on a general topic to assess fluency and articulation.",
        "questions": ["How do you explain a complex technical concept to a non-technical manager?", "Describe a time you convinced a teammate to accept your idea.", "Why is active listening important in engineering?"]
    },
    3: {
        "title": "HR Interview",
        "intro": "Standard behavioral questions mapping cultural fit and conflict resolution.",
        "questions": ["What is your greatest weakness and how are you working on it?", "Where do you see yourself in 5 years?", "Why should we hire you over other candidates?"]
    },
    4: {
        "title": "Aptitude Round",
        "intro": "Logical, analytical, and math reasoning queries.",
        "questions": [
            "A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.",
            "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
            "Explain the difference between inductive and deductive reasoning."
        ]
    },
    5: {
        "title": "Technical Fundamentals",
        "intro": "Core computer science questions covering OOP, Databases, OS, and Networks.",
        "questions": [
            "What is the difference between an abstract class and an interface?",
            "Explain SQL Joins and the difference between LEFT JOIN and INNER JOIN.",
            "How does memory virtualisation or paging work in modern Operating Systems?"
        ]
    },
    6: {
        "title": "Project Viva",
        "intro": "Detailed breakdown of the projects on your resume.",
        "questions": [
            "Walk me through the system architecture of your primary project.",
            "What was the most challenging bug you encountered in your projects, and how did you solve it?",
            "If you had to re-architect your application to serve 10x traffic, what bottlenecks would you target first?"
        ]
    },
    7: {
        "title": "Coding Interview",
        "intro": "Data structures and algorithm challenges.",
        "questions": [
            "Explain how to detect a loop in a singly linked list. What is the time complexity?",
            "Write a function to check if two strings are anagrams of each other.",
            "Explain the difference between DFS and BFS traversal. When would you use which?"
        ]
    },
    8: {
        "title": "Company Specific Interview",
        "intro": "Specialized questions simulating assessments from top tier companies (Google, Amazon, etc.).",
        "questions": [
            "Design a URL shortening service like Bitly. How do you handle scalability and high availability?",
            "How does Google Search handle indexing and ranking at a high level?",
            "Explain the MapReduce paradigm and how it handles distributed computations."
        ]
    },
    9: {
        "title": "Stress Interview",
        "intro": "High-pressure, fast-paced questions checking emotional intelligence and composure under stress.",
        "questions": [
            "You just found a critical security bug in production, and your manager is blames you publicly. What do you do?",
            "If we offer you this job, but you find out your salary is 20% lower than your peers, will you stay?",
            "What would you do if your project is cancelled after working on it for 6 months?"
        ]
    },
    10: {
        "title": "Complete Placement Simulation",
        "intro": "Full-length mock simulation blending HR, Technical, and Behavioral assessments.",
        "questions": [
            "Tell me about a time you led a team under a tight deadline and delivered successfully.",
            "Write code to find the longest palindromic substring in a string, and explain its complexity.",
            "Explain why you are the best fit for our company, and what unique value you bring."
        ]
    }
}

@router.get("/questions/{level}", response_model=dict)
def get_questions(level: int):
    if level not in LEVEL_QUESTIONS:
        raise HTTPException(status_code=404, detail="Level not found. Choose between 1 and 10.")
    return LEVEL_QUESTIONS[level]

@router.post("/submit", response_model=schemas.InterviewOut)
def submit_attempt(
    attempt: schemas.InterviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Save the interview attempt
    new_attempt = models.InterviewAttempt(
        user_id=current_user.id,
        level=attempt.level,
        score=attempt.score,
        feedback=attempt.feedback or "Great attempt. Your communication flow was clear, though minor technical details could be elaborated.",
        video_analysis=attempt.video_analysis or {
            "eye_contact": 85,
            "smile_frequency": 60,
            "posture": 90,
            "nervousness": 15,
            "expressions": "Confident & Professional"
        },
        communication_metrics=attempt.communication_metrics or {
            "fluency": 82,
            "speaking_speed": 130, # words per minute
            "filler_words": ["um", "like"],
            "pronunciation": 88,
            "grammar": 90
        }
    )
    
    # Check levels and update user progression
    # Awards XP
    current_user.xp += 100 * attempt.level
    current_user.streak += 1
    
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    return new_attempt

@router.get("/history", response_model=List[schemas.InterviewOut])
def get_interview_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    attempts = db.query(models.InterviewAttempt).filter(models.InterviewAttempt.user_id == current_user.id).order_by(models.InterviewAttempt.id.desc()).all()
    return attempts
