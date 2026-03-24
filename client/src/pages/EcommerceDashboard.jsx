import { useEffect, useState } from "react";
import axios from "axios";

/* reuse font injector */
const injectFonts = () => {
  if (document.getElementById("db-fonts")) return;
  const link = document.createElement("link");
  link.id = "db-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
  document.head.appendChild(link);
};

/* stat card */
const StatCard = ({ icon, label, value, accent }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accent}22`,
      borderRadius: "20px",
      padding: "24px",
      transition: "0.3s",
    }}
  >
    <p style={{ fontSize: "12px", color: "#64748b" }}>
      {icon} {label}
    </p>

    <h2
      style={{
        fontSize: "28px",
        fontWeight: "800",
        color: accent,
      }}
    >
      {value}
    </h2>
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
      <div style={{ color: "#94a3b8", padding: "40px" }}>
        Loading dashboard...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#020617",
        color: "#fff",
        fontFamily: "DM Sans",
      }}
    >
      {/* HEADER */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "800",
          background: "linear-gradient(135deg,#f1f5f9,#60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        🛍 E-commerce Dashboard
      </h1>

      <p style={{ color: "#64748b", marginBottom: "30px" }}>
        Track your online shopping insights
      </p>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <StatCard
          icon="🔍"
          label="Total Searches"
          value={data.total || 0}
          accent="#60a5fa"
        />

        <StatCard
          icon="🛍"
          label="Favourite Product"
          value={data.favouriteProduct || "—"}
          accent="#f59e0b"
        />

        <StatCard
          icon="🏬"
          label="Favourite Platform"
          value={data.favouritePlatform || "—"}
          accent="#a78bfa"
        />

        <StatCard
          icon="💰"
          label="Money Saved"
          value={`₹${data.moneySaved || 0}`}
          accent="#34d399"
        />
      </div>
    </div>
  );
}