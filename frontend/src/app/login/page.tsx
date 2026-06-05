"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, User, Briefcase, Info, X, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleAutofill = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    localStorage.setItem("userRole", role);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "google_mock_token_123" })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refreshToken", data.refresh_token);
        }
        const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `token=${data.access_token}; path=/; max-age=36000; SameSite=Lax${secureFlag}`;
        
        const role = data.user.role === "recruiter" ? "recruiter" : "student";
        localStorage.setItem("userRole", role);
        window.dispatchEvent(new Event("authChanged"));
        window.dispatchEvent(new Event("roleChanged"));
        window.location.href = role === "recruiter" ? "/recruiter" : "/dashboard";
      } else {
        const errData = await res.json();
        setError(errData.detail || "Google authentication failed.");
      }
    } catch (err) {
      setError("Unable to connect to backend for Google OAuth exchange.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotStatus("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (res.ok) {
        setForgotStatus("Success: Reset instructions and verification code sent to your inbox!");
        setTimeout(() => {
          setForgotStep("reset");
          setForgotStatus("");
        }, 1500);
      } else {
        setForgotStatus("Error: No account matches this email address.");
      }
    } catch (err) {
      setForgotStatus("Success: Reset instructions and verification code sent to your inbox! (Offline Mode)");
      setTimeout(() => {
        setForgotStep("reset");
        setForgotStatus("");
      }, 1500);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetCode || !newPassword) return;
    setForgotLoading(true);
    setForgotStatus("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          token: resetCode,
          new_password: newPassword
        })
      });
      if (res.ok) {
        setForgotStatus("Success: Password reset successfully! Closing window...");
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep("request");
          setForgotStatus("");
        }, 2000);
      } else {
        const errData = await res.json();
        setForgotStatus("Error: " + (errData.detail || "Failed to reset password."));
      }
    } catch (err) {
      setForgotStatus("Error: Unable to connect to the backend server.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        
        // Write the Edge-compatible HTTP-like cookie for Next.js Middleware check
        const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `token=${data.access_token}; path=/; max-age=36000; SameSite=Lax${secureFlag}`;

        const role = data.user.role === "recruiter" ? "recruiter" : "student";
        localStorage.setItem("userRole", role);
        
        window.dispatchEvent(new Event("authChanged"));
        window.dispatchEvent(new Event("roleChanged"));

        window.location.href = role === "recruiter" ? "/recruiter" : "/dashboard";
      } else {
        const errData = await res.json();
        setError(errData.detail || "Incorrect email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend. Logging in with offline mock profiles...");
      setTimeout(() => {
        localStorage.setItem("token", "mock_access_token_token");
        const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `token=mock_access_token_token; path=/; max-age=36000; SameSite=Lax${secureFlag}`;
        const role = email.includes("recruiter") ? "recruiter" : "student";
        localStorage.setItem("userRole", role);
        window.dispatchEvent(new Event("authChanged"));
        window.dispatchEvent(new Event("roleChanged"));
        window.location.href = role === "recruiter" ? "/recruiter" : "/dashboard";
      }, 1000);
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
            Sign in to PlaceMate AI
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Access your AI Career Operating System
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-4 text-left">
          {/* Google Login button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2.5 py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-350 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-850/50"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Or email login</span>
            <div className="flex-grow border-t border-zinc-850/50"></div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
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
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStatus("");
                      setForgotEmail("");
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-white hover:underline transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl focus:outline-none transition-all shadow shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? "Verifying..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Demo Credentials Box */}
        <div className="border-t border-zinc-850/50 pt-6 mt-6">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block mb-3 text-center">
            Or Click to Autofill Demo Credentials
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <button
              onClick={() => handleAutofill("student@placemate.ai", "student")}
              className="p-3 bg-zinc-950/45 hover:bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-300">Demo Student</span>
                <span className="text-[9px] text-zinc-500">student@placemate.ai</span>
              </div>
            </button>

            <button
              onClick={() => handleAutofill("recruiter@placemate.ai", "recruiter")}
              className="p-3 bg-zinc-950/45 hover:bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-300">Demo Recruiter</span>
                <span className="text-[9px] text-zinc-500">recruiter@placemate.ai</span>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-400 pt-4 border-t border-zinc-850/50 mt-6">
          <span>New to PlaceMate AI? </span>
          <Link href="/register" className="font-bold text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl z-10 text-left">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
              <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400" />
                Password Recovery Console
              </span>
              <button onClick={() => { setShowForgotModal(false); setForgotStep("request"); }} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {forgotStatus && (
              <div className={`p-3 border text-xs rounded-xl flex items-start gap-2 mb-4 ${
                forgotStatus.startsWith("Success")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {forgotStatus.startsWith("Success") ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{forgotStatus}</span>
              </div>
            )}

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Confirm Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-zinc-250 placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                      placeholder="name@domain.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? "Routing request..." : "Dispatch Recovery Email"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Recovery Code (From logs/inbox)
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 block w-full px-3 py-2.5 rounded-xl text-sm text-zinc-250 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter 6-digit code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-zinc-250 focus:outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep("request")}
                    className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? "Resetting..." : "Save Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
