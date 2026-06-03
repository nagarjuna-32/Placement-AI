"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Play, 
  Square, 
  Send, 
  MessageSquareCode, 
  Sparkles, 
  UserPlus, 
  Mic,
  Award,
  ChevronRight,
  HelpCircle
} from "lucide-react";

interface GDMessage {
  speaker: string;
  avatar: string;
  color: string;
  text: string;
  isUser: boolean;
}

export default function GroupDiscussionRoom() {
  const [topic, setTopic] = useState("Is AI replacing software developers?");
  const [activeDiscussion, setActiveDiscussion] = useState(false);
  const [messages, setMessages] = useState<GDMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [report, setReport] = useState<any | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const topics = [
    "Is AI replacing software developers?",
    "Remote work vs. Onsite workplace models",
    "Cryptocurrency: Financial revolution or speculative bubble?",
    "Social media: Connecting people or increasing isolation?"
  ];

  const aiParticipants = [
    { name: "Priya Sharma", avatar: "PS", color: "from-pink-500 to-rose-500", role: "Analytical & Structured" },
    { name: "Rohan Das", avatar: "RD", color: "from-blue-500 to-indigo-500", role: "Pragmatic & Technical" },
    { name: "Vikram Mehta", avatar: "VM", color: "from-emerald-500 to-teal-500", role: "Aggressive debater" },
    { name: "Emily Watson", avatar: "EW", color: "from-amber-500 to-orange-500", role: "Collaborative & Synthesizing" },
    { name: "Kabir Sen", avatar: "KS", color: "from-violet-500 to-purple-500", role: "Skeptical & Quality focused" }
  ];

  const dialoguePool: Record<string, string[]> = {
    "Priya Sharma": [
      "Let's look at the numbers. AI tools like GitHub Copilot are boosting developer throughput by 55%, but that doesn't mean developer counts will drop. Historically, higher productivity expands the software market, leading to more development demand, not less.",
      "Building on that, we must distinguish between writing simple syntax and designing systemic solutions. Software engineering is 90% logic planning, architecture design, and database structuring. Code generation is the last 10%.",
      "I agree with Rohan's point about security. If junior developers copy-paste AI code blindly, it increases security debt. That makes human oversight more critical than ever."
    ],
    "Rohan Das": [
      "I agree with Priya's analysis. AI is essentially a high-speed calculator for syntax. But who handles system debugs when the AI outputs hallucinations? Human developers will simply transition into system checkers and prompts reviewers.",
      "Also, we should consider that AI does not understand business logic. A product owner cannot simply tell an AI to build a customized logistics engine without highly specific technical instructions, which only a software architect can devise.",
      "Precisely. We are moving from syntax-level programming to higher-level design, which actually makes systems design skills much more important."
    ],
    "Vikram Mehta": [
      "I disagree slightly. I think we are downplaying the speed of AI growth. Generative models can already build complete Next.js boilerplate systems in seconds. In 5 years, a single architect using AI tools might replace a team of 4 junior developers.",
      "Yes, but my point is that junior hiring numbers will definitely contract. If senior developers become 10x faster, why would companies hire entry-level coders to write standard tests? That's the real threat we should talk about.",
      "That is why upskilling in system designs, clouds, and deployment is the only way for job seekers to survive this shift."
    ],
    "Emily Watson": [
      "That's an interesting point, Vikram. But instead of focusing on headcount reduction, look at how AI enables creativity. Now, a single developer can launch a complete MVP startup in days. AI democratizes engineering, allowing more projects to get funded.",
      "Let's synthesize these ideas. Priya highlights system design, and Vikram notes junior hiring challenges. Doesn't this mean placement prep must shift from basic syntax to architectural logic and validation patterns?",
      "I think Alex's interjection was highly relevant. Human collaboration is something AI cannot duplicate. Team communication is what truly builds products."
    ],
    "Kabir Sen": [
      "Wait, what about the licensing and security liabilities? Copilot models are trained on public repos, which introduces potential copyright issues. Enterprise SaaS products cannot risk raw AI code without massive human review pipelines.",
      "Exactly, Kabir here. We are ignoring code ownership. Who owns the IP of an AI-generated repository? This legal ambiguity will slow enterprise adoption of full AI coding tools.",
      "Let's also not forget testing. AI code often lacks unit test coverage unless explicitly prompted, and even then, logical edges get missed. Human test engineering remains essential."
    ]
  };

  useEffect(() => {
    return () => {
      clearDiscussionInterval();
    };
  }, []);

  useEffect(() => {
    // Scroll chat to bottom
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeSpeaker]);

  const clearDiscussionInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startDiscussion = () => {
    setActiveDiscussion(true);
    setMessages([]);
    setReport(null);
    clearDiscussionInterval();

    // Trigger initial message from Priya
    let msgIdx = 0;
    const activeParticipants = [...aiParticipants];

    const postNextAIMessage = () => {
      if (msgIdx >= 10) {
        endDiscussion();
        return;
      }

      // Pick a random participant
      const speaker = activeParticipants[msgIdx % activeParticipants.length];
      setActiveSpeaker(speaker.name);

      setTimeout(() => {
        const lines = dialoguePool[speaker.name];
        const lineText = lines[Math.floor(msgIdx / activeParticipants.length) % lines.length];

        setMessages((prev) => [
          ...prev,
          {
            speaker: speaker.name,
            avatar: speaker.avatar,
            color: speaker.color,
            text: lineText,
            isUser: false
          }
        ]);
        setActiveSpeaker(null);
        msgIdx++;
      }, 1000); // 1s typing delay
    };

    postNextAIMessage();

    // Run discussion queue every 7 seconds
    timerRef.current = setInterval(() => {
      postNextAIMessage();
    }, 7500);
  };

  const endDiscussion = () => {
    clearDiscussionInterval();
    setActiveDiscussion(false);
    setActiveSpeaker(null);

    // Compute grading report
    // Score based on whether user sent messages (participation)
    const hasParticipated = messages.some(m => m.isUser);
    
    setReport({
      communication_score: hasParticipated ? 84 : 40,
      leadership_score: hasParticipated ? 80 : 30,
      logical_thinking: hasParticipated ? 86 : 30,
      confidence_score: hasParticipated ? 82 : 30,
      speaking_time: hasParticipated ? "45 Seconds" : "0 Seconds",
      feedback: hasParticipated 
        ? "Excellent interjection. You constructively addressed the impact on junior developer roles. Good synthesis of other candidates' points. Keep structuring your remarks with a clear start and conclusion."
        : "You did not participate in the discussion. In group rounds, it's vital to raise your hand and make at least 2 structured points."
    });
  };

  const handleInterject = () => {
    if (!userInput.trim()) return;

    // Post User argument
    setMessages((prev) => [
      ...prev,
      {
        speaker: "Alex Mercer (You)",
        avatar: "AM",
        color: "from-indigo-600 to-indigo-700",
        text: userInput,
        isUser: true
      }
    ]);
    
    const submittedText = userInput;
    setUserInput("");

    // Simulate AI responsive triggers (Emily replies to User)
    setTimeout(() => {
      setActiveSpeaker("Emily Watson");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            speaker: "Emily Watson",
            avatar: "EW",
            color: "from-amber-500 to-orange-500",
            text: `Alex points out an essential concept. The shift isn't about replacing engineers, it's about shifting their focus. If we spend less time writing simple boilerplates, we can spend more time optimizing APIs and securing data pipelines.`,
            isUser: false
          }
        ]);
        setActiveSpeaker(null);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Group Discussion Simulator</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Simulate dynamic debates with AI candidates, testing coordination, logical arguments, and interjection speeds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left config column */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-5 h-fit lg:col-span-1">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase block border-b border-zinc-800 pb-2">
            Discussion Settings
          </span>

          {/* Topic Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">Select Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={activeDiscussion}
              className="bg-zinc-950 border border-zinc-800 text-xs p-2.5 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {topics.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* AI Participants List */}
          <div className="flex flex-col gap-2.5 mt-2">
            <span className="text-xs font-semibold text-zinc-400">Participants (5 AI)</span>
            <div className="flex flex-col gap-2">
              {aiParticipants.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-900 p-2 rounded-lg">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center font-bold text-white text-[9px] shrink-0`}>
                    {p.avatar}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-zinc-200">{p.name}</span>
                    <span className="text-[8px] text-zinc-500 italic">{p.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Action */}
          {!activeDiscussion ? (
            <button
              onClick={startDiscussion}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Group Discussion</span>
            </button>
          ) : (
            <button
              onClick={endDiscussion}
              className="w-full py-2.5 bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-3.5 h-3.5" />
              <span>End & Grade Round</span>
            </button>
          )}
        </div>

        {/* Right Debating arena */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Discussion screen */}
          <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-[450px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-200 truncate max-w-[200px] sm:max-w-md">
                  GD Arena: {topic}
                </span>
              </div>
              {activeSpeaker && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono">
                    {activeSpeaker} is typing...
                  </span>
                </div>
              )}
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs gap-1.5">
                  <MessageSquareCode className="w-8 h-8 text-zinc-700" />
                  <span>Configure the topic and click Start to begin the mock debate.</span>
                </div>
              )}

              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${
                    m.isUser ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none bg-gradient-to-br ${m.color} text-white shadow-sm`}>
                    {m.avatar}
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-zinc-500 font-bold">{m.speaker}</span>
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.isUser 
                        ? "bg-indigo-600 text-white" 
                        : "bg-zinc-950/60 border border-zinc-850 text-zinc-300"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* User Argument Input */}
            <div className="flex gap-2 border-t border-zinc-800 pt-3 mt-3">
              <input 
                type="text" 
                placeholder={activeDiscussion ? "Type your point to interject in the conversation..." : "Start the GD to interact..."}
                disabled={!activeDiscussion}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleInterject(); }}
                className="flex-1 bg-zinc-950 border border-zinc-850 text-xs px-3 py-2.5 rounded-xl text-zinc-300 focus:outline-none focus:border-indigo-500 placeholder-zinc-600 disabled:opacity-50"
              />
              <button
                disabled={!activeDiscussion}
                onClick={handleInterject}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all flex items-center justify-center shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grading metrics display */}
          {report && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Logical Consistency", score: report.logical_thinking, color: "text-indigo-400" },
                  { label: "Communication Flow", score: report.communication_score, color: "text-violet-400" },
                  { label: "Leadership Presence", score: report.leadership_score, color: "text-emerald-400" },
                  { label: "Speaking Duration", score: report.speaking_time, color: "text-amber-500", isTime: true }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.label}</span>
                    <span className={`text-2xl font-extrabold ${item.color}`}>
                      {item.isTime ? item.score : `${item.score}/100`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Evaluator feedback */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Moderator Evaluation Report</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/45 p-3.5 border border-zinc-850 rounded-xl">
                  {report.feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
