import { useState } from "react";
import axios from "axios";

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
        {result && (
          <div className="mt-8 space-y-4">
            <PriceCard
              name="Zomato"
              price={result.zomato}
              cheapest={result.cheapest === "zomato"}
            />
            <PriceCard
              name="Swiggy"
              price={result.swiggy}
              cheapest={result.cheapest === "swiggy"}
            />
          </div>
        )}

      </div>
    </div>
  );
}

function PriceCard({ name, price, cheapest }) {
  return (
    <div
      className={`flex justify-between items-center p-4 rounded-xl border transition ${
        cheapest
          ? "bg-green-50 border-green-500 shadow-md"
          : "bg-slate-100 border-slate-200"
      }`}
    >
      <span className="font-semibold text-slate-700">{name}</span>
      <span className="font-bold text-slate-900">
        ₹{price} {cheapest && "🟢 Cheapest"}
      </span>
    </div>
  );
}

