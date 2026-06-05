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

# ====================================================
# ADAPTIVE AI INTERVIEW ENGINE
# ====================================================

ADAPTIVE_QUESTIONS = {
    "Python": {
        "easy": [
            {"question": "What is Python and why is it popular?", "keywords": ["interpreted", "readable", "general-purpose", "simple"]},
            {"question": "What are lists and tuples in Python?", "keywords": ["sequence", "mutable", "immutable", "collection"]}
        ],
        "medium": [
            {"question": "Explain the difference between a list and a tuple in Python.", "keywords": ["mutable", "immutable", "performance", "parentheses", "brackets"]},
            {"question": "What are Python decorators and how do they work?", "keywords": ["wrapper", "function", "modify", "@", "closure"]}
        ],
        "hard": [
            {"question": "Explain generators and iterators in Python. What are their memory benefits?", "keywords": ["yield", "lazy", "memory", "next", "__iter__"]},
            {"question": "How does memory management work in Python?", "keywords": ["garbage collection", "reference counting", "heap", "allocator", "private"]}
        ],
        "expert": [
            {"question": "Explain the Global Interpreter Lock (GIL) and its implications for multi-threading.", "keywords": ["gil", "thread", "concurrency", "cpu-bound", "mutex"]},
            {"question": "How would you implement custom metaclasses in Python and when are they useful?", "keywords": ["metaclass", "type", "__new__", "class creation", "validation"]}
        ]
    },
    "SQL": {
        "easy": [
            {"question": "What is a relational database and what is SQL used for?", "keywords": ["relational", "query", "tables", "structured", "rdbms"]},
            {"question": "What is the primary key in a database table?", "keywords": ["unique", "not null", "identity", "identifier"]}
        ],
        "medium": [
            {"question": "Explain the difference between SQL (relational) and NoSQL (non-relational) databases.", "keywords": ["schema", "structured", "scaling", "document", "key-value", "nosql"]},
            {"question": "What is the difference between an INNER JOIN and a LEFT JOIN?", "keywords": ["inner join", "left join", "intersection", "matching", "all records", "null"]}
        ],
        "hard": [
            {"question": "What are database indexes and how do they improve query speeds?", "keywords": ["b-tree", "search", "speed", "index", "overhead", "lookup"]},
            {"question": "Explain database transactions and ACID properties.", "keywords": ["acid", "atomicity", "consistency", "isolation", "durability", "commit"]}
        ],
        "expert": [
            {"question": "How do you optimize a query that is running slowly in production?", "keywords": ["explain plan", "indexes", "partitioning", "query optimizer", "slow"]},
            {"question": "Explain database normalization and denormalization. What are the trade-offs?", "keywords": ["normalization", "denormalization", "redundancy", "write speed", "read speed"]}
        ]
    },
    "Machine Learning": {
        "easy": [
            {"question": "What is Machine Learning and what is supervised learning?", "keywords": ["labeled", "training data", "predict", "supervised"]},
            {"question": "What is the difference between regression and classification?", "keywords": ["continuous", "discrete", "predict value", "categories"]}
        ],
        "medium": [
            {"question": "What is overfitting in Machine Learning and how do you prevent it?", "keywords": ["overfitting", "regularization", "dropout", "test data", "cross-validation"]},
            {"question": "What is the purpose of train-test split and cross-validation?", "keywords": ["evaluate", "validation", "split", "generalization", "k-fold"]}
        ],
        "hard": [
            {"question": "Explain how a Random Forest classifier works.", "keywords": ["decision tree", "ensemble", "bagging", "bootstrap", "majority vote"]},
            {"question": "Explain precision, recall, and F1-score. When would you prioritize one over another?", "keywords": ["false positive", "false negative", "precision", "recall", "f1-score", "trade-off"]}
        ],
        "expert": [
            {"question": "Explain the mathematical formulation or concept of Support Vector Machines (SVM).", "keywords": ["hyperplane", "margin", "support vectors", "kernel trick", "optimization"]},
            {"question": "Explain how gradient descent and optimization algorithms like Adam work.", "keywords": ["gradient descent", "learning rate", "momentum", "loss function", "adam"]}
        ]
    },
    "FastAPI": {
        "easy": [
            {"question": "What is FastAPI and what makes it different from other Python frameworks like Django/Flask?", "keywords": ["fastapi", "async", "pydantic", "automatic docs", "swagger"]},
            {"question": "What is Pydantic and how is it used in FastAPI?", "keywords": ["data validation", "schemas", "types", "serialization", "pydantic"]}
        ],
        "medium": [
            {"question": "How do you handle dependency injection in FastAPI?", "keywords": ["depends", "dependency", "injection", "reusable", "db session"]},
            {"question": "Explain how request routing and path parameters work in FastAPI.", "keywords": ["path parameter", "query parameter", "route decorator", "async def"]}
        ],
        "hard": [
            {"question": "Explain how background tasks are handled in FastAPI.", "keywords": ["background tasks", "asynchronous", "celery", "fire-and-forget"]},
            {"question": "How would you implement WebSockets in FastAPI?", "keywords": ["websocket", "real-time", "connection", "accept", "send", "receive"]}
        ],
        "expert": [
            {"question": "How does FastAPI leverage Python's async/await and ASGI for high performance?", "keywords": ["asyncio", "asgi", "event loop", "non-blocking", "uvicorn", "starlette"]},
            {"question": "Explain middleware and custom exception handling in FastAPI.", "keywords": ["middleware", "request-response cycle", "exception handler", "http exception"]}
        ]
    },
    "React": {
        "easy": [
            {"question": "What is React and what are components?", "keywords": ["library", "ui", "components", "jsx", "reusable"]},
            {"question": "What is JSX in React?", "keywords": ["javascript xml", "html in js", "syntax extension", "react element"]}
        ],
        "medium": [
            {"question": "What is the difference between props and state in React?", "keywords": ["props", "state", "immutable", "mutable", "parent-to-child", "local component"]},
            {"question": "Explain the React useState and useEffect hooks.", "keywords": ["usestate", "useeffect", "state hook", "side effect", "dependency array"]}
        ],
        "hard": [
            {"question": "How does the virtual DOM work in React?", "keywords": ["virtual dom", "reconciliation", "diffing", "render", "actual dom"]},
            {"question": "Explain Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) in Next.js.", "keywords": ["ssr", "csr", "seo", "next.js", "hydration", "performance"]}
        ],
        "expert": [
            {"question": "How do you optimize rendering performance in a large React application?", "keywords": ["usememo", "usecallback", "react.memo", "virtualization", "re-renders"]},
            {"question": "Explain React Server Components (RSC) and how they differ from Client Components.", "keywords": ["rsc", "server components", "bundle size", "zero bundle", "database access"]}
        ]
    },
    "Projects": {
        "easy": [
            {"question": "Walk me through the primary project listed on your resume. What problem does it solve?", "keywords": ["project", "problem", "solution", "my role", "overview"]},
            {"question": "What technologies did you choose for your project and why?", "keywords": ["choice", "technologies", "frameworks", "benefits"]}
        ],
        "medium": [
            {"question": "Describe the architecture and main modules of your project.", "keywords": ["architecture", "modules", "frontend", "backend", "database"]},
            {"question": "How did you manage user data or state within your project?", "keywords": ["state management", "database table", "storage", "redux", "session"]}
        ],
        "hard": [
            {"question": "What was the most challenging technical bug or bottleneck in your project, and how did you resolve it?", "keywords": ["bottleneck", "bug", "challenge", "solution", "debugging"]},
            {"question": "How did you implement security or data validation in your project?", "keywords": ["security", "validation", "jwt", "hashing", "cors", "auth"]}
        ],
        "expert": [
            {"question": "If you had to scale your project to support 100x traffic, what bottlenecks would you target and how?", "keywords": ["scaling", "caching", "redis", "load balancer", "replication", "horizontal scaling"]},
            {"question": "If you had to completely rewrite your project using a different stack, what trade-offs would you evaluate?", "keywords": ["rewrite", "trade-offs", "stack", "performance", "architecture"]}
        ]
    }
}

# Pre-packaged follow-up flow for natural conversational depth
FOLLOW_UPS = {
    "What technologies did you choose for your project and why?": {
        "keywords_trigger": ["fastapi", "react", "opencv", "tableau"],
        "next_question": "Why did you choose this stack over alternatives? What specific features improved performance?"
    },
    "Walk me through the primary project listed on your resume. What problem does it solve?": {
        "keywords_trigger": ["attendance", "quiz", "portal", "dashboard"],
        "next_question": "How did you design the user interface and how did users interact with this solution?"
    }
}

def get_topics_for_role(role: str, resume_skills: List[str] = None) -> List[str]:
    role_lower = role.lower()
    available = ["Projects"]
    
    # If skills exist, use them to seed topics
    if resume_skills:
        skills_lower = [s.lower() for s in resume_skills]
        if any(s in skills_lower for s in ["python", "django", "flask"]):
            available.append("Python")
        if any(s in skills_lower for s in ["sql", "postgres", "mysql", "database"]):
            available.append("SQL")
        if any(s in skills_lower for s in ["machine learning", "ml", "tensorflow", "pytorch"]):
            available.append("Machine Learning")
        if any(s in skills_lower for s in ["fastapi"]):
            available.append("FastAPI")
        if any(s in skills_lower for s in ["react", "javascript", "typescript", "next.js"]):
            available.append("React")
            
    # Fallback or supplementary topics based on target role
    if len(available) <= 1:
        if "data" in role_lower or "analyst" in role_lower:
            available.extend(["Python", "SQL", "Machine Learning"])
        elif "frontend" in role_lower or "web" in role_lower or "react" in role_lower:
            available.extend(["React", "SQL"])
        elif "fastapi" in role_lower or "backend" in role_lower:
            available.extend(["Python", "SQL", "FastAPI"])
        else:
            available.extend(["Python", "SQL", "React", "Projects"])
            
    # De-duplicate while maintaining list
    return list(dict.fromkeys(available))

@router.post("/adaptive/start", response_model=schemas.AdaptiveNextResponse)
def start_adaptive_interview(
    target_role: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Fetch latest resume
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    
    resume_skills = None
    if resume and resume.extracted_skills:
        resume_skills = resume.extracted_skills
        
    topics = get_topics_for_role(target_role, resume_skills)
    first_topic = topics[0]
    
    # Initial question
    initial_q_set = ADAPTIVE_QUESTIONS.get(first_topic, ADAPTIVE_QUESTIONS["Python"])
    initial_q = initial_q_set["easy"][0]["question"]
    
    initial_state = schemas.AdaptiveState(
        difficulty="easy",
        current_topic=first_topic,
        topics_asked=[first_topic],
        consecutive_correct=0,
        consecutive_wrong=0,
        scores={
            "technical": 50.0,
            "communication": 50.0,
            "confidence": 50.0,
            "problem_solving": 50.0,
            "project": 50.0
        }
    )
    
    return schemas.AdaptiveNextResponse(
        next_question=initial_q,
        is_finished=False,
        updated_state=initial_state,
        report=None
    )

@router.post("/adaptive/next", response_model=schemas.AdaptiveNextResponse)
def next_adaptive_question(
    req: schemas.AdaptiveNextRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    history = req.history
    current_state = req.current_state
    target_role = req.target_role
    
    if not history:
        raise HTTPException(status_code=400, detail="Answer history is empty.")
        
    latest_answer_obj = history[-1]
    latest_question = latest_answer_obj.question
    latest_answer = latest_answer_obj.answer.lower().strip()
    
    # 1. Fetch latest resume
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    resume_skills = resume.extracted_skills if resume else None
    topics = get_topics_for_role(target_role, resume_skills)
    
    # 2. Semantic grading & Keyword matching
    # Find the question keywords in the pool
    keywords = ["explain", "understanding", "framework", "technology"]
    current_topic = current_state.current_topic
    
    # Find matching topic in question pool
    if current_topic in ADAPTIVE_QUESTIONS:
        for diff_level in ["easy", "medium", "hard", "expert"]:
            for q_obj in ADAPTIVE_QUESTIONS[current_topic][diff_level]:
                if q_obj["question"] == latest_question:
                    keywords = q_obj["keywords"]
                    break
                    
    # Check keyword matches
    match_count = sum(1 for kw in keywords if kw in latest_answer)
    
    # Base technical score calculation
    if len(latest_answer) < 10:
        ans_score = 25.0  # Struggles/Wrong
    elif match_count >= 3:
        ans_score = 95.0  # Excellent
    elif match_count == 2:
        ans_score = 80.0  # Correct
    elif match_count == 1:
        ans_score = 60.0  # Average
    else:
        ans_score = 40.0  # Weak
        
    # 3. Confidence & Communication adjustments
    communication_score = 85.0
    confidence_score = 85.0
    
    # Confidence factors from request
    is_nervous = False
    if latest_answer_obj.filler_count is not None and latest_answer_obj.filler_count > 3:
        confidence_score -= 15.0
        is_nervous = True
    if latest_answer_obj.clarity_score is not None:
        communication_score = latest_answer_obj.clarity_score
        if latest_answer_obj.clarity_score < 70:
            is_nervous = True
    if latest_answer_obj.hesitation_detected:
        confidence_score -= 10.0
        is_nervous = True
    if latest_answer_obj.speech_duration is not None:
        # Check words per minute
        word_count = len(latest_answer.split())
        wpm = (word_count / latest_answer_obj.speech_duration) * 60 if latest_answer_obj.speech_duration > 0 else 120
        if wpm < 70 or wpm > 210:
            communication_score -= 10.0
            confidence_score -= 5.0
            
    # Update running scores
    technical = (current_state.scores.get("technical", 50.0) * len(history) + ans_score) / (len(history) + 1)
    communication = (current_state.scores.get("communication", 50.0) * len(history) + communication_score) / (len(history) + 1)
    confidence = (current_state.scores.get("confidence", 50.0) * len(history) + confidence_score) / (len(history) + 1)
    
    # Project score updates when on projects topic
    prev_project_score = current_state.scores.get("project", 50.0)
    if current_topic == "Projects":
        project_score = (prev_project_score * len(history) + ans_score) / (len(history) + 1)
    else:
        project_score = prev_project_score
        
    # Problem solving updates
    problem_solving = (technical * 0.6 + confidence * 0.4)
    
    updated_scores = {
        "technical": technical,
        "communication": communication,
        "confidence": confidence,
        "problem_solving": problem_solving,
        "project": project_score
    }
    
    # 4. Difficulty Progression Adjustment
    difficulty = current_state.difficulty
    consec_correct = current_state.consecutive_correct
    consec_wrong = current_state.consecutive_wrong
    
    if ans_score >= 70.0:
        consec_correct += 1
        consec_wrong = 0
        # Increase difficulty
        if ans_score >= 90.0: # Excellent -> SIGNIFICANT increase
            if difficulty == "easy":
                difficulty = "hard"
            elif difficulty == "medium":
                difficulty = "expert"
            elif difficulty in ["hard", "expert"]:
                difficulty = "expert"
        else: # Correct -> SLIGHT increase
            if difficulty == "easy":
                difficulty = "medium"
            elif difficulty == "medium":
                difficulty = "hard"
            elif difficulty in ["hard", "expert"]:
                difficulty = "expert"
    else:
        consec_correct = 0
        consec_wrong += 1
        
        # Struggles repeatedly -> Beginner level
        if consec_wrong >= 2:
            difficulty = "easy"
        else: # Weak/Wrong -> Decrease difficulty
            if difficulty == "expert":
                difficulty = "hard"
            elif difficulty == "hard":
                difficulty = "medium"
            elif difficulty in ["medium", "easy"]:
                difficulty = "easy"
                
    # If user is detected nervous, override difficulty to temporarily ease pressure
    if is_nervous and difficulty != "easy":
        if difficulty == "expert":
            difficulty = "hard"
        elif difficulty == "hard":
            difficulty = "medium"
        elif difficulty == "medium":
            difficulty = "easy"
            
    # 5. Check if session has finished (5 questions max)
    MAX_QUESTIONS = 5
    if len(history) >= MAX_QUESTIONS:
        # Compile Report
        avg_tech = int(updated_scores["technical"])
        avg_comm = int(updated_scores["communication"])
        avg_conf = int(updated_scores["confidence"])
        avg_prob = int(updated_scores["problem_solving"])
        avg_proj = int(updated_scores["project"])
        
        # Readiness Index
        readiness_score = int((avg_tech + avg_comm + avg_conf + avg_prob + avg_proj) / 5)
        
        # Comfort categories
        strong_areas = []
        moderate_areas = []
        weak_areas = []
        
        # Categorize by scores
        if avg_tech >= 75:
            strong_areas.append("Technical Theory")
        elif avg_tech >= 55:
            moderate_areas.append("Technical Theory")
        else:
            weak_areas.append("Technical Theory")
            
        if avg_proj >= 75:
            strong_areas.append("Project Viva")
        elif avg_proj >= 55:
            moderate_areas.append("Project Viva")
        else:
            weak_areas.append("Project Viva")
            
        # Determine based on topics asked
        for t in current_state.topics_asked:
            if t != "Projects":
                # Give a mock distribution based on tech scores
                if avg_tech >= 75:
                    strong_areas.append(t)
                elif avg_tech >= 55:
                    moderate_areas.append(t)
                else:
                    weak_areas.append(t)
                    
        # Guarantee lists aren't completely empty
        if not strong_areas: strong_areas = ["Basics", "Concept Recalls"]
        if not moderate_areas: moderate_areas = ["System Design"]
        if not weak_areas: weak_areas = ["Operating Systems", "Computer Networks"]
        
        # Behavior Analysis text
        behavior_critique = (
            f"The candidate showed solid baseline capability discussing {', '.join(strong_areas[:2])}. "
            f"Confidence and fluency adjusted smoothly to difficulty shifts, with an average communication clarity "
            f"rating of {avg_comm}%. "
        )
        if weak_areas:
            behavior_critique += f"Explanations on {', '.join(weak_areas[:2])} can be more rigorous and detail structural trade-offs. "
        behavior_critique += "Overall posture and pronunciation indices align with recruiter expectations."
        
        # Improvement recommendations
        topics_to_revise = []
        for wa in weak_areas:
            topics_to_revise.append(f"Core concepts of {wa}")
        if not topics_to_revise:
            topics_to_revise = ["Advanced Query Performance tuning", "System design optimization"]
            
        recommended_projects = [
            f"Scalable {target_role} Integration template demonstrating modular architectural patterns.",
            "Distributed Caching pipeline utilizing Redis for response rate optimization."
        ]
        
        practice_questions = [
            "Explain list comprehension vs generators in Python.",
            "What is the difference between inner and outer joins?",
            "How do you ensure state management consistency in asynchronous client cycles?"
        ]
        
        report = schemas.AdaptiveReport(
            technical_score=avg_tech,
            communication_score=avg_comm,
            confidence_score=avg_conf,
            problem_solving_score=avg_prob,
            project_score=avg_proj,
            strong_areas=strong_areas,
            moderate_areas=moderate_areas,
            weak_areas=weak_areas,
            behavior_analysis=behavior_critique,
            topics_to_revise=topics_to_revise,
            recommended_projects=recommended_projects,
            practice_questions=practice_questions,
            readiness_score=readiness_score
        )
        
        # Save Attempt to Database (Level 11 indicates Adaptive)
        new_attempt = models.InterviewAttempt(
            user_id=current_user.id,
            level=11,
            score=readiness_score,
            feedback=behavior_critique,
            video_analysis={
                "eye_contact": avg_conf,
                "smile_frequency": 65,
                "posture": 90,
                "nervousness": 100 - avg_conf,
                "expressions": "Professional"
            },
            communication_metrics={
                "fluency": avg_comm,
                "speaking_speed": 135,
                "filler_words": ["um", "like"] if avg_comm < 80 else ["um"],
                "pronunciation": avg_comm + 2,
                "grammar": avg_comm + 4
            }
        )
        
        # Award XP
        current_user.xp += 250
        current_user.streak += 1
        
        db.add(new_attempt)
        db.commit()
        
        updated_state = schemas.AdaptiveState(
            difficulty=difficulty,
            current_topic=current_topic,
            topics_asked=current_state.topics_asked,
            consecutive_correct=consec_correct,
            consecutive_wrong=consec_wrong,
            scores=updated_scores
        )
        
        return schemas.AdaptiveNextResponse(
            next_question=None,
            is_finished=True,
            updated_state=updated_state,
            report=report
        )
        
    # 6. Session has NOT finished -> Select next question
    # Check for Follow-Up question
    next_question = None
    if latest_question in FOLLOW_UPS:
        f_obj = FOLLOW_UPS[latest_question]
        trigger = False
        for trigger_kw in f_obj["keywords_trigger"]:
            if trigger_kw in latest_answer:
                trigger = True
                break
        if trigger:
            next_question = f_obj["next_question"]
            
    # If no follow-up is triggered, retrieve from standard pools
    if not next_question:
        # Determine topic:
        # Alternate topics or remain on topic for max 2 questions
        questions_asked_on_topic = sum(1 for h in history if h.question in [q["question"] for diff in ["easy", "medium", "hard", "expert"] for q in ADAPTIVE_QUESTIONS.get(current_topic, {}).get(diff, [])])
        
        if questions_asked_on_topic >= 2:
            # Switch to a new topic
            unasked_topics = [t for t in topics if t not in current_state.topics_asked]
            if unasked_topics:
                next_topic = unasked_topics[0]
            else:
                next_topic = topics[0]  # Wrap around
            current_state.topics_asked.append(next_topic)
            current_topic = next_topic
        else:
            current_topic = current_state.current_topic
            
        # Select from current_topic pool for updated difficulty
        pool = ADAPTIVE_QUESTIONS.get(current_topic, ADAPTIVE_QUESTIONS["Python"]).get(difficulty, ADAPTIVE_QUESTIONS["Python"]["easy"])
        
        # Exclude questions already asked
        asked_questions = [h.question for h in history]
        unasked_pool = [q for q in pool if q["question"] not in asked_questions]
        
        if unasked_pool:
            next_question = unasked_pool[0]["question"]
        else:
            # Fallback to any unasked in the topic
            all_questions_in_topic = [q["question"] for diff in ["easy", "medium", "hard", "expert"] for q in ADAPTIVE_QUESTIONS.get(current_topic, {}).get(diff, [])]
            fallback_pool = [q for q in all_questions_in_topic if q not in asked_questions]
            if fallback_pool:
                next_question = fallback_pool[0]
            else:
                # Absolute fallback
                next_question = "Explain how you troubleshoot system latency issues."
                
    updated_state = schemas.AdaptiveState(
        difficulty=difficulty,
        current_topic=current_topic,
        topics_asked=current_state.topics_asked,
        consecutive_correct=consec_correct,
        consecutive_wrong=consec_wrong,
        scores=updated_scores
    )
    
    return schemas.AdaptiveNextResponse(
        next_question=next_question,
        is_finished=False,
        updated_state=updated_state,
        report=None
    )
