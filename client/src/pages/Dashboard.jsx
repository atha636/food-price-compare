import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
export default function Dashboard() {
const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [moneySaved, setMoneySaved] = useState(0);
  const location = useLocation();
const [bestPlatform, setBestPlatform] = useState(null);
  useEffect(() => {

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    setDarkMode(true);
  }

}, []);

  useEffect(() => {

    const token = localStorage.getItem("token");

    const fetchData = async () => {

      const userRes = await axios.get(
        "https://food-price-compare-1.onrender.com/me",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const insightsRes = await axios.get(
        "https://food-price-compare-1.onrender.com/insights",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(userRes.data);
      setInsights(insightsRes.data);
      const history = userRes.data.searchHistory || [];

const foodCount = {};

history.forEach(search => {
  foodCount[search.item] = (foodCount[search.item] || 0) + 1;
});

const chartArray = Object.keys(foodCount).map(food => ({
  name: food,
  searches: foodCount[food]
}));

setChartData(chartArray);

/* 🔥 MONEY SAVED CALCULATION */

let totalSaved = 0;
let zomatoWins = 0;
let swiggyWins = 0;

history.forEach(search => {

  if (search.bestPrice) {
    totalSaved += search.bestPrice * 0.1;
  }

  if (search.winner === "zomato") zomatoWins++;
  if (search.winner === "swiggy") swiggyWins++;

});

setMoneySaved(Math.round(totalSaved));

if (zomatoWins === 0 && swiggyWins === 0) {
  setBestPlatform(null);
} else {
  setBestPlatform(
    zomatoWins > swiggyWins ? "Zomato" : "Swiggy"
  );
}

    };

    fetchData();

  }, []);

  if (!user || !insights) return <p className="p-10">Loading...</p>;

  return (

<div className={`min-h-screen flex ${
  darkMode
    ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white"
    : "bg-slate-100 text-slate-800"
}`}>

{/* SIDEBAR */}

<div className={`w-64 min-h-screen p-6 ${
  darkMode
    ? "bg-black/30 border-r border-white/10"
    : "bg-white border-r"
}`}>

<h2 className="text-2xl font-bold mb-10">
PriceCompare
</h2>

<div className="space-y-4">

<button
onClick={()=>navigate("/dashboard")}
className={`block w-full text-left px-3 py-2 rounded-lg transition ${
  location.pathname === "/dashboard"
    ? "bg-blue-500 text-white"
    : "hover:bg-white/10"
}`}
>
📊 Dashboard
</button>

<button
onClick={()=>navigate("/analytics")}
className={`block w-full text-left px-3 py-2 rounded-lg transition ${
  location.pathname === "/analytics"
    ? "bg-blue-500 text-white"
    : "hover:bg-white/10"
}`}
>
📈 Analytics
</button>

<button
onClick={()=>navigate("/history")}
className={`block w-full text-left px-3 py-2 rounded-lg transition ${
  location.pathname === "/history"
    ? "bg-blue-500 text-white"
    : "hover:bg-white/10"
}`}
>
🕓 History
</button>

<button
onClick={()=>navigate("/settings")}
className={`block w-full text-left px-3 py-2 rounded-lg transition ${
  location.pathname === "/settings"
    ? "bg-blue-500 text-white"
    : "hover:bg-white/10"
}`}
>
⚙ Settings
</button>

<button
onClick={()=>{
localStorage.removeItem("token");
window.location.href="/";
}}
className="block w-full text-left text-red-500 hover:opacity-80"
>
🚪 Logout
</button>

</div>

</div>
{/* MAIN CONTENT */}

<div className="flex-1 p-8">

      <h1 className="text-3xl font-bold mb-8">
        User Dashboard
      </h1>

      {/* PROFILE CARD */}

      <div className={`p-6 rounded-2xl shadow mb-8 ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

        <h2 className="text-xl font-semibold mb-4">
          👤 Profile
        </h2>

        <div className="space-y-2">
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
        </div>

      </div>

      {/* STATS GRID */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className={`p-6 rounded-2xl shadow text-center ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

          <h3 className="text-gray-500 text-sm">
            Total Searches
          </h3>

          <p className="text-3xl font-bold mt-2 text-blue-600">
            {insights.totalSearches}
          </p>

        </div>

       <div className={`p-6 rounded-2xl shadow text-center ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

          <h3 className="text-gray-500 text-sm">
            Favourite Food
          </h3>

          <p className="text-2xl font-semibold mt-2">
            {insights.favouriteFood || "—"}
          </p>

        </div>

        <div className={`p-6 rounded-2xl shadow text-center ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

          <h3 className="text-gray-500 text-sm">
            Favourite City
          </h3>

          <p className="text-2xl font-semibold mt-2">
            {insights.favouriteCity || "—"}
          </p>

        </div>

      </div>
      {/* MONEY SAVED */}

<div className="grid md:grid-cols-2 gap-6 mt-10">

<div className={`p-6 rounded-2xl shadow text-center ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

<h3 className="text-gray-500 text-sm">
💰 Total Money Saved
</h3>

<p className="text-3xl font-bold mt-2 text-green-500">
₹{moneySaved}
</p>

</div>

<div className={`p-6 rounded-2xl shadow text-center ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

<h3 className="text-gray-500 text-sm">
🏆 Best Platform
</h3>

<p className="text-2xl font-semibold mt-2">
{bestPlatform || "—"}
</p>

</div>

</div>
      {/* SEARCH CHART */}

<div className={`p-6 rounded-2xl shadow mt-10 ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

  <h2 className="text-xl font-semibold mb-4">
    📊 Food Search Analytics
  </h2>

  <div className="h-64">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart data={chartData}>

        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="searches" fill="#3b82f6" />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>
{/* RECENT SEARCHES */}

<div className={`p-6 rounded-2xl shadow mt-10 ${
  darkMode
    ? "bg-white/5 backdrop-blur-md border border-white/10"
    : "bg-white"
}`}>

  <h2 className="text-xl font-semibold mb-4">
    🕓 Recent Searches
  </h2>

  <table className="w-full text-left">

    <thead className="border-b">

      <tr>
        <th className="py-2">Food</th>
        <th className="py-2">City</th>
        <th className="py-2">Winner</th>
      </tr>

    </thead>

    <tbody>

      {(user.searchHistory || []).map((search, index) => (

        <tr key={index} className="border-b">

          <td className="py-2">{search.item}</td>
          <td className="py-2">{search.city}</td>
          <td className="py-2 capitalize">{search.winner || "-"}</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

    </div>
    </div>
  );
}