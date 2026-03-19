import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { GoogleLogin } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Verified from "./pages/Verified";
import Dashboard from "./pages/Dashboard";
import HeaderSection from "./components/HeaderSection";
import GroceryDashboard from "./pages/GroceryDashboard";
import RideDashboard from "./pages/RideDashboard";
import Favourites from "./pages/Favourites";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import VerificationFailed from "./pages/VerificationFailed";
import { useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import RideMap from "./components/RideMap";
import { Heart } from "lucide-react";
import Settings from "./pages/Settings";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Font injection ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1,h2,.brand { font-family: 'Syne', sans-serif; }

    :root {
      --bg: #07091a;
      --surface: rgba(255,255,255,0.04);
      --surface-hover: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.09);
      --border-glow: rgba(79,142,247,0.35);
      --blue: #4F8EF7;
      --blue-dim: rgba(79,142,247,0.15);
      --orange: #FF6B35;
      --orange-dim: rgba(255,107,53,0.15);
      --red: #EF4444;
      --green: #22c55e;
      --green-dim: rgba(34,197,94,0.15);
      --purple: #a855f7;
      --yellow: #eab308;
      --text: #e2e8f0;
      --text-muted: rgba(226,232,240,0.5);
      --radius: 16px;
    }

    body { background: var(--bg); }

    .glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
    }
    .glass-hover:hover {
      background: var(--surface-hover);
      border-color: var(--border-glow);
    }
    .neon-blue { box-shadow: 0 0 30px rgba(79,142,247,0.25); }
    .neon-orange { box-shadow: 0 0 30px rgba(255,107,53,0.25); }
    .neon-green { box-shadow: 0 0 30px rgba(34,197,94,0.25); }
    .neon-red { box-shadow: 0 0 30px rgba(239,68,68,0.25); }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-effect::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
      animation: shimmer 2s infinite;
    }
    @keyframes gradient-shift {
      0%,100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .btn-primary {
      background: linear-gradient(135deg, #4F8EF7, #6366f1, #4F8EF7);
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    input, select {
      color-scheme: dark;
    }
    input::placeholder { color: rgba(226,232,240,0.3) !important; }

    /* Light mode overrides */
    .light-mode {
      --bg: #f0f4ff;
      --surface: rgba(255,255,255,0.85);
      --surface-hover: rgba(255,255,255,0.95);
      --border: rgba(0,0,0,0.08);
      --border-glow: rgba(79,142,247,0.3);
      --text: #1e293b;
      --text-muted: rgba(30,41,59,0.5);
    }
    .light-mode body { background: var(--bg); }
    .light-mode input::placeholder { color: rgba(30,41,59,0.35) !important; }
  `}</style>
);

function getBestRestaurant(list) {
  if (!list || list.length === 0) return null;
  return list.reduce((a, b) => (a.price < b.price ? a : b));
}

export default function App() {
  const [user, setUser] = useState(null);
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const location = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const [serviceType, setServiceType] = useState(
    location.state?.service || "food"
  );
  useEffect(() => {
    if (location.state?.service) {
      setServiceType(location.state.service);
    }
  }, [location]);

  const isBasketMode =
    serviceType === "grocery" && result?.basket && result.basket.length > 0;

  const basketWinner = isBasketMode
    ? Object.entries(result.totals).reduce((a, b) =>
        a[1] < b[1] ? a : b
      )[0]
    : null;

  const [loading, setLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingCompare, setPendingCompare] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [history, setHistory] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState("zomato");

  const groceryImages = {
    milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    bread: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
    rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    eggs: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7",
    vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999",
    fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb",
    tomato: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
  };

  const categoryColors = {
    dairy: "bg-blue-500",
    bakery: "bg-yellow-500",
    fruits: "bg-red-500",
    vegetables: "bg-green-500",
    pantry: "bg-orange-500",
    other: "bg-gray-500",
  };

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (systemDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const winner =
    serviceType === "food" && result
      ? (() => {
          const zomatoBest =
            result.zomatoList && result.zomatoList.length > 0
              ? result.zomatoList.reduce((a, b) =>
                  a.score < b.score ? a : b
                )
              : null;
          const swiggyBest =
            result.swiggyList && result.swiggyList.length > 0
              ? result.swiggyList.reduce((a, b) =>
                  a.score < b.score ? a : b
                )
              : null;
          if (!zomatoBest && swiggyBest) return "swiggy";
          if (!swiggyBest && zomatoBest) return "zomato";
          if (!zomatoBest && !swiggyBest) return null;
          if (zomatoBest.price < swiggyBest.price) return "zomato";
          if (swiggyBest.price < zomatoBest.price) return "swiggy";
          return null;
        })()
      : null;

  const savingsData =
    serviceType === "food" && result
      ? (() => {
          const groceryInsights =
            serviceType === "grocery" && result
              ? (() => {
                  const platforms = [
                    { name: "Zepto", data: result.zeptoList },
                    { name: "Blinkit", data: result.blinkitList },
                    { name: "Instamart", data: result.instamartList },
                    { name: "JioMart", data: result.jiomartList },
                  ];
                  const items = platforms
                    .map((p) => ({ name: p.name, item: p.data?.[0] }))
                    .filter((p) => p.item);
                  if (items.length < 2) return null;
                  const cheapest = items.reduce((a, b) =>
                    a.item.price < b.item.price ? a : b
                  );
                  const fastest = items.reduce((a, b) =>
                    a.item.time < b.item.time ? a : b
                  );
                  const mostExpensive = items.reduce((a, b) =>
                    a.item.price > b.item.price ? a : b
                  );
                  const savings = mostExpensive.item.price - cheapest.item.price;
                  return {
                    cheapestPlatform: cheapest.name,
                    fastestPlatform: fastest.name,
                    savings,
                  };
                })()
              : null;

          const zomatoBest = getBestRestaurant(result.zomatoList);
          const swiggyBest = getBestRestaurant(result.swiggyList);
          if (!zomatoBest || !swiggyBest) return null;
          const cheaperPrice = Math.min(zomatoBest.price, swiggyBest.price);
          const expensivePrice = Math.max(zomatoBest.price, swiggyBest.price);
          const difference = expensivePrice - cheaperPrice;
          return {
            perOrder: difference,
            monthly: difference * 8,
            yearly: difference * 96,
            percentage: ((difference / expensivePrice) * 100).toFixed(1),
          };
        })()
      : null;

  const groceryWinner =
    serviceType === "grocery" && result
      ? (() => {
          const platforms = [
            { name: "zepto", data: result.zeptoList },
            { name: "blinkit", data: result.blinkitList },
            { name: "instamart", data: result.instamartList },
            { name: "jiomart", data: result.jiomartList },
          ];
          let best = null;
          platforms.forEach((p) => {
            const item = p.data?.[0];
            if (!item) return;
            if (!best || item.price < best.price) {
              best = { platform: p.name, price: item.price };
            }
          });
          return best?.platform || null;
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
          // ✅ clean full address (better than display_name)
const fullAddress = [
  data.address?.suburb,
  data.address?.road,
  data.address?.city
].filter(Boolean).join(", ");

// ✅ fallback city
const detectedCity =
  data.address.city ||
  data.address.town ||
  data.address.state ||
  "";

if (serviceType === "ride") {
  setCity(fullAddress); // 🔥 full pickup location
} else {
  setCity(detectedCity); // normal behavior
}
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
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (location.state?.item && location.state?.city) {
      const { item, city, serviceType } = location.state;
      setItem(item);
      setCity(city);
      if (serviceType) setServiceType(serviceType);
      setTimeout(() => {
        handleCompare(item, city);
      }, 200);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const userRes = await axios.get(
          "https://food-price-compare-production.up.railway.app/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userRes.data);
        setIsLoggedIn(true);
        setHistory(userRes.data.searchHistory || []);
        setFavourites(
          (userRes.data.favourites || []).map(
            (f) => f.name + f.platform + f.city
          )
        );
        const insightsRes = await axios.get(
          "https://food-price-compare-production.up.railway.app/insights",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInsights(insightsRes.data);
      } catch (err) {
        console.log("Auto login failed");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setHistory([]);
        setInsights(null);
      }
    };
    autoLogin();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setAuthError("");
    try {
      const res = await axios.post(
        "https://food-price-compare-production.up.railway.app/login",
        { email, password }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      const userRes = await axios.get(
        "https://food-price-compare-production.up.railway.app/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(userRes.data);
      setIsLoggedIn(true);
      setFavourites(
        (userRes.data.favourites || []).map(
          (f) => f.name + f.platform + f.city
        )
      );
      if (pendingCompare) {
        setPendingCompare(false);
        handleCompare();
      }
      setShowLoginPopup(false);
    } catch (err) {
      setAuthError(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoginLoading(true);
    setAuthError("");
    try {
      await axios.post(
        "https://food-price-compare-production.up.railway.app/signup",
        { name, email, password }
      );
      const res = await axios.post(
        "https://food-price-compare-production.up.railway.app/login",
        { email, password }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      const userRes = await axios.get(
        "https://food-price-compare-production.up.railway.app/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(userRes.data);
      setIsLoggedIn(true);
      setHistory(userRes.data.searchHistory || []);
      setShowLoginPopup(false);
      setIsRegisterMode(false);
      setFavourites(
        (userRes.data.favourites || []).map(
          (f) => f.name + f.platform + f.city
        )
      );
    } catch (err) {
      setAuthError(err.response?.data?.message || "Signup failed");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setHistory([]);
    setInsights(null);
    setResult(null);
    setItem("");
    setCity("");
  };

  const addFavourite = async (name, platform, city, price, image) => {
    const token = localStorage.getItem("token");
    const key = name + platform + city;
    const isAlreadyFav = favourites.includes(key);
    setFavourites((prev) =>
      isAlreadyFav ? prev.filter((f) => f !== key) : [...prev, key]
    );
    try {
      await axios.post(
        "https://food-price-compare-production.up.railway.app/add-favourite",
        { name, platform, city, price, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setFavourites((prev) =>
        isAlreadyFav ? [...prev, key] : prev.filter((f) => f !== key)
      );
      console.log("Favourite toggle failed");
    }
  };

  const handleCompare = async (customItem, customCity) => {
   let searchItem = customItem || item;
let searchCity = customCity || city;

// 🔥 FIX FOR RIDE
if (serviceType === "ride") {
  searchItem = item;   // drop
  searchCity = city;   // pickup
}
    if (
  (serviceType === "food" || serviceType === "grocery") &&
  (!searchItem || !searchCity)
) {
  setError("Please enter item and city.");
  return;
}

if (serviceType === "ride" && (!item || !city)) {
  setError("Please enter pickup and drop location.");
  return;
}
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingCompare(true);
      setShowLoginPopup(true);
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    console.log("SENDING DATA:", {
  item: searchItem,
  city: searchCity,
  serviceType
});
    try {
      const response = await axios.post(
        "https://food-price-compare-production.up.railway.app/compare",
        { item: searchItem, city: searchCity, serviceType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      console.log("API RESPONSE:", response.data);
      let winner = null;
      let bestPrice = null;
      if (response.data.serviceType === "food") {
        const zomatoBest = getBestRestaurant(response.data.zomatoList);
        const swiggyBest = getBestRestaurant(response.data.swiggyList);
        if (!zomatoBest && swiggyBest) {
          winner = "swiggy";
          bestPrice = swiggyBest.price;
        } else if (!swiggyBest && zomatoBest) {
          winner = "zomato";
          bestPrice = zomatoBest.price;
        } else if (zomatoBest && swiggyBest) {
          if (zomatoBest.price < swiggyBest.price) {
            winner = "zomato";
            bestPrice = zomatoBest.price;
          } else {
            winner = "swiggy";
            bestPrice = swiggyBest.price;
          }
        }
      }
      await axios
        .post(
          "https://food-price-compare-production.up.railway.app/save-search",
          { item: searchItem, city: searchCity, serviceType, winner, bestPrice },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(async () => {
          const res = await axios.get(
            "https://food-price-compare-production.up.railway.app/me",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(res.data);
          setHistory(res.data.searchHistory || []);
          setFavourites(
            (res.data.favourites || []).map(
              (f) => f.name + f.platform + f.city
            )
          );
        })
        
        .catch((err) => console.log("Save failed:", err.response?.data));
    } catch (err) {
      console.log("Compare failed:", err);
      setError("Unable to fetch prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        "https://food-price-compare-production.up.railway.app/clear-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory([]);
    } catch (err) {
      console.log("Failed to clear history");
    }
  };

  /* ─── color helpers ─── */
  const dm = darkMode;

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/grocery-dashboard"
        element={<GroceryDashboard theme={theme} />}
      />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/history" element={<History />} />
      <Route 
  path="/ride-dashboard" 
  element={<RideDashboard theme={theme} />} 
/>
      <Route path="/favourites" element={<Favourites />} />
      <Route
        path="/settings"
        element={<Settings theme={theme} setTheme={setTheme} />}
      />

      <Route
        path="/"
        element={
          <>
            <FontStyle />
            <div
              className={`relative min-h-screen w-full overflow-x-hidden transition-all duration-500 ${
                dm
                  ? "bg-[#07091a] text-[#e2e8f0]"
                  : "bg-[#f0f4ff] text-[#1e293b]"
              }`}
            >
              {/* ── ambient blobs ── */}
              <div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                style={{ zIndex: 0 }}
              >
                <div
                  className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 -top-32 -left-32 transition-all ${
                    dm ? "bg-blue-600" : "bg-blue-300"
                  }`}
                />
                <div
                  className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 -bottom-32 -right-32 transition-all ${
                    dm ? "bg-purple-700" : "bg-indigo-300"
                  }`}
                />
                <div
                  className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 top-1/2 left-1/2 transition-all ${
                    dm ? "bg-orange-600" : "bg-orange-300"
                  }`}
                />
              </div>

              {/* ── particles (dark only) ── */}
              {dm && (
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  options={{
                    fullScreen: { enable: false },
                    background: { color: "transparent" },
                    particles: {
                      number: { value: 40 },
                      color: { value: ["#4F8EF7", "#a855f7", "#22c55e"] },
                      size: { value: { min: 1, max: 3 } },
                      opacity: { value: { min: 0.1, max: 0.5 } },
                      move: { enable: true, speed: 0.5 },
                      links: {
                        enable: true,
                        color: "#4F8EF7",
                        opacity: 0.1,
                        distance: 120,
                      },
                    },
                  }}
                  className="absolute inset-0 z-0"
                />
              )}

              {/* ── Winner badge ── */}
              <AnimatePresence>
                {(winner || groceryWinner || basketWinner) && (
                  <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed top-5 right-5 z-50"
                  >
                    <div
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border backdrop-blur-md ${
                        dm
                          ? "bg-green-500/15 text-green-300 border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          : "bg-green-50 text-green-700 border-green-300 shadow-lg"
                      }`}
                    >
                      <span className="text-base">🏆</span>
                      {winner
                        ? winner === "zomato"
                          ? "Zomato Wins"
                          : "Swiggy Wins"
                        : basketWinner
                        ? `${
                            basketWinner.charAt(0).toUpperCase() +
                            basketWinner.slice(1)
                          } Basket Cheapest`
                        : `${
                            groceryWinner.charAt(0).toUpperCase() +
                            groceryWinner.slice(1)
                          } Wins`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Top insight bars ── */}
              <div className="relative z-10 flex flex-col items-center pt-5 px-4 gap-3">
                {/* Food insight bar */}
                {serviceType === "food" &&
                  result?.zomatoList &&
                  result?.swiggyList && (
                    <motion.div
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="hidden lg:flex justify-center w-full max-w-2xl"
                    >
                      <div
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-medium border ${
                          dm
                            ? "bg-blue-500/10 text-blue-200 border-blue-400/20"
                            : "bg-white text-slate-700 border-slate-200 shadow-md"
                        }`}
                      >
                        {(() => {
                          const zomatoBest = getBestRestaurant(
                            result.zomatoList
                          );
                          const swiggyBest = getBestRestaurant(
                            result.swiggyList
                          );
                          const zomatoFastest =
                            result.zomatoList.length > 0
                              ? result.zomatoList.reduce((a, b) =>
                                  a.time < b.time ? a : b
                                )
                              : null;
                          const swiggyFastest =
                            result.swiggyList.length > 0
                              ? result.swiggyList.reduce((a, b) =>
                                  a.time < b.time ? a : b
                                )
                              : null;
                          if (
                            !zomatoBest ||
                            !swiggyBest ||
                            !zomatoFastest ||
                            !swiggyFastest
                          )
                            return null;
                          const priceDifference = Math.abs(
                            zomatoBest.price - swiggyBest.price
                          );
                          const timeDifference = Math.abs(
                            zomatoFastest.time - swiggyFastest.time
                          );
                          return (
                            <div className="flex flex-col items-center gap-2">
                              <span className="font-semibold">
                                {zomatoBest.price < swiggyBest.price
                                  ? `🔥 Zomato saves you ₹${priceDifference}`
                                  : swiggyBest.price < zomatoBest.price
                                  ? `🔥 Swiggy saves you ₹${priceDifference}`
                                  : "⚖️ Both platforms have similar pricing"}
                              </span>
                              <span className={`text-xs ${dm ? "opacity-70" : "text-slate-500"}`}>
                                {zomatoFastest.time < swiggyFastest.time
                                  ? `⚡ Zomato delivers ${timeDifference} mins faster`
                                  : swiggyFastest.time < zomatoFastest.time
                                  ? `⚡ Swiggy delivers ${timeDifference} mins faster`
                                  : "⏱ Delivery time is similar on both platforms"}
                              </span>
                              <div className="w-full mt-2 space-y-2">
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
                                    <>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="font-medium text-red-400">Zomato</span>
                                          <span className="font-bold">₹{zomatoBest.price}</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${dm ? "bg-white/10" : "bg-slate-100"}`}>
                                          <div
                                            className="h-full bg-red-500 rounded-full transition-all duration-700"
                                            style={{ width: `${zomatoPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="font-medium text-orange-400">Swiggy</span>
                                          <span className="font-bold">₹{swiggyBest.price}</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${dm ? "bg-white/10" : "bg-slate-100"}`}>
                                          <div
                                            className="h-full bg-orange-500 rounded-full transition-all duration-700"
                                            style={{ width: `${swiggyPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}

                {/* Grocery insight bar */}
                {serviceType === "grocery" && result && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="hidden lg:flex justify-center w-full max-w-2xl"
                  >
                    <div
                      className={`w-full px-6 py-4 rounded-2xl text-sm font-medium border ${
                        dm
                          ? "bg-green-500/10 text-green-200 border-green-400/20"
                          : "bg-white text-slate-700 border-slate-200 shadow-md"
                      }`}
                    >
                      {(() => {
                        const itemCount = result.basket?.length || 0;
                        const totals = result.totals;
                        if (!totals) return null;
                        const platforms = [
                          { name: "Zepto", price: totals.zepto, time: 10 },
                          { name: "Blinkit", price: totals.blinkit, time: 9 },
                          { name: "Instamart", price: totals.instamart, time: 14 },
                          { name: "JioMart", price: totals.jiomart, time: 25 },
                        ];
                        if (platforms.length < 2) return null;
                        const cheapest = platforms.reduce((a, b) =>
                          a.price < b.price ? a : b
                        );
                        const fastest = platforms.reduce((a, b) =>
                          a.time < b.time ? a : b
                        );
                        const mostExpensive = platforms.reduce((a, b) =>
                          a.price > b.price ? a : b
                        );
                        const savings = mostExpensive.price - cheapest.price;
                        const colorMap = {
                          Zepto: "text-purple-400",
                          Blinkit: "text-yellow-400",
                          Instamart: "text-orange-400",
                          JioMart: "text-blue-400",
                        };
                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs ${dm ? "opacity-60" : "text-slate-400"}`}>
                              🛒 Basket ({itemCount} items)
                            </span>
                            <span className="font-semibold">
                              🔥{" "}
                              <span className={colorMap[cheapest.name]}>
                                {cheapest.name}
                              </span>{" "}
                              best price ₹{cheapest.price}
                            </span>
                            <span className={`text-xs ${dm ? "opacity-70" : "text-slate-500"}`}>
                              ⚡{" "}
                              <span className={colorMap[fastest.name]}>
                                {fastest.name}
                              </span>{" "}
                              fastest delivery {fastest.time} mins
                            </span>
                            <span className={`text-xs font-medium ${dm ? "text-green-400" : "text-green-600"}`}>
                              💰 You save ₹{savings}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Savings insight */}
                {savingsData && savingsData.perOrder > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`w-full max-w-2xl px-5 py-4 rounded-2xl text-sm border ${
                      dm
                        ? "bg-green-500/10 border-green-400/20 text-green-300"
                        : "bg-green-50 border-green-200 text-green-700 shadow-sm"
                    }`}
                  >
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-base">💰</span> Smart Savings Insight
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "This Order", value: `₹${savingsData.perOrder}` },
                        { label: "Monthly (8x)", value: `₹${savingsData.monthly}` },
                        { label: "Yearly", value: `₹${savingsData.yearly}` },
                        { label: "Cheaper by", value: `${savingsData.percentage}%` },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`px-3 py-2 rounded-xl text-center ${
                            dm ? "bg-white/5" : "bg-green-100"
                          }`}
                        >
                          <div className="font-bold text-base">{s.value}</div>
                          <div className="text-xs opacity-70">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Mobile platform toggle */}
                {serviceType === "food" && result && (
                  <div className="flex lg:hidden justify-center gap-3 mt-1">
                    {["zomato", "swiggy"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setMobilePlatform(p)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                          mobilePlatform === p
                            ? p === "zomato"
                              ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                              : "bg-orange-500 text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]"
                            : dm
                            ? "bg-white/8 text-white/60 border border-white/10"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {p === "zomato" ? "🍅 Zomato" : "🟠 Swiggy"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── THREE-COLUMN LAYOUT ── */}
              <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-6 px-4 lg:px-8 py-6">

                {/* ── LEFT: Grocery Panel (Zepto + Blinkit) ── */}
                {serviceType === "grocery" && result && (
                  <GroceryPanel
                    platforms={[
                      { name: "Zepto", price: result.basket?.[0]?.zepto, time: 10, url: "https://www.zeptonow.com/", color: "purple", borderClass: dm ? "border-purple-500/40" : "border-purple-300" },
                      { name: "Blinkit", price: result.basket?.[0]?.blinkit, time: 9, url: "https://blinkit.com/", color: "yellow", borderClass: dm ? "border-yellow-500/40" : "border-yellow-300" },
                    ]}
                    basket={result.basket}
                    groceryImages={groceryImages}
                    categoryColors={categoryColors}
                    dm={dm}
                    title="Quick Commerce"
                    titleColor="text-purple-400"
                  />
                )}

                {/* ── LEFT: Zomato Panel ── */}
                {serviceType === "food" && result?.zomatoList && (
                  <PlatformPanel
                    show={mobilePlatform === "zomato"}
                    platform="zomato"
                    label="Zomato"
                    color="red"
                    list={result.zomatoList}
                    item={item}
                    loading={loading}
                    winner={winner}
                    dm={dm}
                    favourites={favourites}
                    city={city}
                    addFavourite={addFavourite}
                  />
                )}

                {/* ── CENTER CARD ── */}
                <div
                  className={`relative z-10 w-full max-w-md lg:max-w-sm xl:max-w-md rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden ${
                    dm
                      ? "bg-[#0d1025] border border-white/[0.07] shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                      : "bg-white border border-slate-200/80 shadow-[0_25px_60px_rgba(0,0,0,0.1)]"
                  }`}
                >
                  {/* card top gradient strip */}
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />

                  <div className="p-7">
                    {/* ── Top bar: Dashboard / Logout / Theme ── */}
                    <div className="flex justify-end mb-5 gap-2 flex-wrap">
                      {isLoggedIn && (
                        <button
                          onClick={() => (window.location.href = "/dashboard")}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            dm
                              ? "bg-blue-500/15 text-blue-300 border-blue-400/30 hover:bg-blue-500/25"
                              : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                          }`}
                        >
                          📊 Dashboard
                        </button>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={handleLogout}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            dm
                              ? "bg-red-500/15 text-red-300 border-red-400/30 hover:bg-red-500/25"
                              : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          ← Logout
                        </button>
                      )}
                      <button
                        onClick={() => setDarkMode(!dm)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          dm
                            ? "bg-white/8 text-white/70 border-white/15 hover:bg-white/12"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {dm ? "☀ Light" : "🌙 Dark"}
                      </button>
                    </div>

                    {/* ── Service Selector ── */}
                    <div className={`flex p-1 rounded-2xl mb-6 ${dm ? "bg-white/5" : "bg-slate-100"}`}>
                      {["food", "grocery", "ride"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setServiceType(type)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            serviceType === type
                              ? dm
                                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(79,142,247,0.4)]"
                                : "bg-blue-600 text-white shadow-sm"
                              : dm
                              ? "text-white/40 hover:text-white/60"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {type === "food" && "🍔 Food"}
                          {type === "grocery" && "🛒 Grocery"}
                          {type === "ride" && "🚗 Ride"}
                        </button>
                      ))}
                    </div>

                    {/* ── Welcome / Insights ── */}
                   <HeaderSection 
  user={user} 
  insights={insights} 
  serviceType={serviceType} 
/>
                    {/* ── Brand header ── */}
                    <div className="text-center mb-7">
                     <h1 className="brand text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradientMove_4s_ease_infinite]">
  PriceCompare
</h1>
                      <p className={`mt-1 text-sm ${dm ? "text-white/40" : "text-slate-400"}`}>
                        {serviceType === "food" && "Find the cheapest bite in seconds"}
                        {serviceType === "grocery" && "Compare grocery prices instantly"}
                        {serviceType === "ride" && "Compare ride fares instantly"}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: dm
                            ? "rgba(79,142,247,0.12)"
                            : "rgba(79,142,247,0.1)",
                          color: dm ? "#93c5fd" : "#2563eb",
                          border: `1px solid ${dm ? "rgba(79,142,247,0.25)" : "rgba(79,142,247,0.25)"}`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live Price Comparison Engine
                      </div>
                    </div>

                    {/* ── Inputs ── */}
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                          {
  serviceType === "food"
    ? "🍽️"
    : serviceType === "grocery"
    ? "🥬"
    : "🏁" // finish flag for destination
}
                        </span>
                        <input
                          type="text"
                          placeholder={
  serviceType === "food"
    ? "Food item (e.g. Pizza)"
    : serviceType === "grocery"
    ? "Grocery item (e.g. Milk)"
    : "Drop location (e.g. Mohali)"
}
                          value={item}
                          onChange={(e) => setItem(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                          className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none text-sm font-medium transition-all duration-200 ${
                            dm
                              ? "bg-white/6 text-white border border-white/10 focus:border-blue-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(79,142,247,0.15)]"
                              : "bg-slate-50 text-slate-800 border border-slate-200 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,142,247,0.1)]"
                          }`}
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none">{serviceType === "ride" ? "📍" : "🌆"}</span>
                          <input
                            type="text"
                            placeholder={
  serviceType === "ride"
    ? "Pickup location (e.g. Sector 15A Chandigarh)"
    : "City (e.g. Indore)"
}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none text-sm font-medium transition-all duration-200 ${
                              dm
                                ? "bg-white/6 text-white border border-white/10 focus:border-blue-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(79,142,247,0.15)]"
                                : "bg-slate-50 text-slate-800 border border-slate-200 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,142,247,0.1)]"
                            }`}
                          />
                        </div>
                        <motion.button
                          type="button"
                          onClick={handleGetLocation}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.05 }}
                          className={`px-4 py-3.5 rounded-xl font-semibold text-sm transition-all relative overflow-hidden ${
                            dm
                              ? "bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          } ${detectingLocation ? "shadow-[0_0_20px_rgba(79,142,247,0.5)]" : ""}`}
                        >
                          {detectingLocation ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="block"
                            >
                              📡
                            </motion.span>
                          ) : (
                            "📍"
                          )}
                          {detectingLocation && (
                            <span className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-ping opacity-40" />
                          )}
                        </motion.button>
                      </div>

                      {/* ── Compare button ── */}
                      <motion.button
                        onClick={() => handleCompare()}
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.01 }}
                        className={`w-full flex items-center justify-center gap-2.5 font-bold py-4 rounded-xl text-white text-sm transition-all duration-300 relative overflow-hidden disabled:opacity-60 btn-primary shadow-[0_4px_20px_rgba(79,142,247,0.35)] hover:shadow-[0_6px_30px_rgba(79,142,247,0.5)]`}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Comparing prices...
                          </>
                        ) : (
                          <>
                            <span>🔍</span> Compare Prices
                          </>
                        )}
                      </motion.button>

                      {loading && (
                        <p className={`text-xs text-center ${dm ? "text-blue-400/70" : "text-blue-500"}`}>
                          ⚡ Fetching live prices from all platforms…
                        </p>
                      )}
                    </div>

                    {/* ── Error ── */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center mt-4 text-sm px-4 py-3 rounded-xl border ${
                          dm
                            ? "bg-red-500/10 text-red-300 border-red-400/20"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        ⚠️ {error}
                      </motion.p>
                    )}

                    {/* ── Basket Mode ── */}
                    {isBasketMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-2xl border ${
                          dm
                            ? "bg-white/4 border-white/8"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <span>🛒</span> Basket Comparison
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(result.totals).map(([platform, price]) => (
                            <div
                              key={platform}
                              className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm transition-all ${
                                basketWinner === platform
                                  ? dm
                                    ? "bg-green-500/15 border border-green-400/30 text-green-300 font-bold"
                                    : "bg-green-50 border border-green-300 text-green-700 font-bold"
                                  : dm
                                  ? "bg-white/4"
                                  : "bg-white"
                              }`}
                            >
                              <span className="capitalize flex items-center gap-1.5">
                                {basketWinner === platform && (
                                  <span className="text-xs">🏆</span>
                                )}
                                {platform}
                              </span>
                              <span className="font-bold">₹{price}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {isBasketMode && (
                      <div className="mt-4">
                        <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${dm ? "text-white/40" : "text-slate-400"}`}>
                          Basket Items
                        </h4>
                        <div className="space-y-1.5">
                          {result.basket.map((bItem, index) => (
                            <div
                              key={index}
                              className={`flex justify-between items-center text-xs p-3 rounded-xl transition-all ${
                                dm
                                  ? "bg-white/4 border border-white/6 hover:bg-white/7"
                                  : "bg-slate-50 border border-slate-100 hover:bg-white"
                              }`}
                            >
                              <span className="font-semibold capitalize">{bItem.product}</span>
                              <div className="flex gap-3 font-semibold">
                                <span className="text-purple-400">Z ₹{bItem.zepto}</span>
                                <span className="text-yellow-400">B ₹{bItem.blinkit}</span>
                                <span className="text-orange-400">I ₹{bItem.instamart}</span>
                                <span className="text-blue-400">J ₹{bItem.jiomart}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Recent searches ── */}
                    {history.length > 0 && (
                      <div className={`mt-6 pt-5 border-t ${dm ? "border-white/6" : "border-slate-100"}`}>
                        <div className="flex justify-between items-center mb-3">
                          <p className={`text-xs font-semibold uppercase tracking-wider ${dm ? "text-white/40" : "text-slate-400"}`}>
                            Recent Searches
                          </p>
                          <button
                            onClick={handleClearHistory}
                            className={`text-xs font-medium transition-colors ${
                              dm ? "text-red-400/70 hover:text-red-400" : "text-red-400 hover:text-red-500"
                            }`}
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {history.map((search, index) => (
                            <button
                              key={index}
                              onClick={async () => {
                                setLoading(true);
                                setError("");
                                setItem(search.item);
                                setCity(search.city);
                                const token = localStorage.getItem("token");
                                try {
                                  const response = await axios.post(
                                    "https://food-price-compare-production.up.railway.app/compare",
                                    {
                                      item: search.item,
                                      city: search.city,
                                      serviceType: search.serviceType || "food",
                                    },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  setResult(response.data);
                                } catch (err) {
                                  console.log("History compare failed");
                                  setError("Failed to load saved search.");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                                dm
                                  ? "bg-white/6 hover:bg-white/10 text-white/60 hover:text-white border border-white/8"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                              }`}
                            >
                              🕒 {search.item} · {search.city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* ── END CENTER CARD ── */}


{serviceType === "ride" && result && (
  <div className="flex flex-col gap-6 w-full max-w-5xl">

    {/* 🗺️ MAP */}
    <div className="w-full h-[320px] rounded-2xl overflow-hidden shadow-lg">
      <RideMap
        pickupCoords={result.pickupCoords}
        dropCoords={result.dropCoords}
      />
    </div>

    {/* 🚗 RIDE CARDS */}
<div className="w-full">
  {/* Main Grid - 4 Columns on Large, 2 on Medium, 1 on Small */}
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
    {Object.entries(result.platforms).map(([name, data]) => {
      const isWinner = result.winner === name;
      const minPrice = Math.min(...Object.values(data).map(r => r.price));
      const minTime = Math.min(...Object.values(data).map(r => r.time));

      return (
        <div
          key={name}
          onClick={() =>
            setSelectedPlatform(selectedPlatform === name ? null : name)
          }
          className={`group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 backdrop-blur-md
            ${
              selectedPlatform === name
                ? "scale-105 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl"
            }
            ${
              isWinner
                ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                : "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50"
            }
          `}
        >
          {/* Background glow effect */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300
              ${isWinner ? "bg-green-500" : "bg-blue-500"}`}
          />

          {/* Card Content */}
          <div className="relative p-6 flex flex-col h-full">
            {/* Header with Logo and Winner Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {name === "uber" && "🚗"}
                  {name === "ola" && "🛺"}
                  {name === "rapido" && "🏍"}
                  {name === "indrive" && "💸"}
                </div>
                <div>
                  <h2 className="font-bold text-lg capitalize text-white leading-tight">
                    {name}
                  </h2>
                </div>
              </div>
              {isWinner && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg">
                  <span className="text-white font-bold text-xs">🏆 Best</span>
                </div>
              )}
            </div>

            {/* Time and Price */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-slate-300/80">
                <span className="text-sm">⏱</span>
                <span className="text-sm font-medium">{minTime} mins</span>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Price</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-400 bg-clip-text text-transparent">
                  ₹{minPrice}
                </p>
              </div>
            </div>

            {/* Subtle Click Indicator */}
            <div
              className={`mt-4 text-xs text-slate-400 transition-all duration-300 ${
                selectedPlatform === name
                  ? "opacity-100 text-blue-400"
                  : "opacity-0 group-hover:opacity-50"
              }`}
            >
              Click for details
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* 🚀 EXPANDABLE RIDE OPTIONS SECTION */}
  {selectedPlatform && (
    <div
      className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-2xl font-bold capitalize text-white">
          {selectedPlatform}
          <span className="text-green-400 ml-2">Ride Options</span>
        </h3>
        <button
          onClick={() => setSelectedPlatform(null)}
          className="text-slate-400 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>
      </div>

      {/* Ride Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.entries(result.platforms[selectedPlatform]).map(
          ([type, ride], idx) => (
            <div
              key={type}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient Background */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-slate-700/40 to-slate-900/60 
                border border-slate-600/50 group-hover:border-slate-500 transition-colors"
              />

              {/* Premium Background Pattern */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, rgb(34,197,94) 0%, transparent 50%)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative p-6 flex flex-col">
                {/* Type Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="text-4xl">
                    {type === "car" && "🚗"}
                    {type === "bike" && "🏍"}
                    {type === "auto" && "🛺"}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg capitalize text-white">
                      {type}
                    </h4>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 text-slate-300/70 mb-3">
                  <span className="text-sm">⏱</span>
                  <span className="text-sm font-medium">{ride.time} mins</span>
                </div>

                {/* Price */}
                <div className="mb-6 pt-4 border-t border-slate-600/50">
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                    Price
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-400 bg-clip-text text-transparent">
                    ₹{ride.price}
                  </p>
                </div>

                {/* Book Button */}
                <button
                  className="mt-auto w-full py-3 px-4 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500
                    shadow-lg hover:shadow-green-500/50 transition-all duration-300 
                    transform group-hover:scale-105 active:scale-95
                    uppercase tracking-wide text-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Close Hint */}
      <div className="text-center pt-2 text-sm text-slate-500/80">
        Click a platform above to close
      </div>
    </div>
  )}
</div>


  </div>
)}

                {/* ── RIGHT: Grocery Panel (Instamart + JioMart) ── */}
                {serviceType === "grocery" && result && (
                  <GroceryPanel
                    platforms={[
                      { name: "Instamart", price: result.basket?.[0]?.instamart, time: 14, url: "https://www.swiggy.com/instamart", color: "orange", borderClass: dm ? "border-orange-500/40" : "border-orange-300" },
                      { name: "JioMart", price: result.basket?.[0]?.jiomart, time: 25, url: "https://www.jiomart.com/", color: "blue", borderClass: dm ? "border-blue-500/40" : "border-blue-300" },
                    ]}
                    basket={result.basket}
                    groceryImages={groceryImages}
                    categoryColors={categoryColors}
                    dm={dm}
                    title="More Stores"
                    titleColor="text-blue-400"
                  />
                )}

                {/* ── RIGHT: Swiggy Panel ── */}
                {serviceType === "food" && result?.swiggyList && (
                  <PlatformPanel
                    show={mobilePlatform === "swiggy"}
                    platform="swiggy"
                    label="Swiggy"
                    color="orange"
                    list={result.swiggyList}
                    item={item}
                    loading={loading}
                    winner={winner}
                    dm={dm}
                    favourites={favourites}
                    city={city}
                    addFavourite={addFavourite}
                  />
                )}
              </div>
              {/* ── END THREE-COLUMN ── */}

              {/* ── Login Popup ── */}
              <AnimatePresence>
                {showLoginPopup && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 280, damping: 22 }}
                      className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${
                        dm
                          ? "bg-[#0d1025] border border-white/10"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                      <div className="p-7">
                        <h2 className={`brand text-xl font-bold mb-1 text-center ${dm ? "text-white" : "text-slate-800"}`}>
                          {isRegisterMode ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className={`text-xs text-center mb-6 ${dm ? "text-white/40" : "text-slate-400"}`}>
                          {isRegisterMode
                            ? "Sign up to save your comparisons"
                            : "Login to compare prices"}
                        </p>

                        <div className="space-y-3">
                          {isRegisterMode && (
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                                dm
                                  ? "bg-white/6 text-white border-white/10 focus:border-blue-400/50 placeholder-white/30"
                                  : "bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-400"
                              }`}
                            />
                          )}
                          <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                              dm
                                ? "bg-white/6 text-white border-white/10 focus:border-blue-400/50 placeholder-white/30"
                                : "bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-400"
                            }`}
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                              dm
                                ? "bg-white/6 text-white border-white/10 focus:border-blue-400/50 placeholder-white/30"
                                : "bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-400"
                            }`}
                          />
                        </div>

                        {authError && (
                          <div className={`mt-3 p-3 rounded-xl text-xs border ${
                            dm
                              ? "bg-blue-500/10 border-blue-400/20 text-blue-300"
                              : "bg-blue-50 border-blue-200 text-blue-600"
                          }`}>
                            📧 Please verify your email first. Check your inbox or spam folder.
                          </div>
                        )}

                        <button
                          onClick={isRegisterMode ? handleSignup : handleLogin}
                          disabled={loginLoading}
                          className="w-full mt-4 btn-primary py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_15px_rgba(79,142,247,0.3)]"
                        >
                          {loginLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          {loginLoading
                            ? isRegisterMode
                              ? "Creating account..."
                              : "Logging in..."
                            : isRegisterMode
                            ? "Create Account"
                            : "Login"}
                        </button>

                        <div className={`flex items-center gap-3 my-4 text-xs ${dm ? "text-white/30" : "text-slate-400"}`}>
                          <div className={`flex-1 h-px ${dm ? "bg-white/10" : "bg-slate-200"}`} />
                          OR
                          <div className={`flex-1 h-px ${dm ? "bg-white/10" : "bg-slate-200"}`} />
                        </div>

                        <div className="flex justify-center">
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              try {
                                const res = await axios.post(
                                  "https://food-price-compare-production.up.railway.app/google-login",
                                  { token: credentialResponse.credential }
                                );
                                const token = res.data.token;
                                localStorage.setItem("token", token);
                                const userRes = await axios.get(
                                  "https://food-price-compare-production.up.railway.app/me",
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setUser(userRes.data);
                                setIsLoggedIn(true);
                                setShowLoginPopup(false);
                                setHistory(userRes.data.searchHistory || []);
                              } catch (err) {
                                console.log("Google login failed");
                              }
                            }}
                            onError={() => console.log("Google Login Failed")}
                          />
                        </div>

                        <p className={`text-center text-xs mt-4 ${dm ? "text-white/40" : "text-slate-400"}`}>
                          {isRegisterMode
                            ? "Already have an account? "
                            : "Don't have an account? "}
                          <span
                            onClick={() => setIsRegisterMode(!isRegisterMode)}
                            className="text-blue-500 font-semibold cursor-pointer hover:underline"
                          >
                            {isRegisterMode ? "Login" : "Register"}
                          </span>
                        </p>

                        <button
                          onClick={() => {
                            setShowLoginPopup(false);
                            setIsRegisterMode(false);
                          }}
                          className={`w-full mt-3 text-xs py-2 rounded-xl transition-all ${
                            dm
                              ? "text-white/30 hover:text-white/50 hover:bg-white/5"
                              : "text-slate-400 hover:text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        }
      />

      <Route path="/verified" element={<Verified />} />
      <Route path="/verification-failed" element={<VerificationFailed />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

/* ─── Platform Panel (Zomato / Swiggy) ─── */
function PlatformPanel({
  show,
  platform,
  label,
  color,
  list,
  item,
  loading,
  winner,
  dm,
  favourites,
  city,
  addFavourite,
}) {
  const isWinner = winner === platform;
  const accentColor = color === "red" ? "#EF4444" : "#FF6B35";

  return (
    <div
      className={`${show ? "block" : "hidden"} lg:block w-full lg:w-80 rounded-2xl overflow-hidden transition-all duration-500 ${
        dm
          ? "bg-[#0d1025] border border-white/[0.07]"
          : "bg-white border border-slate-200 shadow-md"
      } ${isWinner ? `shadow-[0_0_40px_${color === "red" ? "rgba(239,68,68,0.25)" : "rgba(255,107,53,0.25)"}]` : ""}`}
      style={isWinner ? { borderColor: `${accentColor}40` } : {}}
    >
      {/* platform header */}
      <div
        className={`sticky top-0 z-10 flex items-center justify-center gap-2 py-3.5 backdrop-blur-md border-b ${
          dm
            ? "bg-[#0d1025]/90 border-white/6"
            : "bg-white/90 border-slate-100"
        }`}
      >
        <span
          className="font-bold text-sm"
          style={{ color: accentColor }}
        >
          {label}
        </span>
        {isWinner && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-400/30 font-semibold">
            🏆 Winner
          </span>
        )}
      </div>

      <div className="p-3 space-y-3 lg:max-h-[580px] lg:overflow-y-auto scrollbar-hide">
        {loading ? (
          <>
            <SkeletonCard dm={dm} />
            <SkeletonCard dm={dm} />
            <SkeletonCard dm={dm} />
          </>
        ) : (
          [...list]
            .sort((a, b) => a.price - b.price)
            .map((rest, index) => (
              <RestaurantCard
                key={rest.name + platform}
                rest={rest}
                index={index}
                platform={platform}
                item={item}
                city={city}
                dm={dm}
                favourites={favourites}
                addFavourite={addFavourite}
                accentColor={accentColor}
              />
            ))
        )}
      </div>
    </div>
  );
}

/* ─── Restaurant Card ─── */
function RestaurantCard({
  rest,
  index,
  platform,
  item,
  city,
  dm,
  favourites,
  addFavourite,
  accentColor,
}) {
  const isFav = favourites.includes(rest.name + platform + city);
  const isBest = index === 0;

  return (
    <motion.div
      key={rest.name + platform + "-card"}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${
        dm
          ? "bg-white/4 border border-white/7 hover:border-white/14"
          : "bg-white border border-slate-100 shadow-sm hover:shadow-md"
      } ${isBest ? `ring-1 shadow-lg` : ""}`}
      style={
        isBest
          ? {
              ringColor: accentColor,
              boxShadow: `0 4px 20px ${accentColor}20`,
              borderColor: `${accentColor}30`,
            }
          : {}
      }
    >
      {/* image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={
            rest.image ||
            `https://loremflickr.com/600/400/${item}?random=${index}`
          }
          onError={(e) => {
            e.target.src = `https://loremflickr.com/600/400/${item}?random=${index}`;
          }}
          alt={rest.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {isBest && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-[10px] font-bold animate-pulse"
            style={{ background: accentColor }}
          >
            BEST DEAL
          </div>
        )}

        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-medium">
          ⭐ {rest.rating}
        </div>

        {/* fav button */}
        <button
          onClick={() =>
            addFavourite(rest.name, platform, city, rest.price, rest.image)
          }
          className="absolute top-10 left-2 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full transition-all hover:scale-110"
        >
          <motion.span
            animate={{ scale: isFav ? 1.25 : 1 }}
            transition={{ type: "spring", stiffness: 400 }}
            className={isFav ? "text-red-500" : "text-white/70"}
          >
            ❤️
          </motion.span>
        </button>

        {/* name overlay */}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="text-white font-semibold text-sm leading-tight line-clamp-1">
            {rest.name}
          </div>
        </div>
      </div>

      {/* details */}
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className={`text-xs ${dm ? "text-white/50" : "text-slate-400"}`}>
            ⏱ {rest.time} min · 📍 {rest.distance} km
          </div>
          <div className="text-lg font-bold" style={{ color: accentColor }}>
            ₹<CountUp end={rest.price} duration={0.8} />
          </div>
        </div>
        <a
          href={rest.url}
          target="_blank"
          className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: accentColor }}
          rel="noreferrer"
        >
          Order Now →
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Grocery Panel ─── */
function GroceryPanel({
  platforms,
  basket,
  groceryImages,
  categoryColors,
  dm,
  title,
  titleColor,
}) {
  return (
    <div
      className={`w-full lg:w-72 rounded-2xl overflow-hidden transition-all ${
        dm
          ? "bg-[#0d1025] border border-white/[0.07]"
          : "bg-white border border-slate-200 shadow-md"
      }`}
    >
      <div
        className={`py-3 text-center font-bold text-sm border-b ${
          dm ? "border-white/6" : "border-slate-100"
        } ${titleColor}`}
      >
        {title}
      </div>
      <div className="p-3 space-y-3">
        {platforms.map((platform, pIndex) => (
          <div
            key={platform.name + pIndex}
            className={`rounded-xl border p-3 transition-all hover:scale-[1.01] ${
              dm ? `bg-white/3 ${platform.borderClass}` : `bg-slate-50 ${platform.borderClass} border`
            }`}
          >
            <div className={`flex items-center justify-between mb-2.5`}>
              <span className="text-xs font-bold">{platform.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? "bg-white/8 text-white/50" : "bg-slate-200 text-slate-500"}`}>
                ⏱ {platform.time}m
              </span>
            </div>

            <div
              className={`${
                basket?.length > 1
                  ? "flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
                  : "flex justify-center"
              }`}
            >
              {basket?.map((bItem, i) => {
                const imageKey = bItem.product.toLowerCase().split(" ")[0];
                return (
                  <div
                    key={i}
                    className={`${
                      basket?.length > 1 ? "min-w-[130px]" : "w-full"
                    } rounded-xl overflow-hidden flex-shrink-0 ${
                      dm ? "bg-white/5" : "bg-white shadow-sm"
                    }`}
                  >
                    <a
                      href={
                        platform.name === "Zepto"
                          ? `https://www.zeptonow.com/search?query=${bItem.product}`
                          : platform.name === "Blinkit"
                          ? `https://blinkit.com/s/?q=${bItem.product}`
                          : platform.name === "Instamart"
                          ? `https://www.swiggy.com/instamart/search?query=${bItem.product}`
                          : `https://www.jiomart.com/search/${bItem.product}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
  src={
    bItem.image || groceryImages[imageKey]
  }
  loading="lazy"
  onError={(e) => {
    e.target.src = groceryImages[imageKey];
  }}
  className="w-full h-20 object-cover hover:scale-105 transition-transform"
  alt={bItem.product}
/>
                    </a>
                    <div className="p-2">
                      <span
                        className={`${
                          categoryColors[bItem.category || "other"]
                        } text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold`}
                      >
                        {bItem.category}
                      </span>
                      <div className={`font-semibold text-xs mt-1 capitalize ${dm ? "text-white/80" : "text-slate-700"}`}>
                        {bItem.product}
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="font-bold">
                          ₹
                          {platform.name === "Zepto"
                            ? bItem.zepto
                            : platform.name === "Blinkit"
                            ? bItem.blinkit
                            : platform.name === "Instamart"
                            ? bItem.instamart
                            : bItem.jiomart}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all hover:scale-[1.02]"
            >
              Order on {platform.name} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard({ dm }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        dm ? "bg-white/4" : "bg-slate-100"
      }`}
    >
      <div className={`h-36 ${dm ? "bg-white/6" : "bg-slate-200"}`} />
      <div className="p-3 space-y-2">
        <div className={`h-3 w-3/4 rounded-full ${dm ? "bg-white/6" : "bg-slate-200"}`} />
        <div className={`h-3 w-1/2 rounded-full ${dm ? "bg-white/4" : "bg-slate-100"}`} />
        <div className={`h-8 rounded-xl mt-2 ${dm ? "bg-white/6" : "bg-slate-200"}`} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

/* ─── Price Card (unchanged logic) ─── */
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
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none" />
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
