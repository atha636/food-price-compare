import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Analytics() {

const [chartData,setChartData] = useState([]);
const [foodChart,setFoodChart] = useState([]);
const [loading,setLoading] = useState(true);

const [totalSearches,setTotalSearches] = useState(0);
const [zomatoWins,setZomatoWins] = useState(0);
const [swiggyWins,setSwiggyWins] = useState(0);
const [topFood,setTopFood] = useState("—");

useEffect(()=>{

const token = localStorage.getItem("token");

const fetchAnalytics = async()=>{

const res = await axios.get(
"https://food-price-compare-production.up.railway.app/me",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const history = res.data.searchHistory || [];

setTotalSearches(history.length);

const foodCount = {};

history.forEach(search=>{
foodCount[search.item] = (foodCount[search.item] || 0) + 1;
});

const foodArray = Object.keys(foodCount).map(food=>({
food,
count: foodCount[food]
}));

setFoodChart(foodArray);

if(foodArray.length>0){
const sorted = [...foodArray].sort((a,b)=>b.count-a.count);
setTopFood(sorted[0].food);
}

let zomatoWinCount = 0;
let swiggyWinCount = 0;

history.forEach(search=>{

if(search.winner === "zomato") zomatoWinCount++;
if(search.winner === "swiggy") swiggyWinCount++;

});

setZomatoWins(zomatoWinCount);
setSwiggyWins(swiggyWinCount);

setChartData([
{platform:"Zomato",wins:zomatoWinCount},
{platform:"Swiggy",wins:swiggyWinCount}
]);

setLoading(false);

};

fetchAnalytics();

},[]);


if(loading){
return(

<div className="min-h-screen bg-slate-100 dark:bg-gray-900 p-10">

<h1 className="text-4xl font-bold mb-10 text-slate-800 dark:text-white">
📊 Analytics Dashboard
</h1>

<div className="grid md:grid-cols-4 gap-6 mb-10">

{[1,2,3,4].map(i=>(
<div
key={i}
className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
/>
))}

</div>

<div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse mb-10"/>

<div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"/>

</div>

);
}


return(

<div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-black text-slate-800 dark:text-white p-10">

{/* background glow */}

<div className="pointer-events-none absolute w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full top-[-100px] left-[-100px]"/>
<div className="pointer-events-none absolute w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]"/>

<div className="max-w-7xl mx-auto">

<h1 className="text-4xl font-bold mb-10">
📊 Analytics Dashboard
</h1>


{/* SUMMARY CARDS */}

<div className="grid md:grid-cols-4 gap-6 mb-12">

<div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
<p className="text-sm opacity-80">Total Searches</p>
<p className="text-3xl font-bold">{totalSearches}</p>
</div>

<div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
<p className="text-sm opacity-80">Zomato Wins</p>
<p className="text-3xl font-bold">{zomatoWins}</p>
</div>

<div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-6 rounded-xl shadow-lg">
<p className="text-sm opacity-80">Swiggy Wins</p>
<p className="text-3xl font-bold">{swiggyWins}</p>
</div>

<div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
<p className="text-sm opacity-80">Top Food</p>
<p className="text-2xl font-bold">{topFood}</p>
</div>

</div>



{/* PLATFORM WIN CHART */}

<div className="bg-white/70 dark:bg-white/5 backdrop-blur p-6 rounded-2xl shadow-lg mb-12">

<div className="flex items-center justify-between mb-6">

<h2 className="text-xl font-semibold">
🏆 Platform Win Analytics
</h2>

<span className={`px-3 py-1 rounded-full text-sm font-medium ${
zomatoWins > swiggyWins
? "bg-red-500/20 text-red-400"
: "bg-orange-500/20 text-orange-400"
}`}>
{zomatoWins > swiggyWins ? "Zomato Leading" : "Swiggy Leading"}
</span>

</div>

<div className="h-80">

<ResponsiveContainer width="99%" height="100%">

<BarChart data={chartData}>

<XAxis dataKey="platform" stroke="#94a3b8"/>
<YAxis stroke="#94a3b8"/>

<Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}}/>

<Bar
dataKey="wins"
radius={[10,10,0,0]}
animationDuration={1200}
>

{chartData.map((entry,index)=>(
<Cell
key={index}
fill={entry.platform==="Zomato" ? "#ef4444" : "#f97316"}
/>
))}

</Bar>

</BarChart>

</ResponsiveContainer>

</div>

</div>



{/* TOP FOOD CHART */}

<div className="bg-white/70 dark:bg-white/5 backdrop-blur p-6 rounded-2xl shadow-lg">

<h2 className="text-xl font-semibold mb-6">
🍕 Top Searched Foods
</h2>

<div className="h-80">

<ResponsiveContainer width="99%" height="100%">

<BarChart data={foodChart}>

<XAxis dataKey="food" stroke="#94a3b8"/>
<YAxis stroke="#94a3b8"/>

<Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}}/>

<Bar
dataKey="count"
fill="#10b981"
radius={[10,10,0,0]}
animationDuration={1200}
/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

</div>

</div>

);

}