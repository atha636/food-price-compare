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

export default function GroceryDashboard({ theme }){

const [history,setHistory] = useState([]);
const [platformData,setPlatformData] = useState([]);
const [topItems,setTopItems] = useState([]);
const [bestPlatform,setBestPlatform] = useState(null);
const getGroceryIcon = (item) => {

const name = item.toLowerCase();

if(name.includes("milk")) return "🥛";
if(name.includes("bread")) return "🍞";
if(name.includes("rice")) return "🍚";
if(name.includes("tomato")) return "🍅";
if(name.includes("egg")) return "🥚";
if(name.includes("apple")) return "🍎";
if(name.includes("banana")) return "🍌";
if(name.includes("potato")) return "🥔";
if(name.includes("onion")) return "🧅";

return "🛒";

};
const [moneySaved,setMoneySaved] = useState(0);

useEffect(()=>{

const token = localStorage.getItem("token");

const fetchData = async()=>{

const res = await axios.get(
"https://food-price-compare-production.up.railway.app/me",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const groceryHistory = (res.data.searchHistory || [])
.filter(s => s.serviceType === "grocery");

setHistory(groceryHistory);

/* PLATFORM WINS */

let zepto=0, blinkit=0, instamart=0, jiomart=0;
let saved = 0;

groceryHistory.forEach(search=>{

if(search.winner==="zepto") zepto++;
if(search.winner==="blinkit") blinkit++;
if(search.winner==="instamart") instamart++;
if(search.winner==="jiomart") jiomart++;



if(search.bestPrice){

const estimatedMarketPrice = search.bestPrice + 20;

saved += estimatedMarketPrice - search.bestPrice;



}

});

setMoneySaved(Math.round(saved));

const platforms = [
{ name:"Zepto", wins:zepto },
{ name:"Blinkit", wins:blinkit },
{ name:"Instamart", wins:instamart },
{ name:"JioMart", wins:jiomart }
];

setPlatformData(
platforms.filter(p => p.wins > 0)
);

const best = platforms.reduce((a,b)=>a.wins>b.wins?a:b);

setBestPlatform(best.wins === 0 ? "No data yet" : best.name);

/* TOP ITEMS */

const itemCount = {};

groceryHistory.forEach(search => {

const items = search.item.split(",");

items.forEach(i => {

const item = i.trim().toLowerCase();

itemCount[item] = (itemCount[item] || 0) + 1;

});

});

const top = Object.keys(itemCount).map(item=>({
name:item,
searches:itemCount[item]
}));

setTopItems(top.sort((a,b)=>b.searches-a.searches).slice(0,5));

};

fetchData();

},[]);

return(

<div
className={`min-h-screen p-8 transition-all ${
theme === "dark"
? "bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white"
: "bg-slate-100 text-slate-800"
}`}
>

<h1 className="text-3xl font-bold mb-10">
🛒 Grocery Dashboard
</h1>

{/* STATS */}

<div className="grid md:grid-cols-3 gap-6 mb-10">

<div className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg hover:scale-105 transition">

<p className="text-sm opacity-70">
Total Baskets Compared
</p>

<p className="text-4xl font-bold text-blue-400 mt-2">
{history.length}
</p>

</div>


<div className="p-6 rounded-2xl backdrop-blur-md bg-green-500/10 border border-green-400/20 shadow-lg hover:scale-105 transition">

<p className="text-sm opacity-70">
💰 Money Saved on Groceries
</p>

<p className="text-4xl font-bold mt-2 text-green-400">
₹{moneySaved}
</p>

</div>


<div className="p-6 rounded-2xl backdrop-blur-md bg-yellow-500/10 border border-yellow-400/20 shadow-lg hover:scale-105 transition">

<p className="text-sm opacity-70">
🏆 Best Grocery Platform
</p>

<p className="text-3xl font-semibold mt-2 text-yellow-400">
{bestPlatform}
</p>

</div>

</div>

{/* TOP ITEMS */}

<div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg mb-10">

<h2 className="text-xl font-semibold mb-4">
🥦 Top Grocery Items
</h2>

<div className="flex gap-4 flex-wrap mt-4">

{topItems.map((item,index)=>(
<div
key={index}
className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition hover:scale-105 ${
theme === "dark"
? "bg-blue-500/10 text-blue-300 border-blue-400/20 hover:bg-blue-500/20"
: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
}`}
>

<span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full">
{getGroceryIcon(item.name)}
</span>

<span>
{item.name} ({item.searches})
</span>

</div>
))}

</div>

</div>

{/* PLATFORM CHART */}

<div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">

<h2 className="text-xl font-semibold mb-6">
📊 Platform Win Chart
</h2>

<div className="h-72">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={platformData}>

<XAxis dataKey="name" stroke="#aaa"/>

<YAxis stroke="#aaa"/>

<Tooltip />

<Bar
dataKey="wins"
fill="#3b82f6"
radius={[8,8,0,0]}
/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

{/* RECENT BASKETS */}

<div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg mt-10">

<h2 className="text-xl font-semibold mb-4">
🧺 Recent Grocery Baskets
</h2>

<div className="space-y-3">

{history.slice(0,5).map((h,index)=>(

<div
key={index}
className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10"
>

<span className="text-sm">
{h.item}
</span>

<span className="text-xs opacity-70">
🏆 {h.winner}
</span>

</div>

))}

</div>

</div>

</div>

);

}