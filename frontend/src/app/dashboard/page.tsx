"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  FileDown, 
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Bell,
  Heart,
  Share2,
  Copy,
  Check,
  Briefcase,
  X
} from "lucide-react";

interface ReadinessData {
  resume_score: number;
  communication_score: number;
  technical_score: number;
  coding_score: number;
  readiness_score: number;
  status: string;
  xp: number;
  streak: number;
}

interface AppStats {
  total_applications: number;
  success_rate: number;
  active_interviews: number;
  offers_received: number;
}

interface AlertItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function StudentDashboard() {
  const [readiness, setReadiness] = useState<ReadinessData>({
    resume_score: 88,
    communication_score: 81,
    technical_score: 85,
    coding_score: 83,
    readiness_score: 84,
    status: "Interview Ready",
    xp: 1250,
    streak: 5
  });

  const [trackerStats, setTrackerStats] = useState<AppStats>({
    total_applications: 4,
    success_rate: 25,
    active_interviews: 2,
    offers_received: 1
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [placementProbability, setPlacementProbability] = useState(82);
  const [recommendedCompanies, setRecommendedCompanies] = useState(["Google", "Razorpay", "Nvidia"]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([]);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const triggerOrchestratedSync = async () => {
    setIsOrchestrating(true);
    setOrchestratorLogs(["Initializing Master Orchestrator (AI CEO)...", "Resolving collaborator dependencies..."]);
    setIsLogDrawerOpen(true);
    
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/orchestrator/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          request_type: "profile_update",
          payload: {
            filename: "Resume_Alex_Mercer_AI_Engineer.pdf",
            target_role: "AI Software Engineer"
          }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrchestratorLogs(data.logs || ["Orchestrated search completed successfully."]);
        if (data.placement_prediction) {
          setPlacementProbability(data.placement_prediction.placement_probability);
          setRecommendedCompanies(data.placement_prediction.recommended_companies);
          setReadiness(prev => ({
            ...prev,
            readiness_score: data.placement_prediction.placement_readiness_score,
            resume_score: data.resume_analysis?.ats_score || prev.resume_score
          }));
        }
      } else {
        setOrchestratorLogs(prev => [...prev, "Server error. Falling back to local mock sequence..."]);
        simulateOrchestratorSync();
      }
    } catch (e) {
      console.log("Offline: Simulating orchestrator sync client-side.");
      simulateOrchestratorSync();
    } finally {
      setIsOrchestrating(false);
    }
  };

  const simulateOrchestratorSync = () => {
    const mockLogs = [
      "Master Orchestrator: Initializing sequence 'profile_update'.",
      "Orchestrating -> Resume Analyzer Agent (Step 1/5)",
      "[Resume Analyzer Agent]: Parsing resume layout structure and font parameters.",
      "[Resume Analyzer Agent]: Extracting educational records and graduation details.",
      "[Resume Analyzer Agent]: Auditing technical skillsets and tool keyword distributions.",
      "[Resume Analyzer Agent]: Evaluating grammar configurations and active action-verbs.",
      "[Resume Analyzer Agent]: ATS audit finalized. Score parsed at 88/100.",
      "Orchestrating -> Job Matching Agent (Step 2/5)",
      "[Job Matching Agent]: Querying job tables for skills matching: Python, SQL, FastAPI.",
      "[Job Matching Agent]: Scrubbing LinkedIn, Naukri, and Internshala external stubs.",
      "[Job Matching Agent]: Found 3 matching jobs. Max match score: 85% if lists are populated.",
      "Orchestrating -> Skill Gap Agent (Step 3/5)",
      "[Skill Gap Agent]: Cross-referencing candidate skills against active industry demand statistics.",
      "[Skill Gap Agent]: Auditing gaps for key missing topics: Docker, AWS, CI/CD.",
      "[Skill Gap Agent]: Identified overall study gap timeline: 6 Weeks.",
      "Orchestrating -> Career Roadmap Agent (Step 4/5)",
      "[Career Roadmap Agent]: Synthesizing customized 6-month timeline for AI Software Engineer path.",
      "[Career Roadmap Agent]: Mapping certification pathways and milestones.",
      "[Career Roadmap Agent]: Roadmap schedule generated and stored.",
      "Orchestrating -> Placement Prediction Agent (Step 5/5)",
      "[Placement Prediction Agent]: Compiling composite metrics: resume index, speech checks, and coding scores.",
      "[Placement Prediction Agent]: Running predictive hiring probability models.",
      "[Placement Prediction Agent]: Hiring probability evaluated at 89%. Recommended companies loaded.",
      "Orchestrating -> Memory Agent (Final Audit)",
      "[Memory Agent]: Logging user action 'profile_update' into long-term profile records.",
      "[Memory Agent]: Updating preference metrics and progress parameters.",
      "[Memory Agent]: Memory records: synced portfolio settings successfully.",
      "Master Orchestrator: Profile updates pipeline execution completed."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setOrchestratorLogs(prev => [...prev.slice(0, -1), mockLogs[index], "Collaborating..."]);
        index++;
      } else {
        setOrchestratorLogs(mockLogs);
        setPlacementProbability(89);
        setRecommendedCompanies(["Google", "Razorpay", "Nvidia"]);
        setReadiness(prev => ({
          ...prev,
          readiness_score: 88,
          resume_score: 88
        }));
        clearInterval(interval);
      }
    }, 200);
  };

  const [tasks, setTasks] = useState([
    { id: 1, text: "Connect GitHub profile to trigger repository grading audits", done: false, points: 150, href: "/coding" },
    { id: 2, text: "Review LinkedIn profile optimize critique suggestions", done: false, points: 120, href: "/resume-analyzer" },
    { id: 3, text: "Pass Level 3 Mock HR Interview Panel", done: false, points: 250, href: "/interview" },
    { id: 4, text: "Post project build details on LinkedIn to boost branding", done: true, points: 100, href: "/agent" }
  ]);

  // Fetch from FastAPI
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "recruiter") {
      window.location.href = "/recruiter";
      return;
    }

    async function fetchData() {
      try {
        const token = localStorage.getItem("token") || "mock_token";
        
        // Fetch readiness
        const readinessRes = await fetch("http://127.0.0.1:8000/profile/readiness", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (readinessRes.ok) {
          const data = await readinessRes.json();
          setReadiness(data);
        }

        // Fetch Tracker Stats
        const statsRes = await fetch("http://127.0.0.1:8000/tracker/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setTrackerStats(data);
        }

        // Fetch Alerts
        const alertsRes = await fetch("http://127.0.0.1:8000/alerts/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data);
        }
      } catch (err) {
        console.log("FastAPI offline, using Career OS mock database overlays:", err);
        setMockAlerts();
      }
    }
    fetchData();
  }, []);

  const setMockAlerts = () => {
    setAlerts([
      { id: 1, title: "New High Match Job Posted", message: "Google just posted a new 'AI Software Engineer' role that matches 92% of your resume skills! Check matching list.", read: false, created_at: new Date().toISOString() },
      { id: 2, title: "Salary Increase Alert", message: "Market average salary for 'Data Analyst' positions increased by 8% in Bangalore area.", read: false, created_at: new Date().toISOString() },
      { id: 3, title: "Profile Audit Complete", message: "Your GitHub developer score was evaluated at 85/100. Check suggestions to improve.", read: true, created_at: new Date().toISOString() }
    ]);
  };

  const markAlertAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token") || "mock_token";
      await fetch(`http://127.0.0.1:8000/alerts/read/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.log("Offline: alert read saved client-side.");
    }
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleTaskToggle = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextDone = !t.done;
        if (nextDone) {
          setReadiness(prev => ({ ...prev, xp: prev.xp + t.points }));
        } else {
          setReadiness(prev => ({ ...prev, xp: prev.xp - t.points }));
        }
        return { ...t, done: nextDone };
      }
      return t;
    }));
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText("ALEX125PLACEMATE");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      const reportText = `
========================================
PLACEMATE AI - PLACEMENT READINESS REPORT
========================================
Candidate: Alex Mercer
Email: student@placemate.ai
Date Generated: ${new Date().toLocaleDateString()}

1. PERFORMANCE METRICS
----------------------
Career Health Score: ${readiness.readiness_score}/100
Status: ${readiness.status}
Resume ATS Score: ${readiness.resume_score}/100
Communication Coaching Score: ${readiness.communication_score}/100
Technical Fundamentals Score: ${readiness.technical_score}/100
Coding Execution Score: ${readiness.coding_score}/100

2. APPLICATION TRACKING STATISTICS
---------------------------------
Total Job Applications Submitted: ${trackerStats.total_applications}
Landed Placement Offers: ${trackerStats.offers_received}
Current Active Interview Pipelines: ${trackerStats.active_interviews}
Success Rate: ${trackerStats.success_rate}%

3. PRESCRIBED ACTION ITEMS
-------------------------
- Review project specifications on resume to integrate measurable performance indicators.
- Complete Speech Coach practice drills to reduce filler word counts below 2 per minute.
- Complete Mock Interview Level 2 and Level 3 to unlock technical coding parameters.
========================================
      `;
      
      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PlaceMate_Career_Health_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 1200);
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="flex flex-col gap-8 py-4 relative">
      {/* Header and alerts bell */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-6 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight">Career Operating System</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Analyze your Career Health index, track applications, and consult your personal AI Career Agent.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications Trigger Button */}
          {/* Orchestrate Sync button */}
          <button
            onClick={triggerOrchestratedSync}
            disabled={isOrchestrating}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow shadow-indigo-600/10 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{isOrchestrating ? "Orchestrating..." : "Orchestrate Profile Sync"}</span>
          </button>

          {/* Notifications Trigger Button */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl relative transition-all shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={downloadReport}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 border border-indigo-500/15 text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-600/30 disabled:opacity-50 transition-colors shadow"
          >
            <FileDown className="w-4 h-4" />
            <span>{downloading ? "Generating..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Grid: Health Score, Placement Probability, Application Tracker, Referral info */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Career Health Score */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 text-indigo-400 opacity-20">
            <Heart className="w-20 h-20" />
          </div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase z-10">
            Career Health Score
          </span>
          
          <div className="relative flex items-center justify-center z-10">
            <svg height="110" width="110">
              <circle
                stroke="rgba(63, 63, 70, 0.3)"
                fill="transparent"
                strokeWidth="6"
                r="44"
                cx="55"
                cy="55"
              />
              <circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 44}`}
                style={{ strokeDashoffset: `${2 * Math.PI * 44 - (readiness.readiness_score / 100) * (2 * Math.PI * 44)}` }}
                strokeLinecap="round"
                r="44"
                cx="55"
                cy="55"
                className="progress-ring-circle"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{readiness.readiness_score}</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Health index</span>
            </div>
          </div>

          <div className="z-10">
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
              {readiness.status}
            </span>
          </div>
        </div>

        {/* Placement Probability Gauge */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 text-emerald-400 opacity-20">
            <TrendingUp className="w-20 h-20" />
          </div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase z-10">
            Placement Probability
          </span>
          
          <div className="relative flex items-center justify-center z-10">
            <svg height="110" width="110">
              <circle
                stroke="rgba(63, 63, 70, 0.3)"
                fill="transparent"
                strokeWidth="6"
                r="44"
                cx="55"
                cy="55"
              />
              <circle
                stroke="#10b981"
                fill="transparent"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 44}`}
                style={{ strokeDashoffset: `${2 * Math.PI * 44 - (placementProbability / 100) * (2 * Math.PI * 44)}` }}
                strokeLinecap="round"
                r="44"
                cx="55"
                cy="55"
                className="progress-ring-circle"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{placementProbability}%</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Probability</span>
            </div>
          </div>

          <div className="z-10">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 truncate max-w-full">
              {recommendedCompanies.join(", ")}
            </span>
          </div>
        </div>

        {/* Application Tracker Overview */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
              Job Application Tracker
            </span>
            <Link 
              href="/jobs" 
              className="text-[10px] text-indigo-400 hover:text-white font-bold flex items-center gap-0.5"
            >
              Configure Tracker <ChevronRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex flex-col text-left">
              <span className="text-[10px] font-semibold text-zinc-500">Submitted Applications</span>
              <span className="text-2xl font-extrabold text-zinc-200 mt-1">{trackerStats.total_applications}</span>
            </div>
            <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex flex-col text-left">
              <span className="text-[10px] font-semibold text-zinc-500">Offers Landed</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1">{trackerStats.offers_received}</span>
            </div>
            <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex flex-col text-left">
              <span className="text-[10px] font-semibold text-zinc-500">Success Rate</span>
              <span className="text-2xl font-extrabold text-indigo-400 mt-1">{trackerStats.success_rate}%</span>
            </div>
            <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex flex-col text-left">
              <span className="text-[10px] font-semibold text-zinc-500">Active Pipelines</span>
              <span className="text-2xl font-extrabold text-amber-500 mt-1">{trackerStats.active_interviews}</span>
            </div>
          </div>
        </div>

        {/* Affiliate / Referrals details */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block mb-2">
              Referrals & Affiliate Program
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
              Share your custom code with fellow developers. For every student who completes a level 1 interview via your link, you get <span className="text-indigo-400 font-bold">1 Free Pro Month</span>!
            </p>

            <div className="flex items-center gap-2 mt-4 bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl">
              <span className="text-xs font-mono text-zinc-400 font-semibold select-all truncate flex-1 pl-1">
                ALEX125PLACEMATE
              </span>
              <button
                onClick={copyReferralCode}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors border border-zinc-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          <div className="text-[9px] text-zinc-500 italic text-center">
            🚀 3 successful referrals logged. Upgraded subscription active.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activities */}
        <div className="lg:col-span-1 p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
            Operating System Activities
          </span>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`p-3 bg-zinc-950/50 border rounded-xl flex items-start gap-3 transition-colors ${
                  task.done ? "border-indigo-500/20" : "border-zinc-800/60"
                }`}
              >
                <button 
                  onClick={() => handleTaskToggle(task.id)}
                  className="mt-0.5 text-zinc-500 hover:text-indigo-400 shrink-0"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-500/15" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className={`text-xs font-medium leading-relaxed ${task.done ? "line-through text-zinc-500" : "text-zinc-300"}`}>
                    {task.text}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-indigo-400">+{task.points} XP</span>
                    {!task.done && (
                      <Link 
                        href={task.href} 
                        className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-0.5"
                      >
                        Start <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Career Agent mentor panel */}
        <div className="lg:col-span-2 p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
              AI Career Agent Mentor
            </span>
            <Link 
              href="/agent" 
              className="text-[10px] text-indigo-400 hover:text-white font-bold flex items-center gap-0.5"
            >
              Consult Agent <ChevronRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="flex gap-4 items-start bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl">
            <div className="p-3 bg-indigo-600/15 rounded-full text-indigo-400 border border-indigo-500/15 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5 text-left">
              <span className="text-xs font-bold text-zinc-200">Weekly Mentor Directive:</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Alex, looking at your profile, your resume ATS score is high (88), but we need to verify your codebase skills. Connect your GitHub profile in the **Coding Sandbox** to generate a repository check. We also recommend studying **Docker Containers** to patch your missing skills list.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Next Recommended Actions:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg text-left">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded font-bold uppercase">Learning</span>
                <p className="text-[11px] font-semibold text-zinc-300 mt-1.5">Docker Containerization Guide</p>
                <span className="text-[9px] text-zinc-500">freeCodeCamp (3.5 hours video course)</span>
              </div>
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg text-left">
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/15 px-1.5 py-0.5 rounded font-bold uppercase">Certification</span>
                <p className="text-[11px] font-semibold text-zinc-300 mt-1.5">AWS Cloud Practitioner</p>
                <span className="text-[9px] text-zinc-500">Target for next month applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out notifications Drawer */}
      {isAlertDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsAlertDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Drawer content */}
          <div className="relative w-80 max-w-full h-full bg-zinc-950 border-l border-zinc-900 p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Job Alerts & Alerts
                </span>
                <button
                  onClick={() => setIsAlertDrawerOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Alert list */}
              <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[75vh]">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onClick={() => markAlertAsRead(alert.id)}
                    className={`p-3 border rounded-xl flex flex-col gap-1 text-left cursor-pointer transition-colors ${
                      alert.read 
                        ? "bg-zinc-900/20 border-zinc-900/60 opacity-60 hover:bg-zinc-900/40" 
                        : "bg-indigo-950/10 border-indigo-500/20 hover:bg-indigo-950/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[11px] font-bold text-zinc-200">{alert.title}</span>
                      {!alert.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0 animate-ping"></span>}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">{alert.message}</p>
                    <span className="text-[8px] text-zinc-600 mt-1 font-semibold">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9px] text-zinc-600 text-center font-bold">
              Notifications trigger automatically upon profile match alerts.
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Orchestrator Log Drawer */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsLogDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Drawer content */}
          <div className="relative w-96 max-w-full h-full bg-zinc-950 border-l border-zinc-900 p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3 shrink-0">
                <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Orchestrator Execution Logs
                </span>
                <button
                  onClick={() => setIsLogDrawerOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal Logs */}
              <div className="flex-1 bg-zinc-950 border border-zinc-900 p-4 rounded-xl font-mono text-[10px] overflow-y-auto text-left flex flex-col gap-2 scrollbar select-text shadow-inner">
                {orchestratorLogs.map((log, idx) => {
                  let color = "text-zinc-400";
                  if (log.startsWith("Master Orchestrator:")) {
                    color = "text-indigo-400 font-bold";
                  } else if (log.startsWith("Orchestrating ->")) {
                    color = "text-amber-400 font-bold";
                  } else if (log.includes("[Resume Analyzer Agent]")) {
                    color = "text-emerald-400";
                  } else if (log.includes("[Job Matching Agent]")) {
                    color = "text-blue-400";
                  } else if (log.includes("[Skill Gap Agent]")) {
                    color = "text-purple-400";
                  } else if (log.includes("[Career Roadmap Agent]")) {
                    color = "text-pink-400";
                  } else if (log.includes("[Placement Prediction Agent]")) {
                    color = "text-cyan-400";
                  } else if (log.includes("[Memory Agent]")) {
                    color = "text-violet-400";
                  } else if (log === "Collaborating...") {
                    color = "text-zinc-500 animate-pulse";
                  }
                  return (
                    <div key={idx} className={color}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[9px] text-zinc-600 text-center font-bold pt-4 shrink-0 border-t border-zinc-900">
              Coordinated collaborate execution of 6 profile agents.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
