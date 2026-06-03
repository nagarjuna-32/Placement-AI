from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
import models, schemas, database

SECRET_KEY = "PLACEMATE_SECRET_KEY_FOR_LOCAL_DEV"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-form")

router = APIRouter(prefix="/auth", tags=["auth"])

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        hashed_password=hashed_pass,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Add sample data initialization endpoint
@router.post("/seed", response_model=dict)
def seed_database(db: Session = Depends(database.get_db)):
    # Check if we already seeded
    student = db.query(models.User).filter(models.User.email == "student@placemate.ai").first()
    if not student:
        student = models.User(
            email="student@placemate.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Alex Mercer",
            role="student",
            subscription_tier="free",
            streak=5,
            xp=1250
        )
        db.add(student)
    
    recruiter = db.query(models.User).filter(models.User.email == "recruiter@placemate.ai").first()
    if not recruiter:
        recruiter = models.User(
            email="recruiter@placemate.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Sarah Jenkins (Google Tech Recruiting)",
            role="recruiter",
            subscription_tier="pro"
        )
        db.add(recruiter)
    
    # Add some jobs
    db.query(models.JobMatch).delete()
    jobs = [
        models.JobMatch(
            title="AI Software Engineer",
            company="Google",
            description="Build state of the art generative AI systems, ML pipelines, and large scale user services.",
            location="Bangalore, India",
            type="full-time",
            mode="hybrid",
            salary="₹24L - ₹32L",
            required_skills=["Python", "PyTorch", "FastAPI", "Docker", "Machine Learning"],
            match_score=92,
            missing_skills=["Docker", "Kubernetes"],
            why_matches="Your resume highlights experience in Machine Learning, Python, and FastAPI which matches 3 out of 5 core tech requirements.",
            apply_url="https://linkedin.com/jobs"
        ),
        models.JobMatch(
            title="Backend Python Developer",
            company="Razorpay",
            description="Work on high performance payment gateways and transactional ledgers using Python and SQL.",
            location="Remote",
            type="full-time",
            mode="remote",
            salary="₹12L - ₹18L",
            required_skills=["Python", "SQL", "FastAPI", "AWS", "Git"],
            match_score=85,
            missing_skills=["AWS", "Git"],
            why_matches="Strong proficiency in FastAPI and database queries matches Razorpay's transactional service demands.",
            apply_url="https://naukri.com"
        ),
        models.JobMatch(
            title="Machine Learning Intern",
            company="NVIDIA",
            description="Research and implement cutting-edge computer vision models and optimize performance for CUDA cores.",
            location="Hyderabad, India",
            type="internship",
            mode="onsite",
            salary="₹50k/month",
            required_skills=["Python", "PyTorch", "C++", "CUDA"],
            match_score=78,
            missing_skills=["C++", "CUDA"],
            why_matches="Your project experience in Deep Learning and PyTorch demonstrates strong foundation for AI acceleration.",
            apply_url="https://unstop.com"
        )
    ]
    db.bulk_save_objects(jobs)
    db.commit()
    return {"message": "Database seeded with standard testing user accounts and jobs."}
