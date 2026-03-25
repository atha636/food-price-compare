import { useState, useRef, useEffect, useCallback } from "react";

// ─── Grocery keyword detection (mirrors backend logic) ───────────────────────
const GROCERY_KEYWORDS = [
  "milk","rice","bread","vegetable","egg","eggs","potato","onion","tomato",
  "apple","banana","cheese","butter","paneer","yogurt","curd","sugar","salt","oil","dahi"
];
const RIDE_KEYWORDS = ["ride","uber","ola","rapido","from","auto","cab","bike","drop","pickup"];
const ECOMMERCE_KEYWORDS = ["buy","shop","phone","laptop","shirt","jeans","headphone","tv","amazon","flipkart"];

const detectServiceType = (text) => {
  const t = text.toLowerCase();
  if (GROCERY_KEYWORDS.some(k => t.includes(k))) return "grocery";
  if (RIDE_KEYWORDS.some(k => t.includes(k)))    return "ride";
  if (ECOMMERCE_KEYWORDS.some(k => t.includes(k))) return "ecommerce";
  return "food";
};

// ─── Parse natural language into item + city ─────────────────────────────────
const parseQuery = (text) => {
  const t = text.toLowerCase().trim();

  // "X in Y" / "X at Y" / "X near Y"
  const inMatch = t.match(/^(.+?)\s+(?:in|at|near|around)\s+(.+?)(?:\s+compare)?$/i);
  if (inMatch) return { item: inMatch[1].replace(/compare|find|search/g,"").trim(), city: inMatch[2].trim() };

  // "from X to Y" for ride
  const rideMatch = t.match(/(?:ride|go|cab|auto|bike)?\s*from\s+(.+?)\s+to\s+(.+)/i);
  if (rideMatch) return { item: rideMatch[2].trim(), city: rideMatch[1].trim() };

  // "compare X in Y"
  const compareMatch = t.match(/compare\s+(.+?)\s+(?:in|at)\s+(.+)/i);
  if (compareMatch) return { item: compareMatch[1].trim(), city: compareMatch[2].trim() };

  // fallback: first word is item
  const words = t.replace(/compare|find|search/g,"").trim().split(/\s+/);
  return { item: words[0] || "", city: words.slice(1).join(" ") || "" };
};

// ─── AI response templates ────────────────────────────────────────────────────
const buildAIReply = (item, city, serviceType) => {
  const templates = {
    food:      `Searching ${item ? `"${item}"` : "restaurants"} ${city ? `in ${city}` : ""} across Swiggy & Zomato…`,
    grocery:   `Comparing grocery prices for ${item ? `"${item}"` : "items"} ${city ? `in ${city}` : ""} on Blinkit, Zepto & more…`,
    ride:      `Calculating ride fares from ${city || "pickup"} to ${item || "destination"} on Uber, Ola, Rapido…`,
    ecommerce: `Scanning Amazon, Flipkart & Myntra for ${item ? `"${item}"` : "products"}…`,
  };
  return templates[serviceType] || templates.food;
};

// ─── Typing animation hook ────────────────────────────────────────────────────
const useTypingEffect = (text, speed = 18) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const Message = ({ msg, isLatestAI }) => {
  const isAI = msg.role === "ai";
  const { displayed } = useTypingEffect(isLatestAI && isAI ? msg.text : null);
  const content = isLatestAI && isAI ? displayed : msg.text;

  return (
    <div className={`flex gap-2 ${isAI ? "justify-start" : "justify-end"} group`}>
      {isAI && (
        <div className="w-5 h-5 mt-0.5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="3" fill="white" opacity="0.9"/>
            <circle cx="5" cy="5" r="1.5" fill="white"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[82%] px-3 py-2 rounded-xl text-[12px] leading-relaxed font-mono tracking-tight
          ${isAI
            ? "bg-[#0f1729] border border-[#1e2d4a] text-[#a8c4e8] rounded-tl-sm"
            : "bg-gradient-to-br from-[#2a3f6f] to-[#1e2d4a] border border-[#3a5080] text-[#e2eeff] rounded-tr-sm"
          }
          transition-all duration-200`}
        style={{ boxShadow: isAI ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(42,63,111,0.4)" }}
      >
        {msg.type === "image" ? (
          <div className="space-y-1.5">
            <img src={msg.previewUrl} alt="upload" className="rounded-lg w-28 h-20 object-cover border border-white/10" />
            <p className="text-[11px] text-white/50">{msg.text}</p>
          </div>
        ) : (
          <>
            {content}
            {isLatestAI && isAI && content.length < msg.text.length && (
              <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-0.5 animate-pulse rounded-sm" />
            )}
          </>
        )}
      </div>
      {!isAI && (
        <div className="w-5 h-5 mt-0.5 rounded-md bg-[#2a3f6f] border border-[#3a5080] flex items-center justify-center flex-shrink-0">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <circle cx="4.5" cy="3" r="2" fill="#7a9fcf"/>
            <path d="M1 8c0-1.93 1.567-3.5 3.5-3.5S8 6.07 8 8" stroke="#7a9fcf" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};

// ─── Waveform visualizer ──────────────────────────────────────────────────────
const WaveForm = ({ active }) => (
  <div className="flex items-center gap-[3px] h-4">
    {[0.4,0.8,1,0.6,0.9,0.5,0.7].map((h, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full transition-all duration-100 ${active ? "bg-red-400" : "bg-white/20"}`}
        style={{
          height: active ? `${h * 16}px` : "4px",
          animationDelay: `${i * 80}ms`,
          animation: active ? `waveBar 0.6s ease-in-out ${i * 80}ms infinite alternate` : "none"
        }}
      />
    ))}
  </div>
);

// ─── Suggestion chip ──────────────────────────────────────────────────────────
const SuggestionChip = ({ emoji, label, sub, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-[#1e2d4a] bg-[#0a0f1e]/60 hover:bg-[#0f1729] hover:border-[#2a3f6f] transition-all duration-200 text-left"
  >
    <span className="text-base group-hover:scale-110 transition-transform duration-200">{emoji}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-mono text-[#7a9fcf] group-hover:text-[#a8c4e8] truncate transition-colors">{label}</p>
      <p className="text-[10px] text-[#3a5080] group-hover:text-[#4a6090] truncate transition-colors">{sub}</p>
    </div>
    <svg className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5h6M5 2l3 3-3 3" stroke="#7a9fcf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIAssistant({ setItem, setCity, handleCompare, setServiceType, isLoggedIn }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(""); // "listening"|"processing"|"error"|""
  const [heardText, setHeardText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const recognitionRef     = useRef(null);
  const messagesEndRef     = useRef(null);
  const listeningTimeout   = useRef(null);
  const inputRef           = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    clearTimeout(listeningTimeout.current);
  }, []);

  // ── Core: process any natural language query ───────────────────────────────
  const processQuery = useCallback((text) => {
    const { item, city } = parseQuery(text);
    const serviceType    = detectServiceType(text);
    const shouldCompare  = /compare|find|search|show|get|check/i.test(text) || true; // always compare

    if (item) setItem(item);
    if (city) setCity(city);
    setServiceType(serviceType);

    const aiReply = buildAIReply(item, city, serviceType);

    setMessages(prev => [
      ...prev,
      { role: "user", text },
      { role: "ai",  text: aiReply }
    ]);
    setShowSuggestions(false);

    if (shouldCompare && item) {
      setIsProcessing(true);
      handleCompare(item, city);
      setTimeout(() => setIsProcessing(false), 1200);
    }
  }, [setItem, setCity, setServiceType, handleCompare]);

  // ── Send text ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    processQuery(txt.toLowerCase());
  }, [input, processQuery]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceStatus("error");
      setHeardText("Voice requires Chrome, Edge, or Safari");
      setTimeout(() => { setVoiceStatus(""); setHeardText(""); }, 3000);
      return;
    }

    recognitionRef.current?.abort();
    const rec = new SR();
    recognitionRef.current = rec;

    rec.language        = "en-IN";
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.maxAlternatives = 3;

    rec.start();
    setListening(true);
    setVoiceStatus("listening");
    setHeardText("");
    setConfidence(0);

    listeningTimeout.current = setTimeout(() => {
      rec.abort();
      setListening(false);
      setVoiceStatus("error");
      setHeardText("No speech detected — try again");
      setTimeout(() => { setVoiceStatus(""); setHeardText(""); }, 2500);
    }, 15000);

    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.toLowerCase().trim();
        if (e.results[i].isFinal) { final += t + " "; setConfidence(Math.round(e.results[i][0].confidence * 100)); }
        else interim += t;
      }
      const display = final || interim;
      if (display) { setHeardText(display); setVoiceStatus("listening"); }

      if (final) {
        clearTimeout(listeningTimeout.current);
        setListening(false);
        setVoiceStatus("processing");
        setTimeout(() => {
          processQuery(final.trim());
          setHeardText(""); setVoiceStatus(""); setConfidence(0);
        }, 400);
      }
    };

    rec.onerror = (e) => {
      setListening(false);
      clearTimeout(listeningTimeout.current);
      const msgs = {
        "not-allowed": "Mic access denied — check browser permissions",
        "no-speech":   "No speech detected — speak clearly",
        "audio-capture": "No microphone found",
        "network":     "Network error — check connection",
      };
      setVoiceStatus("error");
      setHeardText(msgs[e.error] || `Error: ${e.error}`);
      setTimeout(() => { setVoiceStatus(""); setHeardText(""); setConfidence(0); }, 3000);
    };

    rec.onend = () => { setListening(false); clearTimeout(listeningTimeout.current); };
  }, [processQuery]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    setListening(false);
    clearTimeout(listeningTimeout.current);
    setVoiceStatus(""); setHeardText("");
  }, []);

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => [...prev, previewUrl]);
    setIsProcessing(true);
    setShowSuggestions(false);

    setMessages(prev => [
      ...prev,
      { role: "user", text: "Analyzing image…", type: "image", previewUrl },
      { role: "ai",   text: "🔍 Running visual detection…" }
    ]);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res  = await fetch("https://food-price-compare-production.up.railway.app/api/ai/detect-item", {
        method: "POST", body: formData
      });
      const data = await res.json();
      if (!data.item) throw new Error("No item detected");

      const detectedItem  = data.item;
      const serviceType   = detectServiceType(detectedItem);
      setItem(detectedItem);
      setServiceType(serviceType);

      setMessages(prev => [
        ...prev,
        { role: "ai", text: `Detected: "${detectedItem}" · Comparing prices…` }
      ]);

      handleCompare(detectedItem, "");
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Could not detect item from image. Try a clearer photo." }]);
    } finally {
      setIsProcessing(false);
    }
  }, [setItem, setServiceType, handleCompare]);

  // ── Suggestions ────────────────────────────────────────────────────────────
  const suggestions = [
    { emoji: "🍕", label: "pizza in indore compare",      sub: "Food · Swiggy vs Zomato"   },
    { emoji: "🥛", label: "milk in delhi compare",        sub: "Grocery · Quick commerce"  },
    { emoji: "🚖", label: "ride from station to mall",    sub: "Ride · Uber, Ola, Rapido"  },
    { emoji: "📱", label: "iphone 15 buy online",         sub: "E-commerce · Best price"   },
  ];

  const latestAIIndex = messages.map(m => m.role).lastIndexOf("ai");

  if (!isLoggedIn) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

        .ai-root { font-family: 'IBM Plex Sans', sans-serif; }
        .ai-mono { font-family: 'IBM Plex Mono', monospace; }

        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1);   }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes blink-cursor {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        .msg-in     { animation: msgIn .25s ease-out forwards; }
        .pulse-ring { animation: pulse-ring 1.5s ease infinite; }
        .ai-scrollbar::-webkit-scrollbar { width:3px; }
        .ai-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ai-scrollbar::-webkit-scrollbar-thumb { background:#1e2d4a; border-radius:2px; }
        .ai-scrollbar::-webkit-scrollbar-thumb:hover { background:#2a3f6f; }

        .shimmer-text {
          background: linear-gradient(90deg, #7a9fcf 0%, #a8c4e8 40%, #38bdf8 60%, #7a9fcf 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(42,63,111,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42,63,111,0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div
        className="ai-root h-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #060b18 0%, #080e1f 50%, #060c1a 100%)",
          borderRadius: "16px",
        }}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

        {/* Top glow orb */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)" }}
        />

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[#0f1e35]">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1a2f5e 0%, #0f1e35 100%)", border: "1px solid #2a3f6f", boxShadow: "0 0 12px rgba(56,189,248,0.15)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" fill="url(#grad1)"/>
                <circle cx="7" cy="7" r="5" stroke="url(#grad2)" strokeWidth="1" opacity="0.5"/>
                <path d="M7 2v2M7 10v2M2 7h2M10 7h2" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                <defs>
                  <radialGradient id="grad1" cx="50%" cy="30%">
                    <stop offset="0%" stopColor="#a8c4e8"/>
                    <stop offset="100%" stopColor="#38bdf8"/>
                  </radialGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="14" y2="14">
                    <stop offset="0%" stopColor="#38bdf8"/>
                    <stop offset="100%" stopColor="#7a9fcf"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div>
              <h3 className="ai-mono text-[12px] font-semibold text-[#e2eeff] tracking-widest uppercase">
                AURA <span className="text-[#38bdf8]">v2</span>
              </h3>
              <p className="text-[9px] text-[#3a5080] tracking-wider uppercase font-medium">
                Price Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status dot */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 4px rgba(52,211,153,0.8)" }}
              />
              <span className="text-[9px] ai-mono text-[#3a5080] tracking-wider">ONLINE</span>
            </div>

            {isProcessing && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#0f1729] border border-[#1e2d4a]">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[9px] ai-mono text-cyan-400 tracking-wider">SCANNING</span>
              </div>
            )}
          </div>
        </header>

        {/* ── MESSAGES ───────────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 overflow-y-auto ai-scrollbar px-3 py-3 space-y-3">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-2 space-y-4" style={{ animation: "fadeSlideUp .4s ease-out" }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0f1729, #1a2f5e)", border: "1px solid #2a3f6f", boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(56,189,248,0.08)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#38bdf8" strokeWidth="1" opacity="0.3"/>
                  <circle cx="12" cy="12" r="4" fill="url(#gEmptyGrad)"/>
                  <path d="M12 8v4l2.5 2.5" stroke="#060b18" strokeWidth="1.5" strokeLinecap="round"/>
                  <defs>
                    <radialGradient id="gEmptyGrad" cx="40%" cy="35%">
                      <stop offset="0%" stopColor="#a8c4e8"/>
                      <stop offset="100%" stopColor="#2a3f6f"/>
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <div>
                <p className="shimmer-text ai-mono text-[13px] font-semibold tracking-wide mb-1">
                  How can I help?
                </p>
                <p className="text-[10px] text-[#2a3f6f] leading-relaxed tracking-wide">
                  Compare food · grocery · rides · products
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div key={i} className="msg-in" style={{ animationDelay: `${i * 20}ms` }}>
              <Message msg={msg} isLatestAI={msg.role === "ai" && i === latestAIIndex} />
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── VOICE STATUS ───────────────────────────────────────────── */}
        {heardText && (
          <div
            className="relative z-10 mx-3 mb-2 px-3 py-2.5 rounded-xl border text-[11px] ai-mono"
            style={{
              background: voiceStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(56,189,248,0.06)",
              borderColor: voiceStatus === "error" ? "rgba(239,68,68,0.3)" : "rgba(56,189,248,0.2)",
              color: voiceStatus === "error" ? "#f87171" : "#7dd3fc"
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {voiceStatus === "listening"  && <WaveForm active={true} />}
                {voiceStatus === "processing" && <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />}
                {voiceStatus === "error"      && <span>⚠</span>}
                <span className="text-[10px] tracking-widest uppercase font-medium opacity-70">
                  {voiceStatus === "listening"  && "Listening"}
                  {voiceStatus === "processing" && "Processing"}
                  {voiceStatus === "error"      && "Error"}
                </span>
              </div>
              {confidence > 0 && voiceStatus !== "error" && (
                <span className="text-[9px] opacity-50 tracking-wider">{confidence}% match</span>
              )}
            </div>
            <p className="truncate opacity-80">{heardText}</p>
          </div>
        )}

        {/* ── SUGGESTIONS ────────────────────────────────────────────── */}
        {showSuggestions && messages.length === 0 && !heardText && (
          <div className="relative z-10 px-3 pb-2 space-y-1.5" style={{ animation: "fadeSlideUp .5s ease-out .1s both" }}>
            {suggestions.map((s, i) => (
              <SuggestionChip
                key={i}
                emoji={s.emoji}
                label={s.label}
                sub={s.sub}
                onClick={() => processQuery(s.label)}
              />
            ))}
          </div>
        )}

        {/* ── INPUT AREA ──────────────────────────────────────────────── */}
        <div
          className="relative z-10 border-t border-[#0f1e35] px-3 pt-2.5 pb-3 space-y-2"
          style={{ background: "linear-gradient(to top, rgba(6,11,24,0.9), transparent)" }}
        >
          {/* Image preview strip */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-1.5 pb-1">
              {imagePreviews.slice(-3).map((url, i) => (
                <img key={i} src={url} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#1e2d4a] opacity-70" />
              ))}
            </div>
          )}

          {/* Main input row */}
          <div className="flex items-center gap-2">
            {/* Text input */}
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={listening}
                placeholder="pizza in mumbai…"
                className="ai-mono w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2 text-[12px] text-[#a8c4e8] placeholder-[#2a3f6f] outline-none transition-all duration-200 focus:border-[#2a4070] focus:bg-[#0d1525]"
                style={{ caretColor: "#38bdf8" }}
              />
            </div>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || listening}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
              style={{ background: input.trim() ? "linear-gradient(135deg, #1a3a70, #0f2450)" : "#0a0f1e", border: "1px solid #2a3f6f" }}
              title="Send"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M6 1l5 5-5 5" stroke={input.trim() ? "#38bdf8" : "#3a5080"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Voice button */}
            {!listening ? (
              <button
                onClick={startListening}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90 hover:border-[#3a5080]"
                style={{ background: "#0a0f1e", border: "1px solid #1e2d4a" }}
                title="Voice input"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="1" width="4" height="6" rx="2" fill="#7a9fcf"/>
                  <path d="M2 6c0 2.21 1.79 4 4 4s4-1.79 4-4" stroke="#7a9fcf" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="6" y1="10" x2="6" y2="11.5" stroke="#7a9fcf" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 pulse-ring"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)" }}
                title="Stop listening"
              >
                <div className="w-3 h-3 rounded-sm bg-red-400" />
              </button>
            )}

            {/* Image upload */}
            <label
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 hover:border-[#3a5080] active:scale-90"
              style={{ background: "#0a0f1e", border: "1px solid #1e2d4a" }}
              title="Upload image"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2.5" width="10" height="7.5" rx="1.5" stroke="#7a9fcf" strokeWidth="1"/>
                <circle cx="4" cy="5.5" r="1" fill="#7a9fcf" opacity="0.6"/>
                <path d="M1 8.5l2.5-2 2 1.5 2-2.5 2.5 3" stroke="#7a9fcf" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                <path d="M8 1v3M6.5 2.5L8 1l1.5 1.5" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Listening indicator bar */}
          {listening && (
            <div className="flex items-center gap-2 px-1">
              <WaveForm active={true} />
              <span className="text-[9px] ai-mono text-red-400/70 tracking-widest uppercase">Recording · tap stop when done</span>
            </div>
          )}

          {/* Keyboard hint */}
          {!listening && input && (
            <p className="text-[9px] ai-mono text-[#1e2d4a] px-1 tracking-wider">
              ↵ enter to search
            </p>
          )}
        </div>
      </div>
    </>
  );
}
