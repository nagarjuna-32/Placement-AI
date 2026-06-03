"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  Info,
  CheckCircle,
  AlertOctagon
} from "lucide-react";

interface VerificationDetails {
  id: string;
  student_name: string;
  title: string;
  skill_completed: string;
  issue_date: string;
  completion_score: number;
  status: "valid" | "revoked";
  verification_url: string;
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchVerification = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/certificates/verify/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        } else {
          setError("This certificate record could not be found or has not been issued yet.");
        }
      } catch (err) {
        console.error(err);
        setError("Database server offline. Unable to complete security audit check.");
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold text-zinc-500 tracking-widest uppercase animate-pulse">
          Performing cryptographical validation audit...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-xl w-full text-center flex flex-col gap-6">
        {/* Verification Card */}
        <div className="glass p-8 rounded-3xl border border-indigo-950/20 shadow-2xl relative flex flex-col gap-6 text-left">
          
          {error || !details ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                <AlertOctagon className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-zinc-200">Credential Verification Failed</h2>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                {error || "The requested certificate identifier is invalid or has been deleted from PlaceMate AI record registers."}
              </p>
            </div>
          ) : (
            <>
              {/* Card Header stamp */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg text-white">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-zinc-200">
                    PlaceMate <span className="text-indigo-400 font-extrabold">AI</span>
                  </span>
                </div>

                {details.status === "valid" ? (
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Valid Credential</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-red-500/5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>REVOKED</span>
                  </div>
                )}
              </div>

              {/* Title & description */}
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Certificate Auditing Desk</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {details.title}
                </h2>
                <p className="text-[11px] text-indigo-400 font-semibold">{details.skill_completed}</p>
              </div>

              {/* Certificate details block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/40 border border-zinc-850/60 p-4 rounded-2xl text-xs mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Candidate Audited:</span>
                  <span className="font-bold text-zinc-300 text-sm">{details.student_name}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-medium">Credential Status:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    details.status === "valid" ? "text-emerald-400" : "text-red-400 animate-pulse"
                  }`}>
                    {details.status === "valid" ? "Verified & Valid" : "Revoked by Admin"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-t border-zinc-900 pt-3">
                  <span className="text-zinc-500 font-medium">Date of Issue:</span>
                  <span className="font-bold text-zinc-350 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {new Date(details.issue_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-t border-zinc-900 pt-3">
                  <span className="text-zinc-500 font-medium">Completion Score:</span>
                  <span className="font-bold text-zinc-350 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-zinc-500" />
                    PMC-{details.completion_score}% Performance
                  </span>
                </div>
              </div>

              {/* QR / ID details footer */}
              <div className="border-t border-zinc-900 pt-4 mt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex flex-col gap-0.5 text-[10px] text-zinc-500 font-mono">
                  <span>ID: {details.id}</span>
                  <span>Evaluator: Autonomous PlaceMate Gemini Core</span>
                </div>

                {details.status === "valid" && (
                  <div className="p-1 bg-white rounded border border-zinc-800 shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(
                        window.location.href
                      )}`}
                      alt="Verification Validation QR"
                      className="w-12 h-12"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to PlaceMate AI Home</span>
        </Link>
      </div>
    </div>
  );
}
