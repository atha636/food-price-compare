import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Analytics() {

const [chartData,setChartData] = useState([]);
const [foodChart,setFoodChart] = useState([]);

useEffect(()=>{

const token = localStorage.getItem("token");

const fetchAnalytics = async()=>{

const res = await axios.get(
"https://food-price-compare-1.onrender.com/me",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const history = res.data.searchHistory || [];
const foodCount = {};

history.forEach(search => {

foodCount[search.item] = (foodCount[search.item] || 0) + 1;

});

const foodArray = Object.keys(foodCount).map(food => ({
food,
count: foodCount[food]
}));

setFoodChart(foodArray);
let zomatoWins = 0;
let swiggyWins = 0;

history.forEach(search=>{

if(search.winner === "zomato") zomatoWins++;
if(search.winner === "swiggy") swiggyWins++;

});

setChartData([
{platform:"Zomato",wins:zomatoWins},
{platform:"Swiggy",wins:swiggyWins}
]);

};

fetchAnalytics();

},[]);

return(

<div className="min-h-screen p-10 bg-slate-100">

<h1 className="text-3xl font-bold mb-10">
📈 Platform Win Analytics
</h1>

{/* PLATFORM WIN CHART */}

<div className="bg-white p-6 rounded-2xl shadow">

<div className="h-80">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={chartData}>

<XAxis dataKey="platform"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="wins" fill="#3b82f6"/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

{/* TOP FOOD CHART */}

<div className="bg-white p-6 rounded-2xl shadow mt-10">

<h2 className="text-xl font-semibold mb-4">
🍕 Top Searched Foods
</h2>

<div className="h-80">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={foodChart}>

<XAxis dataKey="food"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="count" fill="#10b981"/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

</div>

);

}