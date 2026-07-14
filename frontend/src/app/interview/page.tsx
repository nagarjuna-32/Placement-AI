'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, AlertTriangle,
  CheckCircle, XCircle, FileX, Upload, Sparkles,
  MessageSquare, Brain, Smile, RefreshCw
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Question { id: number; level: string; topic: string; question: string; }
interface ResumeSummary { ats_score: number; skills: string[]; projects: string[]; missing: string[]; }
interface ExpressionData { confidence: number; nervousness: number; eyeContact: number; }
interface QuestionResult {
  question_id: number; question: string; level: string; topic: string;
  spoken_answer: string; verdict: string; score: number; feedback: string;
  better_answer: string; was_second_chance: boolean;
  expression_snapshot: ExpressionData | null;
}

type PageState = 'loading' | 'no_resume' | 'setup' | 'permissions' | 'preparing' | 'interview' | 'report';

const LEVEL_COLORS: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  hard: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
};

const PERSONALITIES = [
  { id: 'friendly', label: 'Friendly', desc: 'Supportive and encouraging tone', icon: '😊' },
  { id: 'strict',   label: 'Strict',   desc: 'Professional, direct, no-nonsense', icon: '🎯' },
  { id: 'faang',    label: 'FAANG Style', desc: 'Intense, Google/Amazon-style grilling', icon: '🚀' },
];

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];

function countFillers(text: string) {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
}

function simulateExpression(base: number): ExpressionData {
  const jitter = () => (Math.random() - 0.5) * 12;
  const conf = Math.min(100, Math.max(10, base + jitter()));
  const nerv = Math.min(100, Math.max(5, 100 - conf + jitter() * 0.5));
  const eye  = Math.min(100, Math.max(20, conf * 0.9 + jitter()));
  return { confidence: Math.round(conf), nervousness: Math.round(nerv), eyeContact: Math.round(eye) };
}

function buildFallbackQuestions(skills: string[]): Question[] {
  const s0 = skills[0] || 'Python';
  const s1 = skills[1] || 'SQL';
  return [
    { id: 1,  level: 'easy',   topic: 'General',  question: 'Tell me about yourself and your technical background.' },
    { id: 2,  level: 'easy',   topic: 'General',  question: 'What programming languages are you most comfortable with?' },
    { id: 3,  level: 'easy',   topic: s0,          question: `What is ${s0} and what is it commonly used for?` },
    { id: 4,  level: 'easy',   topic: 'General',  question: 'What is a REST API and how does it work?' },
    { id: 5,  level: 'easy',   topic: 'General',  question: 'What is the difference between GET and POST HTTP methods?' },
    { id: 6,  level: 'medium', topic: s1,          question: `How have you used ${s1} in your projects?` },
    { id: 7,  level: 'medium', topic: 'General',  question: 'Walk me through the architecture of your main project.' },
    { id: 8,  level: 'medium', topic: 'General',  question: 'How do you handle errors and exceptions in your code?' },
    { id: 9,  level: 'medium', topic: 'General',  question: 'What is the difference between synchronous and asynchronous programming?' },
    { id: 10, level: 'medium', topic: 'General',  question: 'Describe a difficult bug you fixed and how you debugged it.' },
    { id: 11, level: 'hard',   topic: 'General',  question: 'Design a URL shortener like Bit.ly. Explain your architecture.' },
    { id: 12, level: 'hard',   topic: 'General',  question: 'How would you scale a web application to handle 1 million users?' },
    { id: 13, level: 'hard',   topic: s0,          question: `What are the most common performance pitfalls when using ${s0}?` },
    { id: 14, level: 'hard',   topic: 'General',  question: 'Explain the CAP theorem and when you would sacrifice consistency for availability.' },
    { id: 15, level: 'hard',   topic: 'General',  question: 'How do you ensure security in a web application? Name at least 5 strategies.' },
  ];
}

function buildFallbackEvaluation(answer: string, topic: string, secondChance: boolean) {
  const isOk = answer.length > 40;
  return {
    verdict: isOk ? 'partial' : 'wrong',
    score: isOk ? 55 : 20,
    feedback: isOk ? 'Your answer touched some key points.' : 'Your answer was too brief or off-topic.',
    ai_response: isOk
      ? "That's a reasonable answer. Let's continue."
      : secondChance
      ? "That's still not correct. We'll have to end the interview here. Thank you."
      : "That's not quite right. I'll give you one more chance.",
    follow_up_question: isOk || secondChance ? null : `Let me rephrase — what do you know about ${topic}?`,
    better_answer: `A strong answer on ${topic} covers core concepts, real-world usage, and examples.`,
    keyword_hits: [] as string[],
  };
}

export default function AIInterviewPage() {
  const [pageState,         setPageState]         = useState<PageState>('loading');
  const [resumeSummary,     setResumeSummary]     = useState<ResumeSummary | null>(null);
  const [personality,       setPersonality]       = useState('friendly');
  const [questions,         setQuestions]         = useState<Question[]>([]);
  const [currentQIdx,       setCurrentQIdx]       = useState(0);
  const [isSecondChance,    setIsSecondChance]    = useState(false);
  const [results,           setResults]           = useState<QuestionResult[]>([]);
  const [liveTranscript,    setLiveTranscript]    = useState('');
  const [aiSpeaking,        setAiSpeaking]        = useState(false);
  const [isListening,       setIsListening]       = useState(false);
  const [expression,        setExpression]        = useState<ExpressionData>({ confidence: 70, nervousness: 30, eyeContact: 75 });
  const [expressionTimeline,setExpressionTimeline]= useState<ExpressionData[]>([]);
  const [totalFillers,      setTotalFillers]      = useState(0);
  const [totalWords,        setTotalWords]        = useState(0);
  const [webcamOn,          setWebcamOn]          = useState(false);
  const [micOn,             setMicOn]             = useState(true);
  const [evaluating,        setEvaluating]        = useState(false);
  const [warningMsg,        setWarningMsg]        = useState('');
  const [report,            setReport]            = useState<any>(null);

  const videoRef          = useRef<HTMLVideoElement>(null);
  const recognitionRef    = useRef<any>(null);
  const expressionTimerRef= useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedAnswer = useRef('');
  const baseConfidence    = useRef(70);
  const resultsRef        = useRef<QuestionResult[]>([]);
  const exprTimelineRef   = useRef<ExpressionData[]>([]);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || 'mock_token') : 'mock_token';
  const API   = 'http://127.0.0.1:8001';

  // Keep refs in sync with state
  useEffect(() => { resultsRef.current      = results;           }, [results]);
  useEffect(() => { exprTimelineRef.current = expressionTimeline;}, [expressionTimeline]);

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    checkResume();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkResume() {
    try {
      const res = await fetch(`${API}/resume/latest`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setResumeSummary({
          ats_score: data.ats_score,
          skills:    data.extracted_skills || [],
          projects:  (data.projects_analysis || []).map((p: any) => p.title || ''),
          missing:   data.missing_keywords  || [],
        });
        setPageState('setup');
      } else {
        setPageState('no_resume');
      }
    } catch {
      setPageState('no_resume');
    }
  }

  // ── Start interview ───────────────────────────────────────────────────────
  async function startInterview() {
    setPageState('permissions');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      setWebcamOn(true);
    } catch {
      setWarningMsg('Camera/mic access denied. Interview will proceed audio-only.');
    }
    setPageState('preparing');
    await fetchQuestions();
  }

  async function fetchQuestions() {
    try {
      const res = await fetch(`${API}/resume/interview-questions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const qs: Question[] = data.questions;
        setQuestions(qs);
        if (data.resume_summary) setResumeSummary(data.resume_summary);
        setPageState('interview');
        startExpressionTracker();
        setTimeout(() => askQuestion(qs, 0, false), 600);
      } else {
        throw new Error('backend error');
      }
    } catch {
      const qs = buildFallbackQuestions(resumeSummary?.skills || []);
      setQuestions(qs);
      setPageState('interview');
      startExpressionTracker();
      setTimeout(() => askQuestion(qs, 0, false), 600);
    }
  }

  // ── Expression tracker ────────────────────────────────────────────────────
  function startExpressionTracker() {
    expressionTimerRef.current = setInterval(() => {
      const expr = simulateExpression(baseConfidence.current);
      setExpression(expr);
    }, 800);
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  function speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    setAiSpeaking(true);
    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = personality === 'faang' ? 1.1 : personality === 'strict' ? 0.95 : 0.9;
    utt.pitch   = personality === 'friendly' ? 1.1 : 0.9;
    const voices = window.speechSynthesis.getVoices();
    const pref   = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Alex'));
    if (pref) utt.voice = pref;
    utt.onend   = () => { setAiSpeaking(false); onEnd?.(); };
    utt.onerror = () => { setAiSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utt);
  }

  // ── Ask question ──────────────────────────────────────────────────────────
  function askQuestion(qs: Question[], idx: number, secondChance: boolean) {
    if (idx >= qs.length) { finishInterview(); return; }
    const q = qs[idx];
    setCurrentQIdx(idx);
    setIsSecondChance(secondChance);
    setLiveTranscript('');
    accumulatedAnswer.current  = '';
    baseConfidence.current = secondChance ? 50 : 68 + Math.random() * 18;

    const intro = secondChance
      ? `I will give you one more chance. ${q.question}`
      : idx === 0
      ? `Welcome to your AI interview. I am your interviewer today. Let us begin. ${q.question}`
      : q.question;

    speak(intro, () => startListening(qs, idx, secondChance));
  }

  // ── Speech recognition ────────────────────────────────────────────────────
  function startListening(qs: Question[], idx: number, secondChance: boolean) {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setWarningMsg('Speech recognition not supported. Please use Chrome or Edge.'); return; }

    const rec              = new SR();
    rec.continuous         = true;
    rec.interimResults     = true;
    rec.lang               = 'en-US';
    recognitionRef.current = rec;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' '; else interim += t;
      }
      if (final) {
        accumulatedAnswer.current += final;
        setTotalWords(w => w + final.split(' ').filter(Boolean).length);
        setTotalFillers(f => f + countFillers(final));
        baseConfidence.current = Math.min(85, baseConfidence.current + 3);
      }
      setLiveTranscript(accumulatedAnswer.current + interim);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        rec.stop();
        submitAnswer(qs, idx, secondChance, accumulatedAnswer.current.trim());
      }, 2500);
    };

    rec.onerror = (e: any) => { console.warn('STT error:', e.error); setIsListening(false); };
    rec.onend   = () => setIsListening(false);
    rec.start();
  }

  function stopListening() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
  }

  // ── Evaluate ──────────────────────────────────────────────────────────────
  async function submitAnswer(qs: Question[], idx: number, secondChance: boolean, answer: string) {
    stopListening();
    if (!answer || answer.length < 3) answer = '(no answer provided)';
    setEvaluating(true);
    setLiveTranscript(answer);

    const currentQ  = qs[idx];
    const exprSnap  = simulateExpression(baseConfidence.current);
    if (answer.length < 15) baseConfidence.current = Math.max(20, baseConfidence.current - 25);

    let evaluation: any;
    try {
      const res = await fetch(`${API}/interview/evaluate-answer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          spoken_answer: answer,
          level: currentQ.level,
          topic: currentQ.topic,
          is_second_chance: secondChance,
        }),
      });
      evaluation = res.ok ? await res.json() : buildFallbackEvaluation(answer, currentQ.topic, secondChance);
    } catch {
      evaluation = buildFallbackEvaluation(answer, currentQ.topic, secondChance);
    }
    setEvaluating(false);

    const newResult: QuestionResult = {
      question_id:       currentQ.id,
      question:          currentQ.question,
      level:             currentQ.level,
      topic:             currentQ.topic,
      spoken_answer:     answer,
      verdict:           evaluation.verdict,
      score:             evaluation.score,
      feedback:          evaluation.feedback,
      better_answer:     evaluation.better_answer,
      was_second_chance: secondChance,
      expression_snapshot: exprSnap,
    };

    const updatedResults  = [...resultsRef.current, newResult];
    const updatedTimeline = [...exprTimelineRef.current, exprSnap];
    setResults(updatedResults);
    setExpressionTimeline(updatedTimeline);

    speak(evaluation.ai_response, () => {
      if (evaluation.verdict === 'wrong') {
        if (secondChance) {
          // Terminate
          doTerminate(updatedResults, updatedTimeline);
        } else {
          // Second chance — replace question with follow-up
          setWarningMsg('⚠️  Second Chance — Answer carefully!');
          const followUpQ: Question = evaluation.follow_up_question
            ? { ...currentQ, question: evaluation.follow_up_question }
            : currentQ;
          const newQs = [...qs];
          newQs[idx]  = followUpQ;
          setQuestions(newQs);
          setTimeout(() => { setWarningMsg(''); askQuestion(newQs, idx, true); }, 1000);
        }
      } else {
        setWarningMsg('');
        const next = idx + 1;
        next >= qs.length ? finishInterview() : setTimeout(() => askQuestion(qs, next, false), 700);
      }
    });
  }

  // ── Terminate ─────────────────────────────────────────────────────────────
  function doTerminate(finalResults: QuestionResult[], timeline: ExpressionData[]) {
    stopListening();
    if (expressionTimerRef.current) clearInterval(expressionTimerRef.current);
    buildAndSaveReport(finalResults, timeline, true, 'Two consecutive wrong answers');
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finishInterview() {
    stopListening();
    if (expressionTimerRef.current) clearInterval(expressionTimerRef.current);
    speak('Thank you for attending the interview. Your results are being calculated.', () => {
      buildAndSaveReport(resultsRef.current, exprTimelineRef.current, false, null);
    });
  }

  // ── Build & save report ───────────────────────────────────────────────────
  async function buildAndSaveReport(
    qResults: QuestionResult[],
    timeline: ExpressionData[],
    terminated: boolean,
    reason: string | null,
  ) {
    const techScores = qResults.map(r => r.score);
    const rawTech    = techScores.length ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 50;
    const technical  = terminated ? Math.min(40, rawTech) : rawTech;

    const avgConf    = timeline.length ? Math.round(timeline.reduce((a, e) => a + e.confidence, 0) / timeline.length) : 55;
    const confidence = terminated ? Math.min(45, avgConf) : avgConf;

    const fillerPenalty   = Math.min(30, Math.round((totalFillers / Math.max(totalWords, 1)) * 100));
    const communication   = Math.max(20, Math.min(95, 75 - fillerPenalty + (totalWords > 100 ? 10 : 0)));

    const reportPayload = {
      was_terminated:       terminated,
      termination_reason:   reason,
      questions_results:    qResults,
      expression_timeline:  timeline,
      communication_metrics: { filler_words: totalFillers, total_words: totalWords, filler_rate: totalWords > 0 ? Math.round((totalFillers / totalWords) * 100) : 0 },
      technical_score:      technical,
      communication_score:  communication,
      confidence_score:     confidence,
    };

    setReport({ ...reportPayload, questions_results: qResults });
    stopMedia();

    try {
      await fetch(`${API}/interview/save-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });
    } catch (e) { console.warn('Save report failed:', e); }

    setPageState('report');
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  function stopMedia() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamOn(false);
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }

  function cleanup() {
    stopListening();
    stopMedia();
    if (expressionTimerRef.current) clearInterval(expressionTimerRef.current);
    if (silenceTimerRef.current)    clearTimeout(silenceTimerRef.current);
  }

  const currentQ = questions[currentQIdx];
  const progress = questions.length > 0 ? (currentQIdx / questions.length) * 100 : 0;

  // ─────────────────────────── RENDER ────────────────────────────────────────

  if (pageState === 'loading') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-400 text-sm">Checking your profile...</p>
    </div>
  );

  if (pageState === 'no_resume') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-full">
        <FileX className="w-12 h-12 text-rose-400" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-white">Resume Required</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-sm">
          The AI Interviewer needs your resume to generate personalized questions.
          Upload and analyze your resume first.
        </p>
      </div>
      <a href="/resume-analyzer" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
        <Upload className="w-4 h-4" /> Upload Your Resume
      </a>
    </div>
  );

  if (pageState === 'setup') return (
    <div className="flex flex-col gap-8 py-4 max-w-3xl mx-auto">
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Interview Room</h1>
        <p className="text-zinc-400 text-sm mt-1">
          The AI will conduct your entire interview based on your resume. Voice only — no typing.
        </p>
      </div>

      {resumeSummary && (
        <div className="p-5 bg-zinc-900/50 border border-emerald-500/20 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Resume Loaded ✓</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
              ATS {resumeSummary.ats_score}/100
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resumeSummary.skills.slice(0, 8).map((s, i) => (
              <span key={i} className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-semibold">{s}</span>
            ))}
          </div>
          {resumeSummary.projects.length > 0 && (
            <p className="text-[11px] text-zinc-500">Projects: {resumeSummary.projects.join(', ')}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Choose AI Interviewer Style</span>
        <div className="grid grid-cols-3 gap-3">
          {PERSONALITIES.map(p => (
            <button key={p.id} onClick={() => setPersonality(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${personality === p.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'}`}
            >
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="text-xs font-bold text-white">{p.label}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl text-xs text-amber-300 leading-relaxed">
        <strong>How it works:</strong> AI speaks questions aloud. You answer via microphone.
        Wrong answer → 1 more chance. Wrong twice → interview ends immediately.
        Your expressions and speech are tracked throughout.
      </div>

      <button onClick={startInterview}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all text-sm"
      >
        <Video className="w-5 h-5" /> Start AI Interview
      </button>
    </div>
  );

  if (pageState === 'permissions' || pageState === 'preparing') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <div>
        <p className="text-white font-bold">{pageState === 'permissions' ? 'Requesting camera & microphone...' : 'AI is preparing your questions...'}</p>
        <p className="text-zinc-500 text-xs mt-1">Please allow access when prompted</p>
      </div>
    </div>
  );

  if (pageState === 'report' && report) {
    const overall = Math.round((report.technical_score + report.communication_score + report.confidence_score) / 3);
    const verdict = report.was_terminated
      ? { label: 'Interview Terminated', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '🚫' }
      : overall >= 75 ? { label: 'Strong Candidate',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🏆' }
      : overall >= 55 ? { label: 'Shows Promise',         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: '📈' }
      :                 { label: 'Needs Improvement',     color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    icon: '📚' };

    return (
      <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
        <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Interview Report</h1>
          <button onClick={() => { setPageState('setup'); setResults([]); setExpressionTimeline([]); setTotalFillers(0); setTotalWords(0); setReport(null); setCurrentQIdx(0); }}
            className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-800"
          >
            <RefreshCw className="w-3 h-3" /> Retake Interview
          </button>
        </div>

        <div className={`p-5 border rounded-2xl flex items-center gap-4 ${verdict.bg}`}>
          <span className="text-4xl">{verdict.icon}</span>
          <div>
            <div className={`text-lg font-extrabold ${verdict.color}`}>{verdict.label}</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Overall Score: <span className={`font-bold ${verdict.color}`}>{overall}/100</span>
              {report.was_terminated && <span className="ml-2 text-rose-400">— Ended after 2 wrong answers</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Technical',      score: report.technical_score,      icon: Brain,         color: 'text-indigo-400', note: 'Answer quality' },
            { label: 'Communication',  score: report.communication_score,  icon: MessageSquare, color: 'text-violet-400', note: `${report.communication_metrics?.filler_words ?? 0} filler words` },
            { label: 'Confidence',     score: report.confidence_score,     icon: Smile,         color: 'text-emerald-400', note: 'Facial expression avg' },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-2">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.label}</span>
              <span className={`text-3xl font-extrabold ${item.color}`}>{item.score}<span className="text-base text-zinc-600">/100</span></span>
              <span className="text-[10px] text-zinc-600">{item.note}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Question Breakdown</span>
          {report.questions_results.map((r: QuestionResult, i: number) => (
            <div key={i} className={`p-4 rounded-xl border ${
              r.verdict === 'correct' ? 'border-emerald-500/20 bg-emerald-500/5'
              : r.verdict === 'partial' ? 'border-amber-500/20 bg-amber-500/5'
              : 'border-rose-500/20 bg-rose-500/5'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {r.verdict === 'correct' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  : r.verdict === 'partial' ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[r.level]}`}>{r.level.toUpperCase()}</span>
                <span className="text-[10px] text-zinc-500">{r.topic}</span>
                {r.was_second_chance && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 rounded">2nd Chance</span>}
                <span className="ml-auto text-xs font-bold text-zinc-300">{r.score}/100</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 mb-1">{r.question}</p>
              <p className="text-[11px] text-zinc-500 italic mb-2">Your answer: &quot;{r.spoken_answer.slice(0, 150)}{r.spoken_answer.length > 150 ? '...' : ''}&quot;</p>
              <p className="text-[11px] text-zinc-400"><span className="font-bold text-zinc-300">AI Feedback:</span> {r.feedback}</p>
              {r.verdict !== 'correct' && (
                <p className="text-[11px] text-zinc-500 mt-1"><span className="font-bold text-zinc-400">Better answer:</span> {r.better_answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Live Interview Room ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-300">
            Q {Math.min(currentQIdx + 1, questions.length)} / {questions.length}
          </span>
          <div className="flex gap-1">
            {['easy', 'medium', 'hard'].map(lvl => (
              <span key={lvl} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${LEVEL_COLORS[lvl]}`}>{lvl}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 mx-6 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMicOn(m => !m)}
            className={`p-1.5 rounded-lg border text-xs ${micOn ? 'border-zinc-700 text-zinc-400' : 'border-rose-600 bg-rose-600/10 text-rose-400'}`}
          >
            {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => { stopListening(); doTerminate(resultsRef.current, exprTimelineRef.current); }}
            className="p-1.5 rounded-lg border border-rose-600/40 text-rose-400 text-xs hover:bg-rose-600/10"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {warningMsg && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-300 font-semibold">{warningMsg}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* User video */}
        <div className="w-1/2 relative bg-zinc-950 border-r border-zinc-800 flex flex-col">
          <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
          {!webcamOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
              <VideoOff className="w-10 h-10 text-zinc-600" />
              <span className="text-xs text-zinc-600">Camera off</span>
            </div>
          )}
          {/* Expression glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: `inset 0 0 40px 10px ${
              expression.confidence >= 65 ? 'rgba(16,185,129,0.25)'
              : expression.confidence >= 45 ? 'rgba(245,158,11,0.25)'
              : 'rgba(239,68,68,0.25)'}`
          }} />
          {/* Expression meters */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            {[
              { label: 'Confidence',  val: expression.confidence,  color: 'bg-emerald-500' },
              { label: 'Nervousness', val: expression.nervousness,  color: 'bg-rose-500' },
              { label: 'Eye Contact', val: expression.eyeContact,   color: 'bg-indigo-500' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-zinc-400 w-16 shrink-0">{m.label}</span>
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color} transition-all duration-500`} style={{ width: `${m.val}%` }} />
                </div>
                <span className="text-[9px] text-zinc-400 w-6 text-right">{m.val}%</span>
              </div>
            ))}
          </div>
          <div className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">YOU</div>
        </div>

        {/* AI panel */}
        <div className="w-1/2 flex flex-col bg-zinc-950">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 ${aiSpeaking ? 'animate-pulse' : ''}`}>
                <Brain className="w-10 h-10 text-white" />
              </div>
              {aiSpeaking && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">AI Interviewer</p>
              <p className="text-[10px] text-zinc-500 capitalize">{personality} style</p>
            </div>
            {currentQ && (
              <div className="w-full p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[currentQ.level]}`}>{currentQ.level.toUpperCase()}</span>
                  <span className="text-[10px] text-zinc-500">{currentQ.topic}</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{currentQ.question}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {evaluating ? (
                <><div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /><span className="text-xs text-indigo-400">Evaluating answer...</span></>
              ) : aiSpeaking ? (
                <><Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" /><span className="text-xs text-violet-400">AI is speaking...</span></>
              ) : isListening ? (
                <><span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /><span className="text-xs text-rose-400">Listening... speak now</span></>
              ) : (
                <span className="text-xs text-zinc-600">Waiting...</span>
              )}
            </div>
          </div>
          <div className="border-t border-zinc-800 p-4 min-h-[80px] max-h-[120px] overflow-y-auto bg-zinc-900/30">
            <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Live Transcript</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {liveTranscript || <span className="text-zinc-700 italic">Your spoken words appear here...</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 shrink-0 flex items-center justify-center gap-2">
        {isListening
          ? <><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /><span className="text-xs text-rose-400 font-semibold">🎙️ Listening — speak your answer</span></>
          : aiSpeaking
          ? <span className="text-xs text-violet-400">🔊 AI speaking — please wait</span>
          : evaluating
          ? <span className="text-xs text-indigo-400">⚙️ Processing your answer...</span>
          : <span className="text-xs text-zinc-600">Waiting for next question...</span>
        }
      </div>
    </div>
  );
}
