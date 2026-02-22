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
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [serviceType, setServiceType] = useState("food");
  const [detectingLocation, setDetectingLocation] = useState(false);
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
        { item, city,serviceType }
      );

      setResult(response.data);
      console.log("API RESPONSE:", response.data);

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
  className={`relative min-h-screen w-screen flex items-center justify-center gap-8 px-6 overflow-hidden transition-all duration-500 ${
    darkMode
  ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
  : "bg-gradient-to-br from-slate-100 via-white to-blue-50"
  }`}
>
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
}
,
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


   <h2 className="text-xl font-bold">
      {darkMode ? "DARK MODE ACTIVE" : "LIGHT MODE ACTIVE"}
    </h2>
    
    {serviceType === "food" &&
  result?.zomatoList &&
  result?.swiggyList && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex justify-center mt-12"
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

      {/* Price Insight */}
      <span>
        {zomatoBest.price < swiggyBest.price
          ? `🔥 Zomato saves you ₹${priceDifference}`
          : swiggyBest.price < zomatoBest.price
          ? `🔥 Swiggy saves you ₹${priceDifference}`
          : "⚖️ Both platforms have similar pricing"}
      </span>

      {/* Time Insight */}
      <span className="text-xs opacity-80">
        {zomatoFastest.time < swiggyFastest.time
          ? `⚡ Zomato delivers ${timeDifference} mins faster`
          : swiggyFastest.time < zomatoFastest.time
          ? `⚡ Swiggy delivers ${timeDifference} mins faster`
          : "⏱ Delivery time is similar on both platforms"}
      </span>
{/* Price Comparison Meter */}
<div className="w-full mt-3">

  {(() => {
    const zomatoBest = result.zomatoList.reduce((a, b) =>
      a.price < b.price ? a : b
    );
    const swiggyBest = result.swiggyList.reduce((a, b) =>
      a.price < b.price ? a : b
    );

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

        {/* Zomato Bar */}
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

        {/* Swiggy Bar */}
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
{serviceType === "food" && result?.zomatoList && (
  <div
  className={`hidden lg:block w-80 rounded-2xl p-4 max-h-[500px] overflow-y-auto ${
    darkMode
      ? "bg-white/5 backdrop-blur-md text-slate-200"
      : "bg-white shadow-md text-slate-800"
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
    {[...result.zomatoList]
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
  whileHover={{ scale: 1.03 }}
  transition={{ type: "spring", stiffness: 200 }}
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
  {/* Image Section */}
<div className="relative h-40 rounded-xl overflow-hidden mb-3">

<div className="overflow-hidden rounded-lg">
  <img
    src={`https://loremflickr.com/600/400/${item}?random=${index}`}
    alt={rest.name}
    className="w-full h-40 object-cover rounded-lg transition-transform duration-500 hover:scale-110"
  />
  </div>

  {/* Dark Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

  {/* Restaurant Name */}
  <div className="absolute bottom-2 left-3 text-white font-semibold text-sm">
    {rest.name}
  </div>

  {/* Rating Badge */}
  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
    ⭐ {rest.rating}
  </div>

  {/* BEST Badge */}
  {index === 0 && (
    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
      BEST DEAL
    </div>
  )}

</div>

{/* Bottom Section */}
<div className="flex justify-between items-center">

  <div className="text-sm opacity-80">
    ⏱ {rest.time} mins
  </div>

  <div className="text-lg font-bold text-blue-500">
    ₹
    <CountUp end={rest.price} duration={1} />
  </div>

</div>

{/* Subtle Shimmer */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>
</motion.div>

    <div className="flex justify-between items-center w-full">
      <span className="font-medium text-left">
        {rest.name}
      </span>

       <div className="flex items-center gap-2">
          {index === 0 && (
            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
              BEST
            </span>
          )}
          <span className="font-semibold">
            ₹{rest.price}
          </span>
        </div>
    </div>

    <div className="flex justify-between text-xs mt-1 opacity-80 w-full">
      <span>⭐ {rest.rating}</span>
    <span>{rest.time} mins</span>
  </div>


      </div>
    ))}
  </div>
)}

      <div
  className={`relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
    darkMode
      ? "bg-gray-800 text-white"
      : "bg-white text-slate-800"
  }`}
>
  {serviceType === "food" && result?.swiggyList && (
  <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-md rounded-2xl p-4 max-h-[500px] overflow-y-auto">
   <h3
  className={`sticky top-0 z-10 py-3 text-center font-bold backdrop-blur-md ${
    darkMode
      ? "bg-gray-900/80 text-orange-400"
      : "bg-white/80 text-orange-500"
  }`}
>
  Swiggy
</h3>
    {[...result.swiggyList]
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
  whileHover={{ scale: 1.03 }}
  transition={{ type: "spring", stiffness: 200 }}
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
  {/* Image Section */}
<div className="relative h-40 rounded-xl overflow-hidden mb-3">
<div className="overflow-hidden rounded-lg">
  <img
    src={`https://loremflickr.com/600/400/food?random=${index}`}
    alt={rest.name}
    className="w-full h-40 object-cover rounded-lg transition-transform duration-500 hover:scale-110"
  />
  </div>

  {/* Dark Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

  {/* Restaurant Name */}
  <div className="absolute bottom-2 left-3 text-white font-semibold text-sm">
    {rest.name}
  </div>

  {/* Rating Badge */}
  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
    ⭐ {rest.rating}
  </div>

  {/* BEST Badge */}
  {index === 0 && (
    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
      BEST DEAL
    </div>
  )}

</div>

{/* Bottom Section */}
<div className="flex justify-between items-center">

  <div className="text-sm opacity-80">
    ⏱ {rest.time} mins
  </div>

  <div className="text-lg font-bold text-blue-500">
    ₹
    <CountUp end={rest.price} duration={1} />
  </div>

</div>

{/* Subtle Shimmer */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>
</motion.div>
    <div className="flex justify-between items-center w-full">
      <span className="font-medium text-left">
        {rest.name}
      </span>

       <div className="flex items-center gap-2">
          {index === 0 && (
            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
              BEST
            </span>
          )}
          <span className="font-semibold">
            ₹{rest.price}
          </span>
        </div>
    </div>

    <div className="flex justify-between text-xs mt-1 opacity-80 w-full">
      <span>⭐ {rest.rating}</span>
    <span>{rest.time} mins</span>
  </div>



      </div>
    ))}
  </div>
)}
<div className="flex justify-end mb-4">
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="text-sm px-3 py-1 rounded-full border transition"
  >
    {darkMode ? "☀ Light" : "🌙 Dark"}
  </button>
</div>


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

  <button
    type="button"
    onClick={handleGetLocation}
    className={`px-4 rounded-xl transition ${
      darkMode
        ? "bg-blue-500 hover:bg-blue-600 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
  >
    {detectingLocation ? (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
) : (
  "📍"
)}

  </button>
</div>
  

          <button
  onClick={handleCompare}
  disabled={loading}
  className={` w-full flex items-center justify-center gap-2
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
  className={`relative overflow-hidden flex flex-col p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
    cheapest
      ? "bg-green-500/20 border border-green-400 shadow-lg shadow-green-500/30"
      : "bg-white/10 border border-white/20"
  }`}
>
  {/* shimmer layer */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer pointer-events-none"></div>

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