import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



export default function App() {
  const [user, setUser] = useState(null);
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [authError, setAuthError] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [serviceType, setServiceType] = useState("food");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState("zomato");
  const winner =
  serviceType === "food" && result
    ? (() => {
        const zomatoBest = result.zomatoList.reduce((a, b) =>
          a.price < b.price ? a : b
        );
        const swiggyBest = result.swiggyList.reduce((a, b) =>
          a.price < b.price ? a : b
        );

        if (zomatoBest.price < swiggyBest.price) return "zomato";
        if (swiggyBest.price < zomatoBest.price) return "swiggy";
        return null;
      })()
    : null;


    const savingsData =
  serviceType === "food" && result
    ? (() => {
        const zomatoBest = result.zomatoList.reduce((a, b) =>
          a.price < b.price ? a : b
        );

        const swiggyBest = result.swiggyList.reduce((a, b) =>
          a.price < b.price ? a : b
        );

        const cheaperPrice = Math.min(
          zomatoBest.price,
          swiggyBest.price
        );

        const expensivePrice = Math.max(
          zomatoBest.price,
          swiggyBest.price
        );

        const difference = expensivePrice - cheaperPrice;

        return {
          perOrder: difference,
          monthly: difference * 8,
          yearly: difference * 96,
          percentage: (
            (difference / expensivePrice) *
            100
          ).toFixed(1),
        };
      })()
    : null;
  const [sortBy, setSortBy] = useState("price");
  const particlesInit = async (engine) => {
  await loadSlim(engine);
};
const handleGetLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setDetectingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        const detectedCity =
          data.address.city ||
          data.address.town ||
          data.address.state ||
          "";

        setCity(detectedCity);
      } catch (err) {
        console.error("Location fetch error", err);
      } finally {
        setDetectingLocation(false);
      }
    },
    () => {
      setDetectingLocation(false);
      alert("Location permission denied");
    }
  );
};

  
  useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setDarkMode(true);
  }
}, []);
useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);
useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        "https://food-price-compare-1.onrender.com/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      setIsLoggedIn(true);

      // 🔥 IMPORTANT — Load history from DB
      setHistory(res.data.searchHistory || []);

    } catch (err) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  fetchUser();
}, []);
const handleLogin = async () => {
  try {
    const res = await axios.post(
      "https://food-price-compare-1.onrender.com/login",
      { email, password }
    );

    const token = res.data.token;
    localStorage.setItem("token", token);

    // 🔥 Fetch user after login
    const userRes = await axios.get(
      "https://food-price-compare-1.onrender.com/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(userRes.data);
    setIsLoggedIn(true);
    setAuthError("");

    // 🔥 ADD THIS — load history
    setHistory(userRes.data.searchHistory || []);

  } catch (err) {
    setAuthError("Invalid email or password");
  }
};
const handleLogout = () => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  setUser(null); 
};

 const handleCompare = async () => {
  if (!item || !city) {
    setError("Please enter food item and city.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setError("Please login first to compare prices.");
    return;
  }

  setError("");
  setLoading(true);
  setResult(null);

  try {
    const response = await axios.post(
      "https://food-price-compare-1.onrender.com/compare",
      { item, city, serviceType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setResult(response.data);
    const zomatoBest = response.data.zomatoList?.reduce((a, b) =>
  a.price < b.price ? a : b
);

const swiggyBest = response.data.swiggyList?.reduce((a, b) =>
  a.price < b.price ? a : b
);

let winner = null;
let bestPrice = null;

if (zomatoBest && swiggyBest) {
  if (zomatoBest.price < swiggyBest.price) {
    winner = "zomato";
    bestPrice = zomatoBest.price;
  } else {
    winner = "swiggy";
    bestPrice = swiggyBest.price;
  }
}

    console.log("API RESPONSE:", response.data);

    // 🔥 Save search without blocking compare
    // 🔥 Save search and then refresh history
await axios.post(
  "https://food-price-compare-1.onrender.com/save-search",
  {
    item,
    city,
    serviceType,
    winner,
    bestPrice
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)
.then(async () => {
  // Fetch updated user to get new searchHistory
  const res = await axios.get(
    "https://food-price-compare-1.onrender.com/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setHistory(res.data.searchHistory || []);
})
.catch(err => console.log("Save failed:", err.response?.data));
  } catch (err) {
    console.log("Compare failed:", err.response?.data);
    setError("Unable to fetch prices. Please try again.");
  } finally {
    setLoading(false);
  }
};
const handleClearHistory = async () => {
  const token = localStorage.getItem("token");

  try {
    await axios.delete(
      "https://food-price-compare-1.onrender.com/clear-history",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setHistory([]);

  } catch (err) {
    console.log("Failed to clear history");
  }
};
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-slate-100 via-white to-blue-50"
      }`}
    >
      {winner && (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="fixed top-6 right-6 z-50"
  >
    <div
      className={`px-5 py-2 rounded-full shadow-2xl text-sm font-semibold backdrop-blur-md border ${
        winner === "zomato"
          ? "bg-red-500/20 text-red-300 border-red-400/30 shadow-red-500/40"
          : "bg-orange-500/20 text-orange-300 border-orange-400/30 shadow-orange-500/40"
      }`}
    >
      🏆 {winner === "zomato" ? "Zomato Wins" : "Swiggy Wins"}
    </div>
  </motion.div>
)}
      {darkMode && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            background: { color: "transparent" },
            particles: {
              number: { value: 60 },
              color: { value: "#ffffff" },
              size: { value: 6 },
              opacity: { value: 0.8 },
              move: {
                enable: true,
                speed: 1,
              },
            },
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {darkMode && (
        <>
          <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse top-[-100px] left-[-100px]" />
          <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl animate-pulse bottom-[-100px] right-[-100px]" />
        </>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex flex-col items-center pt-4 px-4">
        <h2 className="text-xl font-bold">
          {darkMode ? "DARK MODE ACTIVE" : "LIGHT MODE ACTIVE"}
        </h2>

        {/* Insight bar */}
        {serviceType === "food" &&
          result?.zomatoList &&
          result?.swiggyList && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden lg:flex justify-center mt-4"
            >
              <div
                className={`px-6 py-3 rounded-xl shadow-lg text-sm font-medium ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                {(() => {
                  const zomatoBest = result.zomatoList.reduce((a, b) =>
                    a.price < b.price ? a : b
                  );
                  const swiggyBest = result.swiggyList.reduce((a, b) =>
                    a.price < b.price ? a : b
                  );
                  const zomatoFastest = result.zomatoList.reduce((a, b) =>
                    a.time < b.time ? a : b
                  );
                  const swiggyFastest = result.swiggyList.reduce((a, b) =>
                    a.time < b.time ? a : b
                  );
                  const priceDifference = Math.abs(
                    zomatoBest.price - swiggyBest.price
                  );
                  const timeDifference = Math.abs(
                    zomatoFastest.time - swiggyFastest.time
                  );

                  return (
                    <div className="flex flex-col items-center gap-1">
                      <span>
                        {zomatoBest.price < swiggyBest.price
                          ? `🔥 Zomato saves you ₹${priceDifference}`
                          : swiggyBest.price < zomatoBest.price
                          ? `🔥 Swiggy saves you ₹${priceDifference}`
                          : "⚖️ Both platforms have similar pricing"}
                      </span>
                      <span className="text-xs opacity-80">
                        {zomatoFastest.time < swiggyFastest.time
                          ? `⚡ Zomato delivers ${timeDifference} mins faster`
                          : swiggyFastest.time < zomatoFastest.time
                          ? `⚡ Swiggy delivers ${timeDifference} mins faster`
                          : "⏱ Delivery time is similar on both platforms"}
                      </span>
                      <div className="w-full mt-3">
                        {(() => {
                          const maxPrice = Math.max(
                            zomatoBest.price,
                            swiggyBest.price
                          );
                          const zomatoPercent =
                            (zomatoBest.price / maxPrice) * 100;
                          const swiggyPercent =
                            (swiggyBest.price / maxPrice) * 100;
                          return (
                            <div className="space-y-2 mt-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Zomato</span>
                                  <span>₹{zomatoBest.price}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-red-500 transition-all duration-700"
                                    style={{ width: `${zomatoPercent}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Swiggy</span>
                                  <span>₹{swiggyBest.price}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-500 transition-all duration-700"
                                    style={{ width: `${swiggyPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

        {/* Savings */}
        {savingsData && savingsData.perOrder > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mt-4 p-4 rounded-xl text-sm ${
              darkMode
                ? "bg-green-500/10 border border-green-400/30 text-green-300"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            <div className="font-semibold mb-1">💰 Smart Savings Insight</div>
            <div>You save ₹{savingsData.perOrder} this order.</div>
            <div>~ ₹{savingsData.monthly} monthly (8 orders).</div>
            <div>~ ₹{savingsData.yearly} yearly.</div>
            <div>{savingsData.percentage}% cheaper than competitor.</div>
          </motion.div>
        )}

        {/* Mobile Platform Toggle */}
        {serviceType === "food" && result && (
          <div className="flex lg:hidden justify-center gap-4 mt-4 mb-2">
            <button
              onClick={() => setMobilePlatform("zomato")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                mobilePlatform === "zomato"
                  ? "bg-red-500 text-white"
                  : "bg-white/20 text-gray-600"
              }`}
            >
              Zomato
            </button>
            <button
              onClick={() => setMobilePlatform("swiggy")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                mobilePlatform === "swiggy"
                  ? "bg-orange-500 text-white"
                  : "bg-white/20 text-gray-600"
              }`}
            >
              Swiggy
            </button>
          </div>
        )}
      </div>

      {/* ── THREE-COLUMN ROW: Zomato | Center Card | Swiggy ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-8 px-4 lg:px-8 py-6">

        {/* Zomato Panel */}
        {serviceType === "food" && result?.zomatoList && (
          <div
            className={`${mobilePlatform === "zomato" ? "block" : "hidden"} 
            lg:block w-full lg:w-80 rounded-2xl p-4 lg:max-h-[550px] lg:overflow-y-auto transition-all duration-500 ${
              darkMode
                ? "bg-white/5 backdrop-blur-md text-slate-200"
                : "bg-white shadow-md text-slate-800"
            } ${
              winner === "zomato"
                ? "shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                : ""
            }`}
          >
            <h3
              className={`sticky top-0 z-10 py-3 text-center font-bold backdrop-blur-md ${
                darkMode
                  ? "bg-gray-900/80 text-red-400"
                  : "bg-white/80 text-orange-500"
              }`}
            >
              Zomato
            </h3>

            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              [...result.zomatoList]
                .sort((a, b) => a.price - b.price)
                .map((rest, index) => (
                  <div
                    key={index}
                    className={`w-full py-3 border-b text-sm transition-all duration-300 
                    hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 
                    cursor-pointer ${
                      index === 0
                        ? "bg-green-500/10 border-green-400/30 rounded-lg"
                        : "border-white/10"
                    }`}
                  >
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className={`relative w-full p-4 mb-4 rounded-2xl overflow-hidden transition-all duration-300 ${
                        darkMode
                          ? "bg-white/5 backdrop-blur-md border border-white/10"
                          : "bg-white shadow-md border border-slate-200"
                      } ${
                        index === 0
                          ? "ring-2 ring-green-400 shadow-green-400/30"
                          : ""
                      }`}
                    >
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                        <div className="overflow-hidden rounded-lg">
                          <img
                            src={`https://loremflickr.com/600/400/${item}?random=${index}`}
                            alt={rest.name}
                            className="w-full h-40 object-cover rounded-lg transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-3 text-white font-semibold text-sm">
                          {rest.name}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          ⭐ {rest.rating}
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            BEST DEAL
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm opacity-80">⏱ {rest.time} mins</div>
                        <div className="text-lg font-bold text-blue-500">
                          ₹<CountUp end={rest.price} duration={1} />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>
                    </motion.div>

                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-left">{rest.name}</span>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
                            BEST
                          </span>
                        )}
                        <span className="font-semibold">₹{rest.price}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 opacity-80 w-full">
                      <span>⭐ {rest.rating}</span>
                      <span>{rest.time} mins</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── CENTER CARD ── */}
        <div
          className={`relative z-10 w-full max-w-lg rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-slate-800"
          }`}
        >
          <div className="flex justify-end mb-4 gap-2">
  {isLoggedIn && (
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-red-500 text-white rounded-full text-sm"
    >
      Logout
    </button>
  )}

  <button
    onClick={() => setDarkMode(!darkMode)}
    className="text-sm px-3 py-1 rounded-full border transition"
  >
    {darkMode ? "☀ Light" : "🌙 Dark"}
  </button>
</div>

          

          {/* 🔐 LOGIN BLOCK START */}
  {!isLoggedIn && (
  <div className="mb-6 space-y-3">
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl outline-none transition ${
        darkMode
          ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-400"
          : "bg-white text-black placeholder-gray-500 border border-slate-300 focus:ring-2 focus:ring-blue-500"
      }`}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl outline-none transition ${
        darkMode
          ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-400"
          : "bg-white text-black placeholder-gray-500 border border-slate-300 focus:ring-2 focus:ring-blue-500"
      }`}
    />

    <button
      onClick={handleLogin}
      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 
                 text-white py-3 rounded-xl font-semibold 
                 hover:scale-[1.02] transition-all duration-300"
    >
      Login
    </button>

    {authError && (
      <p className="text-red-500 text-sm">{authError}</p>
    )}
  </div>
)}
  {/* 🔐 LOGIN BLOCK END */}
{/* Service Selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["food", "grocery", "ride"].map((type) => (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  serviceType === type
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {type === "food" && "🍔 Food"}
                {type === "grocery" && "🛒 Grocery"}
                {type === "ride" && "🚗 Ride"}
              </button>
            ))}
          </div>
          {user && (
  <div className="mb-4 text-sm text-green-400 font-medium">
    👋 Welcome, {user.name}
  </div>
)}
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              PriceCompare
            </h1>
            <p className={`mt-2 ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
              Compare food prices instantly
            </p>
            <div className="mt-3 flex justify-center">
              <span
                className={`text-xs px-3 py-1 rounded-full transition ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                Live Price Comparison Engine
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Food item (e.g. Pizza)"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 outline-none transition ${
                darkMode
                  ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-400"
                  : "bg-white text-black placeholder-gray-500 border border-slate-300 focus:ring-2 focus:ring-blue-500"
              }`}
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="City (e.g. Indore)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none transition ${
                  darkMode
                    ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-400"
                    : "bg-white text-black placeholder-gray-500 border border-slate-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />

              <motion.button
                type="button"
                onClick={handleGetLocation}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`relative px-4 py-3 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
                  darkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${detectingLocation ? "shadow-[0_0_20px_rgba(59,130,246,0.6)]" : ""}`}
              >
                {detectingLocation ? (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-white"
                  >
                    📡
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    📍
                  </motion.span>
                )}
                {detectingLocation && (
                  <span className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-ping opacity-50"></span>
                )}
              </motion.button>
            </div>

            <button
              onClick={handleCompare}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2
              font-semibold py-3 rounded-xl text-white
              transition-all duration-300
              bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600
              bg-[length:200%_200%]
              animate-[gradient_4s_ease_infinite]
              hover:scale-[1.03]
              hover:shadow-xl hover:shadow-blue-500/40
              disabled:opacity-60`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Comparing..." : "Compare Prices"}
            </button>
{loading && (
  <p className="text-xs text-blue-400 mb-2">
    Loading from history...
  </p>
)}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
  <p className="text-sm text-slate-500">Recent Searches</p>

  <button
    onClick={handleClearHistory}
    className="text-xs text-red-400 hover:text-red-500"
  >
    Clear
  </button>
</div>
                <div className="flex flex-wrap gap-2">
                  {history.map((search, index) => (
                    <button
                      key={index}
                      onClick={async () => {

  setLoading(true);   // 🔥 ADD THIS
  setError("");       // 🔥 clear old errors

  setItem(search.item);
  setCity(search.city);

  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      "https://food-price-compare-1.onrender.com/compare",
      {
        item: search.item,
        city: search.city,
        serviceType: search.serviceType || "food"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setResult(response.data);
  } catch (err) {
    console.log("History compare failed");
    setError("Failed to load saved search.");
  } finally {
    setLoading(false);   // 🔥 ADD THIS
  }
}}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        darkMode
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                      }`}
                    >
                      {search.item} - {search.city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {/* Results for non-food */}
          {result && result.serviceType !== "food" && (() => {
            const maxPrice = Math.max(result.zomato, result.swiggy);
            const difference = Math.abs(result.zomato - result.swiggy);
            const timeDifference = Math.abs(result.zomatoTime - result.swiggyTime);

            let insight = "";
            if (result.cheapest === result.fastest) {
              insight = `${result.cheapest.charAt(0).toUpperCase() + result.cheapest.slice(1)} is both cheaper and faster. Best choice!`;
            } else if (difference <= 10) {
              insight = "Both platforms offer similar pricing. Choose based on delivery time.";
            } else if (result.cheapest === "zomato") {
              insight = `Zomato is ₹${difference} cheaper but ${timeDifference} mins difference in delivery.`;
            } else {
              insight = `Swiggy is ₹${difference} cheaper but ${timeDifference} mins difference in delivery.`;
            }

            const cheaperPlatform = result.zomato < result.swiggy ? "Zomato" : "Swiggy";
            const chartData = [
              { name: "Zomato", price: result.zomato },
              { name: "Swiggy", price: result.swiggy },
            ];

            return (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-8 space-y-6"
              >
                <div className="text-center bg-white/10 border border-white/20 rounded-xl p-4">
                  <p className="text-sm text-slate-300">
                    💰 {cheaperPlatform} is ₹{difference} cheaper
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-sm ${
                    darkMode
                      ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  💡 {insight}
                </div>

                <PriceCard
                  name="Zomato"
                  logo="https://b.zmtcdn.com/images/logo/zomato_logo_2017.png"
                  price={result.zomato}
                  time={result.zomatoTime}
                  cheapest={result.cheapest === "zomato"}
                  maxPrice={maxPrice}
                />
                <PriceCard
                  name="Swiggy"
                  logo="https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png"
                  price={result.swiggy}
                  time={result.swiggyTime}
                  cheapest={result.cheapest === "swiggy"}
                  maxPrice={maxPrice}
                />

                <div
                  className={`mt-6 p-4 rounded-xl flex justify-center ${
                    darkMode
                      ? "bg-white/10 border border-white/20"
                      : "bg-slate-100 border border-slate-300"
                  }`}
                >
                  <BarChart width={300} height={180} data={chartData}>
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="price" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </div>
              </motion.div>
            );
          })()}
        </div>
        {/* ── END CENTER CARD ── */}

        {/* Swiggy Panel */}
        {serviceType === "food" && result?.swiggyList && (
          <div
            className={`${mobilePlatform === "swiggy" ? "block" : "hidden"} 
            lg:block w-full lg:w-80 rounded-2xl p-4 lg:max-h-[550px] lg:overflow-y-auto transition-all duration-500 ${
              darkMode
                ? "bg-white/5 backdrop-blur-md text-slate-200"
                : "bg-white shadow-md text-slate-800"
            } ${
              winner === "swiggy"
                ? "shadow-[0_0_40px_rgba(249,115,22,0.4)]"
                : ""
            }`}
          >
            <h3
              className={`sticky top-0 z-10 py-3 text-center font-bold backdrop-blur-md ${
                darkMode
                  ? "bg-gray-900/80 text-orange-400"
                  : "bg-white/80 text-orange-500"
              }`}
            >
              Swiggy
            </h3>

            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              [...result.swiggyList]
                .sort((a, b) => a.price - b.price)
                .map((rest, index) => (
                  <div
                    key={index}
                    className={`w-full py-3 border-b text-sm transition-all duration-300 
                    hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 
                    cursor-pointer ${
                      index === 0
                        ? "bg-green-500/10 border-green-400/30 rounded-lg"
                        : "border-white/10"
                    }`}
                  >
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className={`relative w-full p-4 mb-4 rounded-2xl overflow-hidden transition-all duration-300 ${
                        darkMode
                          ? "bg-white/5 backdrop-blur-md border border-white/10"
                          : "bg-white shadow-md border border-slate-200"
                      } ${
                        index === 0
                          ? "ring-2 ring-green-400 shadow-green-400/30"
                          : ""
                      }`}
                    >
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                        <div className="overflow-hidden rounded-lg">
                          <img
                            src={`https://loremflickr.com/600/400/food?random=${index}`}
                            alt={rest.name}
                            className="w-full h-40 object-cover rounded-lg transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-3 text-white font-semibold text-sm">
                          {rest.name}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          ⭐ {rest.rating}
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            BEST DEAL
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm opacity-80">⏱ {rest.time} mins</div>
                        <div className="text-lg font-bold text-blue-500">
                          ₹<CountUp end={rest.price} duration={1} />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>
                    </motion.div>

                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-left">{rest.name}</span>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
                            BEST
                          </span>
                        )}
                        <span className="font-semibold">₹{rest.price}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 opacity-80 w-full">
                      <span>⭐ {rest.rating}</span>
                      <span>{rest.time} mins</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

      </div>
      {/* ── END THREE-COLUMN ROW ── */}

    </div>
  );
}

function PriceCard({ name, price, cheapest, maxPrice, logo, time }) {
  const percentage = (price / maxPrice) * 100;

  return (
    <div
      className={`relative overflow-hidden flex flex-col p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
        cheapest
          ? "bg-green-500/20 border border-green-400 shadow-lg shadow-green-500/30"
          : "bg-white/10 border border-white/20"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logo} alt={name} className="w-5 h-5 object-contain" />
          <span className="text-lg font-semibold">{name}</span>
        </div>
        {cheapest && (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
            BEST PRICE
          </span>
        )}
      </div>

      <div className="mt-3 text-3xl font-bold">
        ₹<CountUp end={price} duration={1} separator="," />
      </div>
      <p className="text-sm mt-1 opacity-80">⏱ {time} mins</p>

      <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            cheapest ? "bg-green-400" : "bg-blue-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative w-full p-4 mb-6 rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md">
      <div className="h-40 rounded-xl bg-slate-300 mb-3" />
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-300 rounded" />
        <div className="h-4 w-16 bg-slate-300 rounded" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>
    </div>
  );
}
