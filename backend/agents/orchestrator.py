from sqlalchemy.orm import Session
from agents.career_agents import (
    ResumeAnalyzerAgent,
    JobMatchingAgent,
    SkillGapAgent,
    CareerRoadmapAgent,
    PlacementPredictionAgent,
    MemoryAgent
)
from agents.interview_agents import (
    InterviewerAgent,
    TechnicalInterviewAgent,
    HRInterviewAgent,
    ProjectVivaAgent,
    CodingReviewAgent,
    CommunicationCoachAgent,
    GroupDiscussionAgent
)
from agents.market_agents import (
    MarketIntelligenceAgent,
    SalaryPredictionAgent,
    LinkedInOptimizerAgent,
    GitHubAnalyzerAgent,
    ApplicationTrackerAgent
)

class MasterOrchestrator:
    def __init__(self):
        # Initialize all collaborate agents
        self.resume_analyzer = ResumeAnalyzerAgent()
        self.job_matching = JobMatchingAgent()
        self.skill_gap = SkillGapAgent()
        self.career_roadmap = CareerRoadmapAgent()
        self.placement_prediction = PlacementPredictionAgent()
        self.memory = MemoryAgent()
        
        self.interviewer = InterviewerAgent()
        self.technical_interview = TechnicalInterviewAgent()
        self.hr_interview = HRInterviewAgent()
        self.project_viva = ProjectVivaAgent()
        self.coding_review = CodingReviewAgent()
        self.communication_coach = CommunicationCoachAgent()
        self.group_discussion = GroupDiscussionAgent()
        
        self.market_intelligence = MarketIntelligenceAgent()
        self.salary_prediction = SalaryPredictionAgent()
        self.linkedin_optimizer = LinkedInOptimizerAgent()
        self.github_analyzer = GitHubAnalyzerAgent()
        self.application_tracker = ApplicationTrackerAgent()

    def name(self) -> str:
        return "Master Orchestrator Agent (AI CEO)"

    def dispatch(self, db: Session, user_id: int, request_type: str, payload: dict) -> dict:
        """
        AI CEO routing hub. Determines dependencies and runs agents in sequence.
        """
        if request_type == "profile_update":
            return self.dispatch_profile_update(db, user_id, payload)
        elif request_type == "interview_eval":
            return self.dispatch_interview_evaluation(db, user_id, payload)
        elif request_type == "market_analysis":
            return self.dispatch_market_analysis(db, user_id, payload)
        else:
            return {
                "error": f"Unknown request type '{request_type}'",
                "logs": [f"Orchestration route '{request_type}' failed: route undefined."]
            }

    def dispatch_profile_update(self, db: Session, user_id: int, payload: dict) -> dict:
        filename = payload.get("filename", "resume.pdf")
        target_role = payload.get("target_role", "AI Software Engineer")
        
        logs = ["Master Orchestrator: Initializing sequence 'profile_update'."]
        
        # 1. Resume Analyzer
        logs.append(f"Orchestrating -> {self.resume_analyzer.name()} (Step 1/5)")
        resume_res = self.resume_analyzer.process(db, user_id, filename)
        logs.extend([f"[{self.resume_analyzer.name()}]: {log}" for log in resume_res["logs"]])
        
        # 2. Job Matcher
        logs.append(f"Orchestrating -> {self.job_matching.name()} (Step 2/5)")
        job_res = self.job_matching.process(db, user_id, resume_res["skills"])
        logs.extend([f"[{self.job_matching.name()}]: {log}" for log in job_res["logs"]])
        
        # 3. Skill Gap
        logs.append(f"Orchestrating -> {self.skill_gap.name()} (Step 3/5)")
        gap_res = self.skill_gap.process(db, user_id, resume_res["missing_skills"])
        logs.extend([f"[{self.skill_gap.name()}]: {log}" for log in gap_res["logs"]])
        
        # 4. Career Roadmap
        logs.append(f"Orchestrating -> {self.career_roadmap.name()} (Step 4/5)")
        roadmap_res = self.career_roadmap.process(db, user_id, target_role)
        logs.extend([f"[{self.career_roadmap.name()}]: {log}" for log in roadmap_res["logs"]])
        
        # 5. Placement Prediction
        logs.append(f"Orchestrating -> {self.placement_prediction.name()} (Step 5/5)")
        predict_res = self.placement_prediction.process(db, user_id, resume_res["ats_score"])
        logs.extend([f"[{self.placement_prediction.name()}]: {log}" for log in predict_res["logs"]])
        
        # Sync Memory
        logs.append(f"Orchestrating -> {self.memory.name()} (Final Audit)")
        memory_res = self.memory.process(db, user_id, "profile_update", {"ats_score": resume_res["ats_score"]})
        logs.extend([f"[{self.memory.name()}]: {log}" for log in memory_res["logs"]])
        
        logs.append("Master Orchestrator: Profile updates pipeline execution completed.")
        
        return {
            "success": True,
            "resume_analysis": resume_res,
            "job_matching": job_res,
            "skill_gap": gap_res,
            "roadmap": roadmap_res,
            "placement_prediction": predict_res,
            "logs": logs
        }

    def dispatch_interview_evaluation(self, db: Session, user_id: int, payload: dict) -> dict:
        speech_text = payload.get("speech_text", "")
        code_content = payload.get("code_content", "")
        problem_id = payload.get("problem_id", "1")
        hr_question = payload.get("hr_question", "Describe your profile")
        hr_response = payload.get("hr_response", "")
        
        logs = ["Master Orchestrator: Initializing sequence 'interview_eval'."]
        
        # 1. Speech Analysis
        logs.append(f"Orchestrating -> {self.communication_coach.name()} (Step 1/4)")
        comm_res = self.communication_coach.process(db, user_id, speech_text)
        logs.extend([f"[{self.communication_coach.name()}]: {log}" for log in comm_res["logs"]])
        
        # 2. Coding Review
        logs.append(f"Orchestrating -> {self.coding_review.name()} (Step 2/4)")
        code_res = self.coding_review.process(db, user_id, code_content, problem_id)
        logs.extend([f"[{self.coding_review.name()}]: {log}" for log in code_res["logs"]])
        
        # 3. HR Behavioral Check
        logs.append(f"Orchestrating -> {self.hr_interview.name()} (Step 3/4)")
        hr_res = self.hr_interview.process(db, user_id, hr_question, hr_response)
        logs.extend([f"[{self.hr_interview.name()}]: {log}" for log in hr_res["logs"]])
        
        # Calculate overall score for mock interview
        composite_score = int(comm_res["fluency_score"] * 0.3 + (85 if code_res["compiles"] else 50) * 0.4 + hr_res["score"] * 0.3)
        
        # 4. Update Career Prediction scores
        logs.append(f"Orchestrating -> {self.placement_prediction.name()} (Step 4/4)")
        predict_res = self.placement_prediction.process(db, user_id, composite_score)
        logs.extend([f"[{self.placement_prediction.name()}]: {log}" for log in predict_res["logs"]])
        
        logs.append("Master Orchestrator: Interview evaluations pipeline completed.")
        return {
            "success": True,
            "communication": comm_res,
            "coding": code_res,
            "hr": hr_res,
            "placement_prediction": predict_res,
            "logs": logs
        }

    def dispatch_market_analysis(self, db: Session, user_id: int, payload: dict) -> dict:
        role = payload.get("role", "AI Software Engineer")
        github_username = payload.get("github_username", "developer")
        current_headline = payload.get("current_headline", "")
        current_summary = payload.get("current_summary", "")
        skills = payload.get("skills", ["Python", "FastAPI"])
        
        logs = ["Master Orchestrator: Initializing sequence 'market_analysis'."]
        
        # 1. Market Intel
        logs.append(f"Orchestrating -> {self.market_intelligence.name()} (Step 1/3)")
        intel_res = self.market_intelligence.process(db, user_id, role)
        logs.extend([f"[{self.market_intelligence.name()}]: {log}" for log in intel_res["logs"]])
        
        # 2. GitHub Audit
        logs.append(f"Orchestrating -> {self.github_analyzer.name()} (Step 2/3)")
        github_res = self.github_analyzer.process(db, user_id, github_username)
        logs.extend([f"[{self.github_analyzer.name()}]: {log}" for log in github_res["logs"]])
        
        # 3. LinkedIn Optimizer
        logs.append(f"Orchestrating -> {self.linkedin_optimizer.name()} (Step 3/3)")
        linkedin_res = self.linkedin_optimizer.process(db, user_id, current_headline, current_summary, skills)
        logs.extend([f"[{self.linkedin_optimizer.name()}]: {log}" for log in linkedin_res["logs"]])
        
        logs.append("Master Orchestrator: Market intelligence search completed.")
        return {
            "success": True,
            "market_intelligence": intel_res,
            "github_analysis": github_res,
            "linkedin_optimization": linkedin_res,
            "logs": logs
        }
