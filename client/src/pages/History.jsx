import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function History(){

const [history,setHistory] = useState([]);
const [search,setSearch] = useState("");

useEffect(()=>{

const fetchHistory = async()=>{

const token = localStorage.getItem("token");

try{

const res = await axios.get(
"https://food-price-compare-1.onrender.com/me",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setHistory(res.data.searchHistory || []);

}catch(err){
console.log("Failed to load history");
}

};

fetchHistory();

},[]);

const filteredHistory = history.filter(h =>
h.item.toLowerCase().includes(search.toLowerCase())
);

const deleteItem = (index)=>{
const newHistory = history.filter((_,i)=> i !== index);
setHistory(newHistory);
};

return(

<div className="min-h-screen p-8 bg-slate-100 dark:bg-gray-900">

<h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
🕓 Search History
</h1>

{/* SEARCH BAR */}

<input
type="text"
placeholder="Search food..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="mb-6 w-full md:w-80 p-3 rounded-xl border dark:bg-gray-800 dark:text-white"
/>

{filteredHistory.length === 0 ? (

<p className="text-slate-500 dark:text-slate-400">
No searches found.
</p>

) : (

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{filteredHistory.map((searchItem,index)=>(

<div
key={index}
className="p-5 rounded-2xl shadow bg-white dark:bg-gray-800 relative"
>

<button
onClick={()=>deleteItem(index)}
className="absolute top-3 right-3 p-2 rounded-full
bg-red-50 dark:bg-red-500/10
hover:bg-red-100 dark:hover:bg-red-500/20
transition"
>
<Trash2 size={18} className="text-red-500"/>
</button>

<h2 className="text-lg font-semibold text-slate-800 dark:text-white">
{searchItem.item}
</h2>

<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
📍 {searchItem.city}
</p>

<p className="mt-2 text-sm">

{searchItem.winner ? (
<span className="text-green-500 font-semibold">
🏆 {searchItem.winner.toUpperCase()} Best Price
</span>
) : (
<span className="text-gray-400">
No winner
</span>
)}

</p>

{searchItem.bestPrice && (
<p className="mt-2 text-blue-500 font-bold">
₹{searchItem.bestPrice}
</p>
)}

<p className="text-xs mt-3 text-slate-400">
{new Date(searchItem.date).toLocaleDateString()}
</p>

</div>

))}

</div>

)}

</div>

);

}