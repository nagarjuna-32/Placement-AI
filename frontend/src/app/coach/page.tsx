"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Square, 
  MessageSquare, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Volume2,
  TrendingDown,
  RefreshCw,
  Award
} from "lucide-react";

interface CoachReport {
  communication_score: number;
  confidence_score: number;
  speaking_speed: number; // WPM
  fluency_score: number;
  filler_words_count: Record<string, number>;
  grammar_critique: string;
  improvement_plan: string[];
}

export default function SpeechCoach() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const practiceTasks = [
    { text: "Pitch yourself: Describe your main project in 45 seconds.", wpmGoal: "120-140 WPM" },
    { text: "Leadership scenario: Explain how you resolved a team dispute.", wpmGoal: "110-130 WPM" },
    { text: "Why PlaceMate AI: Articulate why you want to join our team.", wpmGoal: "130-150 WPM" }
  ];

  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  const startRecordingSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setReport(null);
      setErrorState(null);
      setRecording(true);
      setSeconds(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Setup Web Audio API and visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Draw loop
      drawOscilloscope();

      // Configure media recorder
      const options = { mimeType: "audio/webm" };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setErrorState("Microphone access denied or not supported.");
      setRecording(false);
    }
  };

  const [errorState, setErrorState] = useState<string | null>(null);

  const stopRecordingSession = () => {
    // Clear timing
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop Media Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // Stop all tracks on stream to release microphone icon in browser
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // Stop Audio Visualizer Animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    setRecording(false);
  };

  const triggerAnalysis = () => {
    stopRecordingSession();
    setAnalyzing(true);

    // Simulate speech-to-text processing (Gemini/Whisper AI behavior)
    setTimeout(() => {
      setReport({
        communication_score: 83,
        confidence_score: 88,
        speaking_speed: 132, // Words per minute (Optimal range: 120-150 WPM)
        fluency_score: 80,
        filler_words_count: {
          "um": 2,
          "uh": 1,
          "like": 3
        },
        grammar_critique: "Excellent structural flow. Noticed 2 minor sentence fragments at the start. Speaking speed was well within the professional interview cadence.",
        improvement_plan: [
          "Practice pauses: Replace filler expressions ('like', 'um') with silent beats to sound more deliberate.",
          "Vary vocal pitch: Elevate emphasis on major technical metric delivery.",
          "Simplify structures: Shorten long sentences to ensure clean, structured breathing intervals."
        ]
      });
      setAnalyzing(false);
    }, 1800);
  };

  // Draw Audio Wave on Canvas
  const drawOscilloscope = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        
        // Draw colorful glowing sound waves
        ctx.fillStyle = `rgba(99, 102, 241, ${barHeight / 120})`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };

    draw();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Communication Coach</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Polish your verbal delivery, speech speed, filler-word counts, and sentence construction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Instructions / Tasks */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
              Oral Training Exercises
            </span>
            <div className="flex flex-col gap-4">
              {practiceTasks.map((task, idx) => (
                <div key={idx} className="p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Exercise {idx + 1}</span>
                  <p className="text-xs text-zinc-300 font-semibold leading-normal">{task.text}</p>
                  <span className="text-[9px] text-zinc-500 font-medium">Speed Goal: {task.wpmGoal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Recording Deck and Reports */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Audio Console Card */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center gap-6 text-center">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block self-start">
              Coach Recording Desk
            </span>

            {/* Canvas Waveform */}
            <div className="w-full h-32 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 relative flex items-center justify-center">
              <canvas ref={canvasRef} width="400" height="128" className="w-full h-full" />
              {!recording && !analyzing && !report && (
                <span className="absolute text-xs text-zinc-500 font-medium">Click Record to begin vocal practice</span>
              )}
              {analyzing && (
                <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center gap-3">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-xs text-indigo-400 font-semibold animate-pulse">Analyzing pronunciation styles...</span>
                </div>
              )}
            </div>

            {/* Time / Status and button controls */}
            <div className="flex items-center gap-6">
              {recording && (
                <span className="text-xs font-mono text-zinc-400 px-3 py-1 bg-zinc-950 rounded-full border border-zinc-800 animate-pulse">
                  🎙️ {formatTime(seconds)}
                </span>
              )}
              
              {!recording ? (
                <button
                  onClick={startRecordingSession}
                  disabled={analyzing}
                  className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center"
                >
                  <Mic className="w-6 h-6" />
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={stopRecordingSession}
                    className="p-4 bg-zinc-800 text-zinc-200 rounded-full hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                  <button
                    onClick={triggerAnalysis}
                    className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all text-xs flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Evaluate Voice</span>
                  </button>
                </div>
              )}
            </div>
            {errorState && <span className="text-xs text-red-500">{errorState}</span>}
          </div>

          {/* Feedback Reports Grid */}
          {report && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Communication Index</span>
                  <span className="text-2xl font-extrabold text-indigo-400">{report.communication_score}/100</span>
                </div>
                {/* Confidence */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confidence Level</span>
                  <span className="text-2xl font-extrabold text-violet-400">{report.confidence_score}/100</span>
                </div>
                {/* Pace (WPM) */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Speaking Tempo</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{report.speaking_speed} WPM</span>
                  <span className="text-[9px] text-zinc-500 font-semibold uppercase">Optimal range: 120-150</span>
                </div>
              </div>

              {/* Filler Words */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Filler Expressions Counts</span>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(report.filler_words_count).map(([word, val]) => (
                    <div key={word} className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400">"{word}"</span>
                      <span className={`text-xs font-bold ${val > 2 ? "text-amber-500" : "text-emerald-400"}`}>
                        {val} times
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar critique */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Grammar & Structure Check</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/45 p-3.5 border border-zinc-850 rounded-xl">
                  {report.grammar_critique}
                </p>
              </div>

              {/* Improvement Plan */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-4">
                <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Custom Improvement Roadmap</span>
                <div className="flex flex-col gap-3">
                  {report.improvement_plan.map((plan, idx) => (
                    <div key={idx} className="flex gap-3 bg-zinc-950/50 border border-zinc-800/60 p-3.5 rounded-xl">
                      <div className="mt-0.5 text-indigo-400 shrink-0 font-bold text-xs">{idx + 1}.</div>
                      <p className="text-xs text-zinc-300 leading-normal">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
