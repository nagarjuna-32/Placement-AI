"use client";

import { useState } from "react";
import { 
  Globe, 
  Sparkles, 
  Mail, 
  FileText, 
  Check, 
  ArrowRight,
  ExternalLink,
  Laptop,
  Layers,
  Send,
  Download
} from "lucide-react";

// Custom SVG Brand Icons to avoid Lucide V4 Brand Icon deprecations
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function PortfolioBuilder() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("Alex Mercer");
  const [role, setRole] = useState("AI Software Engineer");
  const [bio, setBio] = useState("Aspiring AI software engineer specializing in scalable FastAPI microservices and Next.js frontends.");
  const [githubUrl, setGithubUrl] = useState("github.com/alex-mercer");
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/in/alex-mercer");
  const [customDomain, setCustomDomain] = useState("alexmercer.dev");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const skills = ["Python", "SQL", "FastAPI", "React", "Next.js", "Tailwind CSS", "PyTorch", "Docker"];
  const projects = [
    { title: "Smart Job Portal Backend", tech: "FastAPI, PostgreSQL", desc: "Constructed dynamic relational database schemas and JWT auth protocols serving candidate pools." },
    { title: "E-Commerce Tableau Dashboard", tech: "Python, Tableau", desc: "Designed ETL cleaning scripts and compiled vendor sales dashboards tracking metrics across channels." }
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setIsGenerated(true);
      setGenerating(false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
    setContactName("");
    setContactEmail("");
    setContactMsg("");
    setTimeout(() => setMessageSent(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Portfolio Builder</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Instantly build and deploy a developer website showcasing skills, projects, and credentials.
          </p>
        </div>
      </div>

      {!isGenerated ? (
        /* Configurator form */
        <div className="max-w-xl mx-auto w-full p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-6">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
            Portfolio Generator Settings
          </span>

          <div className="flex flex-col gap-4 text-xs text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Target Role</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-400">Professional Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">GitHub URL/Username</label>
                <input 
                  type="text" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">LinkedIn URL/Username</label>
                <input 
                  type="text" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-400">Custom Domain Name</label>
              <input 
                type="text" 
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow disabled:opacity-50 text-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{generating ? "Deploying Portfolio to Edge..." : "Deploy Portfolio"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Generated Portfolio site */
        <div className="flex flex-col gap-8">
          {/* Dashboard Control bar */}
          <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-400">Live URL:</span>
              <a 
                href={`https://${customDomain}`} 
                target="_blank" 
                rel="noreferrer"
                className="font-bold text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                {customDomain} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <button
              onClick={() => setIsGenerated(false)}
              className="text-xs text-zinc-500 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Reconfigure Settings
            </button>
          </div>

          {/* RENDERED WEB PAGE */}
          <div className="border border-zinc-800 rounded-3xl bg-[#09090b] p-8 max-w-3xl mx-auto w-full relative shadow-2xl overflow-hidden flex flex-col gap-12 text-left">
            <div className="absolute top-0 right-1/4 w-[250px] h-[250px] bg-indigo-600/5 rounded-full glow-blur -z-10 animate-pulse-slow"></div>
            
            {/* Portfolio Hero */}
            <header className="flex flex-col gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {name}
              </h2>
              <span className="text-sm font-semibold text-indigo-400 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                {role}
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl font-normal mt-2">
                {bio}
              </p>
              
              {/* Linked icons */}
              <div className="flex gap-4 mt-2">
                <a href={`https://${githubUrl}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href={`https://${linkedinUrl}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </header>

            {/* Core Skills section */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Expertise Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl text-zinc-300 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Projects list */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Featured Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{proj.title}</h4>
                      <span className="text-[10px] text-indigo-400 font-mono font-semibold">{proj.tech}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">{proj.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Form */}
            <section className="flex flex-col gap-4 border-t border-zinc-900 pt-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Get in Touch</h3>
              
              {messageSent && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Message submitted successfully! Alex will revert shortly.</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex flex-col gap-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <textarea 
                  placeholder="Your Message..."
                  required
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
                <button
                  type="submit"
                  className="w-fit px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold flex items-center gap-1.5 shadow"
                >
                  <span>Send Message</span>
                  <Send className="w-3 h-3 text-indigo-200" />
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
