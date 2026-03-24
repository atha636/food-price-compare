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
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

/* ── Inject Google Fonts once ── */
const injectFonts = () => {
  if (document.getElementById("db-fonts")) return;
  const link = document.createElement("link");
  link.id = "db-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};

/* ── Food icon helper ── */
const getFoodIcon = (food) => {
  const item = food?.toLowerCase() ?? "";
  if (item.includes("pizza"))    return "🍕";
  if (item.includes("burger"))   return "🍔";
  if (item.includes("biryani"))  return "🍛";
  if (item.includes("pasta"))    return "🍝";
  if (item.includes("momos"))    return "🥟";
  if (item.includes("sandwich")) return "🥪";
  if (item.includes("cake"))     return "🍰";
  if (item.includes("coffee"))   return "☕";
  return "🍽️";
};

/* ── Nav items config ── */
const NAV = [
  { label: "Home",               icon: "🏠",  path: "/"                  },
  { label: "Dashboard",          icon: "📊",  path: "/dashboard"         },
  { label: "Grocery Dashboard",  icon: "🛒",  path: "/grocery-dashboard" },
  { label: "Ride Dashboard",     icon: "🚗",  path: "/ride-dashboard"    },
  { label: "Analytics",          icon: "📈",  path: "/analytics"         },
  { label: "History",            icon: "🕓",  path: "/history"           },
  { label: "Favourites",         icon: "❤️",  path: "/favourites"        },
  { label: "Settings",           icon: "⚙",  path: "/settings"          },
  { label: "E-commerce Dashboard", icon: "🛍️", path: "/ecommerce-dashboard" },
];

const ACTIVE_COLOR = {
  "/grocery-dashboard": "#34d399",
};
const getActiveColor = (path) => ACTIVE_COLOR[path] ?? "#60a5fa";

/* ── Custom Bar Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2,6,23,0.96)",
      border: "1px solid rgba(96,165,250,0.3)",
      borderRadius: "12px",
      padding: "10px 16px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "13px",
      color: "#e2e8f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#60a5fa", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>{payload[0].value} searches</p>
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, accent, sub, delay = 0 }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}22`,
        borderRadius: "20px",
        padding: "26px 24px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px ${accent}18` : "none",
        animation: `slideUp 0.55s ease ${delay}s both`,
        cursor: "default",
      }}
    >
      <div style={{
        position: "absolute", top: "-36px", right: "-36px",
        width: "110px", height: "110px",
        background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <p style={{
        fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#64748b", marginBottom: "14px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {icon}&nbsp;&nbsp;{label}
      </p>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(22px, 2.8vw, 36px)",
        fontWeight: 800,
        color: accent,
        lineHeight: 1.1,
        wordBreak: "break-word",
        whiteSpace: "normal"
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: "#475569", marginTop: "8px" }}>{sub}</p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  injectFonts();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [user,        setUser]        = useState(null);
  const [insights,    setInsights]    = useState(null);
  const [chartData,   setChartData]   = useState([]);
  const [darkMode,    setDarkMode]    = useState(false);
  const [moneySaved,  setMoneySaved]  = useState(0);
  const [bestPlatform,setBestPlatform]= useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      const [userRes, insightsRes] = await Promise.all([
        axios.get("https://food-price-compare-production.up.railway.app/me",      { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("https://food-price-compare-production.up.railway.app/insights", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUser(userRes.data);
      setInsights(insightsRes.data);

      const history = userRes.data.searchHistory || [];

      /* Chart */
      const foodCount = {};
      history.forEach(s => { foodCount[s.item] = (foodCount[s.item] || 0) + 1; });
      setChartData(Object.keys(foodCount).map(f => ({ name: f, searches: foodCount[f] })));

      /* Money + best platform */
      let totalSaved = 0, zomatoWins = 0, swiggyWins = 0;
      history.forEach(s => {
        if (s.bestPrice)         totalSaved += s.bestPrice * 0.1;
        if (s.winner === "zomato") zomatoWins++;
        if (s.winner === "swiggy") swiggyWins++;
      });
      setMoneySaved(Math.round(totalSaved));
      if (zomatoWins || swiggyWins)
        setBestPlatform(zomatoWins > swiggyWins ? "Zomato" : "Swiggy");
    };
    fetchData();
  }, []);

  if (!user || !insights) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#020617", fontFamily: "'DM Sans', sans-serif", color: "#64748b",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "40px", height: "40px", border: "3px solid #1e293b",
          borderTop: "3px solid #60a5fa", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <p>Loading your dashboard…</p>
      </div>
    </div>
  );

  const current = insights?.food;

  /* ── Theme tokens ── */
  const bg          = darkMode ? "#020617"                      : "#f8fafc";
  const sidebarBg   = darkMode ? "rgba(2,6,23,0.98)"            : "#ffffff";
  const sidebarBord = darkMode ? "rgba(255,255,255,0.07)"       : "rgba(0,0,0,0.08)";
  const cardBg      = darkMode ? "rgba(255,255,255,0.03)"       : "rgba(255,255,255,0.9)";
  const cardBorder  = darkMode ? "rgba(255,255,255,0.08)"       : "rgba(0,0,0,0.07)";
  const textPrimary = darkMode ? "#f1f5f9"                      : "#0f172a";
  const textMuted   = darkMode ? "#475569"                      : "#94a3b8";
  const rowHover    = darkMode ? "rgba(96,165,250,0.05)"        : "rgba(0,0,0,0.03)";
  const tableBorder = darkMode ? "rgba(255,255,255,0.06)"       : "rgba(0,0,0,0.06)";

  const barColors = ["#60a5fa","#34d399","#f59e0b","#f472b6","#a78bfa","#fb923c"];

  return (
    <>
      <style>{`
        @keyframes slideUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes spin     { to   { transform:rotate(360deg); } }
        @keyframes glow     { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .row-tr:hover td { background: ${rowHover} !important; }
        
        .badge-zomato   { background:rgba(239,68,68,0.12)!important;  color:#f87171!important; }
        .badge-swiggy   { background:rgba(249,115,22,0.12)!important; color:#fb923c!important; }
        .badge-default  { background:rgba(100,116,139,0.12)!important;color:#94a3b8!important; }
        
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }

        /* Mobile Hamburger */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #60a5fa;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
        }

        @media (max-width: 767px) {
          .mobile-menu-btn { display: block; }
          .sidebar-overlay { display: block !important; }
        }

        @media (max-width: 767px) {
          .stat-card-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .stat-card-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        background: bg,
        fontFamily: "'DM Sans', sans-serif",
        color: textPrimary,
        transition: "background 0.3s ease",
        position: "relative",
      }}>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 9,
              display: "none",
            }}
          />
        )}

        {/* ══ SIDEBAR ══ */}
        <aside style={{
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          right: isMobile ? "auto" : "unset",
          width: isMobile ? (sidebarOpen ? "240px" : "0") : sidebarOpen ? "240px" : "72px",
          minHeight: "100vh",
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBord}`,
          padding: isMobile ? (sidebarOpen ? "32px 20px" : "0") : sidebarOpen ? "32px 20px" : "32px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          transition: "width 0.3s ease, padding 0.3s ease",
          backdropFilter: "blur(20px)",
          flexShrink: 0,
          zIndex: 20,
          overflowY: "auto",
          maxHeight: "100vh",
        }}>

          {/* Close button for mobile */}
          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                color: "#60a5fa",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
                marginBottom: "16px",
              }}
            >
              ✕
            </button>
          )}

          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "32px", cursor: "pointer",
            overflow: "hidden",
          }} onClick={() => isMobile ? null : setSidebarOpen(o => !o)}>
            <div style={{
              width: "36px", height: "36px", flexShrink: 0,
              background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
            }}>🚀</div>
            {(!isMobile && sidebarOpen) || (isMobile && sidebarOpen) ? (
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 1000, fontSize: "12px",
                background: "linear-gradient(135deg,#f1f5f9,#60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", whiteSpace: "nowrap",
              }}>
                PriceCompare
              </span>
            ) : null}
          </div>

          {/* Nav links */}
          {NAV.map(({ label, icon, path }) => {
            const active = location.pathname === path;
            const ac     = getActiveColor(path);
            return (
              <button
                key={path}
                className="nav-btn"
                onClick={() => {
                  navigate(path);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: "100%", textAlign: "left",
                  padding: isMobile || sidebarOpen ? "11px 14px" : "11px",
                  borderRadius: "12px",
                  border: active ? `1px solid ${ac}30` : "1px solid transparent",
                  background: active ? `${ac}15` : "transparent",
                  color: active ? ac : textMuted,
                  fontSize: "13px", fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  gap: isMobile || sidebarOpen ? "10px" : "0",
                  justifyContent: isMobile || sidebarOpen ? "flex-start" : "center",
                  transition: "all 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                  overflow: "hidden",
                  position: "relative",
                  minHeight: "44px",
                }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: "3px", borderRadius: "0 3px 3px 0",
                    background: ac,
                    boxShadow: `0 0 8px ${ac}`,
                  }} />
                )}
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                {(isMobile && sidebarOpen) || (!isMobile && sidebarOpen) ? (
                  <span style={{ whiteSpace: "nowrap" }}>{label}</span>
                ) : null}
              </button>
            );
          })}

          {/* Logout */}
          <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: `1px solid ${sidebarBord}` }}>
            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              style={{
                width: "100%", textAlign: "left",
                padding: isMobile || sidebarOpen ? "11px 14px" : "11px",
                borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.15)",
                background: "rgba(239,68,68,0.06)",
                color: "#f87171",
                fontSize: "13px", fontWeight: 500,
                cursor: "pointer",
                display: "flex", alignItems: "center",
                gap: isMobile || sidebarOpen ? "10px" : "0",
                justifyContent: isMobile || sidebarOpen ? "flex-start" : "center",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.2s",
                minHeight: "44px",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🚪</span>
              {(isMobile && sidebarOpen) || (!isMobile && sidebarOpen) ? (
                <span>Logout</span>
              ) : null}
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main style={{
          flex: 1, 
          padding: isMobile ? "20px 16px" : "40px 36px",
          overflowY: "auto",
          animation: "fadeIn 0.4s ease both",
        }}>

          {/* Mobile Header with menu button */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: isMobile ? "24px" : "40px",
            justifyContent: "space-between",
          }}>
            {isMobile && (
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            )}

            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase",
                color: "#60a5fa", marginBottom: "8px", fontWeight: 500,
              }}>
                ● Live Analytics
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "24px" : "clamp(26px,3.5vw,38px)",
                fontWeight: 800, 
                lineHeight: 1.1,
                background: darkMode
                  ? "linear-gradient(135deg,#f1f5f9 30%,#60a5fa 100%)"
                  : "linear-gradient(135deg,#0f172a 30%,#2563eb 100%)",
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}>
                Your Dashboard
              </h1>
              <p style={{ color: textMuted, fontSize: "13px", marginTop: "6px" }}>
                Track food price savings
              </p>
            </div>

            {!isMobile && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 18px",
                borderRadius: "100px",
                background: "rgba(96,165,250,0.1)",
                border: "1px solid rgba(96,165,250,0.2)",
                fontSize: "13px", fontWeight: 500, color: "#60a5fa",
                animation: "glow 3s ease infinite",
                whiteSpace: "nowrap",
              }}>
                🔥 Smart Price Tracker
              </div>
            )}
          </div>

          {isMobile && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 18px",
              borderRadius: "100px",
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.2)",
              fontSize: "12px", fontWeight: 500, color: "#60a5fa",
              animation: "glow 3s ease infinite",
              marginBottom: "20px",
              justifyContent: "center",
            }}>
              🔥 Smart Price Tracker
            </div>
          )}

          {/* Profile card */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "22px",
            padding: isMobile ? "18px 20px" : "24px 28px",
            marginBottom: isMobile ? "20px" : "28px",
            backdropFilter: "blur(16px)",
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "16px" : "20px",
            animation: "slideUp 0.5s ease 0.05s both",
            flexDirection: isMobile ? "column" : "row",
            textAlign: isMobile ? "center" : "left",
          }}>
            <div style={{
              width: "52px", height: "52px", flexShrink: 0,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
            }}>
              {user.name?.[0]?.toUpperCase() ?? "👤"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: isMobile ? "16px" : "18px" }}>
                {user.name}
              </p>
              <p style={{ color: textMuted, fontSize: "13px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </p>
            </div>
            {!isMobile && (
              <div style={{ marginLeft: "auto" }}>
                <span style={{
                  background: "rgba(52,211,153,0.1)", color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "100px", padding: "4px 12px",
                  fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
                }}>
                  ✓ Active
                </span>
              </div>
            )}
          </div>

          {isMobile && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{
                background: "rgba(52,211,153,0.1)", color: "#34d399",
                border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: "100px", padding: "4px 12px",
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
              }}>
                ✓ Active
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="stat-card-grid" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))",
            gap: isMobile ? "12px" : "18px", 
            marginBottom: isMobile ? "20px" : "28px",
          }}>
            <StatCard
              icon="🔍"
              label="Total Searches"
              value={current?.total || 0}
              accent="#60a5fa"
              delay={0.1}
            />

            <StatCard
              icon="🍽️"
              label="Favourite Food"
              value={
                current?.favouriteFood
                  ? `${getFoodIcon(current.favouriteFood)} ${current.favouriteFood}`
                  : "—"
              }
              accent="#f59e0b"
              delay={0.15}
            />

            <StatCard
              icon="📍"
              label="Favourite City"
              value={current?.favouriteCity || "—"}
              accent="#a78bfa"
              delay={0.2}
            />
            <StatCard icon="💰" label="Money Saved"     value={`₹${moneySaved}`} accent="#34d399" sub="Based on best price comparisons" delay={0.25} />
            <StatCard icon="🏆" label="Best Platform"   value={bestPlatform || "—"} accent="#f472b6" sub="Most frequent lowest price" delay={0.3} />
          </div>

          {/* Chart */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "22px",
            padding: isMobile ? "18px" : "28px",
            marginBottom: isMobile ? "20px" : "28px",
            backdropFilter: "blur(16px)",
            animation: "slideUp 0.55s ease 0.35s both",
            overflowX: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "16px" : "18px", fontWeight: 700, margin: 0 }}>
                📊 Food Analytics
              </h2>
              <span style={{
                fontSize: "11px", color: textMuted, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                All time
              </span>
            </div>

            {chartData.length === 0 ? (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontSize: "14px" }}>
                No search data yet
              </div>
            ) : (
              <div style={{ height: isMobile ? "220px" : "260px", minWidth: chartData.length > 3 ? "400px" : "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#475569", fontSize: isMobile ? 10 : 12, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false} 
                      tickLine={false}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false} 
                      tickLine={false}
                      allowDecimals={false}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }} />
                    <Bar dataKey="searches" radius={[10, 10, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent searches - Mobile Card View / Desktop Table */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "22px",
            padding: isMobile ? "18px" : "28px",
            backdropFilter: "blur(16px)",
            animation: "slideUp 0.55s ease 0.4s both",
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "16px" : "18px", fontWeight: 700, marginBottom: "20px", margin: 0, marginBottom: "20px" }}>
              🕓 Recent Searches
            </h2>

            {isMobile ? (
              /* Mobile: Card View */
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(user.searchHistory || []).slice(0, 6).map((search, i) => {
                  const winnerClass =
                    search.winner === "zomato"  ? "badge-zomato"  :
                    search.winner === "swiggy"  ? "badge-swiggy"  : "badge-default";

                  return (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${cardBorder}`,
                        borderRadius: "12px",
                        padding: "14px",
                        animation: `slideUp 0.4s ease ${0.45 + i * 0.06}s both`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{getFoodIcon(search.item)}</span>
                        <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{search.item}</p>
                      </div>
                      <p style={{ fontSize: "12px", color: textMuted, margin: "8px 0" }}>📍 {search.city}</p>
                      <div>
                        {search.winner ? (
                          <span className={winnerClass} style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            fontSize: "11px", fontWeight: 600,
                            textTransform: "capitalize",
                          }}>
                            🏆 {search.winner}
                          </span>
                        ) : (
                          <span style={{ color: textMuted, fontSize: "12px" }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop: Table View */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Food", "City", "Winner"].map(col => (
                        <th key={col} style={{
                          textAlign: "left",
                          padding: "10px 16px",
                          fontSize: "11px", letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: textMuted,
                          fontWeight: 500,
                          borderBottom: `1px solid ${tableBorder}`,
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(user.searchHistory || []).slice(0, 6).map((search, i) => {
                      const winnerClass =
                        search.winner === "zomato"  ? "badge-zomato"  :
                        search.winner === "swiggy"  ? "badge-swiggy"  : "badge-default";

                      return (
                        <tr
                          key={i}
                          className="row-tr"
                          style={{ animation: `slideUp 0.4s ease ${0.45 + i * 0.06}s both` }}
                        >
                          <td style={{
                            padding: "14px 16px",
                            borderBottom: `1px solid ${tableBorder}`,
                            fontSize: "14px", fontWeight: 500,
                          }}>
                            <span style={{ marginRight: "8px" }}>{getFoodIcon(search.item)}</span>
                            {search.item}
                          </td>
                          <td style={{
                            padding: "14px 16px",
                            borderBottom: `1px solid ${tableBorder}`,
                            fontSize: "13px", color: textMuted,
                          }}>
                            📍 {search.city}
                          </td>
                          <td style={{
                            padding: "14px 16px",
                            borderBottom: `1px solid ${tableBorder}`,
                          }}>
                            {search.winner ? (
                              <span className={winnerClass} style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "4px 12px",
                                borderRadius: "100px",
                                fontSize: "12px", fontWeight: 600,
                                textTransform: "capitalize",
                              }}>
                                🏆 {search.winner}
                              </span>
                            ) : (
                              <span style={{ color: textMuted, fontSize: "13px" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center", marginTop: isMobile ? "24px" : "40px",
            fontSize: "11px", color: "#334155",
            letterSpacing: "0.08em",
            paddingBottom: isMobile ? "20px" : "0",
          }}>
            PriceCompare Dashboard · Real-time food price intelligence
          </p>
        </main>
      </div>
    </>
  );
}
