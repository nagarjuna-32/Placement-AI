import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import AuthGuard from "@/components/auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlaceMate AI - Premium Career Development & AI Interview Platform",
  description: "Accelerate your career with AI-powered resume analysis, communication coaching, custom roadmaps, and realistic 10-level mock placement simulations.",
  keywords: "ATS Score, Resume Builder, Mock Interview, AI Coding, Group Discussion Simulator, Career Roadmap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col relative bg-[#09090b] text-[#f4f4f5] overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full glow-blur -z-10 animate-pulse-slow"></div>
        <div className="absolute top-[30vh] right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full glow-blur -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        
        <Navbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 relative z-10">
          <AuthGuard>
            {children}
          </AuthGuard>
        </main>
        
        <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 mt-12">
          <p>© {new Date().getFullYear()} PlaceMate AI. Advanced Career Optimization Suite. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
