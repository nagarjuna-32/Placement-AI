"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  FileCheck, 
  Mic, 
  Brain, 
  Code, 
  Users, 
  Map, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle,
  Zap,
  Star,
  Users2
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: FileCheck,
      title: "AI Resume Analyzer",
      description: "Upload your resume for real-time ATS scoring, parsing, grammar analysis, and tailored skill enrichment tips.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: TrendingUp,
      title: "AI Job Matching",
      description: "Identify match percentages for key roles. Learn what skills you lack and access salary expectations.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Mic,
      title: "AI Communication Coach",
      description: "Practice vocal exercises with live speech-to-text. Track speed, fluency, confidence, and filler words.",
      color: "from-violet-500 to-fuchsia-500"
    },
    {
      icon: Brain,
      title: "10-Level Interview Hub",
      description: "Step-by-step interview simulation levels from basic self-introductions to behavioral, technical, and stress rounds.",
      color: "from-rose-500 to-orange-500"
    },
    {
      icon: Code,
      title: "Built-in Coding Sandbox",
      description: "Code challenges directly in the web browser. Receive AI debugging and runtime complexity checks.",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: Users2,
      title: "AI Group Discussion Room",
      description: "Simulate dynamic team debates. Engage with 5 AI candidates debating trending tech topics in real-time.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Free Tier",
      price: "₹0",
      period: "forever",
      desc: "Perfect for exploring the platform",
      features: [
        "1 Resume ATS Analysis",
        "1 Standard Level-1 Interview",
        "Basic skill check",
        "Public job search links",
      ],
      cta: "Get Started",
      popular: false,
      href: "/dashboard"
    },
    {
      name: "Basic Plan",
      price: "₹99",
      period: "month",
      desc: "Essentials for job seekers",
      features: [
        "5 Resume ATS Analyses",
        "3 Mock Interviews (Level 1-3)",
        "Daily communication training",
        "Skill gap checklist",
        "Pre-filled job search queries"
      ],
      cta: "Go Basic",
      popular: false,
      href: "/dashboard"
    },
    {
      name: "Pro Plan",
      price: "₹299",
      period: "month",
      desc: "Accelerate your interview prep",
      features: [
        "20 Resume ATS Analyses",
        "Unlimited Interviews (Level 1-7)",
        "Advanced speech analysis",
        "Coding challenges compiler",
        "Personalized career roadmaps",
        "Detailed performance PDFs"
      ],
      cta: "Choose Pro",
      popular: true,
      href: "/dashboard"
    },
    {
      name: "Premium",
      price: "₹499",
      period: "month",
      desc: "The ultimate placement suite",
      features: [
        "Unlimited Resume Reviews",
        "All 10 Interview levels unlocked",
        "Company-specific mock rounds",
        "AI Group Discussion simulator",
        "Simulated video behavior reports",
        "Priority recruiter profiling"
      ],
      cta: "Unlock Premium",
      popular: false,
      href: "/dashboard"
    }
  ];

  return (
    <div className="flex flex-col gap-20 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold shadow-inner animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Supercharged with Gemini & Whisper AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Land Your Dream Job with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            AI Placement Coaching
          </span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
          The all-in-one career development platform. Analyze resumes against ATS metrics, coach communication skills, simulate 10 level interviews, compile code, and showcase your profile to recruiters.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:scale-[1.02] shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            Get Placement Ready
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800/80 hover:text-white transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Demo Panel Mock */}
        <div className="w-full mt-12 border border-zinc-800 bg-zinc-950/60 rounded-2xl p-2 shadow-2xl relative">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl opacity-10 blur-xl"></div>
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 sm:p-6 text-left relative flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-xs text-zinc-500 font-mono ml-2">placemate-dashboard.sh</span>
              </div>
              <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full">
                Interactive Simulator
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex flex-col gap-2">
                <span className="text-xs text-zinc-500 font-medium">Readiness Index</span>
                <span className="text-3xl font-extrabold text-indigo-400">84/100</span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-indigo-500 h-full w-[84%] rounded-full"></div>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex flex-col gap-2">
                <span className="text-xs text-zinc-500 font-medium">Daily Streak</span>
                <span className="text-3xl font-extrabold text-amber-500">🔥 5 Days</span>
                <span className="text-[10px] text-zinc-400">Next unlock: Level 6</span>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex flex-col gap-2">
                <span className="text-xs text-zinc-500 font-medium">Top Match Rate</span>
                <span className="text-3xl font-extrabold text-emerald-400">92% Match</span>
                <span className="text-[10px] text-zinc-400">AI Engineer at Google</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="flex flex-col gap-12 pt-8 scroll-mt-24">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Core Career Optimization Modules
          </h2>
          <p className="text-zinc-400 max-w-xl text-sm sm:text-base">
            Constructed as an enterprise-grade platform offering state-of-the-art tools designed to maximize hiring potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all group"
              >
                <div className={`p-3 bg-gradient-to-tr ${feat.color} rounded-xl w-fit text-white group-hover:scale-105 transition-transform duration-300 shadow`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-zinc-100">{feat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="flex flex-col gap-12 pt-8">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Monetization & Plans
          </h2>
          <p className="text-zinc-400 max-w-xl text-sm sm:text-base">
            Unlock advanced capabilities, unlimited mock interview level completions, and download customized improvement reports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
          {pricingPlans.map((plan, idx) => (
            <div 
              key={idx}
              className={`p-6 bg-zinc-900/40 border rounded-2xl flex flex-col justify-between transition-all relative ${
                plan.popular 
                  ? "border-indigo-500 bg-indigo-950/10 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30" 
                  : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-zinc-100">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-500">/{plan.period}</span>
                </div>
                
                <ul className="flex flex-col gap-2.5 border-t border-zinc-800/80 pt-4 pb-6">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-xs text-zinc-300 leading-normal">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold transition-all ${
                  plan.popular 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10" 
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
