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
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);


   useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);
  useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setDarkMode(true);
  }
}, []);
useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);


  const handleCompare = async () => {
    if (!item || !city) {
      setError("Please enter food item and city.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "https://food-price-compare-1.onrender.com/compare",
        { item, city }
      );

      setResult(response.data);
      setHistory((prev) => {
  const updated = [{ item, city }, ...prev];
  const limited = updated.slice(0, 5);

  localStorage.setItem("searchHistory", JSON.stringify(limited));

  return limited;
});

    } catch (err) {
      setError("Unable to fetch prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
  className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
    darkMode ? "bg-black" : "bg-white"
  }`}
>
   <h2 className="text-xl font-bold">
      {darkMode ? "DARK MODE ACTIVE" : "LIGHT MODE ACTIVE"}
    </h2>

      <div
  className={`w-full max-w-lg mx-auto rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
    darkMode
      ? "bg-gray-800 text-white"
      : "bg-white text-slate-800"
  }`}
>
<div className="flex justify-end mb-4">
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="text-sm px-3 py-1 rounded-full border transition"
  >
    {darkMode ? "☀ Light" : "🌙 Dark"}
  </button>
</div>


        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold ${
  darkMode ? "text-white" : "text-slate-800"
}`}>

            PriceCompare
          </h1>
          <p className={`mt-2 ${
  darkMode ? "text-slate-300" : "text-slate-500"
}`}>

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

          <button
  onClick={handleCompare}
  disabled={loading}
  className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition ${
    darkMode
      ? "bg-blue-500 hover:bg-blue-600 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  } disabled:opacity-60`}
>
  {loading && (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  )}
  {loading ? "Comparing..." : "Compare Prices"}
</button>

          {history.length > 0 && (
  <div className="mt-6">
    <p className="text-sm text-slate-500 mb-2">Recent Searches</p>
    <div className="flex flex-wrap gap-2">
      {history.map((search, index) => (
        <button
          key={index}
          onClick={() => {
            setItem(search.item);
            setCity(search.city);
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
        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}

        {/* Results */}
      
       {result && (() => {
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

  const cheaperPlatform =
    result.zomato < result.swiggy ? "Zomato" : "Swiggy";
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
  <div className={`p-4 rounded-xl text-sm ${
  darkMode
    ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
    : "bg-blue-50 text-blue-700 border border-blue-200"
}`}>
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
  <BarChart
    width={300}
    height={180}
    data={chartData}
  >
    <XAxis 
      dataKey="name" 
      stroke="#475569"
      tick={{ fontSize: 12 }}
    />
    <YAxis 
      stroke="#475569"
      tick={{ fontSize: 12 }}
    />
    <Tooltip />
    <Bar
      dataKey="price"
      fill="#3b82f6"
      radius={[6, 6, 0, 0]}
    />
  </BarChart>
</div>

    </motion.div>
  );
})()}

      </div>
    </div>
  );
}

function PriceCard({ name, price, cheapest, maxPrice, logo, time }) {
  const percentage = (price / maxPrice) * 100;

  return (
    <div
      className={`relative flex flex-col p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
        cheapest
          ? "bg-green-500/20 border border-green-400 shadow-lg shadow-green-500/30"
          : "bg-white/10 border border-white/20"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
 <img
  src={logo}
  alt={name}
  className="w-5 h-5 object-contain"
/>

  <span className="text-lg font-semibold">{name}</span>
</div>

        {cheapest && (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
            BEST PRICE
          </span>
        )}
      </div>

      <div className="mt-3 text-3xl font-bold">
       ₹
<CountUp
  end={price}
  duration={1}
  separator=","
/>

      </div>
      <p className="text-sm mt-1 opacity-80">
  ⏱ {time} mins
</p>

      {/* Comparison Bar */}
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
