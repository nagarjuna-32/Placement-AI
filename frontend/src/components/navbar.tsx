"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Terminal, 
  Users, 
  Award, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  Flame, 
  User, 
  ShieldAlert,
  BrainCircuit,
  UserCheck,
  Globe,
  Compass
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [userRole, setUserRole] = useState<"student" | "recruiter" | "admin">("student");
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Read from localStorage if available
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.body.classList.add("light-theme");
      }
    }
    
    const savedRole = localStorage.getItem("userRole") as "student" | "recruiter" | "admin";
    if (savedRole) {
      setUserRole(savedRole);
    }
    
    // Listen for role updates
    const handleRoleChanged = () => {
      const updated = localStorage.getItem("userRole") as "student" | "recruiter" | "admin";
      if (updated) setUserRole(updated);
    };
    
    const handleAuthChanged = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    
    window.addEventListener("roleChanged", handleRoleChanged);
    window.addEventListener("authChanged", handleAuthChanged);
    return () => {
      window.removeEventListener("roleChanged", handleRoleChanged);
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    }
  };

  const changeRole = (role: "student" | "recruiter" | "admin") => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
    window.dispatchEvent(new Event("roleChanged")); // Notify other components
    
    // Redirect if on mismatched dashboard
    if (role === "recruiter" && pathname.startsWith("/dashboard")) {
      window.location.href = "/recruiter";
    } else if (role === "student" && pathname.startsWith("/recruiter")) {
      window.location.href = "/dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("authChanged"));
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Award, role: "student" },
    { href: "/resume-analyzer", label: "AI Resume", icon: FileText, role: "student" },
    { href: "/jobs", label: "Jobs & Tracker", icon: Briefcase, role: "student" },
    { href: "/coach", label: "AI Speech Coach", icon: MessageSquare, role: "student" },
    { href: "/interview", label: "AI Interviews", icon: BrainCircuit, role: "student" },
    { href: "/gd-simulator", label: "GD Simulator", icon: Users, role: "student" },
    { href: "/coding", label: "Coding Sandbox", icon: Terminal, role: "student" },
    { href: "/agent", label: "AI Career Agent", icon: Compass, role: "student" },
    { href: "/portfolio", label: "AI Portfolio", icon: Globe, role: "student" },
    { href: "/recruiter", label: "Recruiter Portal", icon: UserCheck, role: "recruiter" },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (userRole === "admin") return true;
    if (userRole === "recruiter") {
      return link.role === "recruiter" || link.href === "/jobs" || link.href === "/coding";
    }
    return link.role === "student";
  });

  return (
    <nav className="sticky top-0 z-50 glass border-b border-indigo-950/20 px-4 md:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90">
            PlaceMate <span className="text-indigo-400 font-extrabold">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {isAuthenticated && filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Gamified stats */}
          {isAuthenticated && userRole === "student" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-500" title="Daily Streak">
                <Flame className="w-3 h-3 fill-current animate-bounce" />
                <span>{streak}d</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400" title="Experience Points">
                <Sparkles className="w-3 h-3" />
                <span>{xp} XP</span>
              </div>
            </div>
          )}

          {/* Role Switcher */}
          {isAuthenticated && (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
              <button 
                onClick={() => changeRole("student")}
                className={`px-1.5 py-1 text-[10px] rounded font-semibold transition-all ${userRole === "student" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Student
              </button>
              <button 
                onClick={() => changeRole("recruiter")}
                className={`px-1.5 py-1 text-[10px] rounded font-semibold transition-all ${userRole === "recruiter" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Recruiter
              </button>
              <button 
                onClick={() => changeRole("admin")}
                className={`px-1.5 py-1 text-[10px] rounded font-semibold transition-all ${userRole === "admin" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Admin
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-zinc-800/60 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile avatar or Login Button */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[10px] shadow shadow-indigo-500/30">
                  {userRole === "student" ? "AM" : userRole === "recruiter" ? "SJ" : "AD"}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[9px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-zinc-800/60 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-zinc-800/60 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-zinc-800/60 flex flex-col gap-2 pb-4">
          {/* Mobile Auth button */}
          <div className="px-2 py-2 mb-2 bg-zinc-900/65 rounded-lg border border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Account:</span>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[9px] shadow shadow-indigo-500/30">
                  {userRole === "student" ? "AM" : userRole === "recruiter" ? "SJ" : "AD"}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <>
              <div className="flex justify-between items-center px-2 py-2 mb-2 bg-zinc-900/65 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-400">Current Role:</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => changeRole("student")}
                    className={`px-2 py-1 text-[10px] rounded font-medium ${userRole === "student" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                  >
                    Student
                  </button>
                  <button 
                    onClick={() => changeRole("recruiter")}
                    className={`px-2 py-1 text-[10px] rounded font-medium ${userRole === "recruiter" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
