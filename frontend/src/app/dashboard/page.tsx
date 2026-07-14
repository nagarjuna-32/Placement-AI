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
  X,
  Plus
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>({
    plan_tier: "free",
    resume_analyses_used: 0,
    interviews_used: 0,
    gd_used: 0,
    resume_analyses_limit: 3,
    interviews_limit: 3,
    gd_limit: 3,
    expiry_date: null
  });

  // SVG Chart Mock Data
  const mockTrends = [
    { label: "Mock 1", tech: 62, comm: 70, conf: 65 },
    { label: "Mock 2", tech: 68, comm: 72, conf: 70 },
    { label: "Mock 3", tech: 75, comm: 78, conf: 73 },
    { label: "Mock 4", tech: 81, comm: 80, conf: 78 },
    { label: "Mock 5", tech: 85, comm: 83, conf: 82 }
  ];

  // Helper to generate SVG path
  const getSvgPath = (key: 'tech' | 'comm' | 'conf') => {
    return mockTrends.map((val, idx) => {
      const x = idx * 65 + 25;
      const y = 130 - (val[key] - 50) * 2.2;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const triggerOrchestratedSync = async () => {
    setIsOrchestrating(true);
    setOrchestratorLogs(["Initializing Master Orchestrator (AI CEO)...", "Resolving collaborator dependencies..."]);
    setIsLogDrawerOpen(true);
    
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8001/orchestrator/dispatch", {
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
        setOrchestratorLogs(data.logs || ["Orchestrated update completed successfully."]);
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

  // Weekly Improvement checklists
  const [weeklyGrowthTasks, setWeeklyGrowthTasks] = useState([
    { id: 1, text: "Resolve SQL Join latency issues (Level 11 check)", done: false },
    { id: 2, text: "Deliver friendly recruiter intro response without fillers", done: true },
    { id: 3, text: "Update resume with e-commerce dashboard metrics", done: false }
  ]);

  const toggleGrowthTask = (id: number) => {
    setWeeklyGrowthTasks(weeklyGrowthTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

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
        
        const readinessRes = await fetch("http://127.0.0.1:8001/profile/readiness", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (readinessRes.ok) {
          const data = await readinessRes.json();
          setReadiness(data);
        }

        const statsRes = await fetch("http://127.0.0.1:8001/tracker/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setTrackerStats(data);
        }

        const alertsRes = await fetch("http://127.0.0.1:8001/alerts/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data);
        }

        const subRes = await fetch("http://127.0.0.1:8001/profile/subscription", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (subRes.ok) {
          const data = await subRes.json();
          setSubscription(data);
        }
      } catch (err) {
        console.log("FastAPI offline, using mock stubs:", err);
        setMockAlerts();
      }
    }
    fetchData();
  }, []);

  const setMockAlerts = () => {
    setAlerts([
      { id: 1, title: "New High Match Job Posted", message: "Google just posted a new 'AI Software Engineer' role that matches 92% of your resume skills!", read: false, created_at: new Date().toISOString() },
      { id: 2, title: "Salary Increase Alert", message: "Market average salary for 'Data Analyst' positions increased by 8% in Bangalore.", read: false, created_at: new Date().toISOString() },
      { id: 3, title: "Profile Audit Complete", message: "Your GitHub developer score was evaluated at 85/100. Review suggestions.", read: true, created_at: new Date().toISOString() }
    ]);
  };

  const markAlertAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token") || "mock_token";
      await fetch(`http://127.0.0.1:8001/alerts/read/${id}`, {
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

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8001/reports/readiness", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Unable to fetch PDF report from server.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PlaceMate_Placement_Readiness_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradePlan = async (tier: string, amount: number) => {
    setUpgradeLoading(true);
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8001/payments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan_tier: tier, amount })
      });
      if (!res.ok) throw new Error("Order creation failed");
      const order = await res.json();
      
      const loaded = await loadRazorpayScript();
      if (!loaded || order.order_id.startsWith("order_mock")) {
        alert("Running offline sandbox payment checkout...");
        const verifyRes = await fetch("http://127.0.0.1:8001/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: order.order_id,
            razorpay_payment_id: "pay_mock_123456",
            razorpay_signature: "sig_mock_123456"
          })
        });
        if (verifyRes.ok) {
          alert(`Upgrade successful! Welcome to the ${tier.toUpperCase()} plan!`);
          window.location.reload();
        } else {
          alert("Mock signature validation failed.");
        }
        return;
      }
      
      const options = {
        key: order.key_id,
        amount: order.amount * 100,
        currency: order.currency,
        name: "PlaceMate AI",
        description: `Upgrade to ${tier.toUpperCase()} Plan`,
        order_id: order.order_id,
        handler: async function (response: any) {
          const verifyRes = await fetch("http://127.0.0.1:8001/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          if (verifyRes.ok) {
            alert(`Upgrade successful! Welcome to the ${tier.toUpperCase()} plan!`);
            window.location.reload();
          } else {
            alert("Payment signature verification failed.");
          }
        },
        prefill: {
          name: readiness.status,
          email: "student@placemate.ai"
        },
        theme: {
          color: "#6366f1"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    } finally {
      setUpgradeLoading(false);
      setShowUpgradeModal(false);
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="flex flex-col gap-8 py-4 relative text-left">
      {/* Header and alerts bell */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Career Operating System</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Analyze your Career Health index, track applications, and consult your personal AI Career Agent.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={triggerOrchestratedSync}
            disabled={isOrchestrating}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow shadow-indigo-600/10 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{isOrchestrating ? "Orchestrating..." : "Orchestrate Profile Sync"}</span>
          </button>

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
            Placement Readiness
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
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Readiness</span>
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
              Targeting: {recommendedCompanies.join(", ")}
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
              <span className="text-[10px] font-semibold text-zinc-500">Applications</span>
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

        {/* ATS score details */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block mb-2">
              ATS Score & Referrals
            </span>
            <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">ATS Score</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-0.5">{readiness.resume_score}/100</span>
              </div>
              <Link href="/resume-analyzer" className="text-[10px] text-indigo-400 hover:text-white font-bold flex items-center gap-0.5">
                Optimize <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-4 bg-zinc-950 border border-zinc-850 p-2 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 font-semibold select-all truncate flex-1 pl-1">
                ALEX125PLACEMATE
              </span>
              <button
                onClick={copyReferralCode}
                className="p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors border border-zinc-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          <div className="text-[8px] text-zinc-650 text-center font-bold">
            Referrals program active. 3/5 points to free tier month.
          </div>
        </div>
      </div>

      {/* Subscription & Plan Usage */}
      <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase">
              Subscription & Usage Statistics
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase">
            Active Plan: {subscription.plan_tier}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">Resume Analysis Usage</span>
              <span className="text-zinc-200 font-bold">{subscription.resume_analyses_used} / {subscription.resume_analyses_limit}</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${Math.min(100, (subscription.resume_analyses_used / subscription.resume_analyses_limit) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">Mock Interview Usage</span>
              <span className="text-zinc-200 font-bold">{subscription.interviews_used} / {subscription.interviews_limit}</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${Math.min(100, (subscription.interviews_used / subscription.interviews_limit) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">Group Discussion Usage</span>
              <span className="text-zinc-200 font-bold">{subscription.gd_used} / {subscription.gd_limit}</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${Math.min(100, (subscription.gd_used / subscription.gd_limit) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-zinc-900 pt-3 mt-1 text-xs">
          <span className="text-zinc-500 font-medium">
            Plan Expiration: {subscription.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString() : "Never (Free Tier)"}
          </span>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow shadow-indigo-600/10"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Second Row: Activities, SVG Performance Chart, Career Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Activities & Weekly Checklist */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Progression checklist */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
              Activities Queue
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
                  <div className="flex-1 flex flex-col gap-1">
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

          {/* Weekly Growth index Checklist */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
              Weekly Improvement checklist
            </span>
            <div className="flex flex-col gap-2.5">
              {weeklyGrowthTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleGrowthTask(task.id)}
                  className={`p-2.5 bg-zinc-950/40 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    task.done ? "border-emerald-500/20 bg-emerald-950/5 text-zinc-500" : "border-zinc-850 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <span className="text-xs font-medium">{task.text}</span>
                  {task.done ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Performance score trends line chart */}
        <div className="lg:col-span-1 p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4 text-left">
          <div>
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-900 pb-2 mb-3">
              Performance Trend Index
            </span>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
              Track communication, technical, and confidence progress metrics over the last 5 mock evaluations.
            </p>
          </div>

          {/* Interactive SVG Chart container */}
          <div className="w-full bg-zinc-950/70 border border-zinc-850 rounded-xl p-3 flex items-center justify-center relative shadow-inner h-40">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1="20" y1="75" x2="280" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1="20" y1="130" x2="280" y2="130" stroke="rgba(255,255,255,0.1)" />

              {/* Technical Path (Indigo) */}
              <path d={getSvgPath('tech')} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
              {/* Communication Path (Emerald) */}
              <path d={getSvgPath('comm')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,2" />
              {/* Confidence Path (Amber) */}
              <path d={getSvgPath('conf')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

              {/* Data circles for points */}
              {mockTrends.map((val, idx) => {
                const cx = idx * 65 + 25;
                const cyTech = 130 - (val.tech - 50) * 2.2;
                const cyComm = 130 - (val.comm - 50) * 2.2;
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cyTech} r="3.5" fill="#6366f1" />
                    <circle cx={cx} cy={cyComm} r="3.5" fill="#10b981" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold px-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Technical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Communication</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Confidence</span>
          </div>
        </div>

        {/* AI Career Agent mentor panel */}
        <div className="lg:col-span-1 p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4 text-left">
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

          <div className="flex gap-3 items-start bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl">
            <div className="p-2.5 bg-indigo-600/15 rounded-full text-indigo-400 border border-indigo-500/15 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 text-left flex-1">
              <span className="text-xs font-bold text-zinc-200">Active Mentor Directive:</span>
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
                <span className="text-[9px] text-zinc-500">freeCodeCamp (3.5 hours)</span>
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
          <div 
            onClick={() => setIsAlertDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-80 max-w-full h-full bg-zinc-950 border-l border-zinc-900 p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Job Alerts & Notifications
                </span>
                <button
                  onClick={() => setIsAlertDrawerOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

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
                    <span className="text-[8px] text-zinc-650 mt-1 font-semibold">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9px] text-zinc-650 text-center font-bold">
              Notifications trigger automatically upon profile match alerts.
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Orchestrator Log Drawer */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            onClick={() => setIsLogDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
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
            <div className="text-[9px] text-zinc-650 text-center font-bold pt-4 shrink-0 border-t border-zinc-900">
              Coordinated collaborate execution of 6 profile agents.
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl z-10 text-left">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
              <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Upgrade Your PlaceMate AI Subscription
              </span>
              <button onClick={() => setShowUpgradeModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { name: "Basic", price: 99, details: "10 Resume analysis & 10 Mock Interviews / month" },
                { name: "Pro", price: 299, details: "50 Resume analysis & 50 Mock Interviews / month" },
                { name: "Premium", price: 699, details: "Unlimited Resume analysis & Mock Interviews / month" }
              ].map((plan, idx) => (
                <div key={idx} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col justify-between gap-3 text-left">
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{plan.details}</p>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-indigo-400">₹{plan.price}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">/month</span>
                    <button
                      disabled={upgradeLoading}
                      onClick={() => handleUpgradePlan(plan.name.toLowerCase(), plan.price)}
                      className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-colors"
                    >
                      {upgradeLoading ? "Loading..." : "Purchase"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
