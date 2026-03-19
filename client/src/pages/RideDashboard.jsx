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

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444"];

export default function RideDashboard({ theme }) {

  const isDark = theme === "dark";

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [insightsRes, userRes] = await Promise.all([
          axios.get("https://food-price-compare-production.up.railway.app/ride-insights", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://food-price-compare-production.up.railway.app/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setData(insightsRes.data);

        const rideHistory = (userRes.data.searchHistory || []).filter(
          (s) => s.serviceType === "ride"
        );

        setHistory(rideHistory);

        const count = {};
        rideHistory.forEach(r => {
          if (!r.winner) return;
          count[r.winner] = (count[r.winner] || 0) + 1;
        });

        setChartData(
          Object.keys(count).map(p => ({
            name: p,
            rides: count[p]
          }))
        );

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-lg font-medium transition-all duration-500 ${
        isDark ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-600"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-emerald-500 animate-spin"></div>
          <span>Loading your rides...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen w-full transition-all duration-700 overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900"
      }`}
    >

      {/* PREMIUM BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating orbs */}
        <div className={`absolute w-96 h-96 blur-3xl opacity-20 -top-40 -left-40 rounded-full animate-pulse ${
          isDark ? "bg-emerald-600" : "bg-emerald-400"
        }`} style={{ animationDuration: '6s' }} />
        <div className={`absolute w-80 h-80 blur-3xl opacity-15 top-1/3 right-0 rounded-full animate-pulse ${
          isDark ? "bg-sky-600" : "bg-sky-300"
        }`} style={{ animationDuration: '8s' }} />
        <div className={`absolute w-72 h-72 blur-3xl opacity-15 -bottom-32 left-1/4 rounded-full animate-pulse ${
          isDark ? "bg-slate-800" : "bg-slate-300"
        }`} style={{ animationDuration: '7s' }} />

        {/* Grid pattern */}
        <div className={`absolute inset-0 opacity-5 ${
          isDark ? "bg-[linear-gradient(90deg,#64748b_1px,transparent_1px),linear-gradient(0deg,#64748b_1px,transparent_1px)]" 
                  : "bg-[linear-gradient(90deg,#1e293b_1px,transparent_1px),linear-gradient(0deg,#1e293b_1px,transparent_1px)]"
        }`} style={{ backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">

        {/* PREMIUM HEADER */}
        <div className="mb-12 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent tracking-tight mb-2">
                Ride Analytics
              </h1>
              <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Real-time insights into your journey patterns
              </p>
            </div>
            <div className="text-5xl">🚗</div>
          </div>
        </div>

        {/* PREMIUM STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Rides", value: data.totalRides, icon: "🚗", color: "emerald" },
            { label: "Avg Price", value: `₹${data.avgPrice}`, icon: "💰", color: "sky" },
            { label: "Distance Covered", value: `${data.totalDistance} km`, icon: "📍", color: "amber" },
            { label: "Best Platform", value: data.favouritePlatform || "—", icon: "🏆", color: "rose" }
          ].map((card, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-500 hover:scale-105 cursor-default ${
                isDark
                  ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20"
                  : "bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
              style={{
                animation: `slideUp 0.6s ease-out ${i * 0.1}s backwards`
              }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${
                card.color === 'emerald' ? 'from-emerald-500 to-transparent' :
                card.color === 'sky' ? 'from-sky-500 to-transparent' :
                card.color === 'amber' ? 'from-amber-500 to-transparent' :
                'from-rose-500 to-transparent'
              }`} />
              
              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}>
                    {card.label}
                  </p>
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{card.icon}</span>
                </div>
                <h2 className={`text-4xl font-black tracking-tight ${
                  card.color === 'emerald' ? 'text-emerald-400' :
                  card.color === 'sky' ? 'text-sky-400' :
                  card.color === 'amber' ? 'text-amber-400' :
                  'text-rose-400'
                }`}>
                  {card.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* PREMIUM CHART */}
        <div
          className={`relative group mb-12 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
            isDark
              ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20"
              : "bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-slate-300"
          }` }
          style={{
            animation: `slideUp 0.8s ease-out 0.2s backwards`
          }}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">📊</span>
              <h2 className="text-2xl font-bold">Platform Usage Distribution</h2>
            </div>

            {chartData.length === 0 ? (
              <div className={`py-16 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <p className="text-lg">No ride data available yet</p>
                <p className={`text-sm mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Start comparing rides to see analytics</p>
              </div>
            ) : (
              <div className="h-80 rounded-xl overflow-hidden" style={{
                background: isDark 
                  ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.8) 100%)"
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    />
                    <YAxis
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '14px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
                        border: isDark ? "1px solid rgba(148,163,184,0.3)" : "1px solid rgba(100,116,139,0.3)",
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        color: isDark ? "#e2e8f0" : "#1e293b"
                      }}
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                    />
                    <Bar 
                      dataKey="rides" 
                      radius={[16, 16, 0, 0]}
                      animationDuration={1000}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* PREMIUM HISTORY */}
        <div
          className={`relative rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 ${
            isDark
              ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20"
              : "bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
          style={{
            animation: `slideUp 1s ease-out 0.3s backwards`
          }}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕓</span>
                <h2 className="text-2xl font-bold">Recent Rides</h2>
              </div>
              {history.length > 0 && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  isDark ? "bg-white/10 text-sky-400" : "bg-slate-200 text-slate-700"
                }`}>
                  {history.length} rides
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <div className={`py-16 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <p className="text-lg">No rides recorded yet</p>
                <p className={`text-sm mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Your ride history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 6).map((ride, i) => (
                  <div
                    key={i}
                    className={`group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 hover:scale-101 cursor-pointer ${
                      isDark
                        ? "bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-white/20 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent"
                        : "bg-gradient-to-r from-white to-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-lg"
                    }`}
                    style={{
                      animation: `slideRight 0.5s ease-out ${0.35 + i * 0.05}s backwards`
                    }}
                  >
                    {/* Animated accent line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${
                      i % 4 === 0 ? 'bg-emerald-500 group-hover:w-2' :
                      i % 4 === 1 ? 'bg-sky-500 group-hover:w-2' :
                      i % 4 === 2 ? 'bg-amber-500 group-hover:w-2' :
                      'bg-rose-500 group-hover:w-2'
                    }`} />

                    <div className="pl-4 flex-1">
                      <p className="font-bold text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                        {ride.pickup} <span className="text-slate-400">→</span> {ride.drop}
                      </p>
                      <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        <span className="inline-block">📍 {ride.distance} km</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                        ₹{ride.bestPrice}
                      </p>
                      <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}>
                        {ride.winner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

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

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out 0.1s backwards;
        }

        .hover\:scale-101:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
}
