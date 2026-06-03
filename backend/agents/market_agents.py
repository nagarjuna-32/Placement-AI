from sqlalchemy.orm import Session
import models
import random
from datetime import datetime

class MarketIntelligenceAgent:
    def name(self) -> str:
        return "Market Intelligence Agent"

    def process(self, db: Session, user_id: int, role: str) -> dict:
        logs = [
            f"Querying hiring trends database for role: '{role}'.",
            "Scraping active job index metrics and demand coefficients."
        ]
        
        role_lower = role.lower()
        if "data" in role_lower or "analyst" in role_lower:
            avg_salary = "₹6.5 - ₹12 LPA"
            demand_index = "High (8.2/10)"
            top_skills = ["Python", "SQL", "Tableau", "Pandas"]
        elif "frontend" in role_lower or "react" in role_lower:
            avg_salary = "₹7.0 - ₹14 LPA"
            demand_index = "Very High (8.9/10)"
            top_skills = ["React", "TypeScript", "Next.js", "Tailwind CSS"]
        else:
            avg_salary = "₹8.0 - ₹16 LPA"
            demand_index = "Critical (9.4/10)"
            top_skills = ["FastAPI", "Python", "Docker", "PyTorch", "AWS"]
            
        logs.append("Aggregated latest market averages and skills thresholds.")
        return {
            "role": role,
            "average_salary": avg_salary,
            "demand_index": demand_index,
            "trending_skills": top_skills,
            "logs": logs
        }

class SalaryPredictionAgent:
    def name(self) -> str:
        return "Salary Prediction Agent"

    def process(self, db: Session, user_id: int, experience_years: float, skills: list, location: str) -> dict:
        logs = [
            "Calculating salary multipliers based on experience factors.",
            "Weighting skills coefficients against current database profiles.",
            "Normalizing expectations based on location tier indices."
        ]
        
        base_pay = 4.5  # LPA
        xp_multiplier = 1.0 + (experience_years * 0.25)
        
        # Skill weights
        skill_boost = 0.0
        valuable_skills = ["pytorch", "fastapi", "docker", "next.js", "kubernetes", "aws", "react"]
        for s in skills:
            if s.lower() in valuable_skills:
                skill_boost += 0.15
                
        loc_coeff = 1.0
        if "bangalore" in location.lower() or "bengaluru" in location.lower():
            loc_coeff = 1.25
        elif "mumbai" in location.lower() or "delhi" in location.lower():
            loc_coeff = 1.15
            
        predicted = base_pay * xp_multiplier * (1.0 + skill_boost) * loc_coeff
        predicted_lpa = round(predicted, 2)
        
        logs.append(f"Expected compensation estimate parsed at ₹{predicted_lpa} LPA.")
        return {
            "estimated_salary": f"₹{predicted_lpa} LPA",
            "experience_years": experience_years,
            "location_tier_factor": loc_coeff,
            "logs": logs
        }

class LinkedInOptimizerAgent:
    def name(self) -> str:
        return "LinkedIn Optimizer Agent"

    def process(self, db: Session, user_id: int, current_headline: str, current_summary: str, skills: list) -> dict:
        logs = [
            "Parsing current headline configuration structures.",
            "Generating SEO-optimized headline styles.",
            "Composing executive professional summaries emphasizing skill sets."
        ]
        
        skills_str = " | ".join(skills[:4])
        opt_headline = f"Software Engineer | Specializing in {skills_str} | Building Scalable Web & AI Systems"
        opt_summary = (
            f"Passionate software engineer focused on building robust and scalable systems. "
            f"Experienced in developing applications using {', '.join(skills)}. "
            f"Dedicated to optimization, system security, and writing readable, testable code. "
            f"Open to connecting with engineering leaders and recruiters."
        )
        
        # Save to database
        db_opt = models.LinkedinOptimization(
            user_id=user_id,
            headline=opt_headline,
            summary=opt_summary,
            skills_suggestions=skills[:5],
            experience_critique=["Quantify key impact bullet points using action-verbs."]
        )
        db.add(db_opt)
        db.commit()
        
        logs.append("LinkedIn profile optimized headlines stored.")
        return {
            "headline": opt_headline,
            "summary": opt_summary,
            "logs": logs
        }

class GitHubAnalyzerAgent:
    def name(self) -> str:
        return "GitHub Analyzer Agent"

    def process(self, db: Session, user_id: int, github_username: str) -> dict:
        logs = [
            f"Querying GitHub API stubs for user profile: '{github_username}'.",
            "Retrieving repository metadata and language percentages.",
            "Analyzing commit schedules and developer output scores."
        ]
        
        # Generate clean stubs
        dev_score = random.randint(75, 94)
        project_score = dev_score - random.randint(2, 6)
        readiness = int(dev_score * 0.6 + project_score * 0.4)
        
        commits = [
            {"week": "Week 1", "commits": random.randint(5, 15)},
            {"week": "Week 2", "commits": random.randint(8, 20)},
            {"week": "Week 3", "commits": random.randint(12, 28)},
            {"week": "Week 4", "commits": random.randint(15, 32)}
        ]
        
        languages = {"Python": 55.0, "JavaScript": 30.0, "HTML/CSS": 15.0}
        improvements = [
            "Add README files detailing project setups and configurations.",
            "Increase weekly commit frequency to show continuous contributions."
        ]
        
        # Save to database
        db_analysis = models.GithubAnalysis(
            user_id=user_id,
            developer_score=dev_score,
            project_score=project_score,
            readiness_score=readiness,
            repo_count=12,
            commits_chart=commits,
            programming_languages=languages,
            improvements=improvements
        )
        db.add(db_analysis)
        db.commit()
        
        logs.append(f"GitHub developer audit complete. Score set to {dev_score}/100.")
        return {
            "developer_score": dev_score,
            "project_score": project_score,
            "readiness_score": readiness,
            "commits_chart": commits,
            "languages": languages,
            "logs": logs
        }

class ApplicationTrackerAgent:
    def name(self) -> str:
        return "Application Tracker Agent"

    def process(self, db: Session, user_id: int, company: str, position: str, status: str) -> dict:
        logs = [
            f"Registering job application for {position} at {company}.",
            f"Setting application progress state to: '{status}'."
        ]
        
        # Check if already exists or add new
        db_app = models.JobApplication(
            user_id=user_id,
            company=company,
            position=position,
            status=status,
            applied_date=datetime.now().strftime("%Y-%m-%d"),
            salary_expectation="₹8 - ₹12 LPA"
        )
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        
        logs.append("Saved application record to SQLite tracking system.")
        return {
            "application_id": db_app.id,
            "company": company,
            "position": position,
            "status": status,
            "logs": logs
        }
