'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Play, Square, Mic, Video, VideoOff, FileX, Upload, Brain, Sparkles } from 'lucide-react';

interface GDMessage { speaker: string; avatar: string; color: string; text: string; isUser: boolean; }

const AI_PARTICIPANTS = [
  { name: 'Priya Sharma',  avatar: 'PS', color: 'from-pink-500 to-rose-500',     voiceIdx: 1, role: 'Analytical' },
  { name: 'Rohan Das',     avatar: 'RD', color: 'from-blue-500 to-indigo-500',   voiceIdx: 2, role: 'Pragmatic' },
  { name: 'Vikram Mehta',  avatar: 'VM', color: 'from-emerald-500 to-teal-500',  voiceIdx: 3, role: 'Aggressive' },
  { name: 'Emily Watson',  avatar: 'EW', color: 'from-amber-500 to-orange-500',  voiceIdx: 0, role: 'Collaborative' },
  { name: 'Kabir Sen',     avatar: 'KS', color: 'from-violet-500 to-purple-500', voiceIdx: 4, role: 'Skeptical' },
];

const TOPICS = [
  'Is AI replacing software developers?',
  'Remote work vs. Onsite workplace',
  'Cryptocurrency: Revolution or bubble?',
  'Social media: Connecting or isolating?',
  'Should coding be taught in schools?',
];

const DIALOGUES: Record<string, string[]> = {
  'Priya Sharma': [
    'Looking at the data — AI tools boost developer output by 55%, but this actually expands software markets, not reduces headcount. History shows productivity gains create more jobs, not fewer.',
    'We need to separate syntax generation from architectural reasoning. Software engineering is 90% logic and design. Code writing is just the final 10%.',
    'I agree on the security risk. If junior developers blindly paste AI code, the security debt skyrockets. Human oversight becomes more critical, not less.',
  ],
  'Rohan Das': [
    'AI is essentially a smart autocomplete for syntax. But who debugs when the AI hallucinates? Developers shift to system checkers and prompt engineers — a different role, not elimination.',
    'Business logic cannot be captured by a prompt. A product owner cannot tell an AI to build a custom logistics engine without deep technical specifications — which only engineers can write.',
    'Exactly. We are moving from syntax-level programming to higher-level system design. This demands more skill, not less.',
  ],
  'Vikram Mehta': [
    'I will push back here. Generative models can already scaffold a full Next.js app in seconds. One senior architect with AI tools could replace a team of four juniors within five years.',
    'That is the real threat — junior hiring contracts. If seniors are 10x faster, why hire entry-level coders for standard test writing?',
    'Upskilling in system design, cloud, and DevOps is the only survival path for fresh graduates in this landscape.',
  ],
  'Emily Watson': [
    'Vikram raises valid concerns, but AI also democratizes engineering. A single developer can launch a full MVP startup in days now. That creates more projects, not fewer jobs.',
    'Let us synthesize: Priya highlights system design and Vikram notes junior-hiring challenges. This means placement prep must shift from basic syntax to architectural patterns.',
    'Human collaboration is irreplaceable. Team communication, negotiation, stakeholder management — AI cannot replicate these soft skills.',
  ],
  'Kabir Sen': [
    'We are ignoring the IP problem. Copilot is trained on public repos — there are real copyright liability issues. Enterprise SaaS cannot use raw AI code without massive human legal review.',
    'Who owns AI-generated code? This legal grey area alone will slow enterprise adoption significantly. Real-world constraints matter here.',
    'Testing is another gap. AI code lacks proper unit test coverage unless explicitly prompted — and even then, edge cases slip through. Human QA remains essential.',
  ],
};

export default function GDSimulatorPage() {
  const [hasResume,     setHasResume]     = useState<boolean | null>(null);
  const [topic,         setTopic]         = useState(TOPICS[0]);
  const [active,        setActive]        = useState(false);
  const [messages,      setMessages]      = useState<GDMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [webcamOn,      setWebcamOn]      = useState(false);
  const [isListening,   setIsListening]   = useState(false);
  const [liveTranscript,setLiveTranscript]= useState('');
  const [speakingTime,  setSpeakingTime]  = useState(0);
  const [report,        setReport]        = useState<any>(null);
  const [voices,        setVoices]        = useState<SpeechSynthesisVoice[]>([]);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const messageEndRef  = useRef<HTMLDivElement>(null);
  const msgIdxRef      = useRef(0);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const userWordsRef   = useRef('');
  const speakSecsRef   = useRef(0);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || 'mock_token') : 'mock_token';

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    checkResume();
    return () => {
      cleanup();
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function checkResume() {
    try {
      const res = await fetch('http://127.0.0.1:8001/resume/latest', { headers: { Authorization: `Bearer ${token}` } });
      setHasResume(res.ok);
    } catch { setHasResume(false); }
  }

  function speakAs(text: string, voiceIdx: number, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = 0.92 + voiceIdx * 0.02;
    utt.pitch   = 0.85 + voiceIdx * 0.08;
    if (voices.length > 0) utt.voice = voices[voiceIdx % voices.length];
    utt.onend   = () => onEnd?.();
    utt.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utt);
  }

  async function startMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamOn(true);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
    } catch { console.warn('Media blocked'); }
  }

  function stopMedia() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamOn(false);
  }

  function startListeningForUser() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
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
        userWordsRef.current += final;
        speakSecsRef.current += 1;
        setSpeakingTime(s => s + 1);
      }
      setLiveTranscript(userWordsRef.current + interim);

      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => {
        const spoken = userWordsRef.current.trim();
        if (spoken) {
          userWordsRef.current = '';
          setMessages(prev => [...prev, { speaker: 'You', avatar: 'ME', color: 'from-indigo-600 to-indigo-700', text: spoken, isUser: true }]);
          setTimeout(() => {
            const reply = 'That is an insightful point. Building on what you just said — this topic ultimately depends on individual perspective and market context.';
            setActiveSpeaker('Emily Watson');
            speakAs(reply, 0, () => {
              setMessages(prev => [...prev, { speaker: 'Emily Watson', avatar: 'EW', color: 'from-amber-500 to-orange-500', text: reply, isUser: false }]);
              setActiveSpeaker(null);
            });
          }, 1200);
        }
      }, 2000);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend   = () => setIsListening(false);
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (silenceRef.current) clearTimeout(silenceRef.current);
    setIsListening(false);
  }

  async function startDiscussion() {
    setActive(true);
    setMessages([]);
    setReport(null);
    msgIdxRef.current  = 0;
    userWordsRef.current = '';
    speakSecsRef.current = 0;
    setSpeakingTime(0);
    setLiveTranscript('');
    await startMedia();
    startListeningForUser();

    const opener = `Welcome everyone. Today's group discussion topic is: ${topic}. Let us begin. Priya, please start.`;
    speakAs(opener, 0, () => postNextAIMessage());

    timerRef.current = setInterval(() => {
      if (msgIdxRef.current < 10) postNextAIMessage();
      else endDiscussion();
    }, 9000);

    promptTimerRef.current = setInterval(() => {
      if (speakSecsRef.current === 0 && msgIdxRef.current > 2) {
        speakAs('You — what is your view on this topic?', 1);
      }
    }, 30000);
  }

  function postNextAIMessage() {
    const idx         = msgIdxRef.current;
    const participant = AI_PARTICIPANTS[idx % AI_PARTICIPANTS.length];
    setActiveSpeaker(participant.name);
    const lines = DIALOGUES[participant.name];
    const line  = lines[Math.floor(idx / AI_PARTICIPANTS.length) % lines.length];
    speakAs(line, participant.voiceIdx, () => {
      setMessages(prev => [...prev, {
        speaker: participant.name, avatar: participant.avatar,
        color:   participant.color, text: line, isUser: false,
      }]);
      setActiveSpeaker(null);
    });
    msgIdxRef.current++;
  }

  function cleanup() {
    if (timerRef.current)       clearInterval(timerRef.current);
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    stopListening();
    stopMedia();
    window.speechSynthesis?.cancel();
  }

  function endDiscussion() {
    if (timerRef.current)       clearInterval(timerRef.current);
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    setActive(false);
    setActiveSpeaker(null);
    stopListening();
    stopMedia();
    window.speechSynthesis?.cancel();

    const secs = speakSecsRef.current;
    const participated = secs > 0;
    setReport({
      communication: participated ? Math.min(95, 65 + secs * 2)   : 30,
      leadership:    participated ? Math.min(90, 60 + secs * 1.5) : 25,
      logical:       participated ? Math.min(92, 68 + secs * 1.8) : 28,
      confidence:    participated ? Math.min(88, 62 + secs * 2)   : 30,
      speaking_time: `${secs} seconds`,
      verdict: participated
        ? secs >= 10
          ? 'Excellent participation. You made structured points and responded to peers effectively.'
          : 'You participated but could speak more. Aim for at least 3 contributions in a GD.'
        : 'You did not speak in the discussion. In real GDs, participation is mandatory — raise your points confidently.',
    });
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (hasResume === null) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  );

  // ── No Resume ─────────────────────────────────────────────────────────────
  if (!hasResume) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-full">
        <FileX className="w-12 h-12 text-rose-400" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-white">Resume Required</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-sm">
          The AI Group Discussion uses your resume context. Please upload your resume first.
        </p>
      </div>
      <a href="/resume-analyzer" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">
        <Upload className="w-4 h-4" /> Upload Your Resume
      </a>
    </div>
  );

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Group Discussion</h1>
          <p className="text-zinc-400 text-sm mt-1">Debate with AI participants via voice — just speak to join the discussion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">GD Settings</span>

            <select value={topic} onChange={e => setTopic(e.target.value)} disabled={active}
              className="bg-zinc-950 border border-zinc-800 text-xs p-2.5 rounded-lg text-zinc-300 focus:outline-none disabled:opacity-50"
            >
              {TOPICS.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>

            {/* Your feed */}
            <div className="flex flex-col gap-2 border-t border-zinc-800/50 pt-3">
              <span className="text-xs font-semibold text-zinc-400">Your Feed</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 relative flex items-center justify-center">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
                {!webcamOn && <VideoOff className="w-8 h-8 text-zinc-700" />}
                {isListening && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[9px] text-rose-400">MIC ON</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Participants */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-400">AI Participants</span>
              {AI_PARTICIPANTS.map((p, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${activeSpeaker === p.name ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-zinc-950/40'}`}>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{p.avatar}</div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-200">{p.name}</p>
                    <p className="text-[8px] text-zinc-600">{p.role}</p>
                  </div>
                  {activeSpeaker === p.name && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                </div>
              ))}
            </div>

            {!active ? (
              <button onClick={startDiscussion} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                <Play className="w-3.5 h-3.5" /> Start GD
              </button>
            ) : (
              <button onClick={endDiscussion} className="w-full py-2.5 bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-zinc-700 flex items-center justify-center gap-2">
                <Square className="w-3.5 h-3.5" /> End &amp; Get Report
              </button>
            )}
          </div>
        </div>

        {/* Right: discussion area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col h-[420px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-200 truncate max-w-xs">{topic}</span>
              </div>
              {activeSpeaker && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[10px] text-indigo-400 font-bold">{activeSpeaker} speaking...</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs gap-2">
                  <Users className="w-8 h-8 text-zinc-700" />
                  <span>Click Start GD — then speak to participate</span>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 max-w-[85%] ${m.isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{m.avatar}</div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold">{m.speaker}</span>
                    <div className={`p-3 rounded-xl text-xs leading-relaxed ${m.isUser ? 'bg-indigo-600 text-white' : 'bg-zinc-950/60 border border-zinc-800 text-zinc-300'}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* Mic status bar */}
            <div className="border-t border-zinc-800 pt-3 mt-3">
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${isListening ? 'border-rose-500/40 bg-rose-500/5' : 'border-zinc-800 bg-zinc-950/30'}`}>
                {isListening
                  ? <><span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" /><span className="text-xs text-rose-400">🎙️ Listening — speak to join the discussion</span></>
                  : <><Mic className="w-3.5 h-3.5 text-zinc-600" /><span className="text-xs text-zinc-600">{active ? 'Your mic is ready — just start speaking' : 'Start the GD to activate your microphone'}</span></>
                }
              </div>
            </div>
          </div>

          {/* Live transcript */}
          {active && (
            <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
              <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Your Live Transcript</p>
              <p className="text-xs text-zinc-400 min-h-[1rem]">
                {liveTranscript || <span className="italic text-zinc-700">Speak into your microphone...</span>}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">Speaking time: {speakingTime}s</p>
            </div>
          )}

          {/* Report */}
          {report && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Logical',        score: report.logical,        color: 'text-indigo-400' },
                  { label: 'Communication',  score: report.communication,  color: 'text-violet-400' },
                  { label: 'Leadership',     score: report.leadership,     color: 'text-emerald-400' },
                  { label: 'Confidence',     score: report.confidence,     color: 'text-amber-400' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">{item.label}</span>
                    <span className={`text-2xl font-extrabold ${item.color}`}>{item.score}<span className="text-sm text-zinc-600">/100</span></span>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
                <span className="text-xs font-bold text-zinc-400 uppercase block mb-2">AI Moderator Evaluation</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">{report.verdict}</p>
                <p className="text-[11px] text-zinc-500 mt-2">Speaking time: {report.speaking_time}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
