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

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

export default function RideDashboard() {
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

        // 📊 Chart: rides per platform
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
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading Ride Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
        🚗 Ride Analytics Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

        {[
          { label: "Total Rides", value: data.totalRides, icon: "🚗" },
          { label: "Avg Price", value: `₹${data.avgPrice}`, icon: "💰" },
          { label: "Distance", value: `${data.totalDistance} km`, icon: "📍" },
          { label: "Best Platform", value: data.favouritePlatform || "—", icon: "🏆" }
        ].map((card, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl
            hover:scale-105 transition-all shadow-lg"
          >
            <p className="text-sm opacity-70 mb-2">
              {card.icon} {card.label}
            </p>
            <h2 className="text-3xl font-bold capitalize">
              {card.value}
            </h2>
          </div>
        ))}

      </div>

      {/* CHART */}
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-10">
        <h2 className="text-xl font-bold mb-4">📊 Platform Usage</h2>

        {chartData.length === 0 ? (
          <p className="text-gray-400">No data yet</p>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="rides" radius={[10, 10, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* HISTORY */}
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">🕓 Recent Rides</h2>

        {history.length === 0 ? (
          <p className="text-gray-400">No rides yet</p>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 6).map((ride, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 rounded-xl 
                bg-black/30 border border-white/10 hover:bg-white/5 transition"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {ride.pickup} → {ride.drop}
                  </p>
                  <p className="text-xs opacity-70">
                    {ride.distance} km
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-400 font-bold text-lg">
                    ₹{ride.bestPrice}
                  </p>
                  <p className="text-xs opacity-70 capitalize">
                    {ride.winner}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}