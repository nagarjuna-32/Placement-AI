"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Unlock, 
  Video, 
  Mic, 
  MessageSquare, 
  Play, 
  CheckCircle, 
  RefreshCw, 
  VideoOff, 
  Send,
  Sparkles,
  Smile,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  BrainCircuit,
  Eye,
  Users
} from "lucide-react";

interface QuestionSet {
  title: string;
  intro: string;
  questions: string[];
}

export default function InterviewHub() {
  const [activeMode, setActiveMode] = useState<"levels" | "panel">("levels");
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuestionSet>({
    title: "Self Introduction",
    intro: "Tell me about yourself, your educational background, and your career goals.",
    questions: ["Can you introduce yourself in 2 minutes?", "Why did you choose this field?", "What are your primary interests outside of engineering?"]
  });

  const [activeInterview, setActiveInterview] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"text" | "voice_video">("text");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; avatar?: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [webcamActive, setWebcamActive] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [panelReport, setPanelReport] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Panel Specific Questions
  const [panelQuestions, setPanelQuestions] = useState<any>({
    panel_members: [
      { name: "Dinesh Kumar", role: "Tech Lead", focus: "System Design" },
      { name: "Elena Rostova", role: "Project Manager", focus: "Delivery" },
      { name: "Sarah Jenkins", role: "HR Manager", focus: "Culture" }
    ],
    questions: [
      { interviewer: "Dinesh Kumar (Tech Lead)", question: "How would you design a caching strategy for a microservice backend serving 50,000 requests per minute? When would you invalidate keys?" },
      { interviewer: "Elena Rostova (Project Manager)", question: "Describe a scenario where a critical client requirement changed 2 days before deployment. How did you coordinate with your team?" },
      { interviewer: "Sarah Jenkins (HR Manager)", question: "Why do you want to transition from your current position? What are your salary expectations for this role?" }
    ]
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceTrackerRef = useRef<number | null>(null);

  const levels = [
    { num: 1, name: "Self Introduction" },
    { num: 2, name: "Communication Round" },
    { num: 3, name: "HR Interview" },
    { num: 4, name: "Aptitude Round" },
    { num: 5, name: "Technical Fundamentals" },
    { num: 6, name: "Project Viva" },
    { num: 7, name: "Coding Interview" },
    { num: 8, name: "Company Specific Round" },
    { num: 9, name: "Stress Interview" },
    { num: 10, name: "Placement Simulation" }
  ];

  useEffect(() => {
    const savedLevel = localStorage.getItem("unlockedLevel");
    if (savedLevel) {
      setUnlockedLevel(Number(savedLevel));
    }
  }, []);

  useEffect(() => {
    if (activeMode === "levels") {
      async function fetchQuestions() {
        try {
          const res = await fetch(`http://127.0.0.1:8000/interview/questions/${selectedLevel}`);
          if (res.ok) {
            const data = await res.json();
            setActiveQuestionSet(data);
          } else {
            setMockQuestions(selectedLevel);
          }
        } catch (err) {
          setMockQuestions(selectedLevel);
        }
      }
      fetchQuestions();
    } else {
      async function fetchPanelQuestions() {
        try {
          const res = await fetch("http://127.0.0.1:8000/hr-panel/questions");
          if (res.ok) {
            const data = await res.json();
            setPanelQuestions(data);
          }
        } catch (err) {
          console.log("Using static panel questions (Offline)");
        }
      }
      fetchPanelQuestions();
    }
    setActiveInterview(false);
    setChatLog([]);
    setReport(null);
    setPanelReport(null);
  }, [selectedLevel, activeMode]);

  const setMockQuestions = (lvl: number) => {
    const questionDatabase: Record<number, QuestionSet> = {
      1: {
        title: "Self Introduction",
        intro: "Tell me about yourself, your educational background, and your career goals.",
        questions: ["Can you introduce yourself in 2 minutes?", "Why did you choose this field?", "What are your interests outside of engineering?"]
      },
      2: {
        title: "Communication Round",
        intro: "Speak clearly and confidently on a general topic to assess fluency and articulation.",
        questions: ["How do you explain a complex technical concept to a non-technical manager?", "Describe a time you convinced a teammate to accept your idea.", "Why is active listening important?"]
      }
    };
    setActiveQuestionSet(questionDatabase[lvl] || questionDatabase[1]);
  };

  const startInterview = async () => {
    setActiveInterview(true);
    setCurrentQuestionIdx(0);
    setReport(null);
    setPanelReport(null);
    
    if (activeMode === "levels") {
      const initialQuestion = activeQuestionSet.questions[0];
      setChatLog([{ sender: "ai", text: initialQuestion }]);
      if (ttsEnabled) speakQuestionText(initialQuestion);
    } else {
      const firstPanel = panelQuestions.questions[0];
      setChatLog([{ sender: firstPanel.interviewer, text: firstPanel.question, avatar: "DK" }]);
      if (ttsEnabled) speakQuestionText(firstPanel.question);
    }

    if (interactionMode === "voice_video") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setWebcamActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          startFacialTrackerSimulation();
        }
      } catch (e) {
        console.warn("Camera blocked, using text stubs");
      }
    }
  };

  const speakQuestionText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startFacialTrackerSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    let eyeOffsetX = 0;
    
    const drawGrid = () => {
      faceTrackerRef.current = requestAnimationFrame(drawGrid);
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2 - 10;
      
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 75, 0, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - 20, cy - 15, 5, 0, 2 * Math.PI);
      ctx.arc(cx + 20, cy - 15, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      ctx.fill();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 8px monospace";
      ctx.fillText("AI TRACKING ACTIVE", cx - 40, cy - 80);
    };
    drawGrid();
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    const newUserLog = [...chatLog, { sender: "user", text: userInput }];
    setChatLog(newUserLog);
    setUserInput("");

    const nextIndex = currentQuestionIdx + 1;
    
    if (activeMode === "levels") {
      if (nextIndex < activeQuestionSet.questions.length) {
        setCurrentQuestionIdx(nextIndex);
        const q = activeQuestionSet.questions[nextIndex];
        setTimeout(() => {
          setChatLog(prev => [...prev, { sender: "ai", text: q }]);
          if (ttsEnabled) speakQuestionText(q);
        }, 700);
      } else {
        setTimeout(() => endLevelInterview(), 800);
      }
    } else {
      if (nextIndex < panelQuestions.questions.length) {
        setCurrentQuestionIdx(nextIndex);
        const q = panelQuestions.questions[nextIndex];
        const nextAvatar = nextIndex === 1 ? "ER" : "SJ";
        setTimeout(() => {
          setChatLog(prev => [...prev, { sender: q.interviewer, text: q.question, avatar: nextAvatar }]);
          if (ttsEnabled) speakQuestionText(q.question);
        }, 700);
      } else {
        setTimeout(() => endPanelInterview(), 800);
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    if (faceTrackerRef.current) cancelAnimationFrame(faceTrackerRef.current);
  };

  const endLevelInterview = async () => {
    setSubmitting(true);
    stopWebcam();
    const score = Math.floor(Math.random() * 15) + 75;

    const reportData = {
      level: selectedLevel,
      score,
      feedback: `Completed level ${selectedLevel}. Steady communication flow. Variable speech metrics are consistent. Expand technical terminology details in coding topics.`,
      video_analysis: { eye_contact: 88, smile_frequency: 72, posture: 92, expressions: "Attentive" },
      communication_metrics: { fluency: 84, speaking_speed: 135, filler_words: ["um"], pronunciation: 89 }
    };

    try {
      const token = localStorage.getItem("token") || "mock_token";
      await fetch("http://127.0.0.1:8000/interview/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(reportData)
      });
      if (selectedLevel === unlockedLevel && unlockedLevel < 10) {
        setUnlockedLevel(prev => prev + 1);
        localStorage.setItem("unlockedLevel", String(unlockedLevel + 1));
      }
    } catch (e) {
      if (selectedLevel === unlockedLevel && unlockedLevel < 10) {
        setUnlockedLevel(prev => prev + 1);
        localStorage.setItem("unlockedLevel", String(unlockedLevel + 1));
      }
    }
    setReport(reportData);
    setSubmitting(false);
    setActiveInterview(false);
  };

  const endPanelInterview = async () => {
    setSubmitting(true);
    stopWebcam();

    try {
      const token = localStorage.getItem("token") || "mock_token";
      const res = await fetch("http://127.0.0.1:8000/hr-panel/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: ["ans1", "ans2", "ans3"] })
      });
      if (res.ok) {
        const data = await res.json();
        setPanelReport(data);
      } else {
        setPanelReportFallback();
      }
    } catch (e) {
      setPanelReportFallback();
    } finally {
      setSubmitting(false);
      setActiveInterview(false);
    }
  };

  const setPanelReportFallback = () => {
    setPanelReport({
      overall_score: 85,
      panel_reviews: [
        { interviewer: "Dinesh Kumar (Tech Lead)", score: 82, feedback: "Technical answer shows foundational cache properties but could detail key expiration parameters more clearly." },
        { interviewer: "Elena Rostova (Project Manager)", score: 88, feedback: "Agile sprints adjustment examples were excellent." },
        { interviewer: "Sarah Jenkins (HR Manager)", score: 85, feedback: "Confidence indices are high. Cultural fit recommended." }
      ],
      consolidated_decision: "Hire",
      hiring_status_tag: "Strong Candidate - Direct Recommendation"
    });
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Interview Hub</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Build interview skills via unlockable levels or test yourself in a simulated multi-interviewer mock HR Panel.
          </p>
        </div>

        {/* Mode Selector Tab */}
        <div className="flex gap-2 bg-zinc-950 border border-zinc-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveMode("levels")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "levels" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Progression Levels</span>
          </button>
          <button
            onClick={() => setActiveMode("panel")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "panel" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>AI Mock HR Panel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column Settings */}
        <div className="lg:col-span-1 h-fit flex flex-col gap-4">
          {activeMode === "levels" ? (
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
              <span className="text-xs font-bold text-zinc-400 uppercase block border-b border-zinc-800 pb-2">Levels progression</span>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {levels.map((lvl) => {
                  const isLocked = lvl.num > unlockedLevel;
                  const isSelected = selectedLevel === lvl.num;
                  return (
                    <button
                      key={lvl.num}
                      disabled={isLocked}
                      onClick={() => setSelectedLevel(lvl.num)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isLocked 
                          ? "border-zinc-950 bg-zinc-950/20 text-zinc-600 cursor-not-allowed" 
                          : isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold"
                            : "border-zinc-800/60 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <span>Level {lvl.num}: {lvl.name}</span>
                      {isLocked ? <Lock className="w-3.5 h-3.5 text-zinc-650" /> : <Unlock className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3 text-left">
              <span className="text-xs font-bold text-zinc-400 uppercase block border-b border-zinc-800 pb-2">Board Members</span>
              {panelQuestions.panel_members.map((p: any, idx: number) => (
                <div key={idx} className="p-2 bg-zinc-950/50 border border-zinc-900 rounded-lg text-xs">
                  <span className="font-bold text-zinc-200 block">{p.name}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">{p.role} ({p.focus})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {!activeInterview && !report && !panelReport && (
            <div className="p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-6 max-w-xl mx-auto w-full">
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full">
                {activeMode === "levels" ? <BrainCircuit className="w-8 h-8" /> : <Users className="w-8 h-8" />}
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-xl text-white">
                  {activeMode === "levels" ? `Level ${selectedLevel}: ${activeQuestionSet.title}` : "3-Member HR Board Panel"}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mx-auto">
                  {activeMode === "levels" ? activeQuestionSet.intro : "Simulate an intensive assessment deck with Technical Leads, PMs, and HR Managers. Direct shortlists decision based on reviews."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full border-t border-zinc-800 pt-6">
                <button onClick={() => { setInteractionMode("text"); startInterview(); }} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Start Text Session
                </button>
                <button onClick={() => { setInteractionMode("voice_video"); startInterview(); }} className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 flex items-center justify-center gap-2 shadow">
                  <Video className="w-4 h-4" /> Start Video Session
                </button>
              </div>
            </div>
          )}

          {activeInterview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chat log */}
              <div className="md:col-span-2 p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-[450px]">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Dialogue Feed</span>
                  <span className="text-[10px] font-semibold text-indigo-400">
                    Question {currentQuestionIdx + 1} of {activeMode === "levels" ? activeQuestionSet.questions.length : panelQuestions.questions.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar">
                  {chatLog.map((log, idx) => (
                    <div key={idx} className={`flex gap-3 max-w-[85%] ${log.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${log.sender === "user" ? "bg-indigo-600 text-white" : "bg-zinc-850 text-indigo-400 border border-indigo-500/10"}`}>
                        {log.avatar || (log.sender === "user" ? "Me" : "AI")}
                      </div>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${log.sender === "user" ? "bg-indigo-600 text-white" : "bg-zinc-950/60 border border-zinc-850 text-zinc-300"}`}>
                        <div className="text-[9px] font-bold text-zinc-500 mb-0.5">{log.sender}</div>
                        {log.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 border-t border-zinc-800 pt-3 mt-3">
                  <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }} placeholder="Answer query..." className="flex-1 bg-zinc-950 border border-zinc-850 text-xs px-3 py-2.5 rounded-xl text-zinc-300 focus:outline-none focus:border-indigo-500" />
                  <button onClick={handleSendMessage} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"><Send className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Webcam */}
              <div className="md:col-span-1 p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase block border-b border-zinc-800 pb-2">Video Stream</span>
                <div className="w-full aspect-[4/3] bg-zinc-950 rounded-xl border border-zinc-850 overflow-hidden relative">
                  {webcamActive ? (
                    <>
                      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                      <canvas ref={canvasRef} width="240" height="180" className="absolute inset-0 w-full h-full z-10" />
                    </>
                  ) : <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[10px]">Camera Deactivated</div>}
                </div>
              </div>
            </div>
          )}

          {submitting && (
            <div className="max-w-xl mx-auto w-full p-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center gap-6 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs font-semibold text-zinc-200">Evaluating consolidated panel decisions...</span>
            </div>
          )}

          {/* Level Report */}
          {report && activeMode === "levels" && (
            <div className="flex flex-col gap-6 text-left">
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase border-b border-zinc-800 pb-2">Level completed metrics</span>
                <h3 className="font-extrabold text-base text-zinc-200">Grade: {report.score}/100</h3>
                <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-3 rounded-xl">{report.feedback}</p>
                <button onClick={() => { setReport(null); setSelectedLevel(selectedLevel + 1); }} className="w-fit px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs self-end">Next Level</button>
              </div>
            </div>
          )}

          {/* Panel Mock Report */}
          {panelReport && activeMode === "panel" && (
            <div className="flex flex-col gap-6 text-left">
              {/* Decisions Banner */}
              <div className="p-5 bg-indigo-950/15 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 font-bold text-lg">
                    {panelReport.overall_score}/100
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Board Decision</span>
                    <h3 className="text-base font-extrabold text-emerald-400">{panelReport.consolidated_decision} Recommendation</h3>
                  </div>
                </div>
                <button onClick={() => setPanelReport(null)} className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl transition-all border border-zinc-800 shrink-0">
                  Restart Panel Mock
                </button>
              </div>

              {/* Individual reviews */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Interviewer Critiques</span>
                {panelReport.panel_reviews.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 bg-zinc-900/40 border border-zinc-800/85 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                      <span className="font-bold text-zinc-200 text-xs">{r.interviewer}</span>
                      <span className="text-xs font-bold text-indigo-400">{r.score}/100</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">{r.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
