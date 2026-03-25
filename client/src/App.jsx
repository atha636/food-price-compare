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
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Satoshi:wght@300;400;500;700;900&display=swap');
    
    * { font-family: 'Satoshi', sans-serif; box-sizing: border-box; }
    h1,h2,.brand { font-family: 'Cabinet Grotesk', sans-serif; }

    :root {
      --bg: #060818;
      --bg2: #080c1e;
      --surface: rgba(255,255,255,0.035);
      --surface2: rgba(255,255,255,0.055);
      --surface-hover: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.07);
      --border-mid: rgba(255,255,255,0.12);
      --border-glow: rgba(99,102,241,0.4);
      --blue: #6366f1;
      --blue-bright: #818cf8;
      --blue-dim: rgba(99,102,241,0.15);
      --orange: #f97316;
      --orange-dim: rgba(249,115,22,0.15);
      --red: #f43f5e;
      --green: #10b981;
      --green-dim: rgba(16,185,129,0.15);
      --purple: #a855f7;
      --purple-dim: rgba(168,85,247,0.15);
      --yellow: #fbbf24;
      --cyan: #22d3ee;
      --text: #e2e8f0;
      --text-muted: rgba(226,232,240,0.45);
      --text-dim: rgba(226,232,240,0.25);
      --radius: 20px;
      --radius-sm: 14px;
    }

    body { 
      background: var(--bg); 
      margin: 0;
    }

    /* Noise texture overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }

    .glass {
      background: var(--surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border);
    }
    .glass2 {
      background: var(--surface2);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-mid);
    }
    .glass-hover:hover {
      background: var(--surface-hover);
      border-color: var(--border-glow);
    }

    /* Glows */
    .glow-indigo { box-shadow: 0 0 40px rgba(99,102,241,0.2), 0 0 80px rgba(99,102,241,0.08); }
    .glow-orange { box-shadow: 0 0 40px rgba(249,115,22,0.2), 0 0 80px rgba(249,115,22,0.08); }
    .glow-green { box-shadow: 0 0 40px rgba(16,185,129,0.2), 0 0 80px rgba(16,185,129,0.08); }
    .glow-red { box-shadow: 0 0 40px rgba(244,63,94,0.2), 0 0 80px rgba(244,63,94,0.08); }
    .glow-purple { box-shadow: 0 0 40px rgba(168,85,247,0.2); }

    /* Animated gradient text */
    @keyframes gradientFlow {
      0%,100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes gradientMove {
      0%,100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 30%, #fb923c 60%, #818cf8 100%);
      background-size: 300% 300%;
      animation: gradientFlow 5s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Button shimmer */
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-effect::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
      animation: shimmer 2.5s infinite;
    }

    /* Primary button */
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
      background-size: 200% 200%;
      animation: gradientFlow 3s ease infinite;
      position: relative;
      overflow: hidden;
    }
    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      pointer-events: none;
    }

    /* Service tab active glow */
    .tab-active {
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2));
      border: 1px solid rgba(99,102,241,0.5);
      box-shadow: 0 0 20px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    /* Card hover lift */
    .card-lift {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .card-lift:hover {
      transform: translateY(-4px) scale(1.015);
    }

    /* Scrollbar */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    .scrollbar-thin::-webkit-scrollbar { width: 3px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }

    input, select { color-scheme: dark; }
    input::placeholder { color: rgba(226,232,240,0.25) !important; }

    /* Input focus ring */
    .input-field {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e2e8f0;
      transition: all 0.2s ease;
    }
    .input-field:focus {
      background: rgba(99,102,241,0.08);
      border-color: rgba(99,102,241,0.5);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.1);
      outline: none;
    }

    /* Light mode overrides */
    .light-mode {
      --bg: #f4f6ff;
      --bg2: #eef0fa;
      --surface: rgba(255,255,255,0.9);
      --surface2: rgba(255,255,255,1);
      --surface-hover: rgba(255,255,255,1);
      --border: rgba(99,102,241,0.12);
      --border-mid: rgba(99,102,241,0.2);
      --border-glow: rgba(99,102,241,0.35);
      --text: #1e1b4b;
      --text-muted: rgba(30,27,75,0.55);
      --text-dim: rgba(30,27,75,0.35);
    }
    .light-mode body { background: var(--bg); }
    .light-mode input::placeholder { color: rgba(30,27,75,0.3) !important; }
    .light-mode input, .light-mode select { color-scheme: light; }
    .light-mode .input-field {
      background: rgba(255,255,255,0.9);
      border-color: rgba(99,102,241,0.15);
      color: #1e1b4b;
    }
    .light-mode .input-field:focus {
      background: white;
      border-color: rgba(99,102,241,0.5);
    }

    /* Pulse ring animation */
    @keyframes pulseRing {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .pulse-ring::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(99,102,241,0.6);
      animation: pulseRing 1.5s ease-out infinite;
    }

    /* Winner badge glow */
    @keyframes winnerPulse {
      0%,100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); }
      50% { box-shadow: 0 0 40px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2); }
    }
    .winner-badge {
      animation: winnerPulse 2s ease-in-out infinite;
    }

    /* Floating orbs */
    @keyframes float1 {
      0%,100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(30px,-20px) scale(1.05); }
      66% { transform: translate(-20px,10px) scale(0.95); }
    }
    @keyframes float2 {
      0%,100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(-25px,15px) scale(1.03); }
      66% { transform: translate(20px,-25px) scale(0.97); }
    }
    @keyframes float3 {
      0%,100% { transform: translate(0,0); }
      50% { transform: translate(15px,20px); }
    }

    /* Grid dot pattern */
    .dot-pattern {
      background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    /* Platform panel scrollbar */
    .platform-scroll {
      max-height: 600px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(99,102,241,0.3) transparent;
    }
    .platform-scroll::-webkit-scrollbar { width: 3px; }
    .platform-scroll::-webkit-scrollbar-track { background: transparent; }
    .platform-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }

    /* Stagger animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.4s ease forwards; }

    /* Card image zoom */
    .img-zoom { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .img-zoom:hover { transform: scale(1.08); }
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
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
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

  useEffect(() => {
    setItem("");
    setCity("");
    setResult(null);
    setError("");
    setSelectedPlatform(null);
  }, [serviceType]);

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
    milk: "https://images.unsplash.com/photo-1550583724-b2692b85b140",
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
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
              ? result.zomatoList.reduce((a, b) => (a.score < b.score ? a : b))
              : null;
          const swiggyBest =
            result.swiggyList && result.swiggyList.length > 0
              ? result.swiggyList.reduce((a, b) => (a.score < b.score ? a : b))
              : null;
          if (!zomatoBest && swiggyBest) return "swiggy";
          if (!swiggyBest && zomatoBest) return "zomato";
          if (!zomatoBest && !swiggyBest) return null;
          if (zomatoBest.price < swiggyBest.price) return "zomato";
          if (swiggyBest.price < zomatoBest.price) return "swiggy";
          return null;
        })()
      : null;

  const ecommerceWinner =
    serviceType === "ecommerce" && result
      ? (() => {
          const all = [
            ...(result?.amazonList || []),
            ...(result?.flipkartList || []),
            ...(result?.myntraList || []),
          ];
          if (all.length === 0) return null;
          return all.reduce((a, b) => (a.price < b.price ? a : b));
        })()
      : null;

  const savingsData =
    serviceType === "food" && result
      ? (() => {
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
          const fullAddress = [
            data.address?.suburb,
            data.address?.road,
            data.address?.city,
          ]
            .filter(Boolean)
            .join(", ");
          const detectedCity =
            data.address.city ||
            data.address.town ||
            data.address.state ||
            "";
          if (serviceType === "ride") {
            setCity(fullAddress);
          } else {
            setCity(detectedCity);
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
          (userRes.data.favourites || []).map((f) => f.name + f.platform + f.city)
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
        (userRes.data.favourites || []).map((f) => f.name + f.platform + f.city)
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
        (userRes.data.favourites || []).map((f) => f.name + f.platform + f.city)
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
    if (serviceType === "ride") {
      searchItem = item;
      searchCity = city;
    }
    if (
      (serviceType === "food" || serviceType === "grocery" || serviceType === "ecommerce") &&
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
    setSelectedPlatform(null);
    console.log("SENDING DATA:", { item: searchItem, city: searchCity, serviceType });
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
            (res.data.favourites || []).map((f) => f.name + f.platform + f.city)
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

  const dm = darkMode;

  /* ─── Service tab config ─── */
  const serviceTabs = [
    { id: "food", icon: "🍔", label: "Food" },
    { id: "grocery", icon: "🛒", label: "Grocery" },
    { id: "ride", icon: "🚗", label: "Ride" },
    { id: "ecommerce", icon: "🛍", label: "Shop" },
  ];

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
              className={`relative min-h-screen w-full overflow-x-hidden transition-all duration-500 ${
                dm ? "text-[#e2e8f0]" : "light-mode text-[#1e1b4b]"
              }`}
              style={{
                background: dm
                  ? "linear-gradient(135deg, #060818 0%, #0a0f24 50%, #06091a 100%)"
                  : "linear-gradient(135deg, #f0f2ff 0%, #f8f6ff 50%, #edf2ff 100%)",
              }}
            >
              {/* ── Dot grid pattern ── */}
              <div
                className="pointer-events-none fixed inset-0 dot-pattern opacity-30"
                style={{ zIndex: 0 }}
              />

              {/* ── Floating ambient orbs ── */}
              <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                <div
                  className="absolute w-[700px] h-[700px] rounded-full -top-48 -left-48"
                  style={{
                    background: dm
                      ? "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                    animation: "float1 12s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute w-[600px] h-[600px] rounded-full -bottom-36 -right-36"
                  style={{
                    background: dm
                      ? "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
                    animation: "float2 15s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/3"
                  style={{
                    background: dm
                      ? "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
                    animation: "float3 18s ease-in-out infinite",
                  }}
                />
              </div>

              {/* ── Particles (dark only) ── */}
              {dm && (
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  options={{
                    fullScreen: { enable: false },
                    background: { color: "transparent" },
                    particles: {
                      number: { value: 35 },
                      color: { value: ["#6366f1", "#a855f7", "#10b981", "#f97316"] },
                      size: { value: { min: 1, max: 2.5 } },
                      opacity: { value: { min: 0.05, max: 0.4 } },
                      move: { enable: true, speed: 0.4 },
                      links: {
                        enable: true,
                        color: "#6366f1",
                        opacity: 0.08,
                        distance: 130,
                        width: 1,
                      },
                    },
                  }}
                  className="absolute inset-0 z-0"
                />
              )}

              {/* ── Winner Badge ── */}
              <AnimatePresence>
                {(winner || groceryWinner || basketWinner || ecommerceWinner) && (
                  <motion.div
                    initial={{ opacity: 0, y: -40, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="fixed top-5 right-5 z-50"
                  >
                    <div className="winner-badge flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold border"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        borderColor: "rgba(16,185,129,0.35)",
                        color: "#34d399",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <span className="text-base">🏆</span>
                      {winner
                        ? winner === "zomato" ? "Zomato Wins" : "Swiggy Wins"
                        : basketWinner
                        ? `${basketWinner?.charAt(0)?.toUpperCase() + basketWinner?.slice(1)} Cheapest`
                        : groceryWinner
                        ? `${groceryWinner?.charAt(0)?.toUpperCase() + groceryWinner?.slice(1)} Wins`
                        : ""}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Insight Bars ── */}
              <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-4">
                {/* Food insight */}
                {serviceType === "food" && result?.zomatoList && result?.swiggyList && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="hidden lg:flex justify-center w-full max-w-2xl"
                  >
                    <div
                      className="w-full px-6 py-5 rounded-2xl text-sm font-medium border"
                      style={{
                        background: dm
                          ? "rgba(99,102,241,0.07)"
                          : "rgba(255,255,255,0.85)",
                        borderColor: dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
                        backdropFilter: "blur(20px)",
                        boxShadow: dm
                          ? "0 4px 24px rgba(99,102,241,0.1)"
                          : "0 4px 24px rgba(0,0,0,0.06)",
                      }}
                    >
                      {(() => {
                        const zomatoBest = getBestRestaurant(result.zomatoList);
                        const swiggyBest = getBestRestaurant(result.swiggyList);
                        const zomatoFastest = result.zomatoList.length > 0
                          ? result.zomatoList.reduce((a, b) => (a.time < b.time ? a : b))
                          : null;
                        const swiggyFastest = result.swiggyList.length > 0
                          ? result.swiggyList.reduce((a, b) => (a.time < b.time ? a : b))
                          : null;
                        if (!zomatoBest || !swiggyBest || !zomatoFastest || !swiggyFastest) return null;
                        const priceDifference = Math.abs(zomatoBest.price - swiggyBest.price);
                        const timeDifference = Math.abs(zomatoFastest.time - swiggyFastest.time);
                        return (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-base"
                                style={{ color: dm ? "#a5b4fc" : "#4f46e5" }}
                              >
                                {zomatoBest.price < swiggyBest.price
                                  ? `🔥 Zomato saves you ₹${priceDifference}`
                                  : swiggyBest.price < zomatoBest.price
                                  ? `🔥 Swiggy saves you ₹${priceDifference}`
                                  : "⚖️ Both platforms are priced similarly"}
                              </span>
                              <span
                                className="text-xs px-3 py-1 rounded-full font-medium"
                                style={{
                                  background: dm ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16,185,129,0.25)",
                                }}
                              >
                                {zomatoFastest.time < swiggyFastest.time
                                  ? `⚡ Zomato ${timeDifference}m faster`
                                  : swiggyFastest.time < zomatoFastest.time
                                  ? `⚡ Swiggy ${timeDifference}m faster`
                                  : "⏱ Similar delivery time"}
                              </span>
                            </div>
                            <div className="w-full space-y-2.5">
                              {(() => {
                                const maxPrice = Math.max(zomatoBest.price, swiggyBest.price);
                                return (
                                  <>
                                    {[
                                      { label: "Zomato", price: zomatoBest.price, color: "#f43f5e" },
                                      { label: "Swiggy", price: swiggyBest.price, color: "#f97316" },
                                    ].map((p) => (
                                      <div key={p.label}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                          <span className="font-semibold" style={{ color: p.color }}>{p.label}</span>
                                          <span className="font-bold" style={{ color: dm ? "#e2e8f0" : "#1e1b4b" }}>
                                            ₹{p.price}
                                          </span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden"
                                          style={{ background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
                                        >
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(p.price / maxPrice) * 100}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: p.color }}
                                          />
                                        </div>
                                      </div>
                                    ))}
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

                {/* Grocery insight */}
                {serviceType === "grocery" && result && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="hidden lg:flex justify-center w-full max-w-2xl"
                  >
                    <div
                      className="w-full px-6 py-5 rounded-2xl text-sm font-medium border"
                      style={{
                        background: dm ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.85)",
                        borderColor: dm ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.2)",
                        backdropFilter: "blur(20px)",
                        boxShadow: dm
                          ? "0 4px 24px rgba(16,185,129,0.08)"
                          : "0 4px 24px rgba(0,0,0,0.06)",
                      }}
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
                        const cheapest = platforms.reduce((a, b) => (a.price < b.price ? a : b));
                        const fastest = platforms.reduce((a, b) => (a.time < b.time ? a : b));
                        const mostExpensive = platforms.reduce((a, b) => (a.price > b.price ? a : b));
                        const savings = mostExpensive.price - cheapest.price;
                        const colorMap = {
                          Zepto: "#a855f7",
                          Blinkit: "#fbbf24",
                          Instamart: "#f97316",
                          JioMart: "#6366f1",
                        };
                        return (
                          <div className="flex items-center justify-around gap-4">
                            {[
                              { icon: "🛒", label: "Basket", value: `${itemCount} items` },
                              { icon: "💰", label: "Best Price", value: cheapest.name, color: colorMap[cheapest.name] },
                              { icon: "⚡", label: "Fastest", value: fastest.name, color: colorMap[fastest.name] },
                              { icon: "✂️", label: "You Save", value: `₹${savings}`, color: "#10b981" },
                            ].map((s) => (
                              <div key={s.label} className="text-center">
                                <div className="text-xl mb-1">{s.icon}</div>
                                <div className="font-bold text-base" style={{ color: s.color || (dm ? "#e2e8f0" : "#1e1b4b") }}>
                                  {s.value}
                                </div>
                                <div className="text-xs" style={{ color: dm ? "rgba(226,232,240,0.4)" : "rgba(30,27,75,0.5)" }}>
                                  {s.label}
                                </div>
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
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden lg:flex justify-center w-full max-w-2xl"
                  >
                    <div className="px-6 py-4 rounded-2xl border text-sm"
                      style={{
                        background: dm ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.85)",
                        borderColor: dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      {(() => {
                        const all = [
                          ...(result.amazonList || []),
                          ...(result.flipkartList || []),
                          ...(result.myntraList || []),
                        ];
                        if (all.length === 0) return null;
                        const cheapest = all.reduce((a, b) => (a.price < b.price ? a : b));
                        return (
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">🛍</span>
                            <div>
                              <div className="font-bold" style={{ color: dm ? "#a5b4fc" : "#4f46e5" }}>
                                Best Deal: ₹{cheapest.price}
                              </div>
                              <div className="text-xs opacity-60">{cheapest.name}</div>
                            </div>
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
                    className="w-full max-w-2xl px-5 py-4 rounded-2xl text-sm border"
                    style={{
                      background: dm ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.85)",
                      borderColor: dm ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.2)",
                      backdropFilter: "blur(20px)",
                      boxShadow: dm ? "0 4px 24px rgba(16,185,129,0.08)" : "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="font-bold mb-3 flex items-center gap-2"
                      style={{ color: dm ? "#34d399" : "#059669" }}
                    >
                      <span>💰</span> Smart Savings Insight
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "This Order", value: `₹${savingsData.perOrder}` },
                        { label: "Monthly (8×)", value: `₹${savingsData.monthly}` },
                        { label: "Yearly", value: `₹${savingsData.yearly}` },
                        { label: "Cheaper by", value: `${savingsData.percentage}%` },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="px-3 py-2.5 rounded-xl text-center"
                          style={{
                            background: dm ? "rgba(255,255,255,0.04)" : "rgba(16,185,129,0.06)",
                            border: dm ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(16,185,129,0.15)",
                          }}
                        >
                          <div className="font-bold text-base" style={{ color: dm ? "#34d399" : "#059669" }}>
                            {s.value}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: dm ? "rgba(226,232,240,0.4)" : "rgba(30,27,75,0.5)" }}>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Mobile platform toggle */}
                {serviceType === "food" && result && (
                  <div className="flex lg:hidden justify-center gap-3 mt-1">
                    {[
                      { id: "zomato", icon: "🍅", label: "Zomato", color: "#f43f5e" },
                      { id: "swiggy", icon: "🟠", label: "Swiggy", color: "#f97316" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setMobilePlatform(p.id)}
                        className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
                        style={
                          mobilePlatform === p.id
                            ? {
                                background: p.color,
                                color: "#fff",
                                boxShadow: `0 0 20px ${p.color}50`,
                              }
                            : {
                                background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                                color: dm ? "rgba(226,232,240,0.5)" : "rgba(30,27,75,0.6)",
                                border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              }
                        }
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── THREE-COLUMN LAYOUT ── */}
              <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-6 px-4 lg:px-8 py-6">

                {/* ── LEFT: Grocery Panel ── */}
                {serviceType === "grocery" && result && (
                  <GroceryPanel
                    platforms={[
                      { name: "Zepto", price: result.basket?.[0]?.zepto, time: 10, url: "https://www.zeptonow.com/", color: "purple", borderClass: dm ? "border-purple-500/40" : "border-purple-400" },
                      { name: "Blinkit", price: result.basket?.[0]?.blinkit, time: 9, url: "https://blinkit.com/", color: "yellow", borderClass: dm ? "border-yellow-500/40" : "border-yellow-400" },
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
                    logo={zomatoLogo}
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

                {serviceType === "ecommerce" && result && (
                  <div className="w-full max-w-md flex justify-start">
                    <PlatformPanel
                      platform="amazon"
                      label="Amazon"
                      color="yellow"
                      list={result.amazonList || []}
                      item={item}
                      loading={loading}
                      dm={dm}
                      favourites={favourites}
                      city={city}
                      addFavourite={addFavourite}
                    />
                  </div>
                )}

                {/* ── CENTER CARD ── */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-md lg:max-w-sm xl:max-w-md rounded-3xl overflow-hidden"
                  style={{
                    background: dm
                      ? "linear-gradient(145deg, rgba(13,17,40,0.95) 0%, rgba(10,12,28,0.98) 100%)"
                      : "rgba(255,255,255,0.92)",
                    border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.12)"}`,
                    boxShadow: dm
                      ? "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 32px 80px rgba(99,102,241,0.08), 0 0 0 1px rgba(99,102,241,0.08)",
                    backdropFilter: "blur(40px)",
                  }}
                >
                  {/* Card gradient top strip */}
                  <div className="h-[2px] w-full" style={{
                    background: "linear-gradient(90deg, #6366f1, #a855f7, #f97316, #6366f1)",
                    backgroundSize: "200% 100%",
                    animation: "gradientFlow 4s ease infinite",
                  }} />

                  {/* Inner glow */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl"
                    style={{
                      background: dm
                        ? "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)"
                        : "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)",
                    }}
                  />

                  <div className="relative p-7">
                    {/* ── Top action bar ── */}
                    <div className="flex justify-end mb-5 gap-2 flex-wrap">
                      {isLoggedIn && (
                        <button
                          onClick={() => (window.location.href = "/dashboard")}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                          style={{
                            background: dm ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
                            color: dm ? "#a5b4fc" : "#4f46e5",
                            border: `1px solid ${dm ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)"}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = dm ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)";
                          }}
                        >
                          📊 Dashboard
                        </button>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={handleLogout}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                          style={{
                            background: dm ? "rgba(244,63,94,0.1)" : "rgba(244,63,94,0.07)",
                            color: dm ? "#fb7185" : "#e11d48",
                            border: `1px solid ${dm ? "rgba(244,63,94,0.25)" : "rgba(244,63,94,0.2)"}`,
                          }}
                        >
                          ← Logout
                        </button>
                      )}
                      <button
                        onClick={() => setDarkMode(!dm)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                        style={{
                          background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                          color: dm ? "rgba(226,232,240,0.6)" : "rgba(30,27,75,0.6)",
                          border: `1px solid ${dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                        }}
                      >
                        {dm ? "☀ Light" : "🌙 Dark"}
                      </button>
                    </div>

                    {/* ── Service Selector ── */}
                    <div
                      className="flex p-1 rounded-2xl mb-6 gap-1"
                      style={{
                        background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      }}
                    >
                      {serviceTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setServiceType(tab.id);
                            setResult(null);
                          }}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex flex-col items-center gap-0.5"
                          style={
                            serviceType === tab.id
                              ? {
                                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))",
                                  color: dm ? "#a5b4fc" : "#4f46e5",
                                  border: "1px solid rgba(99,102,241,0.4)",
                                  boxShadow: "0 0 20px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                                }
                              : {
                                  color: dm ? "rgba(226,232,240,0.35)" : "rgba(30,27,75,0.4)",
                                  border: "1px solid transparent",
                                }
                          }
                        >
                          <span className="text-base">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* ── HeaderSection ── */}
                    <HeaderSection user={user} insights={insights} serviceType={serviceType} />

                    {/* ── Brand ── */}
                    <div className="text-center mb-7">
                      <h1 className="brand text-4xl font-black tracking-tight gradient-text">
                        PriceCompare
                      </h1>
                      <p className="mt-1.5 text-sm" style={{ color: dm ? "rgba(226,232,240,0.35)" : "rgba(30,27,75,0.45)" }}>
                        {serviceType === "food" && "Find the cheapest bite in seconds"}
                        {serviceType === "grocery" && "Compare grocery prices instantly"}
                        {serviceType === "ride" && "Compare ride fares instantly"}
                        {serviceType === "ecommerce" && "Best deals across all stores"}
                      </p>
                      <div
                        className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: dm ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.07)",
                          color: dm ? "#a5b4fc" : "#4f46e5",
                          border: `1px solid ${dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.2)"}`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-green-400"
                          style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)", animation: "pulse 2s infinite" }}
                        />
                        Live Price Comparison Engine
                      </div>
                    </div>

                    {/* ── Inputs ── */}
                    <div className="space-y-3">
                      {/* Item input */}
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">
                          {serviceType === "food" ? "🍽️"
                            : serviceType === "grocery" ? "🥬"
                            : serviceType === "ecommerce" ? "🛍"
                            : "🏁"}
                        </span>
                        <input
                          type="text"
                          placeholder={
                            serviceType === "food" ? "Search food (e.g. pizza)"
                              : serviceType === "grocery" ? "Search grocery (e.g. milk)"
                              : serviceType === "ecommerce" ? "Search product (e.g. iPhone)"
                              : "Drop location"
                          }
                          value={item}
                          onChange={(e) => setItem(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                          className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium"
                          style={{
                            background: dm ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
                            border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}`,
                            color: dm ? "#e2e8f0" : "#1e1b4b",
                          }}
                        />
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)" }}
                        />
                      </div>

                      {/* City + Location button */}
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">
                            {serviceType === "ride" ? "📍" : "🌆"}
                          </span>
                          <input
                            type="text"
                            placeholder={
                              serviceType === "ride"
                                ? "Pickup location (e.g. Sector 15A)"
                                : "City (e.g. Mumbai)"
                            }
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                            className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium"
                            style={{
                              background: dm ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
                              border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}`,
                              color: dm ? "#e2e8f0" : "#1e1b4b",
                            }}
                          />
                        </div>

                        {/* Location button */}
                        <motion.button
                          type="button"
                          onClick={handleGetLocation}
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          className="relative px-4 py-3.5 rounded-xl font-semibold text-sm transition-all overflow-hidden"
                          style={{
                            background: dm
                              ? "rgba(99,102,241,0.15)"
                              : "rgba(99,102,241,0.1)",
                            color: dm ? "#a5b4fc" : "#4f46e5",
                            border: `1px solid ${dm ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.25)"}`,
                          }}
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
                            <span className="absolute inset-0 rounded-xl border-2 animate-ping opacity-30"
                              style={{ borderColor: "#6366f1" }}
                            />
                          )}
                        </motion.button>
                      </div>

                      {/* Compare button */}
                      <motion.button
                        onClick={() => handleCompare()}
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.01 }}
                        className="w-full flex items-center justify-center gap-2.5 font-bold py-4 rounded-xl text-white text-sm transition-all duration-300 relative overflow-hidden disabled:opacity-60 btn-primary shimmer-effect"
                        style={{
                          boxShadow: loading
                            ? "none"
                            : "0 6px 30px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.3)",
                        }}
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-center"
                          style={{ color: dm ? "rgba(165,180,252,0.6)" : "#6366f1" }}
                        >
                          ⚡ Fetching live prices from all platforms…
                        </motion.p>
                      )}
                    </div>

                    {/* ── Error ── */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-center mt-4 text-sm px-4 py-3 rounded-xl"
                          style={{
                            background: dm ? "rgba(244,63,94,0.08)" : "rgba(244,63,94,0.06)",
                            color: dm ? "#fb7185" : "#e11d48",
                            border: `1px solid ${dm ? "rgba(244,63,94,0.2)" : "rgba(244,63,94,0.15)"}`,
                          }}
                        >
                          ⚠️ {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* ── Basket Mode ── */}
                    {isBasketMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-2xl"
                        style={{
                          background: dm ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.04)",
                          border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.1)"}`,
                        }}
                      >
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"
                          style={{ color: dm ? "#a5b4fc" : "#4f46e5" }}
                        >
                          <span>🛒</span> Basket Comparison
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(result.totals).map(([platform, price]) => (
                            <div
                              key={platform}
                              className="flex justify-between items-center px-4 py-2.5 rounded-xl text-sm transition-all"
                              style={
                                basketWinner === platform
                                  ? {
                                      background: "rgba(16,185,129,0.1)",
                                      border: "1px solid rgba(16,185,129,0.25)",
                                      color: "#10b981",
                                    }
                                  : {
                                      background: dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                                      border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                    }
                              }
                            >
                              <span className="capitalize flex items-center gap-1.5 font-medium">
                                {basketWinner === platform && <span>🏆</span>}
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
                        <h4 className="text-xs font-bold mb-2 uppercase tracking-widest"
                          style={{ color: dm ? "rgba(226,232,240,0.3)" : "rgba(30,27,75,0.4)" }}
                        >
                          Basket Items
                        </h4>
                        <div className="space-y-1.5">
                          {result.basket.map((bItem, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-xs p-3 rounded-xl transition-all"
                              style={{
                                background: dm ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
                                border: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                              }}
                            >
                              <span className="font-semibold capitalize">{bItem.product}</span>
                              <div className="flex gap-3 font-semibold">
                                <span style={{ color: "#a855f7" }}>Z ₹{bItem.zepto}</span>
                                <span style={{ color: "#fbbf24" }}>B ₹{bItem.blinkit}</span>
                                <span style={{ color: "#f97316" }}>I ₹{bItem.instamart}</span>
                                <span style={{ color: "#6366f1" }}>J ₹{bItem.jiomart}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Recent searches ── */}
                    {history.length > 0 && (
                      <div
                        className="mt-6 pt-5"
                        style={{ borderTop: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: dm ? "rgba(226,232,240,0.3)" : "rgba(30,27,75,0.4)" }}
                          >
                            Recent Searches
                          </p>
                          <button
                            onClick={handleClearHistory}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: dm ? "rgba(251,113,133,0.7)" : "#e11d48" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#f43f5e"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = dm ? "rgba(251,113,133,0.7)" : "#e11d48"; }}
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
                                const type = search.serviceType || "food";
                                setServiceType(type);
                                if (type === "ride") {
                                  setPickup(search.city);
                                  setDrop(search.item);
                                } else {
                                  setItem(search.item);
                                  setCity(search.city);
                                }
                                const token = localStorage.getItem("token");
                                try {
                                  const response = await axios.post(
                                    "https://food-price-compare-production.up.railway.app/compare",
                                    { item: search.item, city: search.city, serviceType: type },
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
                              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                              style={{
                                background: dm ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.06)",
                                color: dm ? "rgba(226,232,240,0.55)" : "rgba(30,27,75,0.65)",
                                border: `1px solid ${dm ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.12)"}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = dm ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.1)";
                                e.currentTarget.style.color = dm ? "#a5b4fc" : "#4f46e5";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = dm ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.06)";
                                e.currentTarget.style.color = dm ? "rgba(226,232,240,0.55)" : "rgba(30,27,75,0.65)";
                              }}
                            >
                              🕒 {search.item} · {search.city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                {/* ── END CENTER CARD ── */}

                {/* ── Ride Results ── */}
                {serviceType === "ride" && result && (
                  <div className="flex flex-col gap-6 w-full max-w-5xl">
                    {/* Map */}
                    <div className="w-full h-[320px] rounded-2xl overflow-hidden shadow-lg"
                      style={{ border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}` }}
                    >
                      <RideMap pickupCoords={result.pickupCoords} dropCoords={result.dropCoords} />
                    </div>

                    {/* Ride platform cards */}
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {Object.entries(result.platforms).map(([name, data]) => {
                          const isWinner = result.winner === name;
                          const minPrice = Math.min(...Object.values(data).map((r) => r.price));
                          const minTime = Math.min(...Object.values(data).map((r) => r.time));
                          const platformIcons = { uber: "🚗", ola: "🛺", rapido: "🏍", indrive: "💸" };

                          return (
                            <motion.div
                              key={name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.03, y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedPlatform(selectedPlatform === name ? null : name)}
                              className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300"
                              style={
                                isWinner
                                  ? {
                                      background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))",
                                      border: "2px solid rgba(16,185,129,0.5)",
                                      boxShadow: "0 0 40px rgba(16,185,129,0.25), 0 8px 32px rgba(0,0,0,0.3)",
                                    }
                                  : {
                                      background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(30,27,75,0.3))",
                                      border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}`,
                                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                                    }
                              }
                            >
                              <div className="relative p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="text-3xl">{platformIcons[name] || "🚗"}</div>
                                    <h2 className="font-black text-lg capitalize text-white leading-tight">
                                      {name}
                                    </h2>
                                  </div>
                                  {isWinner && (
                                    <div className="px-3 py-1 rounded-full text-xs font-black text-white"
                                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                    >
                                      🏆 Best
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(226,232,240,0.6)" }}>
                                    <span>⏱</span>
                                    <span>{minTime} mins</span>
                                  </div>
                                  <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                    <p className="text-xs mb-1" style={{ color: "rgba(226,232,240,0.4)" }}>Price</p>
                                    <p className="text-3xl font-black"
                                      style={{ background: "linear-gradient(135deg, #34d399, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                    >
                                      ₹{minPrice}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Expandable ride options */}
                      <AnimatePresence>
                        {selectedPlatform && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between px-1">
                              <h3 className="text-2xl font-black capitalize text-white">
                                {selectedPlatform}{" "}
                                <span style={{ color: "#34d399" }}>Options</span>
                              </h3>
                              <button
                                onClick={() => setSelectedPlatform(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(226,232,240,0.6)" }}
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {Object.entries(result.platforms[selectedPlatform]).map(([type, ride], idx) => {
                                const typeIcons = { car: "🚗", bike: "🏍", auto: "🛺" };
                                return (
                                  <motion.div
                                    key={type}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl"
                                    style={{
                                      background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(10,12,28,0.8))",
                                      border: "1px solid rgba(99,102,241,0.2)",
                                    }}
                                  >
                                    <div className="relative p-6 flex flex-col">
                                      <div className="flex items-center gap-3 mb-5">
                                        <div className="text-4xl">{typeIcons[type] || "🚗"}</div>
                                        <h4 className="font-black text-lg capitalize text-white">{type}</h4>
                                      </div>
                                      <div className="flex items-center gap-2 mb-3" style={{ color: "rgba(226,232,240,0.6)" }}>
                                        <span className="text-sm">⏱</span>
                                        <span className="text-sm font-medium">{ride.time} mins</span>
                                      </div>
                                      <div className="mb-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                        <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: "rgba(226,232,240,0.4)" }}>Price</p>
                                        <p className="text-3xl font-black"
                                          style={{ background: "linear-gradient(135deg, #34d399, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                        >
                                          ₹{ride.price}
                                        </p>
                                      </div>
                                      <button className="mt-auto w-full py-3 px-4 rounded-xl font-black text-white uppercase tracking-wide text-sm transition-all duration-300 group-hover:scale-105"
                                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
                                      >
                                        Book Now
                                      </button>
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

                {/* ── RIGHT: Grocery Panel ── */}
                {serviceType === "grocery" && result && (
                  <GroceryPanel
                    platforms={[
                      { name: "Instamart", price: result.basket?.[0]?.instamart, time: 14, url: "https://www.swiggy.com/instamart", color: "orange", borderClass: dm ? "border-orange-500/40" : "border-orange-400" },
                      { name: "JioMart", price: result.basket?.[0]?.jiomart, time: 25, url: "https://www.jiomart.com/", color: "blue", borderClass: dm ? "border-blue-500/40" : "border-blue-400" },
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
                    logo={swiggyLogo}
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

                {serviceType === "ecommerce" && result && (
                  <div className="flex flex-col gap-6 w-full max-w-md">
                    <PlatformPanel
                      platform="flipkart"
                      label="Flipkart"
                      color="blue"
                      list={result.flipkartList || []}
                      item={item}
                      loading={loading}
                      dm={dm}
                      favourites={favourites}
                      city={city}
                      addFavourite={addFavourite}
                    />
                    <PlatformPanel
                      platform="myntra"
                      label="Myntra"
                      color="pink"
                      list={result.myntraList || []}
                      item={item}
                      loading={loading}
                      dm={dm}
                      favourites={favourites}
                      city={city}
                      addFavourite={addFavourite}
                    />
                  </div>
                )}
              </div>

              {/* ── Login Popup ── */}
              <AnimatePresence>
                {showLoginPopup && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ background: "rgba(6,8,24,0.75)", backdropFilter: "blur(12px)" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 40, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="w-full max-w-sm rounded-3xl overflow-hidden"
                      style={{
                        background: dm
                          ? "linear-gradient(145deg, rgba(13,17,40,0.98), rgba(8,10,24,0.99))"
                          : "rgba(255,255,255,0.97)",
                        border: `1px solid ${dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
                        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
                      }}
                    >
                      {/* Top strip */}
                      <div className="h-[2px]"
                        style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #f97316)" }}
                      />
                      <div className="p-8">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
                        >
                          <span className="text-2xl">{isRegisterMode ? "✨" : "👋"}</span>
                        </div>
                        <h2 className="brand text-2xl font-black mb-1 text-center"
                          style={{ color: dm ? "#e2e8f0" : "#1e1b4b" }}
                        >
                          {isRegisterMode ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className="text-xs text-center mb-6"
                          style={{ color: dm ? "rgba(226,232,240,0.4)" : "rgba(30,27,75,0.5)" }}
                        >
                          {isRegisterMode ? "Sign up to save your comparisons" : "Login to compare prices"}
                        </p>

                        <div className="space-y-3">
                          {isRegisterMode && (
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                              style={{
                                background: dm ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.04)",
                                border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}`,
                                color: dm ? "#e2e8f0" : "#1e1b4b",
                              }}
                            />
                          )}
                          {["email", "password"].map((field) => (
                            <input
                              key={field}
                              type={field}
                              placeholder={field === "email" ? "Email address" : "Password"}
                              value={field === "email" ? email : password}
                              onChange={(e) => field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                              style={{
                                background: dm ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.04)",
                                border: `1px solid ${dm ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)"}`,
                                color: dm ? "#e2e8f0" : "#1e1b4b",
                              }}
                            />
                          ))}
                        </div>

                        {authError && (
                          <div className="mt-3 p-3 rounded-xl text-xs"
                            style={{
                              background: dm ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)",
                              border: `1px solid ${dm ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
                              color: dm ? "#a5b4fc" : "#4f46e5",
                            }}
                          >
                            📧 Please verify your email first. Check your inbox or spam folder.
                          </div>
                        )}

                        <motion.button
                          onClick={isRegisterMode ? handleSignup : handleLogin}
                          disabled={loginLoading}
                          whileTap={{ scale: 0.97 }}
                          className="w-full mt-4 btn-primary py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                          style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
                        >
                          {loginLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          {loginLoading
                            ? isRegisterMode ? "Creating..." : "Logging in..."
                            : isRegisterMode ? "Create Account" : "Login"}
                        </motion.button>

                        <div className="flex items-center gap-3 my-4 text-xs"
                          style={{ color: dm ? "rgba(226,232,240,0.25)" : "rgba(30,27,75,0.3)" }}
                        >
                          <div className="flex-1 h-px" style={{ background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                          OR
                          <div className="flex-1 h-px" style={{ background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
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

                        <p className="text-center text-xs mt-4"
                          style={{ color: dm ? "rgba(226,232,240,0.4)" : "rgba(30,27,75,0.5)" }}
                        >
                          {isRegisterMode ? "Already have an account? " : "Don't have an account? "}
                          <span
                            onClick={() => setIsRegisterMode(!isRegisterMode)}
                            className="cursor-pointer hover:underline font-bold"
                            style={{ color: "#6366f1" }}
                          >
                            {isRegisterMode ? "Login" : "Register"}
                          </span>
                        </p>

                        <button
                          onClick={() => { setShowLoginPopup(false); setIsRegisterMode(false); }}
                          className="w-full mt-3 text-xs py-2 rounded-xl transition-all"
                          style={{ color: dm ? "rgba(226,232,240,0.3)" : "rgba(30,27,75,0.4)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Floating AI ── */}
              <FloatingAI
                setItem={setItem}
                setCity={setCity}
                handleCompare={handleCompare}
                setServiceType={setServiceType}
                isLoggedIn={isLoggedIn}
              />
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
function PlatformPanel({ show = true, platform, label, color, list, item, loading, winner, dm, favourites, city, addFavourite }) {
  const logos = {
    amazon: amazonLogo,
    flipkart: flipkartLogo,
    myntra: myntraLogo,
    zomato: zomatoLogo,
    swiggy: swiggyLogo,
  };

  const isWinner = winner === platform;

  const accentMap = {
    red: { main: "#f43f5e", dim: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)", glow: "rgba(244,63,94,0.2)" },
    orange: { main: "#f97316", dim: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", glow: "rgba(249,115,22,0.2)" },
    blue: { main: "#3b82f6", dim: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", glow: "rgba(59,130,246,0.2)" },
    yellow: { main: "#f59e0b", dim: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.2)" },
    pink: { main: "#ec4899", dim: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)", glow: "rgba(236,72,153,0.2)" },
  };
  const accent = accentMap[color] || accentMap.orange;

  return (
    <div
      className={`${show ? "block" : "hidden"} lg:block w-full lg:w-80 rounded-2xl overflow-hidden transition-all duration-500`}
      style={{
        background: dm
          ? "linear-gradient(145deg, rgba(13,17,40,0.95), rgba(10,12,28,0.97))"
          : "rgba(255,255,255,0.9)",
        border: `1px solid ${isWinner ? accent.border : dm ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.1)"}`,
        boxShadow: isWinner
          ? `0 0 50px ${accent.glow}, 0 8px 32px rgba(0,0,0,0.3)`
          : dm
          ? "0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(99,102,241,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top accent strip */}
      <div className="h-[2px]" style={{ background: accent.main }} />

      {/* Platform Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center gap-2 py-3.5 backdrop-blur-xl"
        style={{
          background: dm ? "rgba(13,17,40,0.9)" : "rgba(255,255,255,0.92)",
          borderBottom: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <img
          src={logos[platform]}
          alt={platform}
          className="h-9 object-contain"
          style={{ filter: dm ? "brightness(1.1)" : "none" }}
        />
        {isWinner && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            🏆 Winner
          </span>
        )}
      </div>

      {/* Products */}
      <div className="p-3 space-y-3 platform-scroll">
        {loading ? (
          <>
            <SkeletonCard dm={dm} />
            <SkeletonCard dm={dm} />
            <SkeletonCard dm={dm} />
          </>
        ) : list && list.length > 0 ? (
          [...list]
            .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
            .map((product, index) => (
              <RestaurantCard
                key={product.name + platform}
                rest={product}
                index={index}
                platform={platform}
                item={item}
                city={city}
                dm={dm}
                favourites={favourites}
                addFavourite={addFavourite}
                accent={accent}
              />
            ))
        ) : (
          <div
            className="text-center py-10 text-sm"
            style={{ color: dm ? "rgba(226,232,240,0.35)" : "rgba(30,27,75,0.4)" }}
          >
            <div className="text-3xl mb-2">🔍</div>
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Restaurant / Product Card ─── */
function RestaurantCard({ rest, index, platform, item, city, dm, favourites, addFavourite, accent }) {
  const isFav = favourites.includes(rest.name + platform + city);
  const isBest = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer card-lift"
      style={{
        background: dm
          ? isBest
            ? `linear-gradient(145deg, ${accent.dim}, rgba(255,255,255,0.02))`
            : "rgba(255,255,255,0.03)"
          : isBest
          ? `linear-gradient(145deg, ${accent.dim}, rgba(255,255,255,0.5))`
          : "rgba(255,255,255,0.7)",
        border: `1px solid ${isBest ? accent.border : dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        boxShadow: isBest ? `0 4px 20px ${accent.glow}` : "none",
      }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={rest.image || `https://loremflickr.com/600/400/${item}?random=${index}`}
          onError={(e) => { e.target.src = `https://loremflickr.com/600/400/${item}?random=${index}`; }}
          alt={rest.name}
          className="w-full h-full object-cover img-zoom"
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}
        />

        {isBest && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wide"
            style={{ background: accent.main, boxShadow: `0 2px 8px ${accent.glow}` }}
          >
            Best Deal
          </motion.div>
        )}

        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          ⭐ {rest.rating || 4.2}
        </div>

        {/* Fav button */}
        <button
          onClick={() => addFavourite(rest.name, platform, city, rest.price, rest.image)}
          className="absolute top-10 left-2 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <motion.span
            animate={{ scale: isFav ? 1.3 : 1 }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{ color: isFav ? "#f43f5e" : "rgba(255,255,255,0.6)" }}
          >
            ❤️
          </motion.span>
        </button>

        {/* Name overlay */}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="text-white font-bold text-sm leading-tight line-clamp-1">
            {rest.name}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs opacity-70">
  <span>⏱ {rest.time || 30} mins</span>
  <span>•</span>
  <span>📍 {rest.distance || 2} km</span>
</div>
          <div className="text-lg font-black" style={{ color: accent.main }}>
            {rest.price ? (
              <>₹<CountUp end={rest.price} duration={0.8} /></>
            ) : (
              <span className="text-sm" style={{ color: "rgba(226,232,240,0.3)" }}>N/A</span>
            )}
          </div>
        </div>
        <a
          href={rest.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white text-xs font-black transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${accent.main}, ${accent.main}cc)`,
            boxShadow: `0 2px 12px ${accent.glow}`,
          }}
        >
          Buy Now →
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Grocery Panel ─── */
function GroceryPanel({ platforms, basket, groceryImages, categoryColors, dm, title, titleColor }) {
  const titleColorMap = {
    "text-purple-400": "#a855f7",
    "text-blue-400": "#60a5fa",
    "text-orange-400": "#fb923c",
    "text-green-400": "#4ade80",
  };
  const titleHex = titleColorMap[titleColor] || "#a855f7";

  return (
    <div
      className="w-full lg:w-72 rounded-2xl overflow-hidden transition-all"
      style={{
        background: dm
          ? "linear-gradient(145deg, rgba(13,17,40,0.95), rgba(10,12,28,0.97))"
          : "rgba(255,255,255,0.9)",
        border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.1)"}`,
        boxShadow: dm ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(99,102,241,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="py-3.5 text-center font-black text-sm"
        style={{
          color: titleHex,
          borderBottom: `1px solid ${dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontSize: "11px",
        }}
      >
        {title}
      </div>
      <div className="p-3 space-y-3">
        {platforms.map((platform, pIndex) => {
          const platformColors = {
            Zepto: { main: "#a855f7", dim: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
            Blinkit: { main: "#fbbf24", dim: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
            Instamart: { main: "#f97316", dim: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
            JioMart: { main: "#6366f1", dim: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)" },
          };
          const pc = platformColors[platform.name] || platformColors.Zepto;

          return (
            <div
              key={platform.name + pIndex}
              className="rounded-xl p-3 transition-all hover:scale-[1.01]"
              style={{
                background: dm ? pc.dim : "rgba(255,255,255,0.6)",
                border: `1px solid ${pc.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black" style={{ color: pc.main }}>
                  {platform.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: dm ? "rgba(226,232,240,0.5)" : "rgba(30,27,75,0.5)",
                  }}
                >
                  ⏱ {platform.time}m
                </span>
              </div>

              <div className={`${basket?.length > 1 ? "flex gap-2 overflow-x-auto pb-1 scrollbar-hide" : "flex justify-center"}`}>
                {basket?.map((bItem, i) => {
                  const imageKey = bItem.product.toLowerCase().split(" ")[0];
                  return (
                    <div
                      key={i}
                      className={`${basket?.length > 1 ? "min-w-[130px]" : "w-full"} rounded-xl overflow-hidden flex-shrink-0`}
                      style={{
                        background: dm ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                        border: `1px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      }}
                    >
                      <a
                        href={
                          platform.name === "Zepto" ? `https://www.zeptonow.com/search?query=${bItem.product}`
                            : platform.name === "Blinkit" ? `https://blinkit.com/s/?q=${bItem.product}`
                            : platform.name === "Instamart" ? `https://www.swiggy.com/instamart/search?query=${bItem.product}`
                            : `https://www.jiomart.com/search/${bItem.product}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={bItem.image || groceryImages[imageKey]}
                          loading="lazy"
                          onError={(e) => { e.target.src = groceryImages[imageKey]; }}
                          className="w-full h-20 object-cover hover:scale-105 transition-transform duration-300"
                          alt={bItem.product}
                        />
                      </a>
                      <div className="p-2">
                        <span className={`${categoryColors[bItem.category || "other"]} text-white text-[9px] px-1.5 py-0.5 rounded-full font-black`}>
                          {bItem.category}
                        </span>
                        <div className="font-bold text-xs mt-1 capitalize"
                          style={{ color: dm ? "rgba(226,232,240,0.8)" : "#1e1b4b" }}
                        >
                          {bItem.product}
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="font-black" style={{ color: pc.main }}>
                            ₹{platform.name === "Zepto" ? bItem.zepto
                              : platform.name === "Blinkit" ? bItem.blinkit
                              : platform.name === "Instamart" ? bItem.instamart
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
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 text-white text-xs font-black rounded-xl transition-all hover:scale-[1.02] hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${pc.main}, ${pc.main}cc)`,
                  boxShadow: `0 2px 12px ${pc.dim}`,
                }}
              >
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
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)" }}
    >
      <div className="h-36 relative overflow-hidden"
        style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}
      >
        <div className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            animation: "shimmer 1.8s ease infinite",
          }}
        />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="h-2.5 w-3/4 rounded-full"
          style={{ background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}
        />
        <div className="h-2 w-1/2 rounded-full"
          style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }}
        />
        <div className="h-9 rounded-xl mt-2"
          style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}
        />
      </div>
    </div>
  );
}

/* ─── Price Card ─── */
function PriceCard({ name, price, cheapest, maxPrice, logo, time }) {
  const percentage = (price / maxPrice) * 100;
  return (
    <div
      className="relative overflow-hidden flex flex-col p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
      style={
        cheapest
          ? {
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 8px 32px rgba(16,185,129,0.2)",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }
      }
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logo} alt={name} className="w-5 h-5 object-contain" />
          <span className="text-lg font-bold">{name}</span>
        </div>
        {cheapest && (
          <span className="text-xs px-3 py-1 rounded-full text-white font-black"
            style={{ background: "#10b981" }}
          >
            BEST PRICE
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-black">
        ₹<CountUp end={price} duration={1} separator="," />
      </div>
      <p className="text-sm mt-1" style={{ color: "rgba(226,232,240,0.6)" }}>⏱ {time} mins</p>
      <div className="mt-4 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: cheapest ? "#10b981" : "#6366f1",
          }}
        />
      </div>
    </div>
  );
}
