import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  RadialBarChart, RadialBar, LineChart, Line,
  CartesianGrid, Legend
} from "recharts";

/* ── Inject Fonts ── */
const injectFonts = () => {
  if (document.getElementById("an-fonts")) return;
  const link = document.createElement("link");
  link.id = "an-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
  document.head.appendChild(link);
};

/* ── Platform colors ── */
const PLATFORM_COLORS = {
  zomato:    "#f87171",
  swiggy:    "#fb923c",
  blinkit:   "#fbbf24",
  zepto:     "#a78bfa",
  instamart: "#34d399",
};

const FOOD_COLORS = ["#60a5fa","#34d399","#f59e0b","#f472b6","#a78bfa","#fb923c","#2dd4bf","#e879f9"];

/* ── Custom Tooltips ── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2,6,23,0.96)", border: "1px solid rgba(96,165,250,0.25)",
      borderRadius: "12px", padding: "10px 16px",
      fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#e2e8f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#60a5fa", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#f1f5f9" }}>{payload[0].value} {payload[0].name}</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2,6,23,0.96)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", padding: "10px 16px",
      fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#e2e8f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: payload[0].payload.fill, fontWeight: 600, marginBottom: 4, textTransform: "capitalize" }}>
        {payload[0].name}
      </p>
      <p>{payload[0].value} wins ({payload[0].payload.pct}%)</p>
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
        border: `1px solid ${hovered ? accent + "45" : accent + "18"}`,
        borderRadius: "22px", padding: "26px 24px",
        position: "relative", overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px ${accent}18` : "none",
        animation: `slideUp 0.55s ease ${delay}s both`,
        cursor: "default",
      }}
    >
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "120px", height: "120px",
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <p style={{
        fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#475569", marginBottom: "14px", fontFamily: "'DM Sans', sans-serif",
      }}>
        {icon}&nbsp;&nbsp;{label}
      </p>
      <p style={{
        fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: 800,
        color: accent, lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "11px", color: "#334155", marginTop: "8px" }}>{sub}</p>}
    </div>
  );
};

/* ── Chart Section Card ── */
const ChartCard = ({ title, badge, badgeColor, children, delay = 0, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px", padding: "28px",
    backdropFilter: "blur(20px)",
    animation: `slideUp 0.55s ease ${delay}s both`,
    ...style,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
        {title}
      </h2>
      {badge && (
        <span style={{
          padding: "4px 12px", borderRadius: "100px",
          background: `${badgeColor}18`, color: badgeColor,
          border: `1px solid ${badgeColor}30`,
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

/* ── Skeleton loader ── */
const Skeleton = () => (
  <div style={{ minHeight: "100vh", background: "#020617", padding: "48px 36px", fontFamily: "'DM Sans', sans-serif" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ width: "200px", height: "14px", background: "#1e293b", borderRadius: "8px", marginBottom: "14px", animation: "pulse 1.4s ease infinite" }} />
        <div style={{ width: "320px", height: "40px", background: "#1e293b", borderRadius: "10px", animation: "pulse 1.4s ease 0.1s infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px", marginBottom: "28px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: "120px", borderRadius: "22px", background: "#0f172a", border: "1px solid #1e293b", animation: `pulse 1.4s ease ${i*0.1}s infinite` }} />
        ))}
      </div>
      {[280, 280].map((h, i) => (
        <div key={i} style={{ height: `${h}px`, borderRadius: "24px", background: "#0f172a", border: "1px solid #1e293b", marginBottom: "24px", animation: `pulse 1.4s ease ${i*0.15}s infinite` }} />
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function Analytics() {
  injectFonts();

  const [chartData,     setChartData]     = useState([]);
  const [foodChart,     setFoodChart]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [totalSearches, setTotalSearches] = useState(0);
  const [zomatoWins,    setZomatoWins]    = useState(0);
  const [swiggyWins,    setSwiggyWins]    = useState(0);
  const [topFood,       setTopFood]       = useState("—");
  const [pieData,       setPieData]       = useState([]);
  const [trendData,     setTrendData]     = useState([]);
  const [cityData,      setCityData]      = useState([]);
  const [moneySaved,    setMoneySaved]    = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const history = res.data.searchHistory || [];
        setTotalSearches(history.length);

        /* Food counts */
        const foodCount = {};
        history.forEach(s => { foodCount[s.item] = (foodCount[s.item] || 0) + 1; });
        const foodArray = Object.keys(foodCount)
          .map(food => ({ food, count: foodCount[food] }))
          .sort((a, b) => b.count - a.count);
        setFoodChart(foodArray.slice(0, 8));
        if (foodArray.length > 0) setTopFood(foodArray[0].food);

        /* Platform wins */
        const winCount = {};
        let saved = 0;
        history.forEach(s => {
          if (s.winner) winCount[s.winner] = (winCount[s.winner] || 0) + 1;
          if (s.bestPrice) saved += s.bestPrice * 0.1;
        });
        setMoneySaved(Math.round(saved));

        const zW = winCount["zomato"] || 0;
        const sW = winCount["swiggy"] || 0;
        setZomatoWins(zW);
        setSwiggyWins(sW);

        /* Platform chart */
        const platformArr = Object.keys(winCount).map(p => ({
          platform: p.charAt(0).toUpperCase() + p.slice(1),
          wins: winCount[p],
        }));
        setChartData(platformArr);

        /* Pie data */
        const total = Object.values(winCount).reduce((a, b) => a + b, 0) || 1;
        const pie = Object.keys(winCount).map(p => ({
          name: p,
          value: winCount[p],
          pct: Math.round((winCount[p] / total) * 100),
          fill: PLATFORM_COLORS[p] || "#60a5fa",
        }));
        setPieData(pie);

        /* Trend: searches per date */
        const dateCount = {};
        history.forEach(s => {
          if (s.date) {
            const d = new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            dateCount[d] = (dateCount[d] || 0) + 1;
          }
        });
        const trend = Object.keys(dateCount)
          .map(d => ({ date: d, searches: dateCount[d] }))
          .slice(-10);
        setTrendData(trend);

        /* City breakdown */
        const cityCount = {};
        history.forEach(s => { if (s.city) cityCount[s.city] = (cityCount[s.city] || 0) + 1; });
        const cities = Object.keys(cityCount)
          .map(c => ({ city: c, count: cityCount[c] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setCityData(cities);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Skeleton />;

  const leader      = zomatoWins >= swiggyWins ? "Zomato" : "Swiggy";
  const leaderColor = zomatoWins >= swiggyWins ? "#f87171" : "#fb923c";
  const totalWins   = zomatoWins + swiggyWins;
  const zPct        = totalWins ? Math.round((zomatoWins / totalWins) * 100) : 0;
  const sPct        = totalWins ? Math.round((swiggyWins / totalWins) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes glow    { 0%,100%{opacity:0.6} 50%{opacity:1} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }
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
        <div style={{ position:"fixed", top:"-200px", left:"-200px", width:"500px", height:"500px", background:"radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-200px", right:"-100px", width:"420px", height:"420px", background:"radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:"1200px", margin:"0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom:"44px", animation:"fadeIn 0.5s ease both" }}>
            <p style={{ fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"#60a5fa", marginBottom:"8px", fontWeight:500 }}>
              ● Insights &amp; Data
            </p>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
              <h1 style={{
                fontFamily:"'Syne', sans-serif",
                fontSize:"clamp(28px,4vw,42px)", fontWeight:800, lineHeight:1.1,
                background:"linear-gradient(135deg,#f1f5f9 30%,#60a5fa 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                Analytics Dashboard
              </h1>
              <div style={{
                display:"flex", alignItems:"center", gap:"8px", padding:"10px 18px",
                borderRadius:"100px", background:"rgba(96,165,250,0.1)",
                border:"1px solid rgba(96,165,250,0.2)",
                fontSize:"13px", fontWeight:500, color:"#60a5fa",
                animation:"glow 3s ease infinite",
              }}>
                📊 {totalSearches} total comparisons
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"18px", marginBottom:"28px" }}>
            <StatCard icon="🔍" label="Total Searches"  value={totalSearches}  accent="#60a5fa" delay={0.05} />
            <StatCard icon="🏆" label="Zomato Wins"     value={zomatoWins}     accent="#f87171" sub={`${zPct}% of searches`} delay={0.1} />
            <StatCard icon="🏆" label="Swiggy Wins"     value={swiggyWins}     accent="#fb923c" sub={`${sPct}% of searches`} delay={0.15} />
            <StatCard icon="🍽️" label="Top Food"        value={topFood}        accent="#f59e0b" delay={0.2} />
            <StatCard icon="💰" label="Money Saved"     value={`₹${moneySaved}`} accent="#34d399" sub="Based on best prices" delay={0.25} />
          </div>

          {/* ── Leader Banner ── */}
          <div style={{
            marginBottom:"28px",
            padding:"20px 28px",
            borderRadius:"20px",
            background:`linear-gradient(135deg, ${leaderColor}12, rgba(0,0,0,0.2))`,
            border:`1px solid ${leaderColor}30`,
            display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px",
            animation:"slideUp 0.5s ease 0.3s both",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{
                width:"46px", height:"46px", borderRadius:"14px",
                background:`${leaderColor}20`, border:`1px solid ${leaderColor}35`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px",
              }}>
                🏆
              </div>
              <div>
                <p style={{ fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#475569", marginBottom:"3px" }}>
                  Current Leader
                </p>
                <p style={{ fontFamily:"'Syne', sans-serif", fontSize:"20px", fontWeight:800, color:leaderColor }}>
                  {leader} is winning
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ flex:1, maxWidth:"360px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px", fontSize:"11px", color:"#475569" }}>
                <span style={{ color:"#f87171" }}>Zomato {zPct}%</span>
                <span style={{ color:"#fb923c" }}>Swiggy {sPct}%</span>
              </div>
              <div style={{ height:"8px", borderRadius:"100px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{ display:"flex", height:"100%" }}>
                  <div style={{ width:`${zPct}%`, background:"linear-gradient(90deg,#ef4444,#f87171)", transition:"width 1s ease", borderRadius:"100px 0 0 100px" }} />
                  <div style={{ width:`${sPct}%`, background:"linear-gradient(90deg,#f97316,#fb923c)", transition:"width 1s ease", borderRadius:"0 100px 100px 0" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 1: Platform Bar + Pie ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"24px", marginBottom:"24px" }}>

            {/* Platform Bar */}
            <ChartCard
              title="🏆 Platform Win Analytics"
              badge={`${leader} Leading`}
              badgeColor={leaderColor}
              delay={0.35}
            >
              <div style={{ height:"240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="40%">
                    <XAxis dataKey="platform" tick={{ fill:"#475569", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)", radius:8 }} />
                    <Bar dataKey="wins" radius={[10,10,0,0]} animationDuration={1000}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={PLATFORM_COLORS[entry.platform.toLowerCase()] || FOOD_COLORS[i % FOOD_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Pie Chart */}
            <ChartCard title="📐 Win Share" delay={0.4}>
              {pieData.length === 0 ? (
                <div style={{ height:"240px", display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", fontSize:"14px" }}>
                  No comparison data yet
                </div>
              ) : (
                <>
                  <div style={{ height:"180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", justifyContent:"center", marginTop:"8px" }}>
                    {pieData.map((p, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px" }}>
                        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:p.fill, flexShrink:0 }} />
                        <span style={{ color:"#64748b", textTransform:"capitalize" }}>{p.name} ({p.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* ── Row 2: Food Chart + City ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"24px", marginBottom:"24px" }}>

            {/* Food Bar */}
            <ChartCard title="🍕 Top Searched Foods" delay={0.45}>
              {foodChart.length === 0 ? (
                <div style={{ height:"240px", display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", fontSize:"14px" }}>No food data yet</div>
              ) : (
                <div style={{ height:"240px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={foodChart} barCategoryGap="35%">
                      <XAxis dataKey="food" tick={{ fill:"#475569", fontSize:11, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)", radius:8 }} />
                      <Bar dataKey="count" radius={[10,10,0,0]} animationDuration={1000}>
                        {foodChart.map((_, i) => (
                          <Cell key={i} fill={FOOD_COLORS[i % FOOD_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            {/* City Leaderboard */}
            <ChartCard title="📍 Top Cities" delay={0.5}>
              {cityData.length === 0 ? (
                <div style={{ height:"240px", display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", fontSize:"14px" }}>No city data yet</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {cityData.map((c, i) => {
                    const max  = cityData[0].count;
                    const pct  = Math.round((c.count / max) * 100);
                    const col  = FOOD_COLORS[i % FOOD_COLORS.length];
                    return (
                      <div key={i} style={{ animation:`slideUp 0.4s ease ${0.5 + i * 0.07}s both` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                          <span style={{ fontSize:"13px", fontWeight:500, color:"#cbd5e1", textTransform:"capitalize" }}>
                            {c.city}
                          </span>
                          <span style={{ fontSize:"12px", color:col, fontWeight:700 }}>{c.count}</span>
                        </div>
                        <div style={{ height:"6px", borderRadius:"100px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                          <div style={{
                            height:"100%", width:`${pct}%`,
                            background:`linear-gradient(90deg, ${col}, ${col}88)`,
                            borderRadius:"100px",
                            transition:"width 1s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>
          </div>

          {/* ── Search Trend Line ── */}
          {trendData.length > 1 && (
            <ChartCard title="📈 Search Trend" delay={0.55}>
              <div style={{ height:"220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:"#475569", fontSize:11, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ stroke:"rgba(255,255,255,0.08)", strokeWidth:1 }} />
                    <Line
                      type="monotone" dataKey="searches"
                      stroke="url(#trendGrad)" strokeWidth={2.5}
                      dot={{ fill:"#60a5fa", r:4, strokeWidth:0 }}
                      activeDot={{ r:6, fill:"#34d399", strokeWidth:0 }}
                      animationDuration={1200}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* Footer */}
          <p style={{ textAlign:"center", marginTop:"48px", fontSize:"11px", color:"#1e293b", letterSpacing:"0.08em" }}>
            PriceCompare · Analytics Dashboard
          </p>
        </div>
      </div>
    </>
  );
}
