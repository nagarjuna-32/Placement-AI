"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Award, 
  Download, 
  Share2, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  X, 
  Printer 
} from "lucide-react";

interface Certificate {
  type: string;
  title: string;
  skill_completed: string;
  requirement: string;
  eligible: boolean;
  is_unlocked: boolean;
  certificate_id: string | null;
  issue_date: string | null;
  completion_score: number;
  status: string;
  verification_url: string | null;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [claimingType, setClaimingType] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/certificates/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCerts(data);
      }
    } catch (err) {
      console.error("Backend offline, loading mock certificates:", err);
      // Fallback local mock data
      setCerts([
        {
          type: "resume_ready",
          title: "Resume Ready Certificate",
          skill_completed: "AI Resume Optimization & ATS Audits",
          requirement: "Achieve an ATS score of 80% or higher inside the AI Resume Analyzer.",
          eligible: true,
          is_unlocked: true,
          certificate_id: "PMC-RES-8FA29C1B",
          issue_date: new Date().toISOString(),
          completion_score: 88,
          status: "valid",
          verification_url: "/verify-certificate/PMC-RES-8FA29C1B"
        },
        {
          type: "communication_skills",
          title: "Communication Skills Certificate",
          skill_completed: "Verbal Communication & Fluency Training",
          requirement: "Achieve a speech confidence/fluency score of 75% or higher inside the AI Speech Coach.",
          eligible: true,
          is_unlocked: true,
          certificate_id: "PMC-COM-4C9E82DF",
          issue_date: new Date().toISOString(),
          completion_score: 81,
          status: "valid",
          verification_url: "/verify-certificate/PMC-COM-4C9E82DF"
        },
        {
          type: "mock_interview",
          title: "Mock Interview Completion Certificate",
          skill_completed: "10-Level Mock Placement Program - Intermediate Stage",
          requirement: "Pass Level 5 (or higher) in AI Interviews with a score of 75% or higher.",
          eligible: false,
          is_unlocked: false,
          certificate_id: null,
          issue_date: null,
          completion_score: 0,
          status: "locked",
          verification_url: null
        },
        {
          type: "coding_interview",
          title: "Coding Interview Completion Certificate",
          skill_completed: "AI-Grade Project Code Audit & Sandbox Execution",
          requirement: "Achieve a project audit or coding readiness rating of 75% or higher.",
          eligible: true,
          is_unlocked: false,
          certificate_id: null,
          issue_date: null,
          completion_score: 83,
          status: "locked",
          verification_url: null
        },
        {
          type: "placement_ready",
          title: "Placement Ready Certificate",
          skill_completed: "Placement Readiness Program",
          requirement: "Unlock all four foundational AI preparation certificates (Resume, Speech, Mock Interview, and Coding).",
          eligible: false,
          is_unlocked: false,
          certificate_id: null,
          issue_date: null,
          completion_score: 0,
          status: "locked",
          verification_url: null
        },
        {
          type: "career_readiness",
          title: "AI Career Readiness Certificate",
          skill_completed: "AI Career Readiness & Profile Orchestration",
          requirement: "Achieve an overall Career Health Score of 85% or higher on your dashboard.",
          eligible: false,
          is_unlocked: false,
          certificate_id: null,
          issue_date: null,
          completion_score: 84,
          status: "locked",
          verification_url: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (type: string) => {
    setClaimingType(type);
    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch(`http://127.0.0.1:8000/certificates/claim/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchCertificates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingType(null);
    }
  };

  const drawCanvasCertificate = (cert: Certificate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load custom high quality image or draw vector elements
    ctx.clearRect(0, 0, 1000, 700);

    // Background (Classic Elegant Ivory Cream)
    ctx.fillStyle = "#fcfaf2";
    ctx.fillRect(0, 0, 1000, 700);

    // Navy Blue Outer Border
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 960, 660);

    // Gold Inner Border
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, 930, 630);

    // Decorative Gold Corners
    const corners = [
      { x: 35, y: 35 },
      { x: 965, y: 35 },
      { x: 35, y: 665 },
      { x: 965, y: 665 }
    ];
    ctx.fillStyle = "#ca8a04";
    corners.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Logo / Header Text
    ctx.fillStyle = "#4f46e5"; // Indigo-600
    ctx.font = "bold 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("PLACEMATE AI", 500, 90);

    ctx.fillStyle = "#475569"; // Zinc-600
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("ADVANCED AI CAREER OPERATING SYSTEM", 500, 115);

    // Main Certificate Header
    ctx.fillStyle = "#ca8a04"; // Gold
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText("Certificate of Completion", 500, 190);

    ctx.fillStyle = "#334155";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("This credential represents audit compliance for the specified milestone:", 500, 240);

    // Student Name
    ctx.fillStyle = "#0f172a"; // Deep Navy
    ctx.font = "bold 38px Georgia, serif";
    const name = localStorage.getItem("userName") || "Alex Mercer";
    ctx.fillText(name, 500, 310);

    // Underline name
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 325);
    ctx.lineTo(750, 325);
    ctx.stroke();

    // Achievement description
    ctx.fillStyle = "#334155";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("has successfully fulfilled the requirements and evaluated syllabus for", 500, 365);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText(cert.title.toUpperCase(), 500, 405);

    ctx.fillStyle = "#475569";
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillText(`Audited Skill: ${cert.skill_completed} (Score: ${cert.completion_score}%)`, 500, 440);

    // Issue Date
    ctx.fillStyle = "#334155";
    ctx.font = "13px Arial, sans-serif";
    const issueDate = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : new Date().toLocaleDateString();
    ctx.fillText(`Date of Issue: ${issueDate}`, 500, 480);

    // Seal and signatures
    // Draw Gold Seal Circle on bottom left
    ctx.fillStyle = "#eab308"; // Golden
    ctx.beginPath();
    ctx.arc(280, 570, 45, 0, Math.PI * 2);
    ctx.fill();

    // Draw some seal notches
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    for (let i = 0; i < 360; i += 15) {
      const rad = (i * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(280 + Math.cos(rad) * 45, 570 + Math.sin(rad) * 45);
      ctx.lineTo(280 + Math.cos(rad) * 52, 570 + Math.sin(rad) * 52);
      ctx.stroke();
    }

    ctx.fillStyle = "#78350f"; // Dark Amber
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.fillText("VERIFIED", 280, 565);
    ctx.fillText("PLACEMATE AI", 280, 580);

    // Draw Signature line on bottom right
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(650, 585);
    ctx.lineTo(820, 585);
    ctx.stroke();

    // Signature writing
    ctx.fillStyle = "#4338ca"; // Blue ink
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillText("Gemini Auditor Engine", 735, 575);

    ctx.fillStyle = "#475569";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("Authorized AI System Signatory", 735, 605);

    // Certificate ID & URL
    ctx.fillStyle = "#64748b";
    ctx.font = "9px Courier New, monospace";
    ctx.fillText(`CREDENTIAL ID: ${cert.certificate_id || "PMC-TEMP"}`, 500, 645);
    ctx.fillText(`VERIFY ONLINE: http://localhost:3000/verify-certificate/${cert.certificate_id || ""}`, 500, 660);
  };

  const downloadImage = (cert: Certificate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${cert.type}_certificate.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getLinkedInShareUrl = (cert: Certificate) => {
    const baseUrl = "https://www.linkedin.com/sharing/share-offsite/";
    const hostname = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const certUrl = `${hostname}/verify-certificate/${cert.certificate_id}`;
    return `${baseUrl}?url=${encodeURIComponent(certUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold text-zinc-500 tracking-widest uppercase animate-pulse">
          Retrieving placement credentials...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Placement Prep Certificates</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Complete key platform milestones to unlock industry-verifiable preparatory program credentials.
        </p>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs.map((cert) => (
          <div 
            key={cert.type}
            className={`p-6 border rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden bg-zinc-900/25 ${
              cert.is_unlocked
                ? "border-indigo-500/35 hover:border-indigo-500/70 shadow-lg shadow-indigo-600/5 hover:bg-zinc-900/40"
                : cert.eligible
                  ? "border-amber-500/35 hover:border-amber-500 bg-amber-500/5"
                  : "border-zinc-800 opacity-70"
            }`}
          >
            {/* Glow backing */}
            {cert.is_unlocked && (
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
            )}

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl border ${
                  cert.is_unlocked 
                    ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" 
                    : cert.eligible
                      ? "bg-amber-600/10 border-amber-500/20 text-amber-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-850 text-zinc-500"
                }`}>
                  {cert.is_unlocked ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                {cert.is_unlocked && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    PMC-{cert.completion_score}% Score
                  </span>
                )}
                {!cert.is_unlocked && cert.eligible && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full animate-bounce">
                    Ready to Claim
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-200">{cert.title}</h3>
                <p className="text-[10px] text-indigo-400/90 font-medium mt-0.5">{cert.skill_completed}</p>
                <p className="text-zinc-500 text-xs mt-3 leading-relaxed">{cert.requirement}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-900 pt-4 flex items-center justify-between">
              {cert.is_unlocked ? (
                <>
                  <button
                    onClick={() => {
                      setActiveCert(cert);
                      setTimeout(() => drawCanvasCertificate(cert), 100);
                    }}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow shadow-indigo-600/15"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>
                </>
              ) : cert.eligible ? (
                <button
                  onClick={() => handleClaim(cert.type)}
                  disabled={claimingType !== null}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow shadow-amber-600/15"
                >
                  {claimingType === cert.type ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Credential...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>Claim Certificate</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Requirement Locked</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden high-res canvas for image downloads */}
      <canvas 
        ref={canvasRef} 
        width="1000" 
        height="700" 
        className="hidden" 
      />

      {/* Certificate Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setActiveCert(null)} 
          />

          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-6 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Certificate Preview Panel
              </span>
              <button 
                onClick={() => setActiveCert(null)} 
                className="text-zinc-550 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Area Wrap (For standard printer page formatting) */}
            <div id="certificate-print-area" className="flex items-center justify-center overflow-x-auto py-4">
              <div className="w-[840px] h-[588px] shrink-0 bg-[#fcfaf2] border-[10px] border-slate-900 outline outline-3 outline-yellow-600 outline-offset-[-14px] p-8 flex flex-col justify-between relative shadow-xl text-left select-none text-slate-800">
                {/* Gold Seal background watermark */}
                <div className="absolute right-12 bottom-12 w-32 h-32 border-[1.5px] border-yellow-600/25 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 border border-dashed border-yellow-600/35 rounded-full flex items-center justify-center">
                    <Award className="w-10 h-10 text-yellow-600/30" />
                  </div>
                </div>

                {/* Header info */}
                <div className="text-center flex flex-col items-center gap-0.5">
                  <span className="font-bold text-indigo-700 tracking-widest text-lg font-serif">PLACEMATE AI</span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Advanced AI Career Development Suite</span>
                </div>

                {/* Main Heading */}
                <div className="text-center mt-2 flex flex-col items-center gap-2">
                  <h2 className="text-amber-600 text-3xl font-bold font-serif">Certificate of Completion</h2>
                  <p className="text-slate-500 text-xs italic">This credential certifies dynamic milestone audit compliance in the preparatory category of:</p>
                </div>

                {/* Student Name */}
                <div className="text-center py-2">
                  <span className="font-bold text-slate-900 text-3xl border-b border-slate-300 pb-1.5 px-16 font-serif">
                    {localStorage.getItem("userName") || "Alex Mercer"}
                  </span>
                </div>

                {/* Audit details */}
                <div className="text-center flex flex-col gap-1.5">
                  <p className="text-slate-600 text-xs leading-normal">has successfully completed the audited requirements and challenges evaluated by Gemini AI for</p>
                  <p className="font-bold text-slate-900 text-lg uppercase tracking-wider">{activeCert.title}</p>
                  <p className="text-slate-500 text-xs italic">Skill Verified: {activeCert.skill_completed} (Passing score: {activeCert.completion_score}%)</p>
                  <p className="text-slate-600 text-[11px] font-semibold">Date of Issuance: {activeCert.issue_date ? new Date(activeCert.issue_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>

                {/* Footer seal/signature & QR code */}
                <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-2 relative">
                  {/* Verified seal */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-yellow-500 outline outline-2 outline-dashed outline-yellow-600 outline-offset-2 flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                      <span className="text-[8px] font-extrabold text-amber-950 uppercase tracking-wider">Verified</span>
                      <span className="text-[7px] font-bold text-amber-900">PlaceMate</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-800 leading-normal">Gemini Auditor Engine</span>
                      <span className="text-[9px] text-slate-500">Autonomous Evaluation System</span>
                    </div>
                  </div>

                  {/* QR code verification box */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 flex flex-col items-center gap-1">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(
                        window.location.origin + activeCert.verification_url
                      )}`}
                      alt="Verification Link QR Code"
                      className="w-14 h-14 bg-white p-0.5 border border-slate-200 shadow-sm"
                    />
                    <span className="text-[7px] font-semibold text-slate-400 font-mono tracking-wider">PMC ID: {activeCert.certificate_id}</span>
                  </div>

                  {/* Signature block */}
                  <div className="flex flex-col items-center text-center">
                    <span className="text-indigo-800 font-serif italic text-base pb-1">AI-CEO Orchestrator</span>
                    <div className="w-40 border-t border-slate-400 pt-1.5">
                      <span className="text-[10px] text-slate-500 font-medium">PlaceMate AI Executive Authority</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-zinc-900 pt-4">
              <button
                onClick={handlePrint}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-800"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={() => downloadImage(activeCert)}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-800"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Download Image</span>
              </button>

              <a
                href={getLinkedInShareUrl(activeCert)}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 sm:col-span-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow shadow-indigo-600/10 hover:scale-[1.01] active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for Print PDF page isolation */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible !important;
          }
          #certificate-print-area {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
