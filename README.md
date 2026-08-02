# 🚀 PlaceMate AI — Career Operating System

<div align="center">

![PlaceMate AI](https://img.shields.io/badge/PlaceMate-AI%20Career%20OS-6366f1?style=for-the-badge&logo=sparkles&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)

**An all-in-one AI-powered placement preparation platform — from resume analysis to live voice AI interviews.**

[Live Demo](#) · [API Docs](http://127.0.0.1:8001/docs) · [Report Bug](https://github.com/nagarjuna-32/Placement-AI/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Pages & Routes](#-pages--routes)
- [AI Features](#-ai-features)
- [Demo Accounts](#-demo-accounts)
- [Contributing](#-contributing)

---

## 🎯 About

**PlaceMate AI** is a full-stack Career Operating System built for students and job seekers. It uses **Google Gemini AI** to power every feature — from parsing your resume and generating personalized interview questions, to conducting a **live video AI interview** that tracks your facial expressions and evaluates your spoken answers in real time.

> No text typing during interviews. Pure voice + video experience.

---

## ✨ Features

### 📄 AI Resume Analyzer
- Upload PDF/DOCX resume
- Instant **ATS score** (0–100)
- Extracted skills, projects, and missing keywords
- Improvement suggestions powered by Gemini AI

### 🎤 Live AI Interview (Voice Only)
- AI reads questions aloud via **Text-to-Speech**
- You answer via **microphone** — no typing allowed
- **Real-time facial expression analysis** (Confidence, Nervousness, Eye Contact meters)
- **3 difficulty levels**: Easy → Medium → Hard (15 questions total)
- Wrong answer → **1 second chance** → wrong again → **interview terminated**
- Post-interview **report**: Technical, Communication & Confidence scores
- Q&A breakdown with AI feedback and better answers

### 🗣️ AI Group Discussion (GD) Simulator
- **5 AI participants** with unique voices debate a topic
- You join using your **microphone** — speak to participate
- AI moderator calls you out if you stay silent
- Post-GD report: Logical, Communication, Leadership, Confidence scores

### 📊 AI Resume → Interview Pipeline
- Resume stored once — reused for all future sessions (no re-upload)
- Questions auto-generated from your resume's skills and projects

### 💻 Coding Sandbox (15 Languages)
- **5 problems**: Two Sum, Valid Parentheses, Fibonacci, Maximum Subarray, Reverse Linked List
- **15 languages**: Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust, Kotlin, Swift, Ruby, PHP, Scala, R
- AI code audit: Time complexity, Space complexity, Code review

### 🔗 GitHub Profile Analyzer
- Paste your GitHub URL — get a **Hiring Readiness Index**
- Language breakdown, weekly commit consistency chart
- Actionable improvement suggestions

### 🤖 AI Career Coach
- Personalized career advice and roadmap
- Chat with a Gemini-powered career agent

### 📜 Certificates
- Earn verifiable certificates after completing interview sessions
- Public verification page with unique certificate IDs

### 🏢 HR / Recruiter Panel
- Role-based access for recruiters
- View candidate profiles, resumes, and interview reports

### 📈 Dashboard & Gamification
- XP points, Career Health score, activity streaks
- Job tracker with application status management

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.7 | React framework with App Router |
| **TypeScript** | 5 | Type-safe development |
| **Tailwind CSS** | 3 | Utility-first styling |
| **Lucide React** | latest | Icon library |
| **Web Speech API** | Browser native | Voice recognition (STT) |
| **Speech Synthesis** | Browser native | Text-to-speech (TTS) |
| **MediaDevices API** | Browser native | Camera & microphone access |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.111.0 | High-performance Python API |
| **Uvicorn** | 0.30.1 | ASGI server |
| **SQLAlchemy** | 2.0.30 | ORM & database management |
| **SQLite** | - | Local database (dev) |
| **Google Gemini AI** | 0.7.2 | AI question generation & evaluation |
| **Pydantic** | 2.7.2 | Data validation & schemas |
| **python-jose** | 3.3.0 | JWT authentication |
| **passlib + bcrypt** | - | Password hashing |
| **Cloudinary** | 1.40.0 | Resume/image uploads |

---

## 📁 Project Structure

```
Placement-AI/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # SQLAlchemy database models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── database.py             # DB engine & session config
│   ├── requirements.txt        # Python dependencies
│   ├── runtime.txt             # Python version for deployment
│   ├── routers/
│   │   ├── auth.py             # Register, Login, JWT auth
│   │   ├── resume.py           # Resume upload, ATS scoring, interview questions
│   │   ├── interview.py        # Answer evaluation, save report, history
│   │   ├── career_agent.py     # AI career coach chat
│   │   ├── certificates.py     # Certificate generation & verification
│   │   ├── github_linkedin.py  # GitHub profile analyzer
│   │   ├── jobs.py             # Job listings & tracker
│   │   ├── profile.py          # User profile management
│   │   ├── tracker.py          # Application tracker
│   │   ├── alerts.py           # Smart job alerts
│   │   ├── market.py           # Market insights
│   │   ├── hr_panel.py         # Recruiter/HR panel
│   │   ├── payments.py         # Subscription & payments
│   │   └── reports.py          # Analytics & reports
│   └── utils/
│       └── rate_limit.py       # Rate limiting middleware
│
└── frontend/
    └── src/app/
        ├── page.tsx             # Landing page
        ├── layout.tsx           # Root layout & navbar
        ├── dashboard/           # User dashboard + XP gamification
        ├── resume-analyzer/     # Resume upload & ATS analysis
        ├── interview/           # 🎤 Live AI Video Interview Room
        ├── gd-simulator/        # 🗣️ AI Group Discussion
        ├── coding/              # 💻 Multi-language Coding Sandbox
        ├── coach/               # 🤖 AI Career Coach chat
        ├── jobs/                # Job listings + tracker
        ├── certificates/        # Certificate viewer
        ├── verify-certificate/  # Public certificate verification
        ├── portfolio/           # Portfolio builder
        ├── recruiter/           # HR/Recruiter panel
        ├── agent/               # Multi-agent orchestrator
        ├── login/               # Authentication
        └── register/            # Registration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+
- **Google Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the Repository

```bash
git clone https://github.com/nagarjuna-32/Placement-AI.git
cd Placement-AI
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Backend will be running at: **http://127.0.0.1:8001**  
Swagger API docs: **http://127.0.0.1:8001/docs**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

### 4. Set Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
SECRET_KEY=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Note:** The app works without Gemini API key using built-in fallback logic (rule-based questions and evaluations).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini AI API key for AI features |
| `SECRET_KEY` | Required | JWT token signing secret |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary for resume uploads |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login & get JWT token |
| `POST` | `/resume/upload` | Upload & analyze resume |
| `GET` | `/resume/latest` | Get most recent resume |
| `POST` | `/resume/interview-questions` | Generate AI questions from resume |
| `POST` | `/interview/evaluate-answer` | Evaluate spoken answer via AI |
| `POST` | `/interview/save-report` | Save full interview report |
| `GET` | `/interview/history` | Get past interview attempts |
| `POST` | `/github/analyze` | Analyze GitHub profile |
| `GET` | `/jobs/listings` | Fetch job listings |
| `POST` | `/certificates/generate` | Generate completion certificate |
| `GET` | `/certificates/verify/{id}` | Publicly verify a certificate |

Full interactive docs available at: **http://127.0.0.1:8001/docs**

---

## 📱 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero, features, pricing |
| `/dashboard` | Dashboard | XP, career health, activity feed |
| `/resume-analyzer` | Resume Analyzer | Upload + ATS analysis + suggestions |
| `/interview` | AI Interview Room | Live voice video interview |
| `/gd-simulator` | GD Simulator | Voice-only group discussion |
| `/coding` | Coding Sandbox | 5 problems × 15 languages |
| `/coach` | AI Career Coach | Chat-based career guidance |
| `/jobs` | Job Board | Listings + application tracker |
| `/certificates` | Certificates | View earned certificates |
| `/verify-certificate` | Verify | Public certificate verification |
| `/recruiter` | HR Panel | Recruiter dashboard |
| `/login` | Login | JWT-based authentication |
| `/register` | Register | New account creation |

---

## 🤖 AI Features

### How the AI Interview Works

```
1. User uploads resume → stored in DB
2. User navigates to /interview → resume auto-loaded (no re-upload)
3. Backend calls Gemini AI → generates 15 questions (5 easy, 5 medium, 5 hard)
4. AI speaks question via browser TTS
5. User speaks answer via microphone
6. 2.5s silence → answer auto-submitted to backend
7. Backend calls Gemini AI → evaluates answer
   → correct/partial  : move to next question
   → wrong (1st time) : give second chance with follow-up question
   → wrong (2nd time) : TERMINATE interview immediately
8. Face expression tracker runs every 800ms (simulated via browser)
9. After all questions (or termination) → report generated
10. Report saved to DB with XP update
```

### Answer Evaluation Logic

```
Verdict   Score    Action
───────────────────────────────────────────
correct   80-100   Next question
partial   50-79    Next question
wrong      0-40    2nd chance → terminate if wrong again
```

---

## 👥 Demo Accounts

The backend auto-seeds these accounts on first startup:

| Role | Email | Password |
|---|---|---|
| Student | `student@demo.com` | `demo1234` |
| Recruiter | `recruiter@demo.com` | `demo1234` |
| Admin | `admin@demo.com` | `demo1234` |

---

## 🌐 Browser Requirements

| Feature | Supported Browsers |
|---|---|
| Voice Recognition (STT) | Chrome, Edge (NOT Firefox/Safari) |
| Text-to-Speech (TTS) | All modern browsers |
| Camera & Microphone | Chrome, Edge, Firefox, Safari |

> ⚠️ For the best interview experience, use **Google Chrome** or **Microsoft Edge**.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ❤️ by **Nagarjuna N**

⭐ Star this repo if you found it useful!

</div>
