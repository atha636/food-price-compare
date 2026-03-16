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

export default function GroceryDashboard(){

const [history,setHistory] = useState([]);
const [platformData,setPlatformData] = useState([]);
const [topItems,setTopItems] = useState([]);
const [bestPlatform,setBestPlatform] = useState(null);
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

if(search.bestPrice){

const estimatedMarketPrice = search.bestPrice + 20;

saved += estimatedMarketPrice - search.bestPrice;

}

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

<div className="p-8">

<h1 className="text-3xl font-bold mb-8">
🛒 Grocery Dashboard
</h1>

{/* STATS */}

<div className="grid md:grid-cols-3 gap-6 mb-10">

<div className="p-6 bg-white rounded-xl shadow text-center">
<p>Total Baskets Compared</p>
<p className="text-4xl font-bold mt-2">
{history.length}
</p>
</div>

<div className="p-6 bg-green-100 rounded-xl shadow text-center">
<p>Money Saved on Groceries</p>
<p className="text-4xl font-bold mt-2 text-green-600">
₹{moneySaved}
</p>
</div>

<div className="p-6 bg-yellow-100 rounded-xl shadow text-center">
<p>Best Grocery Platform</p>
<p className="text-3xl font-semibold mt-2">
{bestPlatform}
</p>
</div>

</div>

{/* TOP ITEMS */}

<div className="bg-white p-6 rounded-xl shadow mb-10">

<h2 className="text-xl font-semibold mb-4">
🥦 Top Grocery Items
</h2>

<div className="flex gap-4 flex-wrap">

{topItems.map((item,index)=>(
<div
key={index}
className="px-4 py-2 bg-blue-100 rounded-full text-sm"
>
{item.name} ({item.searches})
</div>
))}

</div>

</div>

{/* PLATFORM CHART */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-6">
📊 Platform Win Chart
</h2>

<div className="h-72">

<ResponsiveContainer width="100%" height="100%">
<BarChart data={platformData}>

<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>

<Bar
dataKey="wins"
fill="#22c55e"
radius={[8,8,0,0]}
/>

</BarChart>
</ResponsiveContainer>

</div>

</div>

</div>

);

}