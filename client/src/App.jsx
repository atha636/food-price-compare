import { useState } from "react";
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
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Unable to fetch prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            PriceCompare
          </h1>
          <p className="text-slate-500 mt-2">
            Compare food prices instantly
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Food item (e.g. Pizza)"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="City (e.g. Indore)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl disabled:bg-slate-400"
          >
            {loading ? "Comparing..." : "Compare Prices"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}

        {/* Results */}
      
       {result && (() => {
  const maxPrice = Math.max(result.zomato, result.swiggy);
  const difference = Math.abs(result.zomato - result.swiggy);
  const cheaperPlatform =
    result.zomato < result.swiggy ? "Zomato" : "Swiggy";
    const chartData = [
  { name: "Zomato", price: result.zomato },
  { name: "Swiggy", price: result.swiggy },
];



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 space-y-6"
    >
      <div className="text-center bg-white/10 border border-white/20 rounded-xl p-4">
    <p className="text-sm text-slate-300">
      💰 {cheaperPlatform} is ₹{difference} cheaper
    </p>
  </div>
      <PriceCard
        name="Zomato"
        price={result.zomato}
        cheapest={result.cheapest === "zomato"}
        maxPrice={maxPrice}
      />
      <PriceCard
        name="Swiggy"
        price={result.swiggy}
        cheapest={result.cheapest === "swiggy"}
        maxPrice={maxPrice}
      />
      <div className="mt-6 bg-slate-100 p-4 rounded-xl border border-slate-300 flex justify-center">
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

function PriceCard({ name, price, cheapest, maxPrice }) {
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
        <span className="text-lg font-semibold">{name}</span>

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
