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
  const getFoodIcon = (food) => {
  const item = food?.toLowerCase();

  if (item.includes("pizza")) return "🍕";
  if (item.includes("burger")) return "🍔";
  if (item.includes("biryani")) return "🍛";
  if (item.includes("pasta")) return "🍝";
  if (item.includes("momos")) return "🥟";
  if (item.includes("sandwich")) return "🥪";
  if (item.includes("cake")) return "🍰";
  if (item.includes("coffee")) return "☕";

  return "🍽️"; // default icon
};
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

<div className={`w-64 min-h-screen p-6 backdrop-blur-xl ${
  darkMode
    ? "bg-black/40 border-r border-white/10"
    : "bg-white border-r"
}`}>

<h2 className="text-2xl font-bold mb-10 tracking-wide">
🚀 PriceCompare
</h2>

<div className="space-y-3">

<button
onClick={()=>navigate("/dashboard")}
className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
  location.pathname === "/dashboard"
    ? "bg-blue-600 text-white shadow-lg"
    : "hover:bg-white/10"
}`}
>
📊 Dashboard
</button>

<button
onClick={()=>navigate("/analytics")}
className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
  location.pathname === "/analytics"
    ? "bg-blue-600 text-white"
    : "hover:bg-white/10"
}`}
>
📈 Analytics
</button>

<button
onClick={()=>navigate("/history")}
className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
  location.pathname === "/history"
    ? "bg-blue-600 text-white"
    : "hover:bg-white/10"
}`}
>
🕓 History
</button>
<button
onClick={()=>navigate("/favourites")}
className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
  location.pathname === "/favourites"
    ? "bg-blue-600 text-white"
    : "hover:bg-white/10"
}`}
>
❤️ Favourites
</button>

<button
onClick={()=>navigate("/settings")}
className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
  location.pathname === "/settings"
    ? "bg-blue-600 text-white"
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
className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10"
>
🚪 Logout
</button>

</div>
</div>
{/* MAIN CONTENT */}

<div className="flex-1 p-8">

      <div className="flex justify-between items-center mb-10">

<div>
<h1 className="text-3xl font-bold">
📊 Dashboard
</h1>
<p className="text-sm opacity-70">
Track your food price savings and activity
</p>
</div>

<div className="text-sm bg-blue-500/20 px-4 py-2 rounded-full">
🔥 Smart Price Tracker
</div>

</div>

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

<div className={`p-6 rounded-2xl text-center transition hover:scale-105 ${
  darkMode
  ? "bg-white/5 backdrop-blur-md border border-white/10"
  : "bg-white shadow"
}`}>

<p className="text-sm opacity-70">
Total Searches
</p>

<p className="text-4xl font-bold text-blue-500 mt-2">
{insights.totalSearches}
</p>

</div>


<div className={`p-6 rounded-2xl text-center transition hover:scale-105 ${
  darkMode
  ? "bg-white/5 backdrop-blur-md border border-white/10"
  : "bg-white shadow"
}`}>

<p className="text-sm opacity-70">
Favourite Food
</p>

<p className="text-2xl font-semibold mt-2">
{insights.favouriteFood || "—"}
</p>

</div>


<div className={`p-6 rounded-2xl text-center transition hover:scale-105 ${
  darkMode
  ? "bg-white/5 backdrop-blur-md border border-white/10"
  : "bg-white shadow"
}`}>

<p className="text-sm opacity-70">
Favourite City
</p>

<p className="text-2xl font-semibold mt-2">
{insights.favouriteCity || "—"}
</p>

</div>

</div>
      {/* MONEY SAVED */}

<div className="grid md:grid-cols-2 gap-6 mt-10">

<div className={`p-6 rounded-2xl transition hover:scale-105 ${
  darkMode
  ? "bg-green-500/10 border border-green-400/20"
  : "bg-white shadow"
}`}>

<h3 className="text-sm opacity-70">
💰 Total Money Saved
</h3>

<p className="text-4xl font-bold mt-2 text-green-500">
₹{moneySaved}
</p>

<p className="text-xs opacity-70 mt-2">
Based on best price comparisons
</p>

</div>


<div className={`p-6 rounded-2xl transition hover:scale-105 ${
  darkMode
  ? "bg-yellow-500/10 border border-yellow-400/20"
  : "bg-white shadow"
}`}>

<h3 className="text-sm opacity-70">
🏆 Best Platform
</h3>

<p className="text-3xl font-semibold mt-2">
{bestPlatform || "—"}
</p>

<p className="text-xs opacity-70 mt-2">
Most frequent lowest price
</p>

</div>

</div>
      {/* SEARCH CHART */}

<div className={`p-6 rounded-2xl mt-10 ${
  darkMode
  ? "bg-white/5 backdrop-blur-md border border-white/10"
  : "bg-white shadow"
}`}>

<h2 className="text-xl font-semibold mb-6">
📊 Food Search Analytics
</h2>

<div className="h-72">

<ResponsiveContainer width="100%" height="100%">
<BarChart data={chartData}>

<XAxis dataKey="name" stroke={darkMode ? "#aaa" : "#444"} />
<YAxis stroke={darkMode ? "#aaa" : "#444"} />
<Tooltip />

<Bar
dataKey="searches"
fill="#3b82f6"
radius={[8,8,0,0]}
/>

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

  <div className="overflow-x-auto">

<table className="w-full text-left">

<thead className={`text-sm ${
  darkMode
    ? "text-gray-300 border-b border-white/10"
    : "text-gray-600 border-b"
}`}>

<tr>
<th className="py-3">Food</th>
<th className="py-3">City</th>
<th className="py-3">Winner</th>
</tr>

</thead>

<tbody>

{(user.searchHistory || []).slice(0,6).map((search, index) => {

const winnerColor =
search.winner === "zomato"
? "bg-red-500/10 text-red-400"
: search.winner === "swiggy"
? "bg-orange-500/10 text-orange-400"
: "bg-gray-500/10 text-gray-400";

return (

<tr
key={index}
className={`transition ${
darkMode
? "hover:bg-white/5 border-b border-white/10"
: "hover:bg-slate-100 border-b"
}`}
>

<td className="py-3 font-medium">
{getFoodIcon(search.item)} {search.item}
</td>

<td className="py-3">
📍 {search.city}
</td>

<td className="py-3">

{search.winner ? (

<span className={`px-3 py-1 text-xs rounded-full capitalize ${winnerColor}`}>
🏆 {search.winner}
</span>

) : (

<span className="text-gray-400 text-sm">
—
</span>

)}

</td>

</tr>

);

})}

</tbody>

</table>

</div>

</div>

    </div>
    </div>
  );
}