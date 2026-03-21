import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";

/* ── Inject Fonts ── */
const injectFonts = () => {
  if (document.getElementById("fav-fonts")) return;
  const link = document.createElement("link");
  link.id = "fav-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};

/* ── Nav config ── */
const NAV = [
  { label: "Home",              icon: "🏠",  path: "/"                  },
  { label: "Dashboard",         icon: "📊",  path: "/dashboard"         },
  { label: "Analytics",         icon: "📈",  path: "/analytics"         },
  { label: "History",           icon: "🕓",  path: "/history"           },
  { label: "Favourites",        icon: "❤️",  path: "/favourites"        },
  { label: "Settings",          icon: "⚙",  path: "/settings"          },
];

const ACTIVE_COLOR = { "/favourites": "#f472b6" };
const getActiveColor = (p) => ACTIVE_COLOR[p] ?? "#60a5fa";

/* ── Platform styles ── */
const platformStyle = (platform = "") => {
  const p = (platform || "").toLowerCase();
  if (p === "zomato")    return { bg: "rgba(239,68,68,0.15)",  color: "#f87171",  border: "rgba(239,68,68,0.3)"  };
  if (p === "swiggy")    return { bg: "rgba(249,115,22,0.15)", color: "#fb923c",  border: "rgba(249,115,22,0.3)" };
  if (p === "blinkit")   return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24",  border: "rgba(251,191,36,0.3)" };
  if (p === "zepto")     return { bg: "rgba(167,139,250,0.15)",color: "#a78bfa",  border: "rgba(167,139,250,0.3)"};
  if (p === "instamart") return { bg: "rgba(52,211,153,0.15)", color: "#34d399",  border: "rgba(52,211,153,0.3)" };
  return { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" };
};

const CARD_ACCENTS = ["#f472b6","#60a5fa","#34d399","#f59e0b","#a78bfa","#fb923c"];

/* ── Favourite Card ── */
const FavCard = ({ fav, index, onRemove, isMobile }) => {
  const [hovered,  setHovered]  = useState(false);
  const [imgError, setImgError] = useState(false);
  const [removing, setRemoving] = useState(false);

  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const ps     = platformStyle(fav?.platform);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(index), 280);
  };

  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "24px",
        border: `1px solid ${hovered ? accent + "45" : "rgba(255,255,255,0.07)"}`,
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        transition: "all 0.32s ease",
        transform: removing ? "scale(0.88)" : hovered ? "translateY(-7px) scale(1.01)" : "translateY(0) scale(1)",
        opacity: removing ? 0 : 1,
        boxShadow: hovered
          ? `0 28px 56px rgba(0,0,0,0.4), 0 0 0 1px ${accent}25`
          : "0 4px 20px rgba(0,0,0,0.2)",
        animation: `cardIn 0.5s ease ${index * 0.07}s both`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s",
        zIndex: 2,
      }} />

      {/* Image hero */}
      <div style={{
        height: isMobile ? "140px" : "170px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: `linear-gradient(135deg, ${accent}15, rgba(0,0,0,0.3))`,
      }}>
        {!imgError ? (
          <img
            src={fav?.image || `https://loremflickr.com/600/400/restaurant?random=${index}`}
            alt={fav?.name || "Restaurant"}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.09)" : "scale(1)",
              opacity: 0.8,
            }}
          />
        ) : (
          <div style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "52px",
          }}>
            🍽️
          </div>
        )}

        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.88) 0%, transparent 55%)",
        }} />

        {/* Price tag on image */}
        {fav?.price && (
          <div style={{
            position: "absolute",
            bottom: "12px",
            left: "14px",
            background: "rgba(2,6,23,0.75)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${accent}45`,
            borderRadius: "10px",
            padding: "4px 10px",
            fontFamily: "'Syne', sans-serif",
            fontSize: isMobile ? "13px" : "15px",
            fontWeight: 800,
            color: accent,
            zIndex: 1,
          }}>
            ₹{fav.price}
          </div>
        )}

        {/* Heart badge */}
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "30px",
          height: "30px",
          background: "rgba(244,114,182,0.2)",
          border: "1px solid rgba(244,114,182,0.35)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          zIndex: 1,
        }}>
          ❤️
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.12)",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backdropFilter: "blur(8px)",
            zIndex: 2,
            minHeight: "44px",
            minWidth: "44px",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.28)";
            e.currentTarget.style.transform = "scale(1.12)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Card body */}
      <div style={{
        padding: isMobile ? "14px 16px 18px" : "18px 20px 22px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Name */}
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: isMobile ? "14px" : "16px",
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: "5px",
          lineHeight: 1.25,
          margin: 0,
          marginBottom: "5px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {fav?.name || "Unknown"}
        </h2>

        {/* City */}
        <p style={{
          fontSize: "12px",
          color: "#475569",
          marginBottom: "12px",
          margin: 0,
          marginBottom: "12px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          📍 {fav?.city || "Unknown"}
        </p>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          marginBottom: "12px",
        }} />

        {/* Platform badge */}
        <div style={{ marginBottom: "14px" }}>
          <span style={{
            padding: "4px 12px",
            borderRadius: "100px",
            background: ps.bg,
            color: ps.color,
            border: `1px solid ${ps.border}`,
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {(fav?.platform || "Unknown").toUpperCase()}
          </span>
        </div>

        {/* Compare again */}
        <button
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "11px",
            borderRadius: "14px",
            border: `1px solid ${accent}35`,
            background: hovered ? `${accent}18` : `${accent}0d`,
            color: accent,
            fontFamily: "'Syne', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.25s ease",
            letterSpacing: "0.04em",
            minHeight: "44px",
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
          View Again →
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function Favourites() {
  injectFonts();
  const navigate = useNavigate();
  const location = useLocation();

  const [favourites, setFavourites] = useState([]);
  const [darkMode,   setDarkMode]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen,setSidebarOpen]= useState(true);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

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
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavourites(res?.data?.favourites || []);
      } catch (err) {
        console.error("Fetch favourites error:", err);
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  const removeFavourite = (index) => {
    setFavourites(prev => prev.filter((_, i) => i !== index));
  };

  /* ── theme tokens ── */
  const bg          = darkMode ? "#020617"                : "#f8fafc";
  const sidebarBg   = darkMode ? "rgba(2,6,23,0.98)"     : "#ffffff";
  const sidebarBord = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textMuted   = darkMode ? "#475569"                : "#94a3b8";

  /* platform counts */
  const platformCounts = (favourites || []).reduce((acc, f) => {
    const p = (f?.platform || "other").toLowerCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const topPlatform = Object.keys(platformCounts).sort((a,b) => (platformCounts[b] || 0)-(platformCounts[a] || 0))[0];

  return (
    <>
      <style>{`
        @keyframes cardIn  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        .nav-btn-fav:hover { background:rgba(255,255,255,0.06) !important; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }

        @media (max-width: 767px) {
          .fav-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .fav-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (min-width: 1024px) {
          .fav-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
          }
        }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: bg,
        fontFamily: "'DM Sans', sans-serif",
        color: darkMode ? "#f1f5f9" : "#0f172a",
        transition: "background 0.3s ease",
        position: "relative",
      }}>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 9,
              display: "block",
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
                color: "#f472b6",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => isMobile ? null : setSidebarOpen(o => !o)}
          >
            <div style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              background: "linear-gradient(135deg,#f472b6,#ec4899)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 14px rgba(244,114,182,0.4)",
              animation: "heartbeat 2.4s ease infinite",
            }}>
              ❤️
            </div>
            {(!isMobile && sidebarOpen) || (isMobile && sidebarOpen) ? (
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "17px",
                background: "linear-gradient(135deg,#f1f5f9,#f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                whiteSpace: "nowrap",
              }}>
                PriceCompare
              </span>
            ) : null}
          </div>

          {/* Nav items */}
          {NAV.map(({ label, icon, path }) => {
            const active = location.pathname === path;
            const ac     = getActiveColor(path);
            return (
              <button
                key={path}
                className="nav-btn-fav"
                onClick={() => {
                  navigate(path);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: isMobile || sidebarOpen ? "11px 14px" : "11px",
                  borderRadius: "12px",
                  border: active ? `1px solid ${ac}30` : "1px solid transparent",
                  background: active ? `${ac}15` : "transparent",
                  color: active ? ac : textMuted,
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
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
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "3px",
                    borderRadius: "0 3px 3px 0",
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
          <div style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: `1px solid ${sidebarBord}`,
          }}>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: isMobile || sidebarOpen ? "11px 14px" : "11px",
                borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.15)",
                background: "rgba(239,68,68,0.06)",
                color: "#f87171",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
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
          padding: isMobile ? "24px 16px" : "44px 40px",
          overflowY: "auto",
          animation: "fadeIn 0.4s ease both",
          background: darkMode
            ? "linear-gradient(135deg,#020617 0%,#0f172a 55%,#020617 100%)"
            : "#f8fafc",
        }}>

          {/* Ambient blobs (dark only) */}
          {darkMode && <>
            <div style={{
              position: "fixed",
              top: "-160px",
              right: "-160px",
              width: "420px",
              height: "420px",
              background: "radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
            }} />
            <div style={{
              position: "fixed",
              bottom: "-160px",
              left: "-80px",
              width: "380px",
              height: "380px",
              background: "radial-gradient(circle,rgba(96,165,250,0.06) 0%,transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
            }} />
          </>}

          <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px" }}>

            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  position: "fixed",
                  left: "16px",
                  top: "16px",
                  background: "rgba(244,114,182,0.1)",
                  border: "1px solid rgba(244,114,182,0.3)",
                  borderRadius: "10px",
                  color: "#f472b6",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  minHeight: "44px",
                  minWidth: "44px",
                  zIndex: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ☰
              </button>
            )}

            {/* ── Header ── */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: isMobile ? "16px" : "20px",
              marginBottom: isMobile ? "28px" : "40px",
              marginTop: isMobile ? "50px" : "0",
              animation: "slideUp 0.5s ease both",
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#f472b6",
                  marginBottom: "8px",
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: "8px",
                }}>
                  ● Saved Spots
                </p>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: isMobile ? "24px" : "36px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#f1f5f9,#f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                }}>
                  Your Favourites
                </h1>
                <p style={{
                  color: textMuted,
                  fontSize: isMobile ? "13px" : "14px",
                  marginTop: "6px",
                  margin: 0,
                  marginTop: "6px",
                }}>
                  {favourites?.length || 0} saved restaurant{(favourites?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Stat pills */}
              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}>
                {[
                  { label: "Saved", value: favourites?.length || 0, accent: "#f472b6" },
                  { label: "Top Platform", value: topPlatform ? topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1) : "—", accent: "#60a5fa" },
                  { label: "Cities", value: [...new Set((favourites || []).map(f => f?.city).filter(Boolean))].length || "—", accent: "#34d399" },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: isMobile ? "8px 12px" : "10px 18px",
                    borderRadius: "14px",
                    background: `${s.accent}10`,
                    border: `1px solid ${s.accent}25`,
                    textAlign: "center",
                    minWidth: isMobile ? "60px" : "72px",
                  }}>
                    <p style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: isMobile ? "16px" : "20px",
                      fontWeight: 800,
                      color: s.accent,
                      margin: 0,
                    }}>
                      {s.value}
                    </p>
                    <p style={{
                      fontSize: isMobile ? "9px" : "10px",
                      color: textMuted,
                      letterSpacing: "0.06em",
                      margin: 0,
                      marginTop: "2px",
                    }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Loading ── */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #1e293b",
                  borderTop: "3px solid #f472b6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <p style={{ color: textMuted, fontSize: "14px", margin: 0 }}>Loading favourites…</p>
              </div>

            ) : !favourites || favourites.length === 0 ? (
              /* ── Empty state ── */
              <div style={{
                textAlign: "center",
                padding: "80px 20px",
                animation: "fadeIn 0.5s ease both",
              }}>
                <div style={{ fontSize: "64px", marginBottom: "20px", filter: "grayscale(0.2)" }}>
                  💔
                </div>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: isMobile ? "18px" : "22px",
                  fontWeight: 700,
                  color: darkMode ? "#1e293b" : "#cbd5e1",
                  marginBottom: "8px",
                  margin: 0,
                  marginBottom: "8px",
                }}>
                  No favourites yet
                </h2>
                <p style={{
                  color: textMuted,
                  fontSize: isMobile ? "13px" : "14px",
                  marginBottom: "24px",
                  margin: 0,
                  marginBottom: "24px",
                }}>
                  Heart restaurants from search results to save them here
                </p>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    padding: isMobile ? "10px 20px" : "12px 28px",
                    borderRadius: "14px",
                    border: "1px solid rgba(244,114,182,0.3)",
                    background: "rgba(244,114,182,0.1)",
                    color: "#f472b6",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "44px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(244,114,182,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(244,114,182,0.1)"}
                >
                  Start Comparing →
                </button>
              </div>

            ) : (
              /* ── Cards Grid ── */
              <div className="fav-grid" style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
                gap: isMobile ? "16px" : "24px",
              }}>
                {(favourites || []).map((fav, i) => (
                  <FavCard
                    key={i}
                    fav={fav}
                    index={i}
                    onRemove={removeFavourite}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <p style={{
              textAlign: "center",
              marginTop: isMobile ? "40px" : "56px",
              fontSize: "11px",
              color: darkMode ? "#1e293b" : "#cbd5e1",
              letterSpacing: "0.08em",
              margin: 0,
              marginTop: isMobile ? "40px" : "56px",
              paddingBottom: isMobile ? "16px" : "0",
            }}>
              PriceCompare · Your Favourites
            </p>

          </div>
        </main>
      </div>
    </>
  );
}
