import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ─── Google Fonts injected once ─── */
const injectFonts = () => {
  if (document.getElementById("gd-fonts")) return;
  const link = document.createElement("link");
  link.id = "gd-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};




/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(52,211,153,0.3)",
        borderRadius: "12px",
        padding: "10px 16px",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
        fontSize: "13px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        <p style={{ color: "#34d399", fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p>{payload[0].value} wins</p>
      </div>
    );
  }
  return null;
};



/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, accent, delay }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${accent}22`,
    borderRadius: "20px",
    padding: "28px 24px",
    position: "relative",
    overflow: "hidden",
    animation: `slideUp 0.6s ease ${delay}s both`,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "default",
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 20px 40px ${accent}18`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >



    {/* Glow orb */}
    <div style={{
      position: "absolute", top: "-40px", right: "-40px",
      width: "120px", height: "120px",
      background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
      borderRadius: "50%", pointerEvents: "none"
    }} />
    <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: "14px", fontFamily: "'DM Sans', sans-serif" }}>
      {icon} &nbsp;{label}
    </p>
    <p style={{ fontSize: "40px", fontWeight: 800, color: accent, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
      {value}
    </p>
  </div>
);



/* ─── Grocery Icon ─── */
const getGroceryIcon = (item) => {
  const n = item.toLowerCase();
  if (n.includes("milk"))   return "🥛";
  if (n.includes("bread"))  return "🍞";
  if (n.includes("rice"))   return "🍚";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("egg"))    return "🥚";
  if (n.includes("apple"))  return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("potato")) return "🥔";
  if (n.includes("onion"))  return "🧅";
  return "🛒";
};

const BAR_COLORS = ["#34d399", "#60a5fa", "#f59e0b", "#f472b6"];

const platformColors = {
  Zepto:    "#a78bfa",
  Blinkit:  "#fbbf24",
  Instamart: "#34d399",
  JioMart:  "#60a5fa",
};


export default function GroceryDashboard({ theme }) {
  injectFonts();
  const navigate = useNavigate();

  const [history,      setHistory]      = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [topItems,     setTopItems]     = useState([]);
  const [bestPlatform, setBestPlatform] = useState(null);
  const [moneySaved,   setMoneySaved]   = useState(0);
  const [loading,      setLoading]      = useState(true);

  const dark = theme !== "light";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const groceryHistory = (res.data.searchHistory || [])
          .filter(s => s.serviceType === "grocery");

        setHistory(groceryHistory);

        let zepto = 0, blinkit = 0, instamart = 0, jiomart = 0;
        let saved = 0;

        groceryHistory.forEach(search => {
          if (search.winner === "zepto")     zepto++;
          if (search.winner === "blinkit")   blinkit++;
          if (search.winner === "instamart") instamart++;
          if (search.winner === "jiomart")   jiomart++;
          if (search.bestPrice) {
            saved += (search.bestPrice + 20) - search.bestPrice;
          }
        });

        
        setMoneySaved(Math.round(saved));

        const platforms = [
          { name: "Zepto",     wins: zepto     },
          { name: "Blinkit",   wins: blinkit   },
          { name: "Instamart", wins: instamart },
          { name: "JioMart",   wins: jiomart   },
        ];

        setPlatformData(platforms.filter(p => p.wins > 0));

        const best = platforms.reduce((a, b) => a.wins > b.wins ? a : b);
        setBestPlatform(best.wins === 0 ? "No data yet" : best.name);

        const itemCount = {};
        groceryHistory.forEach(search => {
          search.item.split(",").forEach(i => {
            const item = i.trim().toLowerCase();
            itemCount[item] = (itemCount[item] || 0) + 1;
          });
        });

        const top = Object.keys(itemCount)
          .map(item => ({ name: item, searches: itemCount[item] }))
          .sort((a, b) => b.searches - a.searches)
          .slice(0, 5);

        setTopItems(top);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ── Inline styles ── */
  const bg = dark
    ? "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)"
    : "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)";

  const textPrimary   = dark ? "#f1f5f9"  : "#0f172a";
  const textSecondary = dark ? "#64748b"  : "#475569";
  const cardBg        = dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)";
  const cardBorder    = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const rowBg         = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(52,211,153,0);  }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }
        .tag-pill:hover { transform: scale(1.06) !important; }
        .row-item:hover { background: rgba(52,211,153,0.06) !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: bg,
        color: textPrimary,
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 32px",
        transition: "all 0.4s ease",
      }}>

        {/* ── Noise texture overlay ── */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "48px", animation: "fadeIn 0.5s ease both"
          }}>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#34d399", marginBottom: "8px", fontWeight: 500 }}>
                ● Live Tracking
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 800, lineHeight: 1.1,
                background: dark
                  ? "linear-gradient(135deg, #f1f5f9 30%, #34d399 100%)"
                  : "linear-gradient(135deg, #0f172a 30%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Grocery Dashboard
              </h1>
            </div>

            <button
              onClick={() => navigate("/", { state: { service: "grocery" } })}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 22px",
                borderRadius: "14px",
                border: "1px solid rgba(52,211,153,0.3)",
                background: "rgba(52,211,153,0.08)",
                color: "#34d399",
                fontSize: "13px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(52,211,153,0.18)";
                e.currentTarget.style.transform = "scale(1.04)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(52,211,153,0.08)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ← Back to Compare
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "36px" }}>
            <StatCard icon="🧺" label="Baskets Compared"       value={history.length}      accent="#60a5fa" delay={0}   />
            <StatCard icon="💰" label="Money Saved"            value={`₹${moneySaved}`}    accent="#34d399" delay={0.1} />
            <StatCard icon="🏆" label="Best Grocery Platform"  value={bestPlatform || "—"} accent="#f59e0b" delay={0.2} />
          </div>

          {/* ── Top Items ── */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "24px",
            padding: "28px",
            marginBottom: "24px",
            backdropFilter: "blur(16px)",
            animation: "slideUp 0.6s ease 0.3s both",
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              🥦 <span>Top Searched Items</span>
            </h2>

            {topItems.length === 0 ? (
              <p style={{ color: textSecondary, fontSize: "14px" }}>No items searched yet.</p>
            ) : (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {topItems.map((item, i) => (
                  <div
                    key={i}
                    className="tag-pill"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "100px",
                      background: dark ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.08)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      fontSize: "13px", fontWeight: 500,
                      color: dark ? "#a7f3d0" : "#065f46",
                      transition: "transform 0.2s ease",
                      cursor: "default",
                    }}
                  >
                    <span style={{
                      fontSize: "18px", lineHeight: 1,
                      background: "rgba(255,255,255,0.12)",
                      borderRadius: "50%", width: "28px", height: "28px",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {getGroceryIcon(item.name)}
                    </span>
                    <span style={{ textTransform: "capitalize" }}>{item.name}</span>
                    <span style={{
                      background: "rgba(52,211,153,0.15)",
                      borderRadius: "20px", padding: "1px 8px",
                      fontSize: "11px", fontWeight: 700, color: "#34d399"
                    }}>
                      {item.searches}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom Row: Chart + Recent ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", animation: "slideUp 0.6s ease 0.4s both" }}>

            {/* Chart */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "24px",
              padding: "28px",
              backdropFilter: "blur(16px)",
            }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>
                📊 Platform Wins
              </h2>

              {platformData.length === 0 ? (
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: textSecondary, fontSize: "14px" }}>
                  No comparison data yet
                </div>
              ) : (
                <div style={{ height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} barCategoryGap="35%">
                      <XAxis
                        dataKey="name"
                        tick={{ fill: textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: textSecondary, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                        axisLine={false} tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)", radius: 8 }} />
                      <Bar dataKey="wins" radius={[10, 10, 0, 0]}>
                        {platformData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={platformColors[entry.name] || BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent Baskets */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "24px",
              padding: "28px",
              backdropFilter: "blur(16px)",
            }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
                🧺 Recent Baskets
              </h2>

              {history.length === 0 ? (
                <p style={{ color: textSecondary, fontSize: "14px" }}>No recent baskets.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {history.slice(0, 5).map((h, i) => (
                    <div
                      key={i}
                      className="row-item"
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        background: rowBg,
                        border: `1px solid ${cardBorder}`,
                        transition: "background 0.2s ease",
                        animation: `slideUp 0.4s ease ${0.45 + i * 0.07}s both`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{getGroceryIcon(h.item)}</span>
                        <span style={{
                          fontSize: "13px", fontWeight: 500,
                          color: textPrimary,
                          maxWidth: "160px", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                          {h.item}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: `${platformColors[h.winner] || "#34d399"}18`,
                        color: platformColors[h.winner] || "#34d399",
                        border: `1px solid ${platformColors[h.winner] || "#34d399"}33`,
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}>
                        🏆 {h.winner}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <p style={{
            textAlign: "center", marginTop: "48px", fontSize: "12px",
            color: textSecondary, letterSpacing: "0.06em",
            animation: "fadeIn 1s ease 0.8s both"
          }}>
            Grocery Dashboard · Real-time price intelligence
          </p>

        </div>
      </div>
    </>
  );
}
