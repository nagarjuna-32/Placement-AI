"use client";

import { useState } from "react";
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
  XCircle,
  Zap,
  Star,
  Users2
} from "lucide-react";

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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

  const subscriptionPlans = [
    {
      name: "Free Plan",
      icon: "🚀",
      desc: "Perfect for getting started",
      priceMonthly: 0,
      priceYearly: 0,
      period: "forever",
      features: [
        { text: "2 Resume ATS Analyses / Month", included: true },
        { text: "1 AI Mock Interview / Month", included: true },
        { text: "Access to All 10 Interview Levels", included: true },
        { text: "Basic Skill Analysis", included: true },
        { text: "Basic Communication Feedback", included: true },
        { text: "Public Job Search Links", included: true },
        { text: "Basic Dashboard", included: true },
        { text: "Video Interview Analysis", included: false },
        { text: "AI Group Discussion", included: false },
        { text: "Coding Interviews", included: false },
        { text: "Detailed PDF Reports", included: false },
      ],
      extraUsage: [
        "Additional Interview: ₹100",
        "Additional Resume Analysis: ₹30"
      ],
      cta: "Get Started",
      popular: false,
      href: "/dashboard"
    },
    {
      name: "Basic Plan",
      icon: "⭐",
      desc: "Essential features for job seekers",
      priceMonthly: 99,
      priceYearly: 999,
      saveText: "Save ₹189",
      period: "month",
      features: [
        { text: "10 Resume ATS Analyses / Month", included: true },
        { text: "10 AI Mock Interviews / Month", included: true },
        { text: "Access to All 10 Interview Levels", included: true },
        { text: "Communication Analysis", included: true },
        { text: "Skill Gap Analysis", included: true },
        { text: "Career Roadmap", included: true },
        { text: "Basic Reports", included: true },
        { text: "Video Interview Analysis", included: false },
        { text: "AI Group Discussion", included: false },
      ],
      extraUsage: [
        "Additional Interview: ₹50",
        "AI Group Discussion Session: ₹100"
      ],
      cta: "Go Basic",
      popular: false,
      href: "/dashboard"
    },
    {
      name: "Pro Plan",
      icon: "🔥",
      desc: "Accelerate your interview prep",
      priceMonthly: 299,
      priceYearly: 2999,
      saveText: "Save ₹589",
      period: "month",
      features: [
        { text: "Unlimited Resume ATS Analyses", included: true },
        { text: "50 AI Mock Interviews / Month", included: true },
        { text: "Access to All 10 Interview Levels", included: true },
        { text: "Video Interview Analysis", included: true },
        { text: "Advanced Communication Analysis", included: true },
        { text: "Coding Interview Practice", included: true },
        { text: "Company-Specific Interview Rounds", included: true },
        { text: "Detailed PDF Reports", included: true },
        { text: "AI Job Matching", included: true },
        { text: "Personalized Career Roadmap", included: true },
        { text: "AI Group Discussion", included: false },
      ],
      extraUsage: [
        "Additional Interview: ₹20",
        "AI Group Discussion Session: ₹100"
      ],
      cta: "Choose Pro",
      popular: true,
      href: "/dashboard"
    },
    {
      name: "Premium Plan",
      icon: "👑",
      desc: "The ultimate placement suite",
      priceMonthly: 699,
      priceYearly: 6999,
      saveText: "Save ₹1,389",
      period: "month",
      features: [
        { text: "Unlimited Resume ATS Analyses", included: true },
        { text: "Unlimited AI Mock Interviews", included: true },
        { text: "Unlimited Video Interviews", included: true },
        { text: "Unlimited Coding Interviews", included: true },
        { text: "Unlimited AI Group Discussions", included: true },
        { text: "Unlimited Communication Analysis", included: true },
        { text: "Unlimited Career Roadmaps", included: true },
        { text: "Unlimited Placement Readiness Reports", included: true },
        { text: "Unlimited PDF Reports", included: true },
        { text: "Unlimited AI Job Matching", included: true },
        { text: "Access to All 10 Interview Levels", included: true },
        { text: "Company-Specific Interview Rounds", included: true },
        { text: "LinkedIn Profile Optimization", included: true },
        { text: "GitHub Profile Analysis", included: true },
        { text: "Salary Prediction", included: true },
        { text: "Recruiter Readiness Score", included: true },
        { text: "Premium Career Mentor Features", included: true },
        { text: "Priority AI Processing", included: true },
        { text: "Priority Support", included: true },
      ],
      extraUsage: [
        "No Limits. No Extra Charges."
      ],
      cta: "Unlock Premium",
      popular: false,
      href: "/dashboard"
    }
  ];

  const payAsYouGoItems = [
    { name: "AI Mock Interview", price: "₹100" },
    { name: "Resume ATS Analysis", price: "₹30" },
    { name: "Communication Assessment", price: "₹50" },
    { name: "Coding Interview Session", price: "₹100" },
    { name: "AI Group Discussion Session", price: "₹100" },
    { name: "Placement Readiness Report", price: "₹50" },
    { name: "Career Roadmap Report", price: "₹50" }
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
      <section className="flex flex-col gap-8 pt-8">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Monetization & Plans
          </h2>
          <p className="text-zinc-400 max-w-xl text-sm sm:text-base">
            Unlock advanced capabilities, unlimited mock interview level completions, and download customized improvement reports.
          </p>
        </div>

        {/* Billing Cycle Switch */}
        <div className="flex justify-center items-center gap-4 mt-2 mb-6">
          <span className={`text-sm font-semibold transition-colors duration-200 ${billingCycle === 'monthly' ? 'text-zinc-200' : 'text-zinc-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-7 bg-zinc-800 border border-zinc-700/85 rounded-full relative flex items-center p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Toggle billing cycle"
          >
            <div
              className={`w-5 h-5 bg-indigo-500 rounded-full shadow-md transform transition-transform duration-300 ${
                billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-200 ${billingCycle === 'yearly' ? 'text-zinc-200' : 'text-zinc-500'}`}>
            Yearly Billing
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
              Save Up to 20%
            </span>
          </span>
        </div>

        {/* Subscription Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {subscriptionPlans.map((plan, idx) => {
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isFree = plan.priceMonthly === 0;
            return (
              <div 
                key={idx}
                className={`p-6 bg-zinc-900/30 border rounded-2xl flex flex-col justify-between transition-all relative ${
                  plan.popular 
                    ? "border-indigo-500 bg-indigo-950/10 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30" 
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <h3 className="font-bold text-zinc-100">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{plan.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col py-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        ₹{price}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {isFree ? "/ forever" : billingCycle === "yearly" ? "/ year" : "/ month"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && plan.saveText && (
                      <span className="text-[10.5px] text-emerald-400 font-bold mt-1">
                        ({plan.saveText})
                      </span>
                    )}
                  </div>
                  
                  <ul className="flex flex-col gap-2.5 border-y border-zinc-800/80 py-4 my-2">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-xs leading-normal">
                        {feat.included ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500/60 shrink-0 mt-0.5" />
                        )}
                        <span className={feat.included ? "text-zinc-300" : "text-zinc-500 line-through decoration-zinc-800/80"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Extra Usage Section */}
                  <div className="bg-zinc-950/65 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-1.5 mb-4 shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Extra Usage:</span>
                    <ul className="flex flex-col gap-1">
                      {plan.extraUsage.map((usage, uidx) => (
                        <li key={uidx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                          <span>{usage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
            );
          })}
        </div>
      </section>

      {/* Pay-As-You-Go Showcase */}
      <section className="max-w-5xl mx-auto w-full pt-4">
        <div className="relative p-6 sm:p-8 bg-zinc-900/20 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-indigo-600/5 rounded-full glow-blur -z-10"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-30 blur-sm -z-10"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
                <Zap className="w-3 h-3" />
                <span>PAY-AS-YOU-GO</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">No Subscription Required</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Pay only when you need it. Direct access to individual premium tools without long-term contracts.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 text-sm font-semibold rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all text-center shrink-0 self-start md:self-auto shadow-md"
            >
              Get Started
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {payAsYouGoItems.map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-zinc-950/50 border border-zinc-900/80 rounded-xl flex items-center justify-between hover:border-zinc-800 hover:bg-zinc-950/70 transition-all shadow-sm"
              >
                <span className="text-xs text-zinc-300 font-medium">{item.name}</span>
                <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md shrink-0 ml-2">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
