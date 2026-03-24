import { useEffect, useState } from "react";
import axios from "axios";

/* reuse font injector */
const injectFonts = () => {
  if (document.getElementById("db-fonts")) return;
  const link = document.createElement("link");
  link.id = "db-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
};

/* Enhanced stat card with premium design */
const StatCard = ({ icon, label, value, accent, delay }) => (
  <div
    style={{
      background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
      border: `1.5px solid ${accent}33`,
      borderRadius: "24px",
      padding: "32px 28px",
      transition: "all 0.35s cubic-bezier(0.23, 1, 0.320, 1)",
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      animation: `slideUp 0.6s ease-out ${delay}s both`,
      transformOrigin: "center bottom",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.border = `1.5px solid ${accent}66`;
      e.currentTarget.style.background = `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`;
      e.currentTarget.style.transform = "translateY(-8px)";
      e.currentTarget.style.boxShadow = `0 24px 48px ${accent}15, inset 0 1px 0 ${accent}22`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = `1.5px solid ${accent}33`;
      e.currentTarget.style.background = `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {/* Accent glow behind card */}
    <div
      style={{
        position: "absolute",
        top: "-40%",
        right: "-40%",
        width: "200px",
        height: "200px",
        background: `radial-gradient(circle, ${accent}15, transparent 70%)`,
        borderRadius: "50%",
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />

    {/* Icon with scale animation */}
    <div
      style={{
        fontSize: "40px",
        marginBottom: "16px",
        transition: "transform 0.4s ease",
      }}
    >
      {icon}
    </div>

    {/* Label */}
    <p
      style={{
        fontSize: "13px",
        fontWeight: "500",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        marginBottom: "12px",
        fontFamily: "DM Sans",
      }}
    >
      {label}
    </p>

    {/* Value */}
    <h2
      style={{
        fontSize: "36px",
        fontWeight: "800",
        color: accent,
        background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "Syne",
        margin: 0,
        lineHeight: "1.2",
      }}
    >
      {value}
    </h2>

    {/* Bottom accent line */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${accent}00, ${accent}66, ${accent}00)`,
      }}
    />
  </div>
);

export default function EcommerceDashboard() {
  injectFonts();

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://food-price-compare-production.up.railway.app/insights",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data.ecommerce);
    };

    fetch();
  }, []);

  if (!data)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          fontFamily: "DM Sans",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            ✨
          </div>
          <p style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "DM Sans",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 0%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "60px 48px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: "60px", animation: "fadeInDown 0.8s ease-out" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-block",
              background: "rgba(96, 165, 250, 0.1)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              borderRadius: "12px",
              padding: "8px 16px",
              marginBottom: "20px",
              fontSize: "12px",
              color: "#60a5fa",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              animation: "slideUp 0.6s ease-out",
            }}
          >
            💎 Shopping Intelligence
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "800",
              fontFamily: "Syne",
              margin: "0 0 16px 0",
              lineHeight: "1.1",
              background: "linear-gradient(135deg, #f1f5f9 0%, #60a5fa 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "slideUp 0.7s ease-out 0.1s both",
            }}
          >
            Shopping Insights
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              fontWeight: "400",
              margin: "0",
              maxWidth: "500px",
              lineHeight: "1.6",
              animation: "slideUp 0.7s ease-out 0.2s both",
            }}
          >
            Track your e-commerce activity, discover savings, and optimize your shopping experience.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "28px",
            animation: "fadeIn 0.8s ease-out 0.3s both",
          }}
        >
          <StatCard
            icon="🔍"
            label="Total Searches"
            value={data.total?.toLocaleString() || "0"}
            accent="#60a5fa"
            delay={0.4}
          />

          <StatCard
            icon="🛍️"
            label="Top Product"
            value={data.favouriteProduct || "—"}
            accent="#f59e0b"
            delay={0.5}
          />

          <StatCard
            icon="🏪"
            label="Top Platform"
            value={data.favouritePlatform || "—"}
            accent="#a78bfa"
            delay={0.6}
          />

          <StatCard
            icon="💰"
            label="Total Saved"
            value={`₹${(data.moneySaved || 0).toLocaleString()}`}
            accent="#34d399"
            delay={0.7}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
