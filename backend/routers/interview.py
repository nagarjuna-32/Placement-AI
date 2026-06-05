from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
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
    # Enforce plan limits
    usage = db.query(models.SubscriptionUsage).filter(models.SubscriptionUsage.user_id == current_user.id).first()
    if not usage:
        usage = models.SubscriptionUsage(user_id=current_user.id)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        
    if usage.interviews_used >= usage.interviews_limit:
        raise HTTPException(
            status_code=403,
            detail=f"You have reached your subscription tier limit ({usage.interviews_limit} mock interviews). Please upgrade your plan."
        )

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
    
    # Increment usage counter
    usage.interviews_used += 1
    
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

# Global dictionary mapping core questions to premium answers for turn replay
SUGGESTED_ANSWERS = {
    "What is Python and why is it popular?": "Python is an interpreted, high-level, general-purpose language. It is popular because of its clean, readable syntax, dynamic typing, and a vast standard library and ecosystem (e.g., NumPy, Pandas, FastAPI) that makes it suitable for automation, web development, and data science.",
    "What are lists and tuples in Python?": "Lists are mutable, ordered collections defined with square brackets, allowing items to be modified, added, or removed. Tuples are immutable, ordered collections defined with parentheses, which are faster to iterate, use less memory, and can be used as dictionary keys.",
    "Explain the difference between a list and a tuple in Python.": "The main difference is mutability. Lists are mutable and can be altered in-place, whereas tuples are immutable and their contents cannot be changed after creation. Tuples are stored in a single memory block, making them faster and more memory-efficient.",
    "What are Python decorators and how do they work?": "Decorators are design patterns that allow you to modify the behavior of a function or class. They wrap another function, using Python's closure mechanism, and are denoted by the '@decorator' syntax. They pass the original function as an argument and return a wrapper.",
    "Explain generators and iterators in Python. What are their memory benefits?": "Iterators implement '__iter__' and '__next__'. Generators are functions that use the 'yield' keyword to produce values lazily. Instead of storing a whole collection in memory, generators yield one item at a time, saving memory when processing massive data streams.",
    "How does memory management work in Python?": "Python uses a private heap to store objects and data structures. The runtime handles memory allocation automatically, using a combination of Reference Counting (reclaiming objects when their reference count drops to zero) and a cyclic Garbage Collector to detect reference loops.",
    "Explain the Global Interpreter Lock (GIL) and its implications for multi-threading.": "The GIL is a mutex that prevents multiple native threads from executing Python bytecodes at once. This ensures thread-safety but makes CPU-bound multi-threading single-threaded in practice. For true parallel CPU execution, you should use 'multiprocessing' or async tasks.",
    "How would you implement custom metaclasses in Python and when are they useful?": "Metaclasses are classes of classes that define how classes are constructed. You inherit from 'type' and override '__new__' or '__init__'. They are useful for checking/validating class attributes at load-time, auto-registering classes, or modifying class structures.",
    "What is a relational database and what is SQL used for?": "A relational database stores data in structured tables with rows and columns, linked by relationships. SQL (Structured Query Language) is the standard language used to create, read, update, delete, and query relational data.",
    "What is the primary key in a database table?": "A primary key is a column or set of columns that uniquely identifies each row in a table. It cannot contain NULL values, and it automatically creates a unique index on the column for fast lookups.",
    "Explain the difference between SQL (relational) and NoSQL (non-relational) databases.": "SQL databases are relational, table-based, use a predefined schema, and scale vertically. NoSQL databases are non-relational, schema-less (document, key-value, graph, column-family), and scale horizontally, making them ideal for unstructured or rapidly changing data.",
    "What is the difference between an INNER JOIN and a LEFT JOIN?": "INNER JOIN returns rows only when there is a match in both tables. LEFT JOIN returns all rows from the left table, and the matched rows from the right table. If there is no match, the right table columns return NULL.",
    "What are database indexes and how do they improve query speeds?": "Indexes are data structures (like B-trees) that store pointers to table rows in a sorted order. They speed up SELECT queries by avoiding full table scans, though they add overhead to INSERT, UPDATE, and DELETE operations since the index must be updated.",
    "Explain database transactions and ACID properties.": "A transaction is a sequence of database operations treated as a single unit of work. ACID stands for Atomicity (all or nothing), Consistency (preserves database rules), Isolation (concurrent transactions don't interfere), and Durability (permanent changes once committed).",
    "How do you optimize a query that is running slowly in production?": "First, analyze the query execution plan (using EXPLAIN) to identify bottlenecks. Ensure proper indexes are created, avoid wildcard SELECT * queries, rewrite expensive subqueries as joins, partition large tables, and consider caching results in Redis.",
    "Explain database normalization and denormalization. What are the trade-offs?": "Normalization organizes database tables to minimize redundancy and dependency by splitting tables. Denormalization combines tables to improve read speed at the expense of write overhead and redundancy. Normalization favors write integrity; denormalization favors read performance.",
    "What is Machine Learning and what is supervised learning?": "Machine Learning is the study of computer algorithms that improve automatically through experience. Supervised learning is a subfield where models are trained on labeled datasets containing input-output pairs to predict outputs for unseen data.",
    "What is the difference between regression and classification?": "Regression predicts continuous numerical values (e.g., housing prices), whereas classification predicts discrete class labels or categories (e.g., spam vs. ham).",
    "What is overfitting in Machine Learning and how do you prevent it?": "Overfitting occurs when a model learns the noise in the training data rather than the underlying pattern, leading to high training accuracy but poor test accuracy. It is prevented using regularization (L1/L2), cross-validation, pruning decision trees, or dropout in neural networks.",
    "What is the purpose of train-test split and cross-validation?": "A train-test split divides data to evaluate the model on unseen data. Cross-validation (e.g., K-fold) divides data into multiple folds, training and testing multiple times to ensure the model generalizes well and isn't biased toward a specific split.",
    "Explain how a Random Forest classifier works.": "Random Forest is an ensemble learning method that builds multiple decision trees during training. It uses bootstrap aggregating (bagging) to train trees on random subsets of data and features, combining their outputs via majority voting (for classification) to reduce variance.",
    "Explain precision, recall, and F1-score. When would you prioritize one over another?": "Precision is the ratio of true positives to all predicted positives (focuses on minimizing false positives). Recall is the ratio of true positives to all actual positives (focuses on minimizing false negatives). F1-score is their harmonic mean. Prioritize precision when false positives are costly (e.g., spam filtering); prioritize recall when false negatives are dangerous (e.g., cancer diagnosis).",
    "Explain the mathematical formulation or concept of Support Vector Machines (SVM).": "SVM finds an optimal hyperplane in an N-dimensional space that maximizes the margin (distance) between data points of different classes. It uses support vectors (points closest to the boundary) and the kernel trick to map non-linear data into higher dimensions where it becomes linearly separable.",
    "Explain how gradient descent and optimization algorithms like Adam work.": "Gradient descent is an iterative optimization algorithm that minimizes a loss function by updating model weights in the opposite direction of the gradient. Adam (Adaptive Moment Estimation) combines momentum and RMSProp, computing adaptive learning rates for each parameter for faster convergence.",
    "What is FastAPI and what makes it different from other Python frameworks like Django/Flask?": "FastAPI is a modern, fast, asynchronous web framework for building APIs with Python. It differs by natively supporting async/await, using Pydantic for automated data validation and serialization, and generating interactive Swagger API documentation out of the box.",
    "What is Pydantic and how is it used in FastAPI?": "Pydantic is a data validation library that uses Python type hinting. In FastAPI, it validates incoming request payloads, serializes outgoing responses, enforces schema constraints, and auto-generates JSON schema documents.",
    "How do you handle dependency injection in FastAPI?": "FastAPI uses the 'Depends' function for dependency injection. It allows you to declare dependencies (like database sessions, authentication checks, or configuration objects) as parameters in path operations, promoting code reusability and testability.",
    "Explain how request routing and path parameters work in FastAPI.": "Routing is defined using decorators on the FastAPI app instance (e.g., '@app.get(\"/items/{item_id}\")'). Path parameters are captured directly from the URL path, validated using Pydantic typing, and passed to the operation function.",
    "Explain how background tasks are handled in FastAPI.": "FastAPI provides a 'BackgroundTasks' class. You declare it as a parameter in your route function and call 'add_task()' to run CPU-bound or I/O operations asynchronously after returning the response, without locking the request thread.",
    "How would you implement WebSockets in FastAPI?": "You import the 'WebSocket' class and define a route using '@app.websocket(\"/ws\")'. Inside the function, you call 'await websocket.accept()', and then use a loop with 'await websocket.receive_text()' and 'await websocket.send_text()' to handle real-time bi-directional communication.",
    "How does FastAPI leverage Python's async/await and ASGI for high performance?": "FastAPI is built on Starlette and Uvicorn, which implement the ASGI standard. It utilizes Python's 'asyncio' event loop to perform non-blocking asynchronous operations, allowing a single process to handle thousands of concurrent requests without thread overhead.",
    "Explain middleware and custom exception handling in FastAPI.": "Middleware is a function that runs before every request and after every response, modifying headers or logging requests. Custom exception handlers are registered using '@app.exception_handler(ExceptionClass)', allowing you to catch errors globally and return structured JSON responses.",
    "What is React and what are components?": "React is a JavaScript library for building user interfaces. Components are independent, reusable building blocks of UI that manage their own state and render HTML-like JSX structures based on props.",
    "What is JSX in React?": "JSX (JavaScript XML) is a syntax extension that allows you to write HTML-like structures directly inside JavaScript. Under the hood, Babel compiles JSX into 'React.createElement()' function calls.",
    "What is the difference between props and state in React?": "Props are read-only inputs passed from a parent component to a child component, making components reusable. State is local, mutable data managed internally by the component itself, which triggers a re-render when updated.",
    "Explain the React useState and useEffect hooks.": "useState declares a local state variable and a setter function. useEffect allows you to perform side effects (like data fetching, manual DOM updates, or setting up subscriptions) in functional components, running after rendering based on a dependency array.",
    "How does the virtual DOM work in React?": "The virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, compares it with the previous tree using a diffing algorithm (Reconciliation), and batch-updates only the changed elements in the real DOM.",
    "Explain Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) in Next.js.": "CSR renders pages entirely in the browser, downloading a blank HTML and bundle JS. SSR pre-renders HTML on the server for each request, delivering faster initial page loads and superior SEO. Next.js handles hydration to make the pre-rendered HTML interactive on the client.",
    "How do you optimize rendering performance in a large React application?": "Use 'useMemo' to cache expensive calculations, 'useCallback' to prevent function recreation on re-renders, 'React.memo' to skip child renders if props haven't changed, windowing/virtualization for large lists, and code-splitting/lazy-loading.",
    "Explain React Server Components (RSC) and how they differ from Client Components.": "RSC are components that execute exclusively on the server. They reduce client-side bundle size (zero bundle footprint), allow direct backend access (like querying a database), and improve page loading performance, whereas Client Components handle user interaction and browser hooks.",
    "Walk me through the primary project listed on your resume. What problem does it solve?": "My primary project is designed to address workflows and operational blockages. It simplifies tracking and provides real-time visibility, reducing manual overhead and improving reporting accuracy.",
    "What technologies did you choose for your project and why?": "I selected FastAPI for the backend due to its speed, typing, and automatic documentation; React for the frontend to create a responsive, component-driven UI; and PostgreSQL for a robust, relational data storage model. This stack offered high developer velocity and scaling capabilities.",
    "Describe the architecture and main modules of your project.": "The architecture follows a classic Client-Server design. The frontend client communicates via REST APIs with a microservice backend. The backend handles authentication, business logic, and queries a relational database, utilizing caching for performance optimization.",
    "How did you manage user data or state within your project?": "On the client side, state was managed using React Context API for global session data and local state for component UI. On the backend, user sessions were verified using stateless JWT tokens passed in headers, and user data was persisted in SQL tables with relations.",
    "What was the most challenging technical bug or bottleneck in your project, and how did you resolve it?": "The major bottleneck was slow query times during data loading. I diagnosed it using execution plans, identified missing indexes on foreign keys, and implemented database index caching. This reduced query latency by 75%.",
    "How did you implement security or data validation in your project?": "Data validation was handled at the entry point using Pydantic schemas in the backend API. Security was implemented using bcrypt for hashing passwords, JWT tokens for stateless authentication, CORS policies, and SQL injection prevention via ORM query binding.",
    "If you had to scale your project to support 100x traffic, what bottlenecks would you target and how?": "I would target database query bottlenecks by introducing Redis cache layer, scale the API horizontally behind an Nginx load balancer, configure read-replicas for database query distribution, and store static assets on a CDN.",
    "If you had to completely rewrite your project using a different stack, what trade-offs would you evaluate?": "I would evaluate moving to Next.js with Serverless functions. The trade-off is zero server maintenance and seamless frontend integration, vs cold start latency and less control over persistent database pooling."
}

def clean_question_text(q: str) -> str:
    import re
    # Remove tags like [Google Round] or [Technical Lead] or [Stress Round]
    return re.sub(r'\[.*?\]', '', q).strip()

def get_topics_for_role(role: str, resume_skills: List[str] = None) -> List[str]:
    role_lower = role.lower()
    available = ["Projects"]
    
    if resume_skills:
        skills_lower = [s.lower().strip() for s in resume_skills]
        # Only ask questions related to resume skills
        for topic in ADAPTIVE_QUESTIONS:
            if topic == "Projects":
                continue
            if topic.lower() in skills_lower:
                available.append(topic)
            elif topic == "Machine Learning" and any(x in skills_lower for x in ["ml", "machine learning", "deep learning", "neural", "pytorch", "tensorflow"]):
                available.append(topic)
    else:
        # Fallback or supplementary topics based on target role
        if "data" in role_lower or "analyst" in role_lower:
            available.extend(["Python", "SQL", "Machine Learning"])
        elif "frontend" in role_lower or "web" in role_lower or "react" in role_lower:
            available.extend(["React", "SQL"])
        elif "fastapi" in role_lower or "backend" in role_lower:
            available.extend(["Python", "SQL", "FastAPI"])
        else:
            available.extend(["Python", "SQL", "React"])
            
    # De-duplicate while maintaining list
    return list(dict.fromkeys(available))

def customize_question(question: str, personality: str, company: str, topic: str) -> str:
    styled_q = question
    if company:
        company_lower = company.lower()
        if "google" in company_lower:
            styled_q = f"At Google, we focus on engineering at massive scale. {question}"
        elif "amazon" in company_lower:
            styled_q = f"Given Amazon's Leadership Principle to 'Dive Deep', {question}"
        elif "nvidia" in company_lower:
            styled_q = f"In Nvidia's high-performance parallel systems environment, {question}"
        elif "razorpay" in company_lower:
            styled_q = f"Considering Razorpay's transactional architecture and need for high security, {question}"
        elif "microsoft" in company_lower:
            styled_q = f"From an enterprise reliability standpoint at Microsoft, {question}"
            
    if personality:
        p_lower = personality.lower()
        if "stress" in p_lower:
            styled_q = f"[Stress Round] You need to think quickly here: {styled_q}"
        elif "founder" in p_lower:
            styled_q = f"[Startup Focus] We need to ship fast and build clean. {styled_q}"
        elif "lead" in p_lower:
            styled_q = f"[Technical Lead] From a core architectural perspective: {styled_q}"
        elif "corporate" in p_lower:
            styled_q = f"[Corporate HR] Keeping alignment and structure in mind, {styled_q}"
        elif "friendly" in p_lower:
            styled_q = f"[Friendly Conversation] Let's chat about this: {styled_q}"
            
    return styled_q

@router.post("/adaptive/start", response_model=schemas.AdaptiveNextResponse)
def start_adaptive_interview(
    target_role: str,
    personality: Optional[str] = "Friendly Recruiter",
    company: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Enforce plan limits
    usage = db.query(models.SubscriptionUsage).filter(models.SubscriptionUsage.user_id == current_user.id).first()
    if not usage:
        usage = models.SubscriptionUsage(user_id=current_user.id)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        
    if usage.interviews_used >= usage.interviews_limit:
        raise HTTPException(
            status_code=403,
            detail=f"You have reached your subscription tier limit ({usage.interviews_limit} mock interviews). Please upgrade your plan."
        )
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
    
    # Customize question
    initial_q = customize_question(initial_q, personality, company, first_topic)
    
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
        },
        personality=personality,
        company=company
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
    
    # Fetch latest resume
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.id.desc()).first()
    resume_skills = resume.extracted_skills if resume else None
    topics = get_topics_for_role(target_role, resume_skills)
    
    # Keyword matching
    keywords = ["explain", "understanding", "framework", "technology"]
    current_topic = current_state.current_topic
    cleaned_latest = clean_question_text(latest_question)
    
    # Match keywords in question pool
    matched = False
    if current_topic in ADAPTIVE_QUESTIONS:
        for diff_level in ["easy", "medium", "hard", "expert"]:
            for q_obj in ADAPTIVE_QUESTIONS[current_topic][diff_level]:
                if q_obj["question"] == cleaned_latest:
                    keywords = q_obj["keywords"]
                    matched = True
                    break
            if matched:
                break
                
    # Check keyword matches
    match_count = sum(1 for kw in keywords if kw.lower() in latest_answer)
    
    # Base technical score calculation
    if len(latest_answer) < 10:
        ans_score = 25.0
    elif match_count >= 3:
        ans_score = 95.0
    elif match_count == 2:
        ans_score = 80.0
    elif match_count == 1:
        ans_score = 60.0
    else:
        ans_score = 40.0
        
    # Communication and confidence adjustments
    communication_score = 85.0
    confidence_score = 85.0
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
        word_count = len(latest_answer.split())
        wpm = (word_count / latest_answer_obj.speech_duration) * 60 if latest_answer_obj.speech_duration > 0 else 120
        if wpm < 70 or wpm > 210:
            communication_score -= 10.0
            confidence_score -= 5.0
            
    # Adjust grading based on interviewer personality
    p_lower = (current_state.personality or "").lower()
    if "stress" in p_lower:
        ans_score = max(0.0, ans_score - 15.0)
        confidence_score = max(0.0, confidence_score - 15.0)
        communication_score = max(0.0, communication_score - 10.0)
    elif "lead" in p_lower:
        ans_score = max(0.0, ans_score - 10.0)
    elif "friendly" in p_lower:
        ans_score = min(100.0, ans_score + 10.0)
        confidence_score = min(100.0, confidence_score + 10.0)
        communication_score = min(100.0, communication_score + 5.0)
    elif "founder" in p_lower:
        ans_score = min(100.0, ans_score + 5.0)
        communication_score = min(100.0, communication_score + 10.0)

    # Update running scores
    technical = (current_state.scores.get("technical", 50.0) * len(history) + ans_score) / (len(history) + 1)
    communication = (current_state.scores.get("communication", 50.0) * len(history) + communication_score) / (len(history) + 1)
    confidence = (current_state.scores.get("confidence", 50.0) * len(history) + confidence_score) / (len(history) + 1)
    
    prev_project_score = current_state.scores.get("project", 50.0)
    if current_topic == "Projects":
        project_score = (prev_project_score * len(history) + ans_score) / (len(history) + 1)
    else:
        project_score = prev_project_score
        
    problem_solving = (technical * 0.6 + confidence * 0.4)
    
    updated_scores = {
        "technical": technical,
        "communication": communication,
        "confidence": confidence,
        "problem_solving": problem_solving,
        "project": project_score
    }
    
    # Difficulty adjustment
    difficulty = current_state.difficulty
    consec_correct = current_state.consecutive_correct
    consec_wrong = current_state.consecutive_wrong
    
    if ans_score >= 70.0:
        consec_correct += 1
        consec_wrong = 0
        if ans_score >= 90.0:
            if difficulty == "easy":
                difficulty = "hard"
            elif difficulty == "medium":
                difficulty = "expert"
            elif difficulty in ["hard", "expert"]:
                difficulty = "expert"
        else:
            if difficulty == "easy":
                difficulty = "medium"
            elif difficulty == "medium":
                difficulty = "hard"
            elif difficulty in ["hard", "expert"]:
                difficulty = "expert"
    else:
        consec_correct = 0
        consec_wrong += 1
        if consec_wrong >= 2:
            difficulty = "easy"
        else:
            if difficulty == "expert":
                difficulty = "hard"
            elif difficulty == "hard":
                difficulty = "medium"
            elif difficulty in ["medium", "easy"]:
                difficulty = "easy"
                
    if is_nervous and difficulty != "easy":
        if difficulty == "expert":
            difficulty = "hard"
        elif difficulty == "hard":
            difficulty = "medium"
        elif difficulty == "medium":
            difficulty = "easy"
            
    # Check if session has finished
    MAX_QUESTIONS = 5
    if len(history) >= MAX_QUESTIONS:
        avg_tech = int(updated_scores["technical"])
        avg_comm = int(updated_scores["communication"])
        avg_conf = int(updated_scores["confidence"])
        avg_prob = int(updated_scores["problem_solving"])
        avg_proj = int(updated_scores["project"])
        
        readiness_score = int((avg_tech + avg_comm + avg_conf + avg_prob + avg_proj) / 5)
        
        strong_areas = []
        moderate_areas = []
        weak_areas = []
        
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
            
        for t in current_state.topics_asked:
            if t != "Projects":
                if avg_tech >= 75:
                    strong_areas.append(t)
                elif avg_tech >= 55:
                    moderate_areas.append(t)
                else:
                    weak_areas.append(t)
                    
        if not strong_areas: strong_areas = ["Basics", "Concept Recalls"]
        if not moderate_areas: moderate_areas = ["System Design"]
        if not weak_areas: weak_areas = ["Operating Systems", "Computer Networks"]
        
        behavior_critique = (
            f"The candidate showed solid baseline capability discussing {', '.join(strong_areas[:2])}. "
            f"Confidence and fluency adjusted smoothly to difficulty shifts, with an average communication clarity "
            f"rating of {avg_comm}%. "
        )
        if weak_areas:
            behavior_critique += f"Explanations on {', '.join(weak_areas[:2])} can be more rigorous and detail structural trade-offs. "
        behavior_critique += "Overall posture and pronunciation indices align with recruiter expectations."
        
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
        
        # Recruiter notes based on personality & company
        p_name = current_state.personality or "Friendly Recruiter"
        c_name = current_state.company or "General Company"
        
        if "stress" in p_name.lower():
            recruiter_notes = (
                f"STRESS ROUND EVALUATION FOR {c_name.upper()}:\n"
                f"Candidate was tested under intense pressure. Technical readiness score: {avg_tech}%. "
                f"Communication was rated at {avg_comm}% due to visible hesitation markers. "
                f"While they showed basic knowledge, they struggled to defend their architectural design when challenged. "
                f"Decision: Hold/Review."
            )
        elif "lead" in p_name.lower():
            recruiter_notes = (
                f"TECHNICAL LEAD FEEDBACK ({c_name}):\n"
                f"Candidate has reasonable high-level familiarity but lacks granular depth. "
                f"They explained basic patterns but missed low-level optimization parameters. "
                f"Problem solving was {avg_prob}%. Strong in {', '.join(strong_areas[:2])}, "
                f"but needs revision in {', '.join(weak_areas[:2])}. "
                f"Decision: Schedule follow-up technical screen focusing on system scaling."
            )
        elif "founder" in p_name.lower():
            recruiter_notes = (
                f"STARTUP FOUNDER MEMO:\n"
                f"Alex shows solid bias for action. They focus on what works, build speed, and practical trade-offs. "
                f"Communication is clean and down-to-earth ({avg_comm}%). "
                f"They understand end-to-end flow and project ownership. "
                f"Decision: Strong cultural fit. Recommend hiring for builder role."
            )
        elif "corporate" in p_name.lower():
            recruiter_notes = (
                f"CORPORATE HR RECORD ({c_name}):\n"
                f"Candidate demonstrated structured thinking and aligned well with business objectives. "
                f"Vocabulary was professional, and confidence scored {avg_conf}%. "
                f"They communicate values clearly, though they could be more concise. "
                f"Decision: Proceed to technical round."
            )
        else:
            recruiter_notes = (
                f"RECRUITER FEEDBACK ({c_name}):\n"
                f"Had a great introductory conversation with the candidate. "
                f"They have a very approachable demeanor, strong communication fluency ({avg_comm}%), and present their project work enthusiastically. "
                f"They are a quick learner who will integrate well into the team. "
                f"Decision: Proceed to next interview stage."
            )
            
        # Compile Replay list
        replay = []
        for h in history:
            q_clean = clean_question_text(h.question)
            ans = h.answer
            
            kw_list = []
            suggested = "A premium response would structure your answer using the STAR method (Situation, Task, Action, Result). State the core technology clearly, explain the architectural decisions or design patterns (like concurrency models, ACID compliance, or components lifecycle), detail how it handles scale, and conclude with the business/technical impact of your solution."
            for topic in ADAPTIVE_QUESTIONS:
                for diff in ["easy", "medium", "hard", "expert"]:
                    for q_obj in ADAPTIVE_QUESTIONS[topic][diff]:
                        if q_obj["question"] == q_clean:
                            kw_list = q_obj["keywords"]
                            break
            
            if q_clean in SUGGESTED_ANSWERS:
                suggested = SUGGESTED_ANSWERS[q_clean]
                
            m_cnt = sum(1 for kw in kw_list if kw.lower() in ans.lower())
            if len(ans) < 10:
                critique = "Your answer was extremely brief. In a real interview, you should elaborate on your logic, define terms, and provide context."
            elif m_cnt >= 3:
                critique = f"Excellent answer! You covered core keywords ({', '.join(kw_list)}). You showed deep conceptual understanding."
            elif m_cnt == 2:
                critique = f"Good answer. You covered key aspects like {', '.join(kw_list[:2])}. You could add more detail on the architectural impact."
            else:
                critique = "Your answer was a bit generic. Try to focus more on technical implementation, design choices, and mention specific terms."
                
            replay.append(schemas.AdaptiveReplayItem(
                question=h.question,
                answer=h.answer,
                feedback=critique,
                suggested_better_answer=suggested
            ))
            
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
            readiness_score=readiness_score,
            recruiter_notes=recruiter_notes,
            replay=replay
        )
        
        # Save Attempt to Database (Level 11 indicates Adaptive)
        new_attempt = models.InterviewAttempt(
            user_id=current_user.id,
            level=11,
            score=readiness_score,
            feedback=recruiter_notes,
            video_analysis={
                "eye_contact": avg_conf,
                "smile_frequency": 65,
                "posture": 90,
                "nervousness": 100 - avg_conf,
                "expressions": "Professional",
                "replay": [r.dict() for r in replay]
            },
            communication_metrics={
                "fluency": avg_comm,
                "speaking_speed": 135,
                "filler_words": ["um", "like"] if avg_comm < 80 else ["um"],
                "pronunciation": avg_comm + 2,
                "grammar": avg_comm + 4,
                "confidence": avg_conf,
                "clarity": avg_comm,
                "vocabulary": "Advanced" if avg_comm >= 80 else "Intermediate",
                "hesitation": 2 if avg_conf < 75 else 0
            }
        )
        
        # Award XP
        current_user.xp += 250
        current_user.streak += 1
        
        # Increment usage counter
        usage = db.query(models.SubscriptionUsage).filter(models.SubscriptionUsage.user_id == current_user.id).first()
        if usage:
            usage.interviews_used += 1
        
        db.add(new_attempt)
        db.commit()
        
        updated_state = schemas.AdaptiveState(
            difficulty=difficulty,
            current_topic=current_topic,
            topics_asked=current_state.topics_asked,
            consecutive_correct=consec_correct,
            consecutive_wrong=consec_wrong,
            scores=updated_scores,
            personality=current_state.personality,
            company=current_state.company
        )
        
        return schemas.AdaptiveNextResponse(
            next_question=None,
            is_finished=True,
            updated_state=updated_state,
            report=report
        )
        
    # Select next question (with dynamic follow-up support)
    next_question = None
    
    # Determine if last question was a follow-up
    last_was_followup = True
    for topic in ADAPTIVE_QUESTIONS:
        for diff in ["easy", "medium", "hard", "expert"]:
            if any(q_obj["question"] == cleaned_latest for q_obj in ADAPTIVE_QUESTIONS[topic][diff]):
                last_was_followup = False
                break
                
    if not last_was_followup:
        # User answer trigger keywords check
        ans_lower = latest_answer.lower()
        if any(w in ans_lower for w in ["database", "sql", "postgres", "redis", "mongodb", "cache", "query"]):
            next_question = "You mentioned database or caching layers in your explanation. Can you walk me through how you design the schema, manage connection pooling, and handle read/write scaling?"
        elif any(w in ans_lower for w in ["jwt", "auth", "login", "security", "token", "hash"]):
            next_question = "You highlighted authentication or security. How do you secure user credentials, manage token lifecycle (expiration/revocation), and mitigate XSS or CSRF vulnerabilities?"
        elif any(w in ans_lower for w in ["docker", "kubernetes", "aws", "cloud", "deploy", "ci/cd"]):
            next_question = "You mentioned containerization or cloud deployment. Can you explain your deployment pipeline, infrastructure choice, and how you configure load balancing?"
        elif any(w in ans_lower for w in ["model", "predict", "train", "classification", "regression", "fit"]):
            next_question = "You discussed machine learning models. How do you assess model bias, handle training-test splits under class imbalance, and optimize hyperparameters?"
        elif current_topic == "Projects":
            next_question = "For this project, what was the single biggest performance bottleneck or bug you encountered during development, and how did you resolve it?"
            
    if not next_question:
        questions_asked_on_topic = sum(1 for h in history if clean_question_text(h.question) in [q["question"] for diff in ["easy", "medium", "hard", "expert"] for q in ADAPTIVE_QUESTIONS.get(current_topic, {}).get(diff, [])])
        
        if questions_asked_on_topic >= 2:
            unasked_topics = [t for t in topics if t not in current_state.topics_asked]
            if unasked_topics:
                next_topic = unasked_topics[0]
            else:
                next_topic = topics[0]
            current_state.topics_asked.append(next_topic)
            current_topic = next_topic
        else:
            current_topic = current_state.current_topic
            
        pool = ADAPTIVE_QUESTIONS.get(current_topic, ADAPTIVE_QUESTIONS["Python"]).get(difficulty, ADAPTIVE_QUESTIONS["Python"]["easy"])
        
        asked_questions = [clean_question_text(h.question) for h in history]
        unasked_pool = [q for q in pool if q["question"] not in asked_questions]
        
        if unasked_pool:
            next_question = unasked_pool[0]["question"]
        else:
            all_questions_in_topic = [q["question"] for diff in ["easy", "medium", "hard", "expert"] for q in ADAPTIVE_QUESTIONS.get(current_topic, {}).get(diff, [])]
            fallback_pool = [q for q in all_questions_in_topic if q not in asked_questions]
            if fallback_pool:
                next_question = fallback_pool[0]
            else:
                next_question = "Explain how you troubleshoot system latency issues."
                
    # Customize next question
    next_question = customize_question(next_question, current_state.personality, current_state.company, current_topic)
    
    updated_state = schemas.AdaptiveState(
        difficulty=difficulty,
        current_topic=current_topic,
        topics_asked=current_state.topics_asked,
        consecutive_correct=consec_correct,
        consecutive_wrong=consec_wrong,
        scores=updated_scores,
        personality=current_state.personality,
        company=current_state.company
    )
    
    return schemas.AdaptiveNextResponse(
        next_question=next_question,
        is_finished=False,
        updated_state=updated_state,
        report=None
    )

