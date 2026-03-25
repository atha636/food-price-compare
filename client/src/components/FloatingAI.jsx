import { useState, useEffect } from "react";
import AIAssistant from "./AIAssistant";

export default function FloatingAI(props) {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimate(true);
    }
  }, [open]);

  if (!props.isLoggedIn) return null;

  return (
    <>
      {/* 💬 Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white text-2xl shadow-2xl hover:shadow-blue-600/50 hover:scale-110 transition-all duration-300 active:scale-95 border border-white/20 backdrop-blur-md"
      >
        <span className={`inline-block transition-transform duration-300 ${open ? "rotate-45 scale-110" : ""}`}>
          🤖
        </span>
      </button>

      {/* 📦 Popup Panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-[340px] h-[480px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-slate-900/50 flex flex-col overflow-hidden transition-all duration-300 transform ${
            animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Decorative gradient line */}
          <div className="h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"></div>

          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">SmartAssist</h3>
                <p className="text-[10px] text-white/50">AI-powered search</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAnimate(false);
                setTimeout(() => setOpen(false), 150);
              }}
              className="text-white/60 hover:text-white transition-colors duration-200 font-semibold w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              ✖
            </button>
          </div>

          {/* AI Assistant Inside */}
          <div className="flex-1 overflow-hidden">
            <AIAssistant {...props} />
          </div>

          {/* Footer accent */}
          <div className="h-0.5 bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600"></div>
        </div>
      )}

      {/* Backdrop blur effect */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => {
            setAnimate(false);
            setTimeout(() => setOpen(false), 150);
          }}
        ></div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
