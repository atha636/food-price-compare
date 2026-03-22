import { useState, useRef, useEffect } from "react";

export default function AIAssistant({
  setItem,
  setCity,
  handleCompare,
  setServiceType,
  isLoggedIn
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(""); // "listening", "processing", "error", ""
  const [heardText, setHeardText] = useState(""); // Show what was heard
  const [confidence, setConfidence] = useState(0); // Speech confidence

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const listeningTimeoutRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  // 🎤 ENHANCED Voice Recognition
  const startListening = () => {
    if (!isLoggedIn) {
      setVoiceStatus("error");
      alert("Login required to use voice");
      setTimeout(() => setVoiceStatus(""), 2000);
      return;
    }

    // Stop existing recognition if any
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("error");
      alert("🔴 Voice feature requires Chrome, Edge, or Safari browser");
      setTimeout(() => setVoiceStatus(""), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Advanced configuration
    recognition.language = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true; // Show interim results
    recognition.maxAlternatives = 3; // Get multiple alternatives
    recognition.lang = "en-IN";

    try {
      recognition.start();
      setListening(true);
      setVoiceStatus("listening");
      setHeardText("");
      setConfidence(0);

      // Auto-stop after 15 seconds of no speech
      listeningTimeoutRef.current = setTimeout(() => {
        if (listening) {
          recognition.abort();
          setListening(false);
          setVoiceStatus("error");
          setHeardText("No speech detected. Please try again.");
          setTimeout(() => {
            setVoiceStatus("");
            setHeardText("");
          }, 2000);
        }
      }, 15000);

      console.log("🎤 Voice recognition started");
    } catch (err) {
      console.error("❌ Recognition start error:", err);
      setVoiceStatus("error");
      setHeardText("Failed to start recording");
      setTimeout(() => {
        setVoiceStatus("");
        setHeardText("");
      }, 2000);
    }

    recognition.onstart = () => {
      console.log("🎤 Listening started");
    };

    // Show interim results in real-time
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
          // Get confidence for final result
          const conf = event.results[i][0].confidence;
          setConfidence(Math.round(conf * 100));
        } else {
          interimTranscript += transcript;
        }
      }

      // Show what we're hearing in real-time
      const displayText = finalTranscript || interimTranscript;
      if (displayText) {
        setHeardText(displayText);
        setVoiceStatus("listening");
      }

      // Process when final result is received
      if (finalTranscript) {
        clearTimeout(listeningTimeoutRef.current);
        setListening(false);
        setVoiceStatus("processing");

        // Add small delay for better UX
        setTimeout(() => {
          handleAI(finalTranscript.trim());
          setHeardText("");
          setVoiceStatus("");
          setConfidence(0);
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Voice error:", event.error);
      setListening(false);
      clearTimeout(listeningTimeoutRef.current);

      let errorMsg = "Microphone error";

      switch (event.error) {
        case "not-allowed":
          errorMsg = "🔴 Microphone access denied. Check your browser permissions.";
          break;
        case "no-speech":
          errorMsg = "🔴 No speech detected. Please speak clearly.";
          break;
        case "audio-capture":
          errorMsg = "🔴 No microphone found. Check your device.";
          break;
        case "network":
          errorMsg = "🔴 Network error. Check your internet.";
          break;
        case "service-not-allowed":
          errorMsg = "🔴 Speech service is not available.";
          break;
        default:
          errorMsg = `🔴 Error: ${event.error}`;
      }

      setVoiceStatus("error");
      setHeardText(errorMsg);

      setTimeout(() => {
        setVoiceStatus("");
        setHeardText("");
        setConfidence(0);
      }, 3000);
    };

    recognition.onend = () => {
      console.log("🛑 Recognition ended");
      setListening(false);
      clearTimeout(listeningTimeoutRef.current);
    };
  };

  // Stop listening manually
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setListening(false);
    clearTimeout(listeningTimeoutRef.current);
    setVoiceStatus("");
    setHeardText("");
  };

  // 🧠 SMART AI PARSER (UPGRADED)
  const handleAI = (text) => {
    let detectedItem = "";
    let detectedCity = "";

    // 🔥 pattern: "pizza in indore compare"
    const match = text.match(/(.+?) in (.+)/);

    if (match) {
      detectedItem = match[1].replace("compare", "").trim();
      detectedCity = match[2].replace("compare", "").trim();
    } else {
      // fallback
      const words = text.split(" ");
      detectedItem = words[0] || "";
    }

    // 🔥 detect service type smarter
    if (
      text.includes("milk") ||
      text.includes("rice") ||
      text.includes("bread") ||
      text.includes("vegetable")
    ) {
      setServiceType("grocery");
    } else if (
      text.includes("ride") ||
      text.includes("uber") ||
      text.includes("ola") ||
      text.includes("from")
    ) {
      setServiceType("ride");
    } else {
      setServiceType("food");
    }

    // 🔥 update UI
    if (detectedItem) setItem(detectedItem);
    if (detectedCity) setCity(detectedCity);

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      {
        role: "ai",
        text: `Comparing ${detectedItem || "item"} ${
          detectedCity ? `in ${detectedCity}` : ""
        }...`,
      },
    ]);

    // 🔥 trigger compare automatically
    if (text.includes("compare") || text.includes("find")) {
      setIsProcessing(true);
      handleCompare(detectedItem, detectedCity);
      setTimeout(() => setIsProcessing(false), 800);
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  setImage(imageUrl);
  setIsProcessing(true);

  setMessages((prev) => [
    ...prev,
    { role: "user", text: "📸 Uploaded image" },
    { role: "ai", text: "🔍 Detecting item from image..." },
  ]);

  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      "https://food-price-compare-production.up.railway.app/api/ai/detect-item",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data.item) throw new Error("No item detected");

    const detectedItem = data.item;

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `Detected: ${detectedItem}` },
    ]);

    setItem(detectedItem);

    handleCompare(detectedItem, city);

  } catch (err) {
    console.error(err);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "❌ Failed to detect item from image" },
    ]);
  } finally {
    setIsProcessing(false);
  }
};

  const sendMessage = () => {
    
    if (!input.trim()) return;
    handleAI(input.toLowerCase());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    { text: "pizza in indore compare", emoji: "🍕" },
    { text: "milk in delhi compare", emoji: "🥛" },
    { text: "ride from station to mall", emoji: "🚗" },
  ];

  if (!isLoggedIn) return null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-800/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-cyan-600/30 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-white/60">Type or speak your request</p>
          </div>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1 text-xs text-cyan-400">
            <span className="animate-pulse">●</span>
            Processing
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 mb-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/40 text-xs mb-3">Ask me anything...</p>
              <p className="text-white/30 text-[11px] leading-relaxed">
                Try: <span className="text-cyan-400/70">"pizza in indore"</span>
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`animate-fadeIn ${
              m.role === "ai"
                ? "flex justify-start"
                : "flex justify-end"
            }`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed backdrop-blur-sm transition-all ${
                m.role === "ai"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-100"
                  : "bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-400/30 text-blue-50"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Display */}
      {heardText && (
        <div className="px-3 py-2 mx-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-xs text-purple-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">
              {voiceStatus === "listening" && "🎤 Listening..."}
              {voiceStatus === "processing" && "⚙️ Processing..."}
              {voiceStatus === "error" && "❌ Error"}
            </span>
            {confidence > 0 && voiceStatus !== "error" && (
              <span className="text-[10px] text-white/60">
                {confidence}% match
              </span>
            )}
          </div>
          <p className="break-words">{heardText}</p>
        </div>
      )}

      {/* Suggestions */}
      {messages.length === 0 && !heardText && (
        <div className="px-3 pb-2 space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleAI(s.text)}
              className="w-full text-left text-[11px] px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/40 transition-all duration-200 flex items-center gap-2 group"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                {s.emoji}
              </span>
              <span className="text-white/70 group-hover:text-white/90">
                {s.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 bg-gradient-to-t from-slate-900/50 to-transparent p-3 space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-blue-400/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-400/20"
              placeholder="Type your request..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={listening}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || listening}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-xs font-medium text-white hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            ✈️
          </button>

          {/* 🎤 Voice Button - ENHANCED */}
          {!listening ? (
            <button
              onClick={startListening}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 group relative"
              title="Click to start voice recognition"
            >
              <span className="group-hover:animate-bounce">🎙️</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse active:scale-95"
              title="Click to stop listening"
            >
              <span className="inline-block animate-pulse">🛑</span>
            </button>
          )}
        </div>

{/* 🚀 ADD IMAGE UPLOADER HERE */}
<div className="flex items-center gap-2 mt-2">
  <label className="cursor-pointer text-[11px] px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/30 hover:bg-purple-500/40 transition-all">
    📸 Upload
    <input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </label>

  {image && (
    <img
      src={image}
      alt="preview"
      className="w-10 h-10 rounded object-cover border border-white/10"
    />
  )}
</div>

        {/* Status indicator */}
        {listening && (
          <div className="text-[10px] text-red-400/80 px-1 flex items-center gap-2">
            <span className="inline-flex gap-0.5">
              <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}></span>
              <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}></span>
              <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}></span>
            </span>
            Listening... (Click 🛑 to stop)
          </div>
        )}
        
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
}
