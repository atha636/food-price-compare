import { useState, useEffect } from "react";
import axios from "axios";
import { Palette, User, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Inject Fonts ── */
const injectFonts = () => {
  if (document.getElementById("st-fonts")) return;
  const link = document.createElement("link");
  link.id = "st-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};

/* ── Reusable Section Card ── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    backdropFilter: "blur(20px)",
    ...style,
  }}>
    {children}
  </div>
);

/* ── Section Heading ── */
const SectionHead = ({ icon: Icon, label, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
    <div style={{
      width: "34px", height: "34px",
      background: `${color}18`,
      border: `1px solid ${color}30`,
      borderRadius: "10px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={16} color={color} />
    </div>
    <h2 style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: "16px", fontWeight: 700,
      color: label === "Danger Zone" ? color : "#f1f5f9",
    }}>
      {label}
    </h2>
  </div>
);

/* ── Styled Input ── */
const Input = ({ label, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && (
        <label style={{
          display: "block", fontSize: "11px", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#475569",
          marginBottom: "6px", fontFamily: "'DM Sans', sans-serif",
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "13px 16px",
          borderRadius: "14px",
          border: `1px solid ${focused ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.1)"}`,
          background: focused ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.04)",
          color: "#f1f5f9",
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          transition: "all 0.2s ease",
          boxShadow: focused ? "0 0 0 3px rgba(96,165,250,0.1)" : "none",
        }}
      />
    </div>
  );
};

/* ── Theme Button ── */
const ThemeBtn = ({ icon, label, active, accent, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: "18px 12px",
        borderRadius: "16px",
        border: active ? `1px solid ${accent}50` : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? `${accent}18`
          : hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "10px",
        transition: "all 0.2s ease",
        transform: active ? "scale(1.04)" : hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? `0 8px 24px ${accent}20` : "none",
        position: "relative", overflow: "hidden",
        minHeight: "80px",
      }}
    >
      {active && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${accent}15, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
      <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: "12px", fontWeight: active ? 600 : 400,
        color: active ? accent : "#64748b",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.04em",
      }}>
        {label}
      </span>
      {active && (
        <div style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "30px", height: "2px",
          background: accent, borderRadius: "2px 2px 0 0",
        }} />
      )}
    </button>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function Settings({ theme, setTheme }) {
  injectFonts();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [status,          setStatus]          = useState("");
  const [toast,           setToast]           = useState({ msg: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText,     setConfirmText]     = useState("");
  const [saving,          setSaving]          = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [isMobile,        setIsMobile]        = useState(window.innerWidth < 768);

  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;

    axios.get("https://food-price-compare-production.up.railway.app/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setName(res?.data?.name || "");
        setEmail(res?.data?.email || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setLoading(false);
      });
  }, [token]);

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        "https://food-price-compare-production.up.railway.app/update-profile",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(res?.data?.user?.name || name);
      setEmail(res?.data?.user?.email || email);
      showToast("Profile updated successfully ✓", "success");
    } catch (err) {
      console.error("Update error:", err);
      showToast("Update failed — please try again", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (confirmText !== "DELETE") {
      showToast("Type DELETE to confirm", "error");
      return;
    }
    try {
      await axios.delete("https://food-price-compare-production.up.railway.app/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      setShowDeleteModal(false);
      window.location.href = "/";
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Delete failed", "error");
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <style>{`
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
        input::placeholder { color:#334155; }

        @media (max-width: 767px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            initial={{ opacity: 0, y: -16, x: 16 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -16, x: 16 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              top: "24px",
              right: isMobile ? "16px" : "24px",
              left: isMobile ? "16px" : "auto",
              zIndex: 9999,
              padding: "14px 20px",
              borderRadius: "14px",
              background: toast.type === "success"
                ? "linear-gradient(135deg,#065f46,#047857)"
                : "linear-gradient(135deg,#7f1d1d,#b91c1c)",
              border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
              color: "#f1f5f9",
              fontSize: "13px", fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              backdropFilter: "blur(16px)",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020617 0%,#0f172a 60%,#020617 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f1f5f9",
        padding: isMobile ? "24px 16px" : "48px 36px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Ambient blobs */}
        <div style={{
          position: "fixed", top: "-200px", left: "-200px",
          width: "500px", height: "500px",
          background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed", bottom: "-200px", right: "-100px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom: isMobile ? "28px" : "40px", animation: "fadeIn 0.5s ease both" }}>
            <p style={{
              fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#60a5fa", marginBottom: "8px", fontWeight: 500,
            }}>
              ● Account Settings
            </p>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: isMobile ? "28px" : "clamp(28px,4vw,42px)",
              fontWeight: 800,
              lineHeight: 1.1,
              background: "linear-gradient(135deg,#f1f5f9 30%,#60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}>
              Settings
            </h1>
            <p style={{ color: "#475569", fontSize: isMobile ? "13px" : "14px", marginTop: "8px", margin: 0 }}>
              Manage your account preferences and profile
            </p>
          </div>

          {/* ── Grid Layout ── */}
          <div className="settings-grid" style={{
            display: "grid",
            gap: isMobile ? "18px" : "24px",
            alignItems: "start",
          }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "18px" : "24px" }}>

              {/* Theme */}
              <Card style={{ animation: "slideUp 0.5s ease 0.1s both" }}>
                <SectionHead icon={Palette} label="Appearance" color="#60a5fa" />
                <div style={{ display: "flex", gap: "12px" }}>
                  <ThemeBtn
                    icon="☀️"
                    label="Light"
                    active={theme === "light"}
                    accent="#f59e0b"
                    onClick={() => setTheme("light")}
                  />
                  <ThemeBtn
                    icon="🌙"
                    label="Dark"
                    active={theme === "dark"}
                    accent="#818cf8"
                    onClick={() => setTheme("dark")}
                  />
                  <ThemeBtn
                    icon="💻"
                    label="System"
                    active={theme === "system"}
                    accent="#34d399"
                    onClick={() => setTheme("system")}
                  />
                </div>
                <p style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  color: "#334155",
                  lineHeight: 1.6,
                  margin: 0,
                  marginTop: "16px",
                }}>
                  Choose how PriceCompare looks to you. Select a theme or sync with your system.
                </p>
              </Card>

              {/* Profile preview */}
              <Card style={{ animation: "slideUp 0.5s ease 0.15s both" }}>
                <p style={{
                  fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#475569", marginBottom: "18px", margin: 0, marginBottom: "18px",
                }}>
                  Preview
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "12px" : "16px",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}>
                  <div style={{
                    width: "56px", height: "56px", flexShrink: 0,
                    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", fontWeight: 800, color: "#fff",
                    fontFamily: "'Syne', sans-serif",
                    boxShadow: "0 4px 18px rgba(59,130,246,0.35)",
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: isMobile ? "15px" : "16px",
                      margin: 0,
                    }}>
                      {name || "Your Name"}
                    </p>
                    <p style={{
                      color: "#475569",
                      fontSize: "13px",
                      marginTop: "2px",
                      margin: 0,
                      marginTop: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {email || "your@email.com"}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      background: "rgba(52,211,153,0.1)", color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.2)",
                      borderRadius: "100px", padding: "4px 12px",
                      fontSize: "11px", fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}>
                      ✓ Active
                    </span>
                  </div>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "18px" : "24px" }}>

              {/* Edit Profile */}
              <Card style={{ animation: "slideUp 0.5s ease 0.2s both" }}>
                <SectionHead icon={User} label="Edit Profile" color="#34d399" />

                <Input
                  label="Full Name"
                  type="text"
                  value={name || ""}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email || ""}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />

                <button
                  onClick={updateProfile}
                  disabled={saving || loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "none",
                    background: saving || loading
                      ? "rgba(52,211,153,0.3)"
                      : "linear-gradient(135deg,#059669,#34d399)",
                    color: "#fff",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "14px", fontWeight: 700,
                    cursor: saving || loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.04em",
                    boxShadow: saving || loading ? "none" : "0 4px 16px rgba(52,211,153,0.25)",
                    marginTop: "4px",
                    minHeight: "44px",
                  }}
                  onMouseEnter={e => { if (!saving && !loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </Card>

              {/* Danger Zone */}
              <Card style={{
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.03)",
                animation: "slideUp 0.5s ease 0.25s both",
              }}>
                <SectionHead icon={AlertTriangle} label="Danger Zone" color="#f87171" />

                <div style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "16px",
                }}>
                  <p style={{
                    fontSize: "13px",
                    color: "#fca5a5",
                    marginBottom: "10px",
                    fontWeight: 500,
                    margin: 0,
                    marginBottom: "10px",
                  }}>
                    Deleting your account will permanently remove:
                  </p>
                  {["All favourites", "Search history", "Account data & preferences"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "#fca5a5" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "14px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "14px", fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.04em",
                    minHeight: "44px",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.18)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Delete Account
                </button>
              </Card>

            </div>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center",
            marginTop: isMobile ? "32px" : "48px",
            fontSize: "11px",
            color: "#1e293b",
            letterSpacing: "0.08em",
            margin: 0,
            marginTop: isMobile ? "32px" : "48px",
          }}>
            PriceCompare · Account Settings
          </p>
        </div>
      </div>

      {/* ══ Delete Confirmation Modal ══ */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9000,
              padding: isMobile ? "16px" : "0",
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              style={{
                background: "linear-gradient(135deg,#0f172a,#1e293b)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "24px",
                padding: isMobile ? "24px" : "32px",
                width: isMobile ? "100%" : "360px",
                maxWidth: "100%",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Warning icon */}
              <div style={{
                width: "52px", height: "52px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px",
                marginBottom: "20px",
                animation: "pulse-glow 2s infinite",
              }}>
                ⚠️
              </div>

              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "18px" : "20px",
                fontWeight: 800,
                color: "#f87171",
                marginBottom: "8px",
                margin: 0,
                marginBottom: "8px",
              }}>
                Delete Account
              </h3>
              <p style={{
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "24px",
                margin: 0,
                marginBottom: "24px",
              }}>
                This action is <strong style={{ color: "#f87171" }}>permanent and irreversible</strong>.
                Type <code style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "#f87171",
                  padding: "1px 6px",
                  borderRadius: "5px",
                  fontSize: "12px",
                }}>DELETE</code> below to confirm.
              </p>

              <Input
                type="text"
                placeholder="Type DELETE"
                value={confirmText || ""}
                onChange={e => setConfirmText(e.target.value)}
              />

              <div style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                flexDirection: isMobile ? "column" : "row",
              }}>
                <button
                  onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    minHeight: "44px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "14px",
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: confirmText === "DELETE"
                      ? "linear-gradient(135deg,#dc2626,#ef4444)"
                      : "rgba(239,68,68,0.1)",
                    color: confirmText === "DELETE" ? "#fff" : "#f87171",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: confirmText === "DELETE" ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
                    minHeight: "44px",
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
