"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  ExternalLink, 
  Search, 
  Filter,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  Cpu,
  PlusCircle,
  X,
  Trash
} from "lucide-react";

interface JobMatch {
  id: number;
  title: string;
  company: string;
  description?: string;
  location?: string;
  type?: string;
  mode?: string;
  salary?: string;
  required_skills?: string[];
  match_score: number;
  missing_skills?: string[];
  why_matches?: string;
  apply_url?: string;
}

interface Application {
  id: number;
  company: string;
  position: string;
  status: string;
  applied_date?: string;
  salary_expectation?: string;
  interview_date?: string;
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<"search" | "tracker" | "salary">("search");
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [minMatch, setMinMatch] = useState(50);
  const [searchLinks, setSearchLinks] = useState<Record<string, string>>({});

  // Tracker State
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [appCompany, setAppCompany] = useState("");
  const [appPosition, setAppPosition] = useState("");
  const [appStatus, setAppStatus] = useState("applied");
  const [appSalary, setAppSalary] = useState("");
  const [appInterviewDate, setAppInterviewDate] = useState("");

  // Salary Predictor State
  const [predRole, setPredRole] = useState("AI Software Engineer");
  const [predExp, setPredExp] = useState(1);
  const [predLoc, setPredLoc] = useState("Bangalore");
  const [predSkills, setPredSkills] = useState("Python, FastAPI, PyTorch");
  const [predResult, setPredResult] = useState<any | null>(null);
  const [predicting, setPredicting] = useState(false);

  // Market Trends State
  const [marketTrends, setMarketTrends] = useState<any>({
    demanded_skills: [
      { skill: "Artificial Intelligence (LLMs, PyTorch)", demand_index: 98, growth: "+22% YoY" },
      { skill: "Cloud Engineering (AWS, Kubernetes)", demand_index: 92, growth: "+15% YoY" },
      { skill: "Data Engineering (Spark, Airflow)", demand_index: 89, growth: "+18% YoY" },
      { skill: "TypeScript / Next.js", demand_index: 82, growth: "+10% YoY" }
    ],
    fastest_growing_roles: [
      { title: "Generative AI Engineer", growth_rate: "145% Growth", avg_salary: "₹18L - ₹32L" },
      { title: "MLES / Platform Architect", growth_rate: "88% Growth", avg_salary: "₹22L - ₹36L" }
    ]
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "mock_token";
        
        // Fetch matched jobs
        const res = await fetch("http://127.0.0.1:8001/jobs/matches", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else {
          setMockJobs();
        }

        // Fetch applications
        const appsRes = await fetch("http://127.0.0.1:8001/tracker/applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appsRes.ok) {
          const data = await appsRes.json();
          setApplications(data);
        } else {
          setMockApplications();
        }

        // Fetch market trends
        const marketRes = await fetch("http://127.0.0.1:8001/market/trends");
        if (marketRes.ok) {
          const data = await marketRes.json();
          setMarketTrends(data);
        }
      } catch (err) {
        console.log("FastAPI backend offline, loading stubs for Jobs OS:", err);
        setMockJobs();
        setMockApplications();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const setMockJobs = () => {
    setJobs([
      {
        id: 1,
        title: "AI Software Engineer",
        company: "Google",
        description: "Build state of the art generative AI systems, ML pipelines, and large scale user services.",
        location: "Bangalore, India",
        type: "full-time",
        mode: "hybrid",
        salary: "₹24L - ₹32L",
        required_skills: ["Python", "PyTorch", "FastAPI", "Docker", "Machine Learning"],
        match_score: 92,
        missing_skills: ["Docker", "Kubernetes"],
        why_matches: "Your resume highlights experience in Machine Learning, Python, and FastAPI which matches 3 out of 5 core tech requirements.",
        apply_url: "https://linkedin.com/jobs"
      },
      {
        id: 2,
        title: "Backend Python Developer",
        company: "Razorpay",
        description: "Work on high performance payment gateways and transactional ledgers using Python and SQL.",
        location: "Remote",
        type: "full-time",
        mode: "remote",
        salary: "₹12L - ₹18L",
        required_skills: ["Python", "SQL", "FastAPI", "AWS", "Git"],
        match_score: 85,
        missing_skills: ["AWS", "Git"],
        why_matches: "Strong proficiency in FastAPI and database queries matches Razorpay's transactional service demands.",
        apply_url: "https://naukri.com"
      }
    ]);
  };

  const setMockApplications = () => {
    setApplications([
      { id: 1, company: "Google", position: "AI Engineer", status: "applied", applied_date: "2026-06-01", salary_expectation: "₹28L" },
      { id: 2, company: "Nvidia", position: "ML Specialist", status: "interview", applied_date: "2026-05-20", salary_expectation: "₹32L", interview_date: "2026-06-10" },
      { id: 3, company: "Razorpay", position: "FastAPI Dev", status: "assessment", applied_date: "2026-05-28", salary_expectation: "₹15L" }
    ]);
  };

  const triggerSmartSearch = async (role: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8001/jobs/search-links?role=${encodeURIComponent(role)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchLinks(data);
      } else {
        generateSearchLinksFallback(role);
      }
    } catch (err) {
      generateSearchLinksFallback(role);
    }
  };

  const generateSearchLinksFallback = (role: string) => {
    const escaped = encodeURIComponent(role);
    setSearchLinks({
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${escaped}`,
      naukri: `https://www.naukri.com/${escaped.replace(/%20/g, "-")}-jobs`,
      unstop: `https://unstop.com/jobs?search=${escaped}`,
      internshala: `https://internshala.com/internships/keywords-${escaped}`
    });
  };

  // Add Job App Tracker
  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCompany || !appPosition) return;

    const payload = {
      company: appCompany,
      position: appPosition,
      status: appStatus,
      applied_date: new Date().toISOString().split("T")[0],
      salary_expectation: appSalary,
      interview_date: appInterviewDate
    };

    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8001/tracker/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(prev => [data, ...prev]);
      } else {
        addAppFallback(payload);
      }
    } catch (e) {
      addAppFallback(payload);
    }

    setAppCompany("");
    setAppPosition("");
    setAppSalary("");
    setAppInterviewDate("");
    setShowAddAppModal(false);
  };

  const addAppFallback = (payload: any) => {
    const mockApp = { id: Date.now(), ...payload };
    setApplications(prev => [mockApp, ...prev]);
  };

  const handleDeleteApplication = async (id: number) => {
    try {
      const token = localStorage.getItem("token") || "mock_token";
      await fetch(`http://127.0.0.1:8001/tracker/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.log("Deleted locally");
    }
    setApplications(applications.filter(a => a.id !== id));
  };

  const handleUpdateStatus = async (id: number, nextStatus: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    const payload = { ...app, status: nextStatus };
    
    try {
      const token = localStorage.getItem("token") || "mock_token";
      await fetch(`http://127.0.0.1:8001/tracker/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.log("Updated locally");
    }
    setApplications(applications.map(a => a.id === id ? { ...a, status: nextStatus } : a));
  };

  // Salary Predictor Submit
  const handlePredictSalary = async () => {
    setPredicting(true);
    setPredResult(null);

    const skills = predSkills.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      role: predRole,
      experience: predExp,
      location: predLoc,
      skills
    };

    try {
      const res = await fetch("http://127.0.0.1:8001/market/predict-salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPredResult(data);
      } else {
        predictSalaryFallback(payload);
      }
    } catch (e) {
      predictSalaryFallback(payload);
    } finally {
      setPredicting(false);
    }
  };

  const predictSalaryFallback = (payload: any) => {
    const len = payload.skills.length;
    const base = payload.role.includes("AI") ? 12 : 8;
    const est = base + (payload.experience * 2.5) + (len * 0.8);
    setPredResult({
      expected_salary_range: `₹${est.toFixed(1)}L - ₹${(est * 1.3).toFixed(1)}L`,
      market_average: `₹${(est * 1.15).toFixed(1)}L`,
      growth_potential: est > 16 ? "High" : "Moderate",
      factors: ["Evaluated from role criteria", "Experience premiums computed"]
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "all" || job.type === selectedType;
    const matchMode = selectedMode === "all" || job.mode === selectedMode;
    const matchScoreLimit = job.match_score >= minMatch;
    return matchQuery && matchType && matchMode && matchScoreLimit;
  });

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Tab select Header */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight">Jobs & Trackers</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Browse compatible profiles, track application timelines, and predict market compensation ratios.
          </p>
        </div>
        
        {/* Tab triggers */}
        <div className="flex gap-2 bg-zinc-950 border border-zinc-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "search" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Matched Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab("tracker")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "tracker" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Applications Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab("salary")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "salary" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salary Predictor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab 1: Search and Match lists */}
        {activeTab === "search" && (
          <>
            {/* Filters sidebar */}
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-5 h-fit lg:col-span-1">
              <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
                Filter Search
              </span>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Position Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Positions</option>
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Workplace Mode</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                </select>
              </div>

              {/* Smart query builder */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/80 pt-4">
                <span className="text-xs font-bold text-zinc-400 uppercase">Smart Query Linker</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="AI Specialist..."
                    id="smart-search-input-2"
                    className="bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-zinc-300 focus:outline-none flex-1 min-w-0"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("smart-search-input-2") as HTMLInputElement;
                      if (input && input.value) triggerSmartSearch(input.value);
                    }}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
                {Object.keys(searchLinks).length > 0 && (
                  <div className="flex flex-col gap-1.5 bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                    {Object.entries(searchLinks).map(([name, url]) => (
                      <a key={name} href={url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:text-white flex justify-between uppercase py-1 border-b border-zinc-900 last:border-b-0">
                        <span>{name}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Matches list */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <input 
                type="text" 
                placeholder="Search matching positions or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/30 border border-zinc-800 p-3 rounded-xl text-xs focus:outline-none"
              />

              <div className="flex flex-col gap-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 hover:border-indigo-500/20 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-left">
                        <h3 className="font-bold text-base text-zinc-100">{job.title}</h3>
                        <span className="text-[10px] text-zinc-400">{job.company} • {job.location}</span>
                      </div>
                      <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-500 font-bold">
                        {job.match_score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">{job.description}</p>
                    <a href={job.apply_url} target="_blank" rel="noreferrer" className="w-fit self-end px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1">
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Job application tracker */}
        {activeTab === "tracker" && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex justify-between items-center bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex-wrap gap-4">
              <span className="text-xs font-bold text-zinc-400 uppercase">Application Tracker Database</span>
              <button
                onClick={() => setShowAddAppModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log New Application</span>
              </button>
            </div>

            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Opportunity</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status Stage</th>
                    <th className="p-4">Interview Schedule</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-900/35 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-zinc-200">{app.position}</span>
                          <span className="text-[10px] text-zinc-500">{app.company} • Exp Salary: {app.salary_expectation || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400">{app.applied_date || "N/A"}</td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-300 font-semibold"
                        >
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-zinc-400">{app.interview_date || "Not Scheduled"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Log Modal */}
            {showAddAppModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 text-xs text-left relative shadow-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2">
                    <span className="font-bold text-zinc-200">Log Job Application</span>
                    <button onClick={() => setShowAddAppModal(false)} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-400">Company Name</label>
                    <input type="text" value={appCompany} onChange={(e) => setAppCompany(e.target.value)} placeholder="Google..." className="bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-200 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-400">Position Role</label>
                    <input type="text" value={appPosition} onChange={(e) => setAppPosition(e.target.value)} placeholder="AI Engineer..." className="bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-200 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-400">Expected Compensation</label>
                    <input type="text" value={appSalary} onChange={(e) => setAppSalary(e.target.value)} placeholder="₹24L..." className="bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-200 outline-none" />
                  </div>
                  
                  <button onClick={handleAddApplication} className="py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors mt-2 text-center">
                    Submit Record
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Salary predictor */}
        {activeTab === "salary" && (
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Input Config */}
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left h-fit md:col-span-1">
              <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
                Salary Settings
              </span>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-400">Target Role</label>
                  <input type="text" value={predRole} onChange={(e) => setPredRole(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-zinc-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-400">Experience (Years)</label>
                  <input type="number" min="0" value={predExp} onChange={(e) => setPredExp(Number(e.target.value))} className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-zinc-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-400">Location Area</label>
                  <input type="text" value={predLoc} onChange={(e) => setPredLoc(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-zinc-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-400">Key Skills (Comma separated)</label>
                  <input type="text" value={predSkills} onChange={(e) => setPredSkills(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-zinc-200 outline-none" />
                </div>

                <button
                  onClick={handlePredictSalary}
                  disabled={predicting}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors mt-2 text-xs"
                >
                  {predicting ? "Predicting..." : "Predict Expected Salary"}
                </button>
              </div>
            </div>

            {/* Outputs */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {predResult ? (
                <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-5 text-left">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prediction Outcome</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Expected Salary Range</span>
                      <span className="text-xl font-extrabold text-indigo-400 mt-1">{predResult.expected_salary_range}</span>
                    </div>
                    <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Market Average</span>
                      <span className="text-xl font-extrabold text-violet-400 mt-1">{predResult.market_average}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-zinc-900 pt-4">
                    <span className="text-xs font-bold text-zinc-300">Factors Evaluated:</span>
                    <div className="flex flex-col gap-1.5 text-zinc-400 text-[11px] leading-relaxed">
                      {predResult.factors.map((f: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-600 text-sm border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/10 h-full flex flex-col items-center justify-center gap-1">
                  <span>Enter parameter values and click Predict to calculate ranges.</span>
                </div>
              )}

              {/* Real time market trends index */}
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2">
                  Real-Time Hiring Market Trends
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Most Demanded Skills</span>
                    <div className="flex flex-col gap-2">
                      {marketTrends.demanded_skills.map((s: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-zinc-950/40 border border-zinc-900 rounded-lg text-[11px]">
                          <span className="font-semibold text-zinc-300">{s.skill}</span>
                          <span className="text-indigo-400 font-bold">{s.growth}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Fastest Growing Roles</span>
                    <div className="flex flex-col gap-2">
                      {marketTrends.fastest_growing_roles.map((r: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-zinc-950/40 border border-zinc-900 rounded-lg text-[11px]">
                          <span className="font-semibold text-zinc-300">{r.title}</span>
                          <span className="text-emerald-400 font-bold">{r.avg_salary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
