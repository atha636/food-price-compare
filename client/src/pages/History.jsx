import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Inject Fonts ── */
const injectFonts = () => {
  if (document.getElementById("hist-fonts")) return;
  const link = document.createElement("link");
  link.id = "hist-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};

/* ── Food emoji helper ── */
const getFoodEmoji = (item = "") => {
  const n = item.toLowerCase();
  if (n.includes("pizza"))    return "🍕";
  if (n.includes("burger"))   return "🍔";
  if (n.includes("biryani"))  return "🍛";
  if (n.includes("pasta"))    return "🍝";
  if (n.includes("momos"))    return "🥟";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("cake"))     return "🍰";
  if (n.includes("coffee"))   return "☕";
  if (n.includes("sushi"))    return "🍱";
  if (n.includes("noodle"))   return "🍜";
  if (n.includes("roll"))     return "🌯";
  if (n.includes("salad"))    return "🥗";
  return "🍽️";
};

/* ── Winner colors ── */
const winnerStyle = (winner) => {
  if (winner === "zomato")    return { bg: "rgba(239,68,68,0.12)",  color: "#f87171",  border: "rgba(239,68,68,0.25)"  };
  if (winner === "swiggy")    return { bg: "rgba(249,115,22,0.12)", color: "#fb923c",  border: "rgba(249,115,22,0.25)" };
  if (winner === "blinkit")   return { bg: "rgba(251,191,36,0.12)", color: "#fbbf24",  border: "rgba(251,191,36,0.25)" };
  if (winner === "zepto")     return { bg: "rgba(167,139,250,0.12)",color: "#a78bfa",  border: "rgba(167,139,250,0.25)"};
  if (winner === "instamart") return { bg: "rgba(52,211,153,0.12)", color: "#34d399",  border: "rgba(52,211,153,0.25)" };
  return { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.2)" };
};

/* ── Accent color per card index ── */
const ACCENTS = ["#60a5fa","#34d399","#f59e0b","#a78bfa","#f472b6","#fb923c"];

/* ── History Card ── */
const HistoryCard = ({ item, index, onDelete, onCompare }) => {
  const [hovered, setHovered]   = useState(false);
  const [imgError, setImgError] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];
  const ws     = winnerStyle(item.winner);
  const emoji  = getFoodEmoji(item.item);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "24px",
        border: `1px solid ${hovered ? accent + "40" : "rgba(255,255,255,0.07)"}`,
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px ${accent}20` : "0 4px 20px rgba(0,0,0,0.2)",
        animation: `cardIn 0.5s ease ${index * 0.06}s both`,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
      }} />

      {/* Image / Emoji hero */}
      <div style={{
        height: "160px",
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(135deg, ${accent}15, rgba(0,0,0,0.3))`,
        flexShrink: 0,
      }}>
        {!imgError ? (
          <img
            src={`https://loremflickr.com/600/400/${encodeURIComponent(item.item)}?random=${index}`}
            alt={item.item}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              opacity: 0.75,
            }}
          />
        ) : (
          <div style={{
            height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "56px",
            background: `linear-gradient(135deg, ${accent}10, rgba(0,0,0,0.2))`,
          }}>
            {emoji}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 60%)",
        }} />

        {/* Price badge over image */}
        {item.bestPrice && (
          <div style={{
            position: "absolute", bottom: "12px", left: "14px",
            background: "rgba(2,6,23,0.8)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${accent}40`,
            borderRadius: "10px",
            padding: "4px 10px",
            fontSize: "14px", fontWeight: 800,
            color: accent,
            fontFamily: "'Syne', sans-serif",
          }}>
            ₹{item.bestPrice}
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={() => onDelete(index)}
          style={{
            position: "absolute", top: "10px", right: "10px",
            width: "34px", height: "34px",
            borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.1)",
            color: "#f87171",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.25)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Food name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
          <span style={{
            fontSize: "22px", lineHeight: 1,
            background: `${accent}18`,
            border: `1px solid ${accent}25`,
            borderRadius: "10px",
            width: "38px", height: "38px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {emoji}
          </span>
          <div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "16px", fontWeight: 700,
              color: "#f1f5f9",
              textTransform: "capitalize",
              lineHeight: 1.2,
            }}>
              {item.item}
            </h2>
            <p style={{ fontSize: "12px", color: "#475569", marginTop: "3px" }}>
              📍 {item.city}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          {item.winner ? (
            <span style={{
              padding: "4px 10px",
              borderRadius: "100px",
              background: ws.bg,
              color: ws.color,
              border: `1px solid ${ws.border}`,
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              🏆 {item.winner}
            </span>
          ) : (
            <span style={{ color: "#334155", fontSize: "12px" }}>No winner</span>
          )}

          <span style={{ fontSize: "11px", color: "#334155" }}>
            {item.date ? new Date(item.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" }) : ""}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "14px" }} />

        {/* Compare Again button */}
        <button
          onClick={() => onCompare(item)}
          style={{
            marginTop: "auto",
            width: "100%", padding: "12px",
            borderRadius: "14px",
            border: `1px solid ${accent}35`,
            background: hovered ? `${accent}18` : `${accent}0d`,
            color: accent,
            fontFamily: "'Syne', sans-serif",
            fontSize: "13px", fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.25s ease",
            letterSpacing: "0.04em",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${accent}28`;
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = hovered ? `${accent}18` : `${accent}0d`;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Compare Again →
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function History() {
  injectFonts();
  const navigate = useNavigate();

  const [history,  setHistory]  = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [focused,  setFocused]  = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(res.data.searchHistory || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter(h =>
    h.item?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteItem = (index) => {
    const real = history.indexOf(filtered[index]);
    setHistory(prev => prev.filter((_, i) => i !== real));
  };

  const handleCompare = (item) => {
    navigate("/", { state: { item: item.item, city: item.city, serviceType: item.serviceType } });
  };

  return (
    <>
      <style>{`
        @keyframes cardIn  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020617 0%,#0f172a 55%,#020617 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f1f5f9",
        padding: "48px 36px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Ambient blobs */}
        <div style={{
          position: "fixed", top: "-180px", right: "-180px",
          width: "480px", height: "480px",
          background: "radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed", bottom: "-200px", left: "-100px",
          width: "420px", height: "420px",
          background: "radial-gradient(circle,rgba(52,211,153,0.06) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: "40px", animation: "fadeIn 0.5s ease both" }}>
            <p style={{
              fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#60a5fa", marginBottom: "8px", fontWeight: 500,
            }}>
              ● Your Activity
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, lineHeight: 1.1,
                  background: "linear-gradient(135deg,#f1f5f9 30%,#60a5fa 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Search History
                </h1>
                <p style={{ color: "#475569", fontSize: "14px", marginTop: "6px" }}>
                  {history.length} total searches · {filtered.length} shown
                </p>
              </div>

              {/* Stats pill */}
              <div style={{
                display: "flex", gap: "16px", flexWrap: "wrap",
              }}>
                {[
                  { label: "Searches", value: history.length, accent: "#60a5fa" },
                  { label: "Cities",   value: [...new Set(history.map(h => h.city).filter(Boolean))].length, accent: "#34d399" },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: "10px 18px",
                    borderRadius: "14px",
                    background: `${s.accent}10`,
                    border: `1px solid ${s.accent}25`,
                    textAlign: "center",
                  }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: s.accent }}>{s.value}</p>
                    <p style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.06em" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Search bar ── */}
          <div style={{
            position: "relative", maxWidth: "460px",
            marginBottom: "36px",
            animation: "slideUp 0.5s ease 0.1s both",
          }}>
            <Search
              size={16}
              color={focused ? "#60a5fa" : "#334155"}
              style={{
                position: "absolute", left: "16px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
                transition: "color 0.2s",
              }}
            />
            <input
              type="text"
              placeholder="Search your food history…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 16px 14px 44px",
                borderRadius: "16px",
                border: `1px solid ${focused ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: focused ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.04)",
                color: "#f1f5f9",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: focused ? "0 0 0 3px rgba(96,165,250,0.1)" : "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)", border: "none",
                  color: "#64748b", cursor: "pointer",
                  width: "22px", height: "22px", borderRadius: "50%",
                  fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: "36px", height: "36px",
                border: "3px solid #1e293b",
                borderTop: "3px solid #60a5fa",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <p style={{ color: "#475569", fontSize: "14px" }}>Loading history…</p>
            </div>

          ) : filtered.length === 0 ? (
            /* ── Empty state ── */
            <div style={{
              textAlign: "center", padding: "80px 20px",
              animation: "fadeIn 0.5s ease both",
            }}>
              <div style={{
                fontSize: "64px", marginBottom: "20px",
                filter: "grayscale(0.3)",
              }}>
                🍽️
              </div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "22px", fontWeight: 700,
                color: "#1e293b", marginBottom: "8px",
              }}>
                {search ? "No results found" : "No history yet"}
              </h2>
              <p style={{ color: "#334155", fontSize: "14px" }}>
                {search
                  ? `Nothing matched "${search}" — try a different keyword`
                  : "Start comparing food prices to see your history here"}
              </p>
            </div>

          ) : (
            /* ── Grid ── */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}>
              {filtered.map((item, i) => (
                <HistoryCard
                  key={i}
                  item={item}
                  index={i}
                  onDelete={deleteItem}
                  onCompare={handleCompare}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <p style={{
            textAlign: "center", marginTop: "56px",
            fontSize: "11px", color: "#1e293b", letterSpacing: "0.08em",
          }}>
            PriceCompare · Search History
          </p>

        </div>
      </div>
    </>
  );
}
