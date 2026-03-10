import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function History(){

const [history,setHistory] = useState([]);
const [search,setSearch] = useState("");
const navigate = useNavigate();

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

<div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-black p-8">

<div className="max-w-7xl mx-auto">

<h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-8">
🕓 Search History
</h1>


{/* SEARCH BAR */}

<div className="relative mb-10 max-w-md">

<Search
className="absolute left-3 top-3 text-gray-400"
size={18}
/>

<input
type="text"
placeholder="Search food..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full pl-10 pr-4 py-3 rounded-xl border
bg-white/70 dark:bg-gray-800
backdrop-blur
dark:text-white
focus:ring-2 focus:ring-blue-500"
/>

</div>


{/* EMPTY STATE */}

{filteredHistory.length === 0 ? (

<div className="text-center py-20">

<p className="text-gray-400 text-lg">
No searches found.
</p>

<p className="text-sm text-gray-500 mt-2">
Try searching for pizza, burger, etc.
</p>

</div>

) : (

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

{filteredHistory.map((searchItem,index)=>(

<div
key={index}
className="relative p-5 rounded-2xl
bg-white/70 dark:bg-white/5
backdrop-blur-xl
border border-white/20
shadow-lg
transition
hover:scale-[1.03]
hover:shadow-2xl"
>

{/* DELETE BUTTON */}

<button
onClick={()=>deleteItem(index)}
className="absolute top-3 right-3 p-2 rounded-full
bg-red-50 dark:bg-red-500/10
hover:bg-red-100 dark:hover:bg-red-500/20
transition"
>
<Trash2 size={18} className="text-red-500"/>
</button>


{/* FOOD IMAGE */}

<div className="h-36 rounded-xl overflow-hidden mb-4">

<img
src={`https://loremflickr.com/600/400/${searchItem.item}?random=${index}`}
alt={searchItem.item}
className="w-full h-full object-cover hover:scale-110 transition"
/>

</div>


{/* FOOD NAME */}

<h2 className="text-lg font-semibold text-slate-800 dark:text-white">

{searchItem.item}

</h2>


{/* CITY */}

<p className="text-sm text-gray-500 dark:text-gray-400">

📍 {searchItem.city}

</p>


{/* WINNER */}

<div className="mt-2">

{searchItem.winner ? (

<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
searchItem.winner === "zomato"
? "bg-red-500/20 text-red-400"
: "bg-orange-500/20 text-orange-400"
}`}>
🏆 {searchItem.winner.toUpperCase()}
</span>

) : (

<span className="text-gray-400 text-sm">
No winner
</span>

)}

</div>


{/* PRICE */}

{searchItem.bestPrice && (

<p className="mt-2 text-blue-500 font-bold text-lg">

₹{searchItem.bestPrice}

</p>

)}


{/* DATE */}

<p className="text-xs mt-2 text-gray-400">

{new Date(searchItem.date).toLocaleDateString()}

</p>


{/* COMPARE BUTTON */}

<button
onClick={()=>{

navigate("/",{
state:{
item: searchItem.item,
city: searchItem.city,
serviceType: searchItem.serviceType
}
});

}}
className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm transition"
>

Compare Again

</button>

</div>

))}

</div>

)}

</div>

</div>

);

}