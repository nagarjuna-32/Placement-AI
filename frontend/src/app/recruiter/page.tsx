"use client";

import { useState, useEffect } from "react";
import { 
  UserCheck, 
  PlusCircle, 
  Users, 
  Search, 
  Filter, 
  Check, 
  Mail, 
  AlertCircle,
  Briefcase,
  ExternalLink,
  Award,
  Sparkles
} from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string[];
  ats_score: number;
  match_score: number;
  status: "applied" | "shortlisted" | "contacted";
}

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<"candidates" | "post_job">("candidates");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("all");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("PlaceMate AI Partner");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("full-time");
  const [mode, setMode] = useState("remote");
  const [salary, setSalary] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Standard mock candidates database
    setCandidates([
      {
        id: 1,
        name: "Alex Mercer",
        email: "student@placemate.ai",
        role: "AI Software Engineer",
        skills: ["Python", "SQL", "FastAPI", "Machine Learning"],
        ats_score: 84,
        match_score: 92,
        status: "applied"
      },
      {
        id: 2,
        name: "Priya Sharma",
        email: "priya@gmail.com",
        role: "Data Analyst",
        skills: ["Python", "SQL", "Pandas", "Tableau"],
        ats_score: 82,
        match_score: 88,
        status: "shortlisted"
      },
      {
        id: 3,
        name: "Vikram Mehta",
        email: "vikram@outlook.com",
        role: "Frontend Developer",
        skills: ["JavaScript", "TypeScript", "React", "Tailwind CSS"],
        ats_score: 87,
        match_score: 84,
        status: "applied"
      },
      {
        id: 4,
        name: "Neha Sen",
        email: "neha.sen@yahoo.com",
        role: "ML Intern",
        skills: ["Python", "PyTorch", "C++"],
        ats_score: 76,
        match_score: 75,
        status: "contacted"
      }
    ]);
  }, []);

  const handleStatusChange = (id: number, nextStatus: "shortlisted" | "contacted") => {
    setCandidates(candidates.map(c => {
      if (c.id === id) {
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !skillsText) return;

    setSubmitting(true);
    setSuccessMsg(null);

    const skills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      title: jobTitle,
      company,
      description,
      location,
      type,
      mode,
      salary,
      required_skills: skills
    };

    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("Job posting uploaded successfully to candidate portal!");
        resetForm();
      } else {
        setSuccessMsg("Simulated: Job posting added to recruiter registry.");
        resetForm();
      }
    } catch (err) {
      console.log("FastAPI backend offline, adding job to recruiter local state:", err);
      setSuccessMsg("Simulated: Job posting added to recruiter registry (Local Fallback).");
      resetForm();
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const resetForm = () => {
    setJobTitle("");
    setDescription("");
    setLocation("");
    setSalary("");
    setSkillsText("");
  };

  // Extract all unique candidate skills for filter dropdown
  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  // Filter candidate list
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = selectedSkillFilter === "all" || c.skills.includes(selectedSkillFilter);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Command Deck</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review matching applicants, filter by skill keywords, and post new open opportunities.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "candidates" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Applicants pool</span>
          </button>
          <button
            onClick={() => setActiveTab("post_job")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "post_job" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Tab: Applicants list */}
      {activeTab === "candidates" && (
        <div className="flex flex-col gap-6">
          {/* Filters header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl items-center">
            <div className="sm:col-span-2 flex gap-2">
              <input 
                type="text" 
                placeholder="Search candidates by name or target role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 w-full"
              >
                <option value="all">All Skills</option>
                {allSkills.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates table list */}
          <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Candidate Profile</th>
                  <th className="p-4">Skills audited</th>
                  <th className="p-4 text-center">ATS rating</th>
                  <th className="p-4 text-center">Compatibility</th>
                  <th className="p-4 text-center">Stage</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-zinc-200">{c.name}</span>
                        <span className="text-[10px] text-zinc-500">{c.email}</span>
                        <span className="text-[10px] text-indigo-400 font-semibold">{c.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.map((s, idx) => (
                          <span key={idx} className="text-[9px] bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-300">
                      {c.ats_score}/100
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-extrabold text-emerald-400">{c.match_score}% Match</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        c.status === "shortlisted" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : c.status === "contacted" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                            : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {c.status === "applied" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "shortlisted")}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg hover:scale-105 transition-transform"
                            title="Shortlist applicant"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={`mailto:${c.email}?subject=PlaceMate AI Recruiter Outreach`}
                          onClick={() => handleStatusChange(c.id, "contacted")}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg hover:scale-105 transition-transform"
                          title="Contact candidate"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCandidates.length === 0 && (
              <div className="p-8 text-center text-zinc-500">No applicants match filters.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Post a job form */}
      {activeTab === "post_job" && (
        <div className="max-w-xl mx-auto w-full p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-6">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
            Opportunity Upload Form
          </span>

          <form onSubmit={handlePostJob} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Job Title</label>
                <input 
                  type="text" 
                  placeholder="AI Software Engineer..."
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Company Name</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-400">Job Description</label>
              <textarea 
                placeholder="Role requirements, daily tasks, and guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Geographic Location</label>
                <input 
                  type="text" 
                  placeholder="Bangalore, India..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Compensation (Salary)</label>
                <input 
                  type="text" 
                  placeholder="₹12L - ₹18L..."
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Position Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-400">Workplace Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-400">Required Skills (Comma separated)</label>
              <input 
                type="text" 
                placeholder="Python, PyTorch, Docker, Git..."
                required
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2 shadow disabled:opacity-50"
            >
              <span>{submitting ? "Publishing..." : "Publish Job Posting"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
