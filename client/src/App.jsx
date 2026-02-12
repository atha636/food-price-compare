import { useState } from "react";
import axios from "axios";

function App() {
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!item || !city) {
      setError("Please enter both food item and city.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(axios.post("https://food-price-compare-1.onrender.com/compare"), {


        item,
        city,
      });

      setResult(response.data);
    } catch (err) {
      setError("Unable to fetch prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Food Price Comparison</h1>
        <p style={{ textAlign: "center", color: "#555" }}>
          Compare prices between Zomato and Swiggy
        </p>

        <input
          type="text"
          placeholder="Food item (e.g. Pizza)"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="City (e.g. Indore)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleCompare}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Comparing prices..." : "Compare Prices"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
            {error}
          </p>
        )}

        {!result && !loading && !error && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Enter details and click compare to see prices.
          </p>
        )}

        {result && (
          <div style={{ marginTop: "25px" }}>
            <h3 style={{ textAlign: "center" }}>Comparison Result</h3>

            <PriceRow
              name="Zomato"
              price={result.zomato}
              cheapest={result.cheapest === "zomato"}
            />

            <PriceRow
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

function PriceRow({ name, price, cheapest }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px",
        marginTop: "10px",
        borderRadius: "6px",
        backgroundColor: cheapest ? "#ecfdf5" : "#f3f4f6",
        border: cheapest ? "1px solid #10b981" : "1px solid #e5e7eb",
      }}
    >
      <strong>{name}</strong>
      <span>
        ₹{price} {cheapest && "🟢 Cheapest"}
      </span>
    </div>
  );
}
<p className="text-xs text-center text-slate-400 mt-6">
  Disclaimer: Prices shown are indicative and may vary on Zomato or Swiggy.
</p>


const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
};

export default App;
