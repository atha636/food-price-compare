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
        <p style={{ color: "#34d399", fontWeight: 600, marginBottom: 4, margin: 0 }}>{label}</p>
        <p style={{ margin: 0 }}>{payload[0].value} wins</p>
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
      position: "absolute",
      top: "-40px",
      right: "-40px",
      width: "120px",
      height: "120px",
      background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
      borderRadius: "50%",
      pointerEvents: "none"
    }} />
    <p style={{
      fontSize: "11px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#64748b",
      fontFamily: "'DM Sans', sans-serif",
      margin: 0,
      marginBottom: "14px",
    }}>
      {icon} &nbsp;{label}
    </p>
    <p style={{
      fontSize: "clamp(24px, 2.5vw, 40px)",
      fontWeight: 800,
      color: accent,
      fontFamily: "'Syne', sans-serif",
      lineHeight: 1,
      margin: 0,
    }}>
      {value}
    </p>
  </div>
);

/* ─── Grocery Icon ─── */
const getGroceryIcon = (item) => {
  if (!item) return "🛒";
  const n = String(item).toLowerCase();
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
  Zepto:     "#a78bfa",
  Blinkit:   "#fbbf24",
  Instamart: "#34d399",
  JioMart:   "#60a5fa",
};

export default function GroceryDashboard({ theme }) {
  injectFonts();
  const navigate = useNavigate();

  const [history,      setHistory]      = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [topItems,     setTopItems]     = useState([]);
  const [bestPlatform, setBestPlatform] = useState("—");
  const [moneySaved,   setMoneySaved]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  const dark = theme !== "light";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const searchHistory = res?.data?.searchHistory || [];
        const groceryHistory = searchHistory.filter(s => s?.serviceType === "grocery");

        setHistory(groceryHistory);

        if (groceryHistory && groceryHistory.length > 0) {
          let zepto = 0, blinkit = 0, instamart = 0, jiomart = 0;
          let saved = 0;

          groceryHistory.forEach(search => {
            if (search?.winner === "zepto")     zepto++;
            if (search?.winner === "blinkit")   blinkit++;
            if (search?.winner === "instamart") instamart++;
            if (search?.winner === "jiomart")   jiomart++;
            if (search?.bestPrice) {
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

          const filteredPlatforms = platforms.filter(p => p.wins > 0);
          setPlatformData(filteredPlatforms);

          const best = platforms.reduce((a, b) => a.wins > b.wins ? a : b);
          setBestPlatform(best.wins === 0 ? "No data yet" : best.name);

          const itemCount = {};
          groceryHistory.forEach(search => {
            if (search?.item) {
              const items = typeof search.item === 'string' ? search.item.split(",") : [search.item];
              items.forEach(i => {
                const item = String(i).trim().toLowerCase();
                if (item) {
                  itemCount[item] = (itemCount[item] || 0) + 1;
                }
              });
            }
          });

          const top = Object.keys(itemCount)
            .map(item => ({ name: item, searches: itemCount[item] }))
            .sort((a, b) => b.searches - a.searches)
            .slice(0, 5);

          setTopItems(top);
        }
      } catch (err) {
        console.error("Error fetching grocery data:", err);
        setError(err?.message || "Failed to load grocery data");
        setHistory([]);
        setPlatformData([]);
        setTopItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        fontFamily: "'DM Sans', sans-serif",
        color: textPrimary,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #1e293b",
            borderTop: "3px solid #34d399",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p>Loading grocery data…</p>
        </div>
      </div>
    );
  }

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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .tag-pill:hover { transform: scale(1.06) !important; }
        .row-item:hover { background: rgba(52,211,153,0.06) !important; }

        /* Mobile responsiveness */
        @media (max-width: 767px) {
          .stat-grid {
            grid-template-columns: 1fr !important;
          }
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
          .back-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: bg,
        color: textPrimary,
        fontFamily: "'DM Sans', sans-serif",
        padding: isMobile ? "20px 16px" : "40px 32px",
        transition: "all 0.4s ease",
      }}>

        {/* ── Noise texture overlay ── */}
        <div style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? "16px" : "24px",
            marginBottom: isMobile ? "32px" : "48px",
            animation: "fadeIn 0.5s ease both"
          }}>
            <div style={{ flex: 1, width: "100%" }}>
              <p style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#34d399",
                margin: 0,
                marginBottom: "8px",
                fontWeight: 500,
              }}>
                ● Live Tracking
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "24px" : "clamp(28px, 4vw, 42px)",
                fontWeight: 800,
                lineHeight: 1.1,
                background: dark
                  ? "linear-gradient(135deg, #f1f5f9 30%, #34d399 100%)"
                  : "linear-gradient(135deg, #0f172a 30%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}>
                Grocery Dashboard
              </h1>
            </div>

            <button
              className="back-btn"
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: isMobile ? "12px 16px" : "12px 22px",
                borderRadius: "14px",
                border: "1px solid rgba(52,211,153,0.3)",
                background: "rgba(52,211,153,0.08)",
                color: "#34d399",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.25s ease",
                minHeight: isMobile ? "44px" : "auto",
                width: isMobile ? "100%" : "auto",
                flexShrink: 0,
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
              ← {isMobile ? "Back" : "Back to Compare"}
            </button>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              color: "#fca5a5",
              fontSize: "13px",
              animation: "slideUp 0.4s ease both",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div className="stat-grid" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: isMobile ? "14px" : "20px",
            marginBottom: isMobile ? "24px" : "36px"
          }}>
            <StatCard 
              icon="🧺" 
              label="Baskets Compared" 
              value={history?.length || 0} 
              accent="#60a5fa" 
              delay={0}
            />
            <StatCard 
              icon="💰" 
              label="Money Saved" 
              value={`₹${moneySaved}`} 
              accent="#34d399" 
              delay={0.1}
            />
            <StatCard 
              icon="🏆" 
              label="Best Grocery Platform" 
              value={bestPlatform} 
              accent="#f59e0b" 
              delay={0.2}
            />
          </div>

          {/* ── Top Items ── */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: "24px",
            padding: isMobile ? "20px 16px" : "28px",
            marginBottom: isMobile ? "20px" : "24px",
            backdropFilter: "blur(16px)",
            animation: "slideUp 0.6s ease 0.3s both",
          }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
              marginBottom: "16px",
            }}>
              🥦 <span>Top Searched Items</span>
            </h2>

            {!topItems || topItems.length === 0 ? (
              <p style={{ color: textSecondary, fontSize: "14px", margin: 0 }}>No items searched yet.</p>
            ) : (
              <div style={{
                display: "flex",
                gap: isMobile ? "10px" : "12px",
                flexWrap: "wrap"
              }}>
                {topItems.map((item, i) => (
                  <div
                    key={i}
                    className="tag-pill"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: isMobile ? "8px 12px" : "10px 18px",
                      borderRadius: "100px",
                      background: dark ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.08)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      fontSize: isMobile ? "12px" : "13px",
                      fontWeight: 500,
                      color: dark ? "#a7f3d0" : "#065f46",
                      transition: "transform 0.2s ease",
                      cursor: "default",
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? "16px" : "18px",
                      lineHeight: 1,
                      background: "rgba(255,255,255,0.12)",
                      borderRadius: "50%",
                      width: isMobile ? "24px" : "28px",
                      height: isMobile ? "24px" : "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {getGroceryIcon(item?.name)}
                    </span>
                    <span style={{
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {item?.name}
                    </span>
                    <span style={{
                      background: "rgba(52,211,153,0.15)",
                      borderRadius: "20px",
                      padding: "1px 6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#34d399",
                      flexShrink: 0,
                    }}>
                      {item?.searches || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom Row: Chart + Recent ── */}
          <div className="bottom-grid" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "20px" : "24px",
            animation: "slideUp 0.6s ease 0.4s both"
          }}>

            {/* Chart */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "24px",
              padding: isMobile ? "20px 16px" : "28px",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
            }}>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "16px" : "18px",
                fontWeight: 700,
                margin: 0,
                marginBottom: "20px",
              }}>
                📊 Platform Wins
              </h2>

              {!platformData || platformData.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: textSecondary,
                  fontSize: "14px",
                  minHeight: "200px",
                }}>
                  No comparison data yet
                </div>
              ) : (
                <div style={{
                  flex: 1,
                  width: "100%",
                  minHeight: isMobile ? "200px" : "220px",
                  position: "relative",
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} barCategoryGap="35%">
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: textSecondary,
                          fontSize: isMobile ? 10 : 12,
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                        axisLine={false}
                        tickLine={false}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        height={isMobile ? 50 : 30}
                      />
                      <YAxis
                        tick={{
                          fill: textSecondary,
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={isMobile ? 28 : 40}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)", radius: 8 }} />
                      <Bar dataKey="wins" radius={[10, 10, 0, 0]}>
                        {platformData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={platformColors[entry?.name] || BAR_COLORS[index % BAR_COLORS.length]}
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
              padding: isMobile ? "20px 16px" : "28px",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
            }}>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "16px" : "18px",
                fontWeight: 700,
                margin: 0,
                marginBottom: "16px",
              }}>
                🧺 Recent Baskets
              </h2>

              {!history || history.length === 0 ? (
                <p style={{ color: textSecondary, fontSize: "14px", margin: 0 }}>No recent baskets.</p>
              ) : (
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "8px" : "10px",
                  overflowY: "auto",
                }}>
                  {history.slice(0, isMobile ? 8 : 5).map((h, i) => {
                    if (!h) return null;
                    
                    return (
                      <div
                        key={i}
                        className="row-item"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          padding: isMobile ? "10px 12px" : "12px 16px",
                          borderRadius: "14px",
                          background: rowBg,
                          border: `1px solid ${cardBorder}`,
                          transition: "background 0.2s ease",
                          animation: `slideUp 0.4s ease ${0.45 + i * 0.07}s both`,
                          minHeight: isMobile ? "40px" : "auto",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? "8px" : "10px",
                          flex: 1,
                          minWidth: 0,
                        }}>
                          <span style={{ fontSize: isMobile ? "16px" : "18px", flexShrink: 0 }}>
                            {getGroceryIcon(h?.item)}
                          </span>
                          <span style={{
                            fontSize: isMobile ? "12px" : "13px",
                            fontWeight: 500,
                            color: textPrimary,
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {h?.item || "Unknown item"}
                          </span>
                        </div>
                        <span style={{
                          fontSize: isMobile ? "10px" : "11px",
                          fontWeight: 600,
                          padding: isMobile ? "3px 8px" : "4px 10px",
                          borderRadius: "20px",
                          background: `${platformColors[h?.winner] || "#34d399"}18`,
                          color: platformColors[h?.winner] || "#34d399",
                          border: `1px solid ${platformColors[h?.winner] || "#34d399"}33`,
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}>
                          🏆 {isMobile ? (h?.winner?.slice(0, 4) || "—") : (h?.winner || "—")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <p style={{
            textAlign: "center",
            marginTop: isMobile ? "32px" : "48px",
            fontSize: "12px",
            color: textSecondary,
            letterSpacing: "0.06em",
            animation: "fadeIn 1s ease 0.8s both",
            paddingBottom: isMobile ? "16px" : "0",
            margin: 0,
            marginTop: isMobile ? "32px" : "48px",
          }}>
            Grocery Dashboard · Real-time price intelligence
          </p>

        </div>
      </div>
    </>
  );
}
