import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { GoogleLogin } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Verified from "./pages/Verified";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./components/AIAssistant";
import FloatingAI from "./components/FloatingAI";
import HeaderSection from "./components/HeaderSection";
import GroceryDashboard from "./pages/GroceryDashboard";
import RideDashboard from "./pages/RideDashboard";
import EcommerceDashboard from "./pages/EcommerceDashboard";
import Favourites from "./pages/Favourites";
import zomatoLogo from "./assets/logos/Zomato.png";
import swiggyLogo from "./assets/logos/swiggy.png";
import amazonLogo from "./assets/logos/amazon.png";
import flipkartLogo from "./assets/logos/flipkart.png";
import myntraLogo from "./assets/logos/myntra.png";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

/* ─── Mobile detection hook ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ─── Font injection ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    h1,h2,.brand { font-family: 'Syne', sans-serif; }

    :root {
      --bg: #0b0c10;
      --bg2: #0f1117;
      --surface: rgba(255,255,255,0.028);
      --surface2: rgba(255,255,255,0.05);
      --surface-hover: rgba(255,255,255,0.065);
      --border: rgba(255,255,255,0.06);
      --border-mid: rgba(255,255,255,0.1);
      --border-glow: rgba(251,146,60,0.45);
      --accent: #fb923c;
      --accent2: #f43f5e;
      --accent3: #fbbf24;
      --accent-dim: rgba(251,146,60,0.12);
      --accent2-dim: rgba(244,63,94,0.1);
      --teal: #2dd4bf;
      --teal-dim: rgba(45,212,191,0.1);
      --green: #34d399;
      --green-dim: rgba(52,211,153,0.1);
      --text: #f1f0ed;
      --text-muted: rgba(241,240,237,0.45);
      --text-dim: rgba(241,240,237,0.22);
      --radius: 18px;
      --radius-sm: 12px;
    }

    html { -webkit-text-size-adjust: 100%; }
    body { background: var(--bg); margin: 0; overscroll-behavior-y: none; }

    /* ── LIGHT MODE ── */
    .light-mode {
      --bg: #faf8f4;
      --bg2: #f3f0ea;
      --surface: rgba(255,255,255,0.85);
      --surface2: rgba(255,255,255,1);
      --surface-hover: rgba(255,255,255,1);
      --border: rgba(0,0,0,0.06);
      --border-mid: rgba(0,0,0,0.1);
      --border-glow: rgba(251,146,60,0.4);
      --text: #1a1714;
      --text-muted: rgba(26,23,20,0.5);
      --text-dim: rgba(26,23,20,0.3);
    }

    /* Grain overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .glass { background: var(--surface); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); }
    .glass2 { background: var(--surface2); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid var(--border-mid); }

    @keyframes gradShift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    .gradient-text {
      background: linear-gradient(120deg, #fb923c 0%, #f43f5e 35%, #fbbf24 60%, #fb923c 100%);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    @media (min-width: 1024px) {
      .gradient-text { animation: gradShift 5s ease infinite; }
    }

    @keyframes amberPulse {
      0%,100% { box-shadow: 0 0 16px rgba(251,146,60,0.25); }
      50%      { box-shadow: 0 0 32px rgba(251,146,60,0.45), 0 0 64px rgba(244,63,94,0.15); }
    }
    .winner-badge { animation: amberPulse 2.4s ease-in-out infinite; }

    @keyframes shimmer {
      0%   { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(200%) skewX(-12deg); }
    }
    @media (min-width: 1024px) {
      .btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
        animation: shimmer 2.8s ease infinite;
        pointer-events: none;
      }
    }
    .btn-primary {
      background: linear-gradient(135deg, #fb923c 0%, #f43f5e 50%, #fb923c 100%);
      background-size: 200% 200%;
      position: relative;
      overflow: hidden;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    @media (min-width: 1024px) {
      .btn-primary { animation: gradShift 4s ease infinite; }
    }

    @keyframes float1 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(40px,-30px) scale(1.06); }
      66%      { transform: translate(-25px,15px) scale(0.94); }
    }
    @keyframes float2 {
      0%,100% { transform: translate(0,0); }
      50%      { transform: translate(-30px,20px); }
    }
    @keyframes float3 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(20px,-20px) scale(1.04); }
    }

    .dot-pattern {
      background-image: radial-gradient(circle, rgba(251,146,60,0.08) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .platform-scroll {
      max-height: 600px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(251,146,60,0.25) transparent;
      overscroll-behavior: contain;
    }
    .platform-scroll::-webkit-scrollbar { width: 3px; }
    .platform-scroll::-webkit-scrollbar-track { background: transparent; }
    .platform-scroll::-webkit-scrollbar-thumb { background: rgba(251,146,60,0.3); border-radius: 99px; }

    input, select { color-scheme: dark; }
    .light-mode input, .light-mode select { color-scheme: light; }
    input::placeholder { color: var(--text-dim) !important; }
    .input-field {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      color: var(--text);
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .light-mode .input-field {
      background: rgba(255,255,255,0.9);
      border-color: rgba(0,0,0,0.08);
    }
    .input-field:focus {
      background: rgba(251,146,60,0.06);
      border-color: rgba(251,146,60,0.5);
      box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
      outline: none;
    }

    @media (min-width: 1024px) {
      .card-lift { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
      .card-lift:hover { transform: translateY(-3px) scale(1.012); }
      .img-zoom { transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
      .img-zoom:hover { transform: scale(1.07); }
    }

    @keyframes pulseGreen {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    .pulse-dot { animation: pulseGreen 1.8s ease infinite; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.4s ease forwards; }

    .gpu { -webkit-transform: translateZ(0); transform: translateZ(0); will-change: transform; }
    button, a { touch-action: manipulation; }

    @media (max-width: 1023px) {
      .glass, .glass2 { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      button { min-height: 44px; }
      .platform-scroll { max-height: none; }
      img { content-visibility: auto; }
    }

    .or-divider {
      display: flex; align-items: center; gap: 12px;
      color: var(--text-dim); font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    }
    .or-divider::before, .or-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }
  `}</style>
);

function getBestRestaurant(list) {
  if (!list || list.length === 0) return null;
  return list.reduce((a, b) => (a.price < b.price ? a : b));
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};
const fadeMobile = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.22 } },
};

export default function App() {
  const isMobile = useIsMobile();

  const [user, setUser] = useState(null);
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [result, setResult] = useState(null);
  const location = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const [serviceType, setServiceType] = useState(location.state?.service || "food");
  useEffect(() => {
    if (location.state?.service) setServiceType(location.state.service);
  }, [location]);

  useEffect(() => {
    setItem("");
    setCity("");
    setResult(null);
    setError("");
    setSelectedPlatform(null);
  }, [serviceType]);

  const isBasketMode = serviceType === "grocery" && result?.basket && result.basket.length > 0;
  const basketWinner = isBasketMode
    ? Object.entries(result.totals).reduce((a, b) => (a[1] < b[1] ? a : b))[0]
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
  const [darkMode, setDarkMode] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState("zomato");

  const groceryImages = useMemo(() => ({
    milk: "https://images.unsplash.com/photo-1550583724-b2692b85b140",
    bread: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
    rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    eggs: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7",
    vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999",
    fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb",
    tomato: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
  }), []);

  const categoryColors = {
    dairy: "bg-blue-500", bakery: "bg-yellow-500", fruits: "bg-red-500",
    vegetables: "bg-green-500", pantry: "bg-orange-500", other: "bg-gray-500",
  };

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      systemDark ? root.classList.add("dark") : root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const winner = useMemo(() => {
    if (serviceType !== "food" || !result) return null;
    const zomatoBest = result.zomatoList?.length ? result.zomatoList.reduce((a, b) => (a.score < b.score ? a : b)) : null;
    const swiggyBest = result.swiggyList?.length ? result.swiggyList.reduce((a, b) => (a.score < b.score ? a : b)) : null;
    if (!zomatoBest && swiggyBest) return "swiggy";
    if (!swiggyBest && zomatoBest) return "zomato";
    if (!zomatoBest && !swiggyBest) return null;
    if (zomatoBest.price < swiggyBest.price) return "zomato";
    if (swiggyBest.price < zomatoBest.price) return "swiggy";
    return null;
  }, [serviceType, result]);

  const ecommerceWinner = useMemo(() => {
    if (serviceType !== "ecommerce" || !result) return null;
    const all = [...(result?.amazonList || []), ...(result?.flipkartList || []), ...(result?.myntraList || [])];
    return all.length ? all.reduce((a, b) => (a.price < b.price ? a : b)) : null;
  }, [serviceType, result]);

  const savingsData = useMemo(() => {
    if (serviceType !== "food" || !result) return null;
    const zomatoBest = getBestRestaurant(result.zomatoList);
    const swiggyBest = getBestRestaurant(result.swiggyList);
    if (!zomatoBest || !swiggyBest) return null;
    const cheaperPrice = Math.min(zomatoBest.price, swiggyBest.price);
    const expensivePrice = Math.max(zomatoBest.price, swiggyBest.price);
    const difference = expensivePrice - cheaperPrice;
    return { perOrder: difference, monthly: difference * 8, yearly: difference * 96, percentage: ((difference / expensivePrice) * 100).toFixed(1) };
  }, [serviceType, result]);

  const groceryWinner = useMemo(() => {
    if (serviceType !== "grocery" || !result) return null;
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
      if (!best || item.price < best.price) best = { platform: p.name, price: item.price };
    });
    return best?.platform || null;
  }, [serviceType, result]);

  const [sortBy, setSortBy] = useState("price");

  const particlesInit = useCallback(async (engine) => { await loadSlim(engine); }, []);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const fullAddress = [data.address?.suburb, data.address?.road, data.address?.city].filter(Boolean).join(", ");
          const detectedCity = data.address.city || data.address.town || data.address.state || "";
          serviceType === "ride" ? setCity(fullAddress) : setCity(detectedCity);
        } catch (err) { console.error("Location fetch error", err); }
        finally { setDetectingLocation(false); }
      },
      () => { setDetectingLocation(false); alert("Location permission denied"); }
    );
  }, [serviceType]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setDarkMode(false);
    else setDarkMode(true);
  }, []);

  useEffect(() => { localStorage.setItem("theme", darkMode ? "dark" : "light"); }, [darkMode]);

  useEffect(() => {
    if (location.state?.item && location.state?.city) {
      const { item, city, serviceType } = location.state;
      setItem(item); setCity(city);
      if (serviceType) setServiceType(serviceType);
      setTimeout(() => { handleCompare(item, city); }, 200);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const userRes = await axios.get("https://food-price-compare-production.up.railway.app/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(userRes.data); setIsLoggedIn(true); setHistory(userRes.data.searchHistory || []);
        setFavourites((userRes.data.favourites || []).map((f) => f.name + f.platform + f.city));
        const insightsRes = await axios.get("https://food-price-compare-production.up.railway.app/insights", { headers: { Authorization: `Bearer ${token}` } });
        setInsights(insightsRes.data);
      } catch {
        localStorage.removeItem("token"); setIsLoggedIn(false); setUser(null); setHistory([]); setInsights(null);
      }
    };
    autoLogin();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true); setAuthError("");
    try {
      const res = await axios.post("https://food-price-compare-production.up.railway.app/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      const userRes = await axios.get("https://food-price-compare-production.up.railway.app/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(userRes.data); setIsLoggedIn(true);
      setFavourites((userRes.data.favourites || []).map((f) => f.name + f.platform + f.city));
      if (pendingCompare) { setPendingCompare(false); handleCompare(); }
      setShowLoginPopup(false);
    } catch (err) { setAuthError(err.response?.data?.message || "Login failed"); }
    finally { setLoginLoading(false); }
  };

  const handleSignup = async () => {
    setLoginLoading(true); setAuthError("");
    try {
      await axios.post("https://food-price-compare-production.up.railway.app/signup", { name, email, password });
      const res = await axios.post("https://food-price-compare-production.up.railway.app/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      const userRes = await axios.get("https://food-price-compare-production.up.railway.app/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(userRes.data); setIsLoggedIn(true); setHistory(userRes.data.searchHistory || []);
      setShowLoginPopup(false); setIsRegisterMode(false);
      setFavourites((userRes.data.favourites || []).map((f) => f.name + f.platform + f.city));
    } catch (err) { setAuthError(err.response?.data?.message || "Signup failed"); }
    setLoginLoading(false);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token"); setIsLoggedIn(false); setUser(null);
    setHistory([]); setInsights(null); setResult(null); setItem(""); setCity("");
  }, []);

  const addFavourite = useCallback(async (name, platform, city, price, image) => {
    const token = localStorage.getItem("token");
    const key = name + platform + city;
    const isAlreadyFav = favourites.includes(key);
    setFavourites((prev) => isAlreadyFav ? prev.filter((f) => f !== key) : [...prev, key]);
    try {
      await axios.post("https://food-price-compare-production.up.railway.app/add-favourite",
        { name, platform, city, price, image }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      setFavourites((prev) => isAlreadyFav ? [...prev, key] : prev.filter((f) => f !== key));
    }
  }, [favourites]);

  const handleCompare = useCallback(async (customItem, customCity) => {
    let searchItem = customItem || item;
    let searchCity = customCity || city;
    if (serviceType === "ride") { searchItem = item; searchCity = city; }
    if ((serviceType === "food" || serviceType === "grocery" || serviceType === "ecommerce") && (!searchItem || !searchCity)) {
      setError("Please enter item and city."); return;
    }
    if (serviceType === "ride" && (!item || !city)) { setError("Please enter pickup and drop location."); return; }
    const token = localStorage.getItem("token");
    if (!token) { setPendingCompare(true); setShowLoginPopup(true); return; }
    setError(""); setLoading(true); setResult(null); setSelectedPlatform(null);
    try {
      const response = await axios.post("https://food-price-compare-production.up.railway.app/compare",
        { item: searchItem, city: searchCity, serviceType }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(response.data);
      let winnerVal = null, bestPrice = null;
      if (response.data.serviceType === "food") {
        const zomatoBest = getBestRestaurant(response.data.zomatoList);
        const swiggyBest = getBestRestaurant(response.data.swiggyList);
        if (!zomatoBest && swiggyBest) { winnerVal = "swiggy"; bestPrice = swiggyBest.price; }
        else if (!swiggyBest && zomatoBest) { winnerVal = "zomato"; bestPrice = zomatoBest.price; }
        else if (zomatoBest && swiggyBest) {
          if (zomatoBest.price < swiggyBest.price) { winnerVal = "zomato"; bestPrice = zomatoBest.price; }
          else { winnerVal = "swiggy"; bestPrice = swiggyBest.price; }
        }
      }
      await axios.post("https://food-price-compare-production.up.railway.app/save-search",
        { item: searchItem, city: searchCity, serviceType, winner: winnerVal, bestPrice },
        { headers: { Authorization: `Bearer ${token}` } })
        .then(async () => {
          const res = await axios.get("https://food-price-compare-production.up.railway.app/me", { headers: { Authorization: `Bearer ${token}` } });
          setUser(res.data); setHistory(res.data.searchHistory || []);
          setFavourites((res.data.favourites || []).map((f) => f.name + f.platform + f.city));
        }).catch((err) => console.log("Save failed:", err.response?.data));
    } catch { setError("Unable to fetch prices. Please try again."); }
    finally { setLoading(false); }
  }, [item, city, serviceType]);

  const handleClearHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete("https://food-price-compare-production.up.railway.app/clear-history", { headers: { Authorization: `Bearer ${token}` } });
      setHistory([]);
    } catch { console.log("Failed to clear history"); }
  };

  const dm = darkMode;

  const serviceTabs = [
    { id: "food",      icon: "🍔", label: "Food" },
    { id: "grocery",   icon: "🛒", label: "Grocery" },
    { id: "ride",      icon: "🚗", label: "Ride" },
    { id: "ecommerce", icon: "🛍", label: "Shop" },
  ];

  const cardStyle = useMemo(() => ({
    background: dm
      ? "linear-gradient(160deg, rgba(18,16,14,0.98) 0%, rgba(14,12,10,0.99) 100%)"
      : "rgba(255,253,248,0.96)",
    border: `1px solid ${dm ? "rgba(255,255,255,0.065)" : "rgba(0,0,0,0.07)"}`,
    boxShadow: isMobile
      ? "none"
      : dm
        ? "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset"
        : "0 24px 80px rgba(0,0,0,0.1)",
    backdropFilter: isMobile ? "blur(10px)" : "blur(40px)",
    WebkitBackdropFilter: isMobile ? "blur(10px)" : "blur(40px)",
  }), [dm, isMobile]);

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/grocery-dashboard" element={<GroceryDashboard theme={theme} />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/ecommerce-dashboard" element={<EcommerceDashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/ride-dashboard" element={<RideDashboard theme={theme} />} />
      <Route path="/favourites" element={<Favourites />} />
      <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} />} />

      <Route
        path="/"
        element={
          <>
            <FontStyle />
            <div
              className={`relative min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${dm ? "" : "light-mode"}`}
              style={{
                background: dm
                  ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,146,60,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(244,63,94,0.05) 0%, transparent 60%), #0b0c10"
                  : "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,146,60,0.08) 0%, transparent 60%), #faf8f4",
                color: "var(--text)",
              }}
            >
              {/* Dot grid */}
              <div className="pointer-events-none fixed inset-0 dot-pattern" style={{ zIndex: 0, opacity: isMobile ? 0.12 : 0.25 }} />

              {/* Floating orbs – desktop only */}
              {!isMobile && (
                <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                  <div className="absolute w-[800px] h-[800px] rounded-full -top-64 -left-64 gpu"
                    style={{ background: dm ? "radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 65%)" : "radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 65%)", animation: "float1 14s ease-in-out infinite" }}
                  />
                  <div className="absolute w-[600px] h-[600px] rounded-full -bottom-48 -right-48 gpu"
                    style={{ background: dm ? "radial-gradient(circle, rgba(244,63,94,0.09) 0%, transparent 65%)" : "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 65%)", animation: "float2 17s ease-in-out infinite" }}
                  />
                  <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 gpu"
                    style={{ background: dm ? "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)" : "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 65%)", animation: "float3 20s ease-in-out infinite" }}
                  />
                </div>
              )}

              {/* Particles */}
              {!isMobile && dm && (
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  options={{
                    fullScreen: { enable: false },
                    background: { color: "transparent" },
                    particles: {
                      number: { value: 22 },
                      color: { value: ["#fb923c", "#f43f5e", "#fbbf24", "#2dd4bf"] },
                      size: { value: { min: 1, max: 2 } },
                      opacity: { value: { min: 0.04, max: 0.22 } },
                      move: { enable: true, speed: 0.28 },
                      links: { enable: true, color: "#fb923c", opacity: 0.05, distance: 130, width: 1 },
                    },
                  }}
                  className="absolute inset-0 z-0"
                />
              )}

              {/* Winner Badge */}
              <AnimatePresence>
                {(winner || groceryWinner || basketWinner || ecommerceWinner) && (
                  <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show" exit="hidden" className="fixed top-4 right-4 z-50">
                    <div className="winner-badge flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border"
                      style={{ background: dm ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.12)", borderColor: "rgba(52,211,153,0.4)", color: "#34d399", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                      <span>🏆</span>
                      {winner ? (winner === "zomato" ? "Zomato Wins" : "Swiggy Wins")
                        : basketWinner ? `${basketWinner.charAt(0).toUpperCase() + basketWinner.slice(1)} Cheapest`
                        : groceryWinner ? `${groceryWinner.charAt(0).toUpperCase() + groceryWinner.slice(1)} Wins`
                        : ""}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Insight bars */}
              <div className="relative z-10 flex flex-col items-center pt-4 px-3 sm:px-4 gap-3">

                {/* Food insight – desktop */}
                {serviceType === "food" && result?.zomatoList && result?.swiggyList && (
                  <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show" className="hidden lg:flex justify-center w-full max-w-2xl">
                    <div className="w-full px-6 py-5 rounded-2xl text-sm font-medium border"
                      style={{ background: dm ? "linear-gradient(135deg, rgba(251,146,60,0.06), rgba(244,63,94,0.04))" : "rgba(255,253,248,0.9)", borderColor: dm ? "rgba(251,146,60,0.18)" : "rgba(251,146,60,0.15)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: dm ? "0 4px 24px rgba(251,146,60,0.06)" : "0 4px 24px rgba(0,0,0,0.05)" }}>
                      {(() => {
                        const zomatoBest = getBestRestaurant(result.zomatoList);
                        const swiggyBest = getBestRestaurant(result.swiggyList);
                        const zomatoFastest = result.zomatoList.length > 0 ? result.zomatoList.reduce((a, b) => (a.time < b.time ? a : b)) : null;
                        const swiggyFastest = result.swiggyList.length > 0 ? result.swiggyList.reduce((a, b) => (a.time < b.time ? a : b)) : null;
                        if (!zomatoBest || !swiggyBest || !zomatoFastest || !swiggyFastest) return null;
                        const priceDifference = Math.abs(zomatoBest.price - swiggyBest.price);
                        const timeDifference = Math.abs(zomatoFastest.time - swiggyFastest.time);
                        return (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-base" style={{ color: dm ? "#fb923c" : "#c2410c" }}>
                                {zomatoBest.price < swiggyBest.price ? `🔥 Zomato saves you ₹${priceDifference}` : swiggyBest.price < zomatoBest.price ? `🔥 Swiggy saves you ₹${priceDifference}` : "⚖️ Both platforms are priced similarly"}
                              </span>
                              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                                {zomatoFastest.time < swiggyFastest.time ? `⚡ Zomato ${timeDifference}m faster` : swiggyFastest.time < zomatoFastest.time ? `⚡ Swiggy ${timeDifference}m faster` : "⏱ Similar delivery time"}
                              </span>
                            </div>
                            <div className="w-full space-y-2">
                              {(() => {
                                const maxPrice = Math.max(zomatoBest.price, swiggyBest.price);
                                return [
                                  { label: "Zomato", price: zomatoBest.price, color: "#f43f5e" },
                                  { label: "Swiggy", price: swiggyBest.price, color: "#fb923c" },
                                ].map((p) => (
                                  <div key={p.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="font-semibold" style={{ color: p.color }}>{p.label}</span>
                                      <span className="font-bold" style={{ color: "var(--text)" }}>₹{p.price}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(p.price / maxPrice) * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full" style={{ background: p.color }} />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Mobile food insight */}
                {isMobile && serviceType === "food" && result?.zomatoList && result?.swiggyList && (
                  <motion.div variants={fadeMobile} initial="hidden" animate="show" className="w-full max-w-md">
                    <div className="flex justify-around px-4 py-3 rounded-2xl border text-xs font-semibold"
                      style={{ background: dm ? "rgba(251,146,60,0.06)" : "rgba(255,253,248,0.92)", borderColor: dm ? "rgba(251,146,60,0.18)" : "rgba(251,146,60,0.15)" }}>
                      {(() => {
                        const zB = getBestRestaurant(result.zomatoList);
                        const sB = getBestRestaurant(result.swiggyList);
                        if (!zB || !sB) return null;
                        const diff = Math.abs(zB.price - sB.price);
                        const cheaper = zB.price < sB.price ? "Zomato" : "Swiggy";
                        return (
                          <>
                            <div className="text-center"><div className="font-black" style={{ color: "#f43f5e" }}>₹{zB.price}</div><div style={{ color: "var(--text-muted)" }}>Zomato</div></div>
                            <div className="text-center" style={{ color: "#34d399" }}><div className="font-black">₹{diff} off</div><div style={{ color: "var(--text-muted)" }}>{cheaper} cheaper</div></div>
                            <div className="text-center"><div className="font-black" style={{ color: "#fb923c" }}>₹{sB.price}</div><div style={{ color: "var(--text-muted)" }}>Swiggy</div></div>
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Grocery insight */}
                {serviceType === "grocery" && result && (
                  <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show" className="w-full max-w-2xl">
                    <div className="px-4 sm:px-6 py-4 rounded-2xl text-sm font-medium border"
                      style={{ background: dm ? "rgba(52,211,153,0.06)" : "rgba(255,253,248,0.9)", borderColor: dm ? "rgba(52,211,153,0.18)" : "rgba(52,211,153,0.2)", backdropFilter: isMobile ? "blur(8px)" : "blur(20px)", WebkitBackdropFilter: isMobile ? "blur(8px)" : "blur(20px)", boxShadow: dm ? "0 4px 24px rgba(52,211,153,0.06)" : "0 4px 24px rgba(0,0,0,0.05)" }}>
                      {(() => {
                        const totals = result.totals;
                        if (!totals) return null;
                        const platforms = [{ name: "Zepto", price: totals.zepto, time: 10 }, { name: "Blinkit", price: totals.blinkit, time: 9 }, { name: "Instamart", price: totals.instamart, time: 14 }, { name: "JioMart", price: totals.jiomart, time: 25 }];
                        const cheapest = platforms.reduce((a, b) => (a.price < b.price ? a : b));
                        const fastest = platforms.reduce((a, b) => (a.time < b.time ? a : b));
                        const mostExpensive = platforms.reduce((a, b) => (a.price > b.price ? a : b));
                        const savings = mostExpensive.price - cheapest.price;
                        const colorMap = { Zepto: "#a855f7", Blinkit: "#fbbf24", Instamart: "#fb923c", JioMart: "#818cf8" };
                        return (
                          <div className="flex items-center justify-around gap-2">
                            {[{ icon: "🛒", label: "Basket", value: `${result.basket?.length || 0} items` }, { icon: "💰", label: "Best Price", value: cheapest.name, color: colorMap[cheapest.name] }, { icon: "⚡", label: "Fastest", value: fastest.name, color: colorMap[fastest.name] }, { icon: "✂️", label: "You Save", value: `₹${savings}`, color: "#34d399" }].map((s) => (
                              <div key={s.label} className="text-center">
                                <div className="text-lg sm:text-xl mb-0.5">{s.icon}</div>
                                <div className="font-bold text-sm sm:text-base" style={{ color: s.color || "var(--text)" }}>{s.value}</div>
                                <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>{s.label}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Ecommerce insight */}
                {serviceType === "ecommerce" && result && (
                  <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show" className="w-full max-w-2xl">
                    <div className="px-4 py-3 rounded-2xl border text-sm inline-flex"
                      style={{ background: dm ? "rgba(251,146,60,0.06)" : "rgba(255,253,248,0.9)", borderColor: dm ? "rgba(251,146,60,0.18)" : "rgba(251,146,60,0.15)", backdropFilter: isMobile ? "blur(8px)" : "blur(20px)", WebkitBackdropFilter: isMobile ? "blur(8px)" : "blur(20px)" }}>
                      {(() => {
                        const all = [...(result.amazonList || []), ...(result.flipkartList || []), ...(result.myntraList || [])];
                        if (all.length === 0) return null;
                        const cheapest = all.reduce((a, b) => (a.price < b.price ? a : b));
                        return (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🛍</span>
                            <div>
                              <div className="font-bold" style={{ color: "#fb923c" }}>Best Deal: ₹{cheapest.price}</div>
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{cheapest.name}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Savings insight */}
                {savingsData && savingsData.perOrder > 0 && (
                  <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show" className="w-full max-w-2xl px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-sm border"
                    style={{ background: dm ? "rgba(52,211,153,0.06)" : "rgba(255,253,248,0.9)", borderColor: dm ? "rgba(52,211,153,0.18)" : "rgba(52,211,153,0.18)", backdropFilter: isMobile ? "blur(6px)" : "blur(20px)", WebkitBackdropFilter: isMobile ? "blur(6px)" : "blur(20px)", boxShadow: dm ? "0 4px 24px rgba(52,211,153,0.06)" : "0 4px 20px rgba(0,0,0,0.04)" }}>
                    <div className="font-bold mb-2.5 flex items-center gap-2 text-xs sm:text-sm" style={{ color: dm ? "#34d399" : "#059669" }}>
                      <span>💰</span> Smart Savings Insight
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[{ label: "This Order", value: `₹${savingsData.perOrder}` }, { label: "Monthly (8×)", value: `₹${savingsData.monthly}` }, { label: "Yearly", value: `₹${savingsData.yearly}` }, { label: "Cheaper by", value: `${savingsData.percentage}%` }].map((s) => (
                        <div key={s.label} className="px-2.5 py-2 rounded-xl text-center"
                          style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(52,211,153,0.06)", border: dm ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(52,211,153,0.15)" }}>
                          <div className="font-bold text-sm sm:text-base" style={{ color: dm ? "#34d399" : "#059669" }}>{s.value}</div>
                          <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Mobile platform toggle */}
                {serviceType === "food" && result && (
                  <div className="flex lg:hidden justify-center gap-2 mt-1">
                    {[{ id: "zomato", icon: "🍅", label: "Zomato", color: "#f43f5e" }, { id: "swiggy", icon: "🟠", label: "Swiggy", color: "#fb923c" }].map((p) => (
                      <button key={p.id} onClick={() => setMobilePlatform(p.id)} className="px-5 py-2.5 rounded-full text-sm font-bold transition-colors duration-150"
                        style={mobilePlatform === p.id ? { background: p.color, color: "#fff" } : { background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)", color: "var(--text-muted)", border: `1px solid ${dm ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)"}` }}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── THREE-COLUMN LAYOUT ── */}
              <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-6 px-3 sm:px-4 lg:px-8 py-4 sm:py-6">

                {serviceType === "grocery" && result && (
                  <GroceryPanel platforms={[{ name: "Zepto", price: result.basket?.[0]?.zepto, time: 10, url: "https://www.zeptonow.com/", color: "purple" }, { name: "Blinkit", price: result.basket?.[0]?.blinkit, time: 9, url: "https://blinkit.com/", color: "yellow" }]}
                    basket={result.basket} groceryImages={groceryImages} categoryColors={categoryColors} dm={dm} title="Quick Commerce" titleColor="text-purple-400" isMobile={isMobile} />
                )}

                {serviceType === "food" && result?.zomatoList && (
                  <PlatformPanel show={mobilePlatform === "zomato"} platform="zomato" logo={zomatoLogo} label="Zomato" color="red"
                    list={result.zomatoList} item={item} loading={loading} winner={winner} dm={dm} favourites={favourites} city={city} addFavourite={addFavourite} isMobile={isMobile} />
                )}

                {serviceType === "ecommerce" && result && (
                  <div className="w-full max-w-md">
                    <PlatformPanel platform="amazon" label="Amazon" color="yellow" list={result.amazonList || []} item={item} loading={loading} dm={dm} favourites={favourites} city={city} addFavourite={addFavourite} isMobile={isMobile} />
                  </div>
                )}

                {/* ── CENTER CARD ── */}
                <motion.div variants={isMobile ? fadeMobile : fadeUp} initial="hidden" animate="show"
                  className="relative z-10 w-full max-w-md lg:max-w-sm xl:max-w-md rounded-3xl overflow-hidden" style={cardStyle}>
                  <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #fb923c, #f43f5e, #fbbf24, #fb923c)" }} />
                  {!isMobile && (
                    <div className="absolute inset-0 pointer-events-none rounded-3xl"
                      style={{ background: dm ? "radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.06) 0%, transparent 60%)" : "radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.04) 0%, transparent 60%)" }} />
                  )}

                  <div className="relative p-5 sm:p-7">
                    {/* Top actions */}
                    <div className="flex justify-end mb-4 gap-2 flex-wrap">
                      {isLoggedIn && (
                        <button onClick={() => (window.location.href = "/dashboard")} className="px-3 py-2 rounded-full text-xs font-semibold transition-colors duration-150"
                          style={{ background: dm ? "rgba(251,146,60,0.1)" : "rgba(251,146,60,0.08)", color: dm ? "#fb923c" : "#c2410c", border: `1px solid ${dm ? "rgba(251,146,60,0.22)" : "rgba(251,146,60,0.18)"}` }}>
                          📊 Dashboard
                        </button>
                      )}
                      {isLoggedIn && (
                        <button onClick={handleLogout} className="px-3 py-2 rounded-full text-xs font-semibold transition-colors duration-150"
                          style={{ background: dm ? "rgba(244,63,94,0.09)" : "rgba(244,63,94,0.07)", color: dm ? "#fb7185" : "#e11d48", border: `1px solid ${dm ? "rgba(244,63,94,0.22)" : "rgba(244,63,94,0.15)"}` }}>
                          ← Logout
                        </button>
                      )}
                      <button onClick={() => setDarkMode(!dm)} className="px-3 py-2 rounded-full text-xs font-semibold transition-colors duration-150"
                        style={{ background: dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.05)", color: "var(--text-muted)", border: `1px solid ${dm ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)"}` }}>
                        {dm ? "☀ Light" : "🌙 Dark"}
                      </button>
                    </div>

                    {/* Service tabs */}
                    <div className="flex p-1 rounded-2xl mb-5 gap-1"
                      style={{ background: dm ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.04)", border: `1px solid ${dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.06)"}` }}>
                      {serviceTabs.map((tab) => (
                        <button key={tab.id} onClick={() => { setServiceType(tab.id); setResult(null); }}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex flex-col items-center gap-0.5"
                          style={serviceType === tab.id
                            ? { background: dm ? "linear-gradient(135deg, rgba(251,146,60,0.18), rgba(244,63,94,0.12))" : "rgba(255,255,255,0.95)", color: dm ? "#fb923c" : "#c2410c", border: "1px solid rgba(251,146,60,0.35)", boxShadow: dm ? "0 0 14px rgba(251,146,60,0.12)" : "0 2px 12px rgba(0,0,0,0.08)" }
                            : { color: "var(--text-dim)", border: "1px solid transparent" }}>
                          <span className="text-base">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    <HeaderSection user={user} insights={insights} serviceType={serviceType} />

                    {/* Brand */}
                    <div className="text-center mb-6">
                      <h1 className="brand text-3xl sm:text-4xl font-black tracking-tight gradient-text leading-none">PriceCompare</h1>
                      <p className="mt-2 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                        {serviceType === "food" && "Find the cheapest bite in seconds"}
                        {serviceType === "grocery" && "Compare grocery prices instantly"}
                        {serviceType === "ride" && "Compare ride fares instantly"}
                        {serviceType === "ecommerce" && "Best deals across all stores"}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: dm ? "rgba(251,146,60,0.08)" : "rgba(251,146,60,0.07)", color: dm ? "#fb923c" : "#c2410c", border: `1px solid ${dm ? "rgba(251,146,60,0.2)" : "rgba(251,146,60,0.18)"}` }}>
                        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
                        Live Price Comparison Engine
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">
                          {serviceType === "food" ? "🍽️" : serviceType === "grocery" ? "🥬" : serviceType === "ecommerce" ? "🛍" : "🏁"}
                        </span>
                        <input type="text"
                          placeholder={serviceType === "food" ? "Search food (e.g. pizza)" : serviceType === "grocery" ? "Search grocery (e.g. milk)" : serviceType === "ecommerce" ? "Search product (e.g. iPhone)" : "Drop location"}
                          value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                          className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium" style={{ fontSize: "16px" }} />
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">{serviceType === "ride" ? "📍" : "🌆"}</span>
                          <input type="text" placeholder={serviceType === "ride" ? "Pickup location" : "City (e.g. Mumbai)"}
                            value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                            className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium" style={{ fontSize: "16px" }} />
                        </div>
                        <button type="button" onClick={handleGetLocation} className="px-4 rounded-xl font-semibold text-sm transition-colors duration-150"
                          style={{ background: dm ? "rgba(251,146,60,0.1)" : "rgba(251,146,60,0.09)", color: dm ? "#fb923c" : "#c2410c", border: `1px solid ${dm ? "rgba(251,146,60,0.28)" : "rgba(251,146,60,0.22)"}`, minWidth: 48, minHeight: 48 }}>
                          {detectingLocation ? <span className="block animate-spin">📡</span> : <span className="flex items-center gap-1">📍 <span className="hidden sm:inline">Use</span></span>}
                        </button>
                      </div>

                      <button onClick={() => handleCompare(item, city)} disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 font-bold py-4 rounded-xl text-white text-sm btn-primary disabled:opacity-60"
                        style={{ boxShadow: loading ? "none" : "0 4px 22px rgba(251,146,60,0.35), 0 0 0 1px rgba(251,146,60,0.2)" }}>
                        {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Comparing prices...</>) : (<><span>🔍</span> Compare Prices</>)}
                      </button>

                      {loading && <p className="text-xs text-center" style={{ color: dm ? "rgba(251,146,60,0.65)" : "#c2410c" }}>⚡ Fetching live prices from all platforms…</p>}
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p variants={fadeMobile} initial="hidden" animate="show" exit="hidden" className="text-center mt-3 text-sm px-4 py-3 rounded-xl"
                          style={{ background: dm ? "rgba(244,63,94,0.08)" : "rgba(244,63,94,0.06)", color: dm ? "#fb7185" : "#e11d48", border: `1px solid ${dm ? "rgba(244,63,94,0.2)" : "rgba(244,63,94,0.15)"}` }}>
                          ⚠️ {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Basket mode */}
                    {isBasketMode && (
                      <div className="mt-5">
                        <div className="p-4 rounded-2xl" style={{ background: dm ? "rgba(255,255,255,0.025)" : "rgba(251,146,60,0.04)", border: `1px solid ${dm ? "rgba(255,255,255,0.065)" : "rgba(251,146,60,0.1)"}` }}>
                          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: dm ? "#fb923c" : "#c2410c" }}><span>🛒</span> Basket Comparison</h3>
                          <div className="space-y-2">
                            {Object.entries(result.totals).map(([platform, price]) => (
                              <div key={platform} className="flex justify-between items-center px-4 py-2.5 rounded-xl text-sm"
                                style={basketWinner === platform ? { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" } : { background: dm ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)"}` }}>
                                <span className="capitalize flex items-center gap-1.5 font-medium">{basketWinner === platform && <span>🏆</span>}{platform}</span>
                                <span className="font-bold">₹{price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Basket Items</h4>
                          <div className="space-y-1.5">
                            {result.basket.map((bItem, index) => (
                              <div key={index} className="flex justify-between items-center text-xs p-3 rounded-xl"
                                style={{ background: dm ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.7)", border: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}` }}>
                                <span className="font-semibold capitalize">{bItem.product}</span>
                                <div className="flex gap-2 font-semibold">
                                  <span style={{ color: "#a855f7" }}>Z ₹{bItem.zepto}</span>
                                  <span style={{ color: "#fbbf24" }}>B ₹{bItem.blinkit}</span>
                                  <span style={{ color: "#fb923c" }}>I ₹{bItem.instamart}</span>
                                  <span style={{ color: "#818cf8" }}>J ₹{bItem.jiomart}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent searches */}
                    {history.length > 0 && (
                      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)"}` }}>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Recent Searches</p>
                          <button onClick={handleClearHistory} className="text-xs font-semibold" style={{ color: dm ? "rgba(251,113,133,0.65)" : "#e11d48" }}>Clear all</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {history.map((search, index) => (
                            <button key={index} onClick={async () => {
                              setLoading(true); setError("");
                              const type = search.serviceType || "food";
                              setServiceType(type); setItem(search.item); setCity(search.city);
                              const token = localStorage.getItem("token");
                              try {
                                const response = await axios.post("https://food-price-compare-production.up.railway.app/compare",
                                  { item: search.item, city: search.city, serviceType: type }, { headers: { Authorization: `Bearer ${token}` } });
                                setResult(response.data);
                              } catch { setError("Failed to load saved search."); }
                              finally { setLoading(false); }
                            }} className="text-xs px-3 py-2 rounded-full font-medium transition-colors duration-150"
                              style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(251,146,60,0.05)", color: "var(--text-muted)", border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(251,146,60,0.12)"}` }}>
                              🕒 {search.item} · {search.city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Ride results */}
                {serviceType === "ride" && result && (
                  <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl">
                    <div className="w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
                      <RideMap pickupCoords={result.pickupCoords} dropCoords={result.dropCoords} />
                    </div>
                    <div className="w-full">
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                        {Object.entries(result.platforms).map(([name, data]) => {
                          const isWinner = result.winner === name;
                          const minPrice = Math.min(...Object.values(data).map((r) => r.price));
                          const minTime = Math.min(...Object.values(data).map((r) => r.time));
                          const platformIcons = { uber: "🚗", ola: "🛺", rapido: "🏍", indrive: "💸" };
                          return (
                            <motion.div key={name} variants={fadeMobile} initial="hidden" animate="show" whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedPlatform(selectedPlatform === name ? null : name)}
                              className="relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl"
                              style={isWinner ? { background: "linear-gradient(135deg, rgba(52,211,153,0.18), rgba(5,150,105,0.08))", border: "2px solid rgba(52,211,153,0.45)", boxShadow: "0 0 24px rgba(52,211,153,0.15)" } : { background: "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(14,12,10,0.85))", border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
                              <div className="relative p-4 sm:p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="text-2xl sm:text-3xl">{platformIcons[name] || "🚗"}</div>
                                    <h2 className="font-black text-base sm:text-lg capitalize" style={{ color: dm ? "#f1f0ed" : "#1a1714" }}>{name}</h2>
                                  </div>
                                  {isWinner && <div className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>🏆 Best</div>}
                                </div>
                                <div className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>⏱ {minTime} mins</div>
                                <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                  <p className="text-[10px] sm:text-xs mb-1" style={{ color: "var(--text-dim)" }}>Price</p>
                                  <p className="text-2xl sm:text-3xl font-black" style={{ background: "linear-gradient(135deg, #fb923c, #f43f5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹{minPrice}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {selectedPlatform && (
                          <motion.div variants={fadeMobile} initial="hidden" animate="show" exit="hidden" className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                              <h3 className="text-xl sm:text-2xl font-black capitalize" style={{ color: dm ? "#f1f0ed" : "#1a1714" }}>
                                {selectedPlatform} <span style={{ color: "#fb923c" }}>Options</span>
                              </h3>
                              <button onClick={() => setSelectedPlatform(null)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-muted)" }}>✕</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                              {Object.entries(result.platforms[selectedPlatform]).map(([type, ride], idx) => {
                                const typeIcons = { car: "🚗", bike: "🏍", auto: "🛺" };
                                return (
                                  <motion.div key={type} variants={fadeMobile} initial="hidden" animate="show" transition={{ delay: idx * 0.08 }} className="relative overflow-hidden rounded-2xl"
                                    style={{ background: "linear-gradient(135deg, rgba(251,146,60,0.1), rgba(14,12,10,0.85))", border: "1px solid rgba(251,146,60,0.2)" }}>
                                    <div className="p-5">
                                      <div className="flex items-center gap-3 mb-4"><div className="text-3xl">{typeIcons[type] || "🚗"}</div><h4 className="font-black text-lg capitalize" style={{ color: dm ? "#f1f0ed" : "#1a1714" }}>{type}</h4></div>
                                      <div className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>⏱ {ride.time} mins</div>
                                      <div className="mb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                        <p className="text-3xl font-black" style={{ background: "linear-gradient(135deg, #fb923c, #f43f5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹{ride.price}</p>
                                      </div>
                                      <button className="w-full py-3 px-4 rounded-xl font-black text-white text-sm" style={{ background: "linear-gradient(135deg, #fb923c, #f43f5e)", boxShadow: "0 4px 14px rgba(251,146,60,0.3)" }}>Book Now</button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {serviceType === "grocery" && result && (
                  <GroceryPanel platforms={[{ name: "Instamart", price: result.basket?.[0]?.instamart, time: 14, url: "https://www.swiggy.com/instamart", color: "orange" }, { name: "JioMart", price: result.basket?.[0]?.jiomart, time: 25, url: "https://www.jiomart.com/", color: "blue" }]}
                    basket={result.basket} groceryImages={groceryImages} categoryColors={categoryColors} dm={dm} title="More Stores" titleColor="text-blue-400" isMobile={isMobile} />
                )}

                {serviceType === "food" && result?.swiggyList && (
                  <PlatformPanel show={mobilePlatform === "swiggy"} platform="swiggy" label="Swiggy" logo={swiggyLogo} color="orange"
                    list={result.swiggyList} item={item} loading={loading} winner={winner} dm={dm} favourites={favourites} city={city} addFavourite={addFavourite} isMobile={isMobile} />
                )}

                {serviceType === "ecommerce" && result && (
                  <div className="flex flex-col gap-4 w-full max-w-md">
                    <PlatformPanel platform="flipkart" label="Flipkart" color="blue" list={result.flipkartList || []} item={item} loading={loading} dm={dm} favourites={favourites} city={city} addFavourite={addFavourite} isMobile={isMobile} />
                    <PlatformPanel platform="myntra" label="Myntra" color="pink" list={result.myntraList || []} item={item} loading={loading} dm={dm} favourites={favourites} city={city} addFavourite={addFavourite} isMobile={isMobile} />
                  </div>
                )}
              </div>

              {/* Login Popup */}
              <AnimatePresence>
                {showLoginPopup && (
                  <motion.div variants={fadeMobile} initial="hidden" animate="show" exit="hidden"
                    className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                    style={{ background: "rgba(11,12,16,0.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
                    onClick={(e) => e.target === e.currentTarget && setShowLoginPopup(false)}>
                    <motion.div
                      initial={{ y: isMobile ? "100%" : 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: isMobile ? "100%" : 40, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 26 }}
                      className="w-full sm:max-w-sm overflow-hidden"
                      style={{ background: dm ? "linear-gradient(160deg, rgba(18,16,14,0.99), rgba(14,12,10,1))" : "rgba(255,253,248,0.98)", border: `1px solid ${dm ? "rgba(251,146,60,0.18)" : "rgba(251,146,60,0.15)"}`, boxShadow: "0 -8px 50px rgba(0,0,0,0.5)", borderRadius: isMobile ? "24px 24px 0 0" : "24px" }}>
                      {isMobile && <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: dm ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)" }} /></div>}
                      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #fb923c, #f43f5e, #fbbf24)" }} />
                      <div className="p-6 sm:p-8">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.22)" }}>
                          <span className="text-xl">{isRegisterMode ? "✨" : "👋"}</span>
                        </div>
                        <h2 className="brand text-xl sm:text-2xl font-black mb-1 text-center" style={{ color: "var(--text)" }}>{isRegisterMode ? "Create Account" : "Welcome Back"}</h2>
                        <p className="text-xs text-center mb-5" style={{ color: "var(--text-muted)" }}>{isRegisterMode ? "Sign up to save your comparisons" : "Login to compare prices"}</p>

                        <div className="space-y-3">
                          {isRegisterMode && <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl text-sm outline-none input-field" style={{ fontSize: "16px" }} />}
                          {[{ field: "email", type: "email", placeholder: "Email address", val: email, setter: setEmail }, { field: "password", type: "password", placeholder: "Password", val: password, setter: setPassword }].map(({ field, type, placeholder, val, setter }) => (
                            <input key={field} type={type} placeholder={placeholder} value={val} onChange={(e) => setter(e.target.value)} className="w-full px-4 py-3.5 rounded-xl text-sm outline-none input-field" style={{ fontSize: "16px" }} />
                          ))}
                        </div>

                        {authError && (
                          <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: dm ? "rgba(251,146,60,0.07)" : "rgba(251,146,60,0.06)", border: `1px solid ${dm ? "rgba(251,146,60,0.2)" : "rgba(251,146,60,0.15)"}`, color: dm ? "#fb923c" : "#c2410c" }}>
                            📧 Please verify your email first. Check your inbox or spam folder.
                          </div>
                        )}

                        <button onClick={isRegisterMode ? handleSignup : handleLogin} disabled={loginLoading}
                          className="w-full mt-4 btn-primary py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                          style={{ boxShadow: "0 4px 18px rgba(251,146,60,0.3)" }}>
                          {loginLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {loginLoading ? (isRegisterMode ? "Creating..." : "Logging in...") : (isRegisterMode ? "Create Account" : "Login")}
                        </button>

                        <div className="or-divider my-4">OR</div>

                        <div className="flex justify-center">
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              try {
                                const res = await axios.post("https://food-price-compare-production.up.railway.app/google-login", { token: credentialResponse.credential });
                                const token = res.data.token;
                                localStorage.setItem("token", token);
                                const userRes = await axios.get("https://food-price-compare-production.up.railway.app/me", { headers: { Authorization: `Bearer ${token}` } });
                                setUser(userRes.data); setIsLoggedIn(true); setShowLoginPopup(false); setHistory(userRes.data.searchHistory || []);
                              } catch { console.log("Google login failed"); }
                            }}
                            onError={() => console.log("Google Login Failed")}
                          />
                        </div>

                        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                          {isRegisterMode ? "Already have an account? " : "Don't have an account? "}
                          <span onClick={() => setIsRegisterMode(!isRegisterMode)} className="cursor-pointer hover:underline font-bold" style={{ color: "#fb923c" }}>
                            {isRegisterMode ? "Login" : "Register"}
                          </span>
                        </p>
                        <button onClick={() => { setShowLoginPopup(false); setIsRegisterMode(false); }} className="w-full mt-3 text-xs py-3 rounded-xl transition-colors duration-150" style={{ color: "var(--text-dim)" }}>Cancel</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <FloatingAI setItem={setItem} setCity={setCity} handleCompare={handleCompare} setServiceType={setServiceType} isLoggedIn={isLoggedIn} />
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

/* ─── Platform Panel ─── */
function PlatformPanel({ show = true, platform, label, color, list, item, loading, winner, dm, favourites, city, addFavourite, isMobile }) {
  const logos = { amazon: amazonLogo, flipkart: flipkartLogo, myntra: myntraLogo, zomato: zomatoLogo, swiggy: swiggyLogo };
  const isWinner = winner === platform;
  const accentMap = {
    red:    { main: "#f43f5e", dim: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.28)",   glow: "rgba(244,63,94,0.12)"   },
    orange: { main: "#fb923c", dim: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.28)",  glow: "rgba(251,146,60,0.12)"  },
    blue:   { main: "#60a5fa", dim: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.28)",  glow: "rgba(96,165,250,0.12)"  },
    yellow: { main: "#fbbf24", dim: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.28)",  glow: "rgba(251,191,36,0.12)"  },
    pink:   { main: "#f472b6", dim: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.28)", glow: "rgba(244,114,182,0.12)" },
  };
  const accent = accentMap[color] || accentMap.orange;

  return (
    <div className={`${show ? "block" : "hidden"} lg:block w-full lg:w-80 rounded-2xl overflow-hidden`}
      style={{ background: dm ? "linear-gradient(160deg, rgba(18,16,14,0.97), rgba(14,12,10,0.99))" : "rgba(255,253,248,0.94)", border: `1px solid ${isWinner ? accent.border : dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, boxShadow: isWinner ? `0 0 36px ${accent.glow}, 0 0 0 1px ${accent.border}` : dm ? "0 4px 28px rgba(0,0,0,0.4)" : "0 4px 28px rgba(0,0,0,0.07)", backdropFilter: isMobile ? "blur(10px)" : "blur(24px)", WebkitBackdropFilter: isMobile ? "blur(10px)" : "blur(24px)" }}>
      <div className="h-[2px]" style={{ background: accent.main }} />
      <div className="sticky top-0 z-10 flex items-center justify-center gap-2 py-3"
        style={{ background: dm ? "rgba(18,16,14,0.92)" : "rgba(255,253,248,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
        <img src={logos[platform]} alt={platform} className="h-8 object-contain" style={{ filter: dm ? "brightness(1.1)" : "none" }} />
        {isWinner && <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>🏆 Winner</span>}
      </div>
      <div className="p-3 space-y-3 platform-scroll">
        {loading ? (<><SkeletonCard dm={dm} /><SkeletonCard dm={dm} /><SkeletonCard dm={dm} /></>) : list && list.length > 0 ? (
          [...list].sort((a, b) => (a.price || Infinity) - (b.price || Infinity)).map((product, index) => (
            <RestaurantCard key={product.name + platform} rest={product} index={index} platform={platform} item={item} city={city} dm={dm} favourites={favourites} addFavourite={addFavourite} accent={accent} isMobile={isMobile} />
          ))
        ) : (
          <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}><div className="text-3xl mb-2">🔍</div>No products found</div>
        )}
      </div>
    </div>
  );
}

/* ─── Restaurant / Product Card ─── */
function RestaurantCard({ rest, index, platform, item, city, dm, favourites, addFavourite, accent, isMobile }) {
  const isFav = favourites.includes(rest.name + platform + city);
  const isBest = index === 0;
  return (
    <div className="relative rounded-2xl overflow-hidden card-lift"
      style={{ background: dm ? isBest ? `linear-gradient(145deg, ${accent.dim}, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)" : isBest ? `linear-gradient(145deg, ${accent.dim}, rgba(255,255,255,0.5))` : "rgba(255,255,255,0.7)", border: `1px solid ${isBest ? accent.border : dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)"}`, boxShadow: isBest ? `0 2px 14px ${accent.glow}` : "none" }}>
      <div className="relative h-32 sm:h-36 overflow-hidden">
        <img src={rest.image || `https://loremflickr.com/600/400/${item}?random=${index}`} onError={(e) => { e.target.src = `https://loremflickr.com/600/400/${item}?random=${index}`; }} alt={rest.name} className="w-full h-full object-cover img-zoom" loading="lazy" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
        {isBest && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wide" style={{ background: accent.main }}>Best Deal</div>}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>⭐ {rest.rating || 4.2}</div>
        <button onClick={() => addFavourite(rest.name, platform, city, rest.price, rest.image)} className="absolute top-9 left-2 w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)" }}>
          <span style={{ color: isFav ? "#f43f5e" : "rgba(255,255,255,0.5)", fontSize: 14 }}>❤️</span>
        </button>
        <div className="absolute bottom-2 left-3 right-3"><div className="text-white font-bold text-sm leading-tight line-clamp-1">{rest.name}</div></div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><span>⏱ {rest.time || 30}m</span><span>•</span><span>📍 {rest.distance || 2}km</span></div>
          <div className="text-lg font-black" style={{ color: accent.main }}>
            {rest.price ? <>₹<CountUp end={rest.price} duration={isMobile ? 0.4 : 0.8} /></> : <span className="text-sm opacity-30">N/A</span>}
          </div>
        </div>
        <a href={rest.link} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white text-xs font-black"
          style={{ background: `linear-gradient(135deg, ${accent.main}, ${accent.main}bb)`, boxShadow: `0 2px 10px ${accent.glow}` }}>
          Buy Now →
        </a>
      </div>
    </div>
  );
}

/* ─── Grocery Panel ─── */
function GroceryPanel({ platforms, basket, groceryImages, categoryColors, dm, title, titleColor, isMobile }) {
  const titleColorMap = { "text-purple-400": "#a855f7", "text-blue-400": "#60a5fa", "text-orange-400": "#fb923c", "text-green-400": "#4ade80" };
  const titleHex = titleColorMap[titleColor] || "#a855f7";
  return (
    <div className="w-full lg:w-72 rounded-2xl overflow-hidden"
      style={{ background: dm ? "linear-gradient(160deg, rgba(18,16,14,0.97), rgba(14,12,10,0.99))" : "rgba(255,253,248,0.94)", border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, boxShadow: dm ? "0 4px 28px rgba(0,0,0,0.4)" : "0 4px 28px rgba(0,0,0,0.07)", backdropFilter: isMobile ? "blur(10px)" : "blur(24px)", WebkitBackdropFilter: isMobile ? "blur(10px)" : "blur(24px)" }}>
      <div className="py-3 text-center font-black text-[11px] uppercase tracking-wider" style={{ color: titleHex, borderBottom: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>{title}</div>
      <div className="p-3 space-y-3">
        {platforms.map((platform, pIndex) => {
          const platformColors = { Zepto: { main: "#a855f7", dim: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.22)" }, Blinkit: { main: "#fbbf24", dim: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)" }, Instamart: { main: "#fb923c", dim: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.22)" }, JioMart: { main: "#818cf8", dim: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.22)" } };
          const pc = platformColors[platform.name] || platformColors.Zepto;
          return (
            <div key={platform.name + pIndex} className="rounded-xl p-3" style={{ background: dm ? pc.dim : "rgba(255,255,255,0.7)", border: `1px solid ${pc.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black" style={{ color: pc.main }}>{platform.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)", color: "var(--text-muted)" }}>⏱ {platform.time}m</span>
              </div>
              <div className={`${basket?.length > 1 ? "flex gap-2 overflow-x-auto pb-1 scrollbar-hide" : "flex justify-center"}`} style={{ WebkitOverflowScrolling: "touch" }}>
                {basket?.map((bItem, i) => {
                  const imageKey = bItem.product.toLowerCase().split(" ")[0];
                  return (
                    <div key={i} className={`${basket?.length > 1 ? "min-w-[120px]" : "w-full"} rounded-xl overflow-hidden flex-shrink-0`}
                      style={{ background: dm ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.85)", border: `1px solid ${dm ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)"}` }}>
                      <a href={platform.name === "Zepto" ? `https://www.zeptonow.com/search?query=${bItem.product}` : platform.name === "Blinkit" ? `https://blinkit.com/s/?q=${bItem.product}` : platform.name === "Instamart" ? `https://www.swiggy.com/instamart/search?query=${bItem.product}` : `https://www.jiomart.com/search/${bItem.product}`} target="_blank" rel="noopener noreferrer">
                        <img src={bItem.image || groceryImages[imageKey]} loading="lazy" decoding="async" onError={(e) => { e.target.src = groceryImages[imageKey]; }} className="w-full h-16 sm:h-20 object-cover" alt={bItem.product} />
                      </a>
                      <div className="p-1.5 sm:p-2">
                        <span className={`${categoryColors[bItem.category || "other"]} text-white text-[9px] px-1.5 py-0.5 rounded-full font-black`}>{bItem.category}</span>
                        <div className="font-bold text-xs mt-1 capitalize" style={{ color: dm ? "rgba(241,240,237,0.8)" : "#1a1714" }}>{bItem.product}</div>
                        <div className="font-black text-xs mt-0.5" style={{ color: pc.main }}>₹{platform.name === "Zepto" ? bItem.zepto : platform.name === "Blinkit" ? bItem.blinkit : platform.name === "Instamart" ? bItem.instamart : bItem.jiomart}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <a href={platform.url} target="_blank" rel="noreferrer" className="mt-2.5 flex items-center justify-center gap-1 w-full py-2.5 text-white text-xs font-black rounded-xl" style={{ background: `linear-gradient(135deg, ${pc.main}, ${pc.main}bb)` }}>
                Order on {platform.name} →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard({ dm }) {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: dm ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)" }}>
      <div className="h-32 sm:h-36 relative overflow-hidden" style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)", animation: "shimmer 1.8s ease infinite" }} />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-3/4 rounded-full" style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />
        <div className="h-2 w-1/2 rounded-full" style={{ background: dm ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.04)" }} />
        <div className="h-8 rounded-xl mt-1" style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
      </div>
    </div>
  );
}

/* ─── Price Card (kept for compatibility) ─── */
function PriceCard({ name, price, cheapest, maxPrice, logo, time }) {
  const percentage = (price / maxPrice) * 100;
  return (
    <div className="relative overflow-hidden flex flex-col p-4 sm:p-5 rounded-2xl"
      style={cheapest ? { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", boxShadow: "0 4px 20px rgba(52,211,153,0.12)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2"><img src={logo} alt={name} className="w-5 h-5 object-contain" /><span className="text-base sm:text-lg font-bold">{name}</span></div>
        {cheapest && <span className="text-xs px-2.5 py-0.5 rounded-full text-white font-black" style={{ background: "#34d399" }}>BEST PRICE</span>}
      </div>
      <div className="mt-3 text-2xl sm:text-3xl font-black">₹<CountUp end={price} duration={0.8} separator="," /></div>
      <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>⏱ {time} mins</p>
      <div className="mt-3 h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: cheapest ? "#34d399" : "#fb923c", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}