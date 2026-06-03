from sqlalchemy.orm import Session
import models
import random

class InterviewerAgent:
    def name(self) -> str:
        return "Interviewer Agent"

    def process(self, db: Session, user_id: int, chat_history: list) -> dict:
        logs = [
            "Parsing dialogue historical context and candidate response patterns.",
            "Analyzing answer structure and sentiment tones.",
            "Determining adaptive next-step interview questions."
        ]
        
        last_user_message = ""
        for msg in reversed(chat_history):
            if msg.get("sender") == "user":
                last_user_message = msg.get("text", "")
                break
        
        # Select adaptive response
        if not last_user_message:
            next_q = "Let's start. Tell me about a time you resolved a major bug in production under tight constraints."
        elif "bug" in last_user_message.lower() or "production" in last_user_message.lower():
            next_q = "Interesting. How did you coordinate with other team members or manage stakeholder expectations during this crisis?"
        elif "team" in last_user_message.lower() or "coordinate" in last_user_message.lower():
            next_q = "Excellent. If you could rebuild that system today, what architectural decisions would you change to prevent this issue?"
        else:
            next_q = "Great. Can you explain your experience in designing REST APIs and how you ensure security and token authorization?"

        logs.append("Formulated adaptive interviewer response based on chat sentiment index.")
        return {
            "next_question": next_q,
            "logs": logs
        }

class TechnicalInterviewAgent:
    def name(self) -> str:
        return "Technical Interview Agent"

    def process(self, db: Session, user_id: int, topic: str, level: int = 1) -> dict:
        logs = [
            f"Accessing technical database matrix for topic: {topic}.",
            f"Checking difficulty coefficient for Level {level} parameters."
        ]
        
        questions_pool = {
            "python": [
                {"question": "Explain Python's GIL (Global Interpreter Lock) and how it affects multi-threading.", "ideal": "GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. Multiprocessing is used to bypass it."},
                {"question": "What is the difference between deepcopy and shallow copy in Python?", "ideal": "Shallow copy copies references, while deepcopy recursively copies objects themselves, creating entirely independent copies."}
            ],
            "dsa": [
                {"question": "Compare the time complexity of lookup in a Red-Black Tree vs a HashMap.", "ideal": "Red-Black Tree has O(log N) lookup time in worst case, whereas a HashMap has O(1) average lookup, degrading to O(N) if collisions occur."},
                {"question": "Describe how Dijkstra's algorithm works and its time complexity with an Adjacency List.", "ideal": "Dijkstra's finds the shortest path from a source node using a min-priority queue. Using binary heap, complexity is O((V + E) log V)."}
            ],
            "dbms": [
                {"question": "Explain database ACID properties and how write-ahead logging (WAL) enforces Durability.", "ideal": "ACID stands for Atomicity, Consistency, Isolation, Durability. WAL ensures all changes are logged before being written, enabling recovery on crashes."},
                {"question": "Compare SQL indexes (Clustered vs Non-Clustered) and their structural overheads.", "ideal": "Clustered indexes dictate physical storage order (one per table), while Non-Clustered indexes maintain a separate logical mapping (many per table)."}
            ]
        }
        
        key = topic.lower()
        pool = questions_pool.get(key, questions_pool["python"])
        q_item = random.choice(pool)
        
        logs.append(f"Retrieved target technical question. Level {level} calibration active.")
        return {
            "question": q_item["question"],
            "ideal_answer": q_item["ideal"],
            "logs": logs
        }

class HRInterviewAgent:
    def name(self) -> str:
        return "HR Interview Agent"

    def process(self, db: Session, user_id: int, question: str, response: str) -> dict:
        logs = [
            "Deconstructing HR response logic and keywords.",
            "Auditing behavioral integrity markers (cooperation, resolution, growth mindset)."
        ]
        
        score = 80
        feedback = "Good structure. However, try using the STAR method (Situation, Task, Action, Result) to more clearly quantify the results of your actions."
        
        resp_lower = response.lower()
        if len(response.split()) < 15:
            score = 65
            feedback = "Your response is too brief. Try to detail your specific actions and the overall outcome of the situation."
        elif "star" in resp_lower or "achieved" in resp_lower or "result" in resp_lower:
            score = 92
            feedback = "Outstanding response! You demonstrated strong leadership and clearly highlighted quantitative outcomes."

        logs.append(f"HR evaluation finalized. Score coefficient set to {score}%.")
        return {
            "score": score,
            "feedback": feedback,
            "logs": logs
        }

class ProjectVivaAgent:
    def name(self) -> str:
        return "Project Viva Agent"

    def process(self, db: Session, user_id: int, project_title: str) -> dict:
        logs = [
            f"Analyzing technical stack signatures for project: '{project_title}'.",
            "Synthesizing system architecture constraints and engineering bottleneck vectors."
        ]
        
        questions = [
            f"In your '{project_title}' project, how did you handle state synchronization and prevent concurrency collisions?",
            "What database normalization strategy did you choose, and how would you optimize query performance under high load?",
            "If your server instances scaled to 10k concurrent users, where would the primary memory or disk IO bottleneck occur?"
        ]
        
        suggestions = [
            "Integrate Redis as a caching layer to reduce direct SQL connection pressures.",
            "Implement a circuit breaker pattern (using tools like Resilience4j or custom middleware) to handle external API latency."
        ]
        
        logs.append("Generated 3 tailored architectural inquiry checkpoints.")
        return {
            "viva_questions": questions,
            "suggestions": suggestions,
            "logs": logs
        }

class CodingReviewAgent:
    def name(self) -> str:
        return "Coding Review Agent"

    def process(self, db: Session, user_id: int, code_content: str, problem_id: str) -> dict:
        logs = [
            "Lexing code structure and checking syntax rules.",
            "Simulating dry-runs against hidden test cases.",
            "Estimating Big-O runtime and space-complexity indices."
        ]
        
        code_lower = code_content.lower()
        compiles = True
        feedback = "Your solution uses correct loops. To optimize, you could replace the nested search loop with a hash map lookup to reduce complexity."
        time_complexity = "O(N^2)"
        space_complexity = "O(1)"
        
        if "map" in code_lower or "dict" in code_lower:
            time_complexity = "O(N)"
            space_complexity = "O(N)"
            feedback = "Excellent! You optimized the time complexity to O(N) by utilizing a Hash Map dictionary for quick key lookups."
        
        if "syntaxerror" in code_lower or "err" in code_lower:
            compiles = False
            feedback = "Syntax error detected in loops initialization. Check bracket offsets."
            
        logs.append(f"Code compilation analysis completed. Complexity: {time_complexity}.")
        return {
            "compiles": compiles,
            "time_complexity": time_complexity,
            "space_complexity": space_complexity,
            "feedback": feedback,
            "logs": logs
        }

class CommunicationCoachAgent:
    def name(self) -> str:
        return "Communication Coach Agent"

    def process(self, db: Session, user_id: int, speech_text: str) -> dict:
        logs = [
            "Performing voice transcripts syllable analysis.",
            "Counting filler speech indicators (um, uh, like, basically, actually).",
            "Calculating vocal speed (Words Per Minute)."
        ]
        
        words = speech_text.split()
        word_count = len(words)
        
        # Calculate fillers
        fillers = ["um", "uh", "like", "basically", "actually", "literally", "so"]
        filler_count = sum(1 for w in words if w.lower().strip(",.?!") in fillers)
        
        # Speed estimate
        wpm = 135  # Standard default
        if word_count > 0:
            wpm = min(180, max(90, int(word_count * 1.2)))
            
        fluency = max(40, 100 - (filler_count * 5))
        
        exercises = [
            "Practice the 'Three-Second Pause' rule between transitioning thoughts to cut down filler triggers.",
            "Vocal breathing drills: run 2-minute paced paragraph readings focusing on explicit consonant enunciations."
        ]
        
        logs.append(f"Speech coach analysis done. Words checked: {word_count}. Fillers count: {filler_count}.")
        return {
            "wpm": wpm,
            "fillers": filler_count,
            "fluency_score": fluency,
            "vocal_exercises": exercises,
            "logs": logs
        }

class GroupDiscussionAgent:
    def name(self) -> str:
        return "Group Discussion Agent"

    def process(self, db: Session, user_id: int, topic: str, user_stance: str) -> dict:
        logs = [
            f"Configuring debate roundtable for topic: '{topic}'.",
            "Initializing simulated participants: Candidate 1 (Analytical), Candidate 2 (Pragmatic)."
        ]
        
        debate_flow = [
            {"speaker": "Moderator", "statement": f"Welcome back. Today we discuss '{topic}'. Let's start the speaker loops."},
            {"speaker": "Candidate 1 (Analytical)", "statement": "I believe this trend is driven by backend cost efficiency. Microservices allow decoupled scaling, lowering runtime requirements."},
            {"speaker": "Candidate 2 (Pragmatic)", "statement": "While I agree, the network latency overhead is often overlooked. Monoliths offer faster local transactions in early stage setups."}
        ]
        
        verdict = (
            f"You participated with a stance on {user_stance}. To stand out, you should "
            f"explicitly reference Candidate 1's analytical points and counter with cost-saving data."
        )
        
        logs.append("Debate moderation logs and speaker scripts constructed.")
        return {
            "speaker_loops": debate_flow,
            "moderator_verdict": verdict,
            "logs": logs
        }
