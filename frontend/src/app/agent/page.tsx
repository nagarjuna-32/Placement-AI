"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  UserPlus, 
  Calendar, 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  Compass, 
  Globe,
  Award,
  AlertTriangle,
  FolderKanban,
  Briefcase
} from "lucide-react";

export default function CareerAgentPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I am your AI Career Coach. I'm loading your placement data and evaluation history to customize our session..." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [topicInput, setTopicInput] = useState("React Server Components");
  const [brandingResult, setBrandingResult] = useState<any | null>(null);
  const [generatingBranding, setGeneratingBranding] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [role, setRole] = useState("AI Software Engineer");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([]);
  
  // Coach Directive states
  const [coachDirective, setCoachDirective] = useState<any | null>(null);
  const [loadingDirective, setLoadingDirective] = useState(true);

  // Fetch coach directive on load
  useEffect(() => {
    async function fetchCoachDirective() {
      try {
        const token = localStorage.getItem("token") || "mock_token";
        const res = await fetch("http://127.0.0.1:8000/career-agent/coach-directive", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCoachDirective(data);
          const greeting = `Welcome back! I've synchronized your mock score trends and resume skills. I detected some skill gaps in: ${data.weak_topics.join(", ")}. Let's target these study goals: ${data.next_goals.join(" ")}. Check out your recommended projects and job listings below!`;
          setMessages([
            { sender: "ai", text: greeting }
          ]);
        } else {
          setMockDirective();
        }
      } catch (err) {
        setMockDirective();
      } finally {
        setLoadingDirective(false);
      }
    }
    fetchCoachDirective();
  }, []);

  const setMockDirective = () => {
    const mockData = {
      weak_topics: ["SQL Query Optimization", "System Architecture Scales"],
      next_goals: [
        "Master database transaction isolation levels and B-Tree indexing.",
        "Design caching strategies utilizing Redis for high throughput API gateways."
      ],
      recommended_projects: [
        "Construct a high-performance transactional SQL ledger with Redis cache layers.",
        "Implement a custom asynchronous task scheduler from scratch."
      ],
      recommended_certs: [
        "Microsoft Certified: Power BI Data Analyst Associate",
        "AWS Certified Solutions Architect - Associate"
      ],
      recommended_jobs: [
        {
          title: "Backend Python Developer",
          company: "Razorpay",
          location: "Remote",
          type: "full-time",
          mode: "remote",
          salary: "₹12L - ₹18L",
          match_score: 85,
          missing_skills: ["AWS", "Git"],
          why_matches: "Proficiency in FastAPI and database schemas maps to Razorpay payment engines.",
          apply_url: "https://www.naukri.com"
        },
        {
          title: "AI Software Engineer",
          company: "Google",
          location: "Bangalore, India",
          type: "full-time",
          mode: "hybrid",
          salary: "₹24L - ₹32L",
          match_score: 92,
          missing_skills: ["Docker", "Kubernetes"],
          why_matches: "Matches your deep learning and FastAPI experience.",
          apply_url: "https://www.linkedin.com/jobs"
        }
      ]
    };
    setCoachDirective(mockData);
    setMessages([
      { sender: "ai", text: `Welcome back! I've loaded your profile directives. Focus on bridging gaps in SQL optimization and System Design. Let's work on: ${mockData.next_goals[0]}` }
    ]);
  };

  const triggerOrchestratedMarketSearch = async () => {
    setIsOrchestrating(true);
    setOrchestratorLogs(["Initializing Master Orchestrator (AI CEO)...", "Routing to market intelligence channels..."]);
    
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/orchestrator/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          request_type: "market_analysis",
          payload: {
            role: role,
            github_username: "alexmercer",
            current_headline: "Student at Career OS",
            current_summary: "Interested in software development.",
            skills: ["Python", "FastAPI", "React", "Next.js"]
          }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrchestratorLogs(data.logs || ["Search successful."]);
        
        if (data.linkedin_optimization) {
          setBrandingResult({
            post_content: (
              `🚀 Completed Orchestrated Career Search with Master Orchestrator!\n\n` +
              `Headline Suggestion: ${data.linkedin_optimization.headline}\n\n` +
              `Summary Preview: ${data.linkedin_optimization.summary}`
            ),
            professional_bio: data.linkedin_optimization.headline
          });
        }
      } else {
        setOrchestratorLogs(prev => [...prev, "Server responded with error. Running local simulator..."]);
        simulateMarketSearch();
      }
    } catch (e) {
      console.log("Offline: Simulating market search client-side.");
      simulateMarketSearch();
    } finally {
      setIsOrchestrating(false);
    }
  };

  const simulateMarketSearch = () => {
    const mockLogs = [
      "Master Orchestrator: Initializing sequence 'market_analysis'.",
      "Orchestrating -> Market Intelligence Agent (Step 1/3)",
      "[Market Intelligence Agent]: Querying hiring trends database for role: 'AI Software Engineer'.",
      "[Market Intelligence Agent]: Scraping active job index metrics and demand coefficients.",
      "[Market Intelligence Agent]: Aggregated latest market averages and skills thresholds.",
      "Orchestrating -> GitHub Analyzer Agent (Step 2/3)",
      "[GitHub Analyzer Agent]: Querying GitHub API stubs for user profile: 'alexmercer'.",
      "[GitHub Analyzer Agent]: Retrieving repository metadata and language percentages.",
      "[GitHub Analyzer Agent]: Analyzing commit schedules and developer output scores.",
      "[GitHub Analyzer Agent]: GitHub developer audit complete. Score set to 85/100.",
      "Orchestrating -> LinkedIn Optimizer Agent (Step 3/3)",
      "[LinkedIn Optimizer Agent]: Parsing current headline configuration structures.",
      "[LinkedIn Optimizer Agent]: Generating SEO-optimized headline styles.",
      "[LinkedIn Optimizer Agent]: Composing executive professional summaries emphasizing skill sets.",
      "[LinkedIn Optimizer Agent]: LinkedIn profile optimized headlines stored.",
      "Master Orchestrator: Market intelligence search completed."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setOrchestratorLogs(prev => [...prev.slice(0, -1), mockLogs[index], "Collaborating..."]);
        index++;
      } else {
        setOrchestratorLogs(mockLogs);
        setBrandingResult({
          post_content: (
            `🚀 Completed Orchestrated Career Search with Master Orchestrator!\n\n` +
            `Headline Suggestion: Software Engineer | Specializing in FastAPI | Python | React | Next.js | Building Scalable Web & AI Systems\n\n` +
            `Summary Preview: Passionate software engineer focused on building robust and scalable systems. Experienced in developing applications using FastAPI, Python, React, Next.js.`
          ),
          professional_bio: "Software Engineer | Specializing in FastAPI | Python | React | Next.js"
        });
        clearInterval(interval);
      }
    }, 250);
  };

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const newLog = [...messages, { sender: "user", text: inputVal }];
    setMessages(newLog);
    setInputVal("");

    setTimeout(() => {
      let reply = "I've reviewed your query. Based on your evaluations, I suggest completing the 'Construct a high-performance transactional SQL ledger' project. It will improve your technical viva scores in databases.";
      const txt = inputVal.toLowerCase();
      if (txt.includes("cert") || txt.includes("course")) {
        reply = `I recommend taking the: ${coachDirective?.recommended_certs[0] || "AWS Solutions Architect certificate"}. It directly addresses your target certifications roadmap.`;
      } else if (txt.includes("weak") || txt.includes("skill") || txt.includes("gap")) {
        reply = `Your active weak areas from past evaluations are: ${coachDirective?.weak_topics.join(", ") || "SQL optimization"}. Focus on the study goals in the top directive panel.`;
      } else if (txt.includes("job") || txt.includes("recommend")) {
        reply = `I have matched some top job roles for you, including: ${coachDirective?.recommended_jobs[0]?.title || "Backend Developer"} at ${coachDirective?.recommended_jobs[0]?.company || "Razorpay"}. See direct application links at the bottom.`;
      }
      setMessages(prev => [...prev, { sender: "ai", text: reply }]);
    }, 750);
  };

  const handleGenerateBranding = async () => {
    setGeneratingBranding(true);
    setBrandingResult(null);

    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/career-agent/branding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role, topic: topicInput })
      });

      if (res.ok) {
        const data = await res.json();
        setBrandingResult(data);
      } else {
        generateBrandingFallback();
      }
    } catch (e) {
      generateBrandingFallback();
    } finally {
      setGeneratingBranding(false);
    }
  };

  const generateBrandingFallback = () => {
    setBrandingResult({
      post_content: (
        `🚀 Excited to share my latest learning milestone in #${topicInput.replace(/\s+/g, "")}!\n\n` +
        `I have been diving deep into backend architecture pipelines, optimization metrics, and database design. ` +
        `Building scalable systems requires a deliberate focus on system latency, code structure, and security controls.\n\n` +
        `As I build my engineering background as an aspiring ${role}, I'm keen to connect with recruiters and technical leaders working on next-gen tools. ` +
        `Check out my profile or drop a comment! #SoftwareEngineering #TechCareer #DevWorkflows`
      ),
      professional_bio: (
        `Aspiring ${role} | Passionate about engineering high-efficiency backends, ` +
        `system architecture, and SQL databases. Certified cloud practitioner. Open to developer opportunities.`
      )
    });
  };

  const copyPost = () => {
    if (!brandingResult) return;
    navigator.clipboard.writeText(brandingResult.post_content);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  const copyBio = () => {
    if (!brandingResult) return;
    navigator.clipboard.writeText(brandingResult.professional_bio);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Career Agent Mentor</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Your premium career coach. Review personalized directives, generate branding logs, and get direct job application links.
          </p>
        </div>
        
        <button
          onClick={triggerOrchestratedMarketSearch}
          disabled={isOrchestrating}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>{isOrchestrating ? "Orchestrating..." : "Orchestrate Profile Search"}</span>
        </button>
      </div>

      {/* Live collaborating logs stream */}
      {isOrchestrating || orchestratorLogs.length > 0 ? (
        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Live Collaborating Agent Logs (Master Orchestrator CEO)
            </span>
            <button 
              onClick={() => setOrchestratorLogs([])}
              className="text-[9px] text-zinc-500 hover:text-zinc-300 font-bold"
            >
              Clear Logs
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto font-mono text-[10px] flex flex-col gap-1.5 scrollbar select-text pr-2">
            {orchestratorLogs.map((log, idx) => {
              let color = "text-zinc-400";
              if (log.startsWith("Master Orchestrator:")) {
                color = "text-indigo-400 font-bold";
              } else if (log.startsWith("Orchestrating ->")) {
                color = "text-amber-400 font-bold";
              } else if (log.includes("[Market Intelligence Agent]")) {
                color = "text-blue-400";
              } else if (log.includes("[GitHub Analyzer Agent]")) {
                color = "text-emerald-400";
              } else if (log.includes("[LinkedIn Optimizer Agent]")) {
                color = "text-purple-400";
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
      ) : null}

      {/* Coach Directive Panel */}
      {coachDirective && (
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 text-left relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">AI Career Coach Directives & Memory</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Active Weak Topics (Need Attention)</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {coachDirective.weak_topics.map((wt: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    {wt}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Target Study Objectives</span>
              <ul className="flex flex-col gap-2 mt-1.5">
                {coachDirective.next_goals.map((goal: string, idx: number) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Recommended Certifications</span>
              <ul className="flex flex-col gap-2 mt-1.5">
                {coachDirective.recommended_certs.map((cert: string, idx: number) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                    <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column Chat Agent */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              Agent Dialogue Chat
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar">
            {messages.map((log, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  log.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                  log.sender === "user" ? "bg-indigo-600 text-white" : "bg-zinc-850 text-indigo-400 border border-indigo-500/10"
                }`}>
                  {log.sender === "user" ? "Me" : "AG"}
                </div>
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  log.sender === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-zinc-950/60 border border-zinc-850 text-zinc-300"
                }`}>
                  {log.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2 py-2 overflow-x-auto">
            <button 
              onClick={() => setInputVal("Recommend a project based on my weak topics?")}
              className="text-[9px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 px-2 py-1 rounded text-zinc-400 shrink-0 font-semibold"
            >
              Recommend projects?
            </button>
            <button 
              onClick={() => setInputVal("What certifications should I prepare next?")}
              className="text-[9px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 px-2 py-1 rounded text-zinc-400 shrink-0 font-semibold"
            >
              Prepare certifications?
            </button>
            <button 
              onClick={() => setInputVal("Show my matched job recommendation listings")}
              className="text-[9px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 px-2 py-1 rounded text-zinc-400 shrink-0 font-semibold"
            >
              Match jobs?
            </button>
          </div>

          <div className="flex gap-2 border-t border-zinc-800 pt-3">
            <input 
              type="text" 
              placeholder="Ask career, branding, or project guidelines..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
              className="flex-1 bg-zinc-950 border border-zinc-850 text-xs px-3 py-2.5 rounded-xl text-zinc-300 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right column Branding assistant */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 justify-between h-[450px] overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2 mb-3">
              Branding & Bio Assistant
            </span>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-semibold text-zinc-400">Target Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="AI Software Engineer">AI Software Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-semibold text-zinc-400">Learning Topic</label>
                  <input 
                    type="text" 
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="React, Docker, AWS..."
                    className="bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateBranding}
                disabled={generatingBranding}
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all text-xs"
              >
                {generatingBranding ? "Compiling Branding Posts..." : "Generate LinkedIn Content"}
              </button>
            </div>

            {/* Content Results */}
            {brandingResult && (
              <div className="flex flex-col gap-4 mt-4 border-t border-zinc-850 pt-4 text-xs">
                {/* LinkedIn post */}
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-300">Generated LinkedIn Post:</span>
                    <button 
                      onClick={copyPost}
                      className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copiedPost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedPost ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <textarea 
                    readOnly 
                    value={brandingResult.post_content}
                    className="w-full bg-zinc-950 p-3 border border-zinc-850 rounded-lg text-[10px] text-zinc-400 h-24 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                {/* Professional bio */}
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-300">ATS Profile Bio Summary:</span>
                    <button 
                      onClick={copyBio}
                      className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copiedBio ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedBio ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <textarea 
                    readOnly 
                    value={brandingResult.professional_bio}
                    className="w-full bg-zinc-950 p-2.5 border border-zinc-850 rounded-lg text-[10px] text-zinc-400 h-14 focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Projects and Job Matches */}
      {coachDirective && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects & Practice */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
              Targeted Portfolio Projects
            </span>

            <div className="flex flex-col gap-3">
              {coachDirective.recommended_projects.map((proj: string, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl flex items-start text-left gap-3.5 relative overflow-hidden">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-lg shrink-0 mt-0.5">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h4 className="text-xs font-bold text-zinc-200 leading-normal">{proj}</h4>
                    <span className="text-[10px] text-zinc-500 font-medium">Resolves weak skills detected in past technical mocks.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Matches */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
              Matched Job Openings
            </span>

            <div className="flex flex-col gap-3">
              {coachDirective.recommended_jobs.map((job: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl flex justify-between items-start text-left gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-1.5 py-0.5 rounded font-bold uppercase">
                        {job.match_score}% Match
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200 leading-normal">{job.title}</h4>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">{job.company} • {job.location} • {job.salary}</span>
                    <span className="text-[9px] text-zinc-500 leading-relaxed font-normal mt-1 block">
                      {job.why_matches} {job.missing_skills.length > 0 && `Missing: ${job.missing_skills.join(", ")}`}
                    </span>
                  </div>
                  <a 
                    href={job.apply_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:text-white font-bold flex items-center gap-0.5 shrink-0 mt-0.5 bg-indigo-600/10 border border-indigo-500/15 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
