"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // user (student), recruiter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://127.0.0.1:8001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || "Registration failed. Email might already be registered.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend services. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl border border-indigo-950/20 shadow-2xl relative">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Join PlaceMate AI and accelerate your career
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2 text-left">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Registration successful! Redirecting you to login page...</span>
          </div>
        )}

        <form className="mt-8 space-y-6 text-left" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    role === "user"
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                      : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    role === "recruiter"
                      ? "bg-emerald-600/10 border-emerald-500 text-emerald-400"
                      : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Recruiter</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl focus:outline-none transition-all shadow shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Registering account..." : "Sign Up"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-4 border-t border-zinc-850/50 mt-6">
          <span>Already have an account? </span>
          <Link href="/login" className="font-bold text-indigo-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
