import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Favourites() {

const navigate = useNavigate();
const location = useLocation();

const [favourites,setFavourites] = useState([]);
const [darkMode, setDarkMode] = useState(false);

/* THEME LOAD */

useEffect(() => {

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

}, []);

/* FETCH FAVOURITES */

useEffect(()=>{

const fetchFavourites = async () => {

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

setFavourites(res.data.favourites || []);

}catch(err){

console.log("Failed to load favourites");

}

};

fetchFavourites();

},[]);

return (

<div className={`min-h-screen flex ${
darkMode
? "bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white"
: "bg-slate-100 text-slate-800"
}`}>

{/* SIDEBAR */}

<div className={`w-64 min-h-screen p-6 ${
darkMode
? "bg-black/40 border-r border-white/10"
: "bg-white border-r"
}`}>

<h2 className="text-2xl font-bold mb-10">🚀 PriceCompare</h2>

<div className="space-y-3">

<button
onClick={()=>navigate("/dashboard")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
location.pathname === "/dashboard"
? "bg-blue-600 text-white shadow-lg"
: "hover:bg-white/10"
}`}
>
📊 Dashboard
</button>

<button
onClick={()=>navigate("/analytics")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
location.pathname === "/analytics"
? "bg-blue-600 text-white"
: "hover:bg-white/10"
}`}
>
📈 Analytics
</button>

<button
onClick={()=>navigate("/history")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
location.pathname === "/history"
? "bg-blue-600 text-white"
: "hover:bg-white/10"
}`}
>
🕓 History
</button>

<button
onClick={()=>navigate("/favourites")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
location.pathname === "/favourites"
? "bg-blue-600 text-white"
: "hover:bg-white/10"
}`}
>
❤️ Favourites
</button>

<button
onClick={()=>navigate("/settings")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
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

<h1 className="text-3xl font-bold mb-8">
❤️ Your Favourite Restaurants
</h1>

{favourites.length === 0 ? (

<p className="text-gray-400">No favourites yet.</p>

) : (

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{favourites.map((fav,index)=>(

<div
key={index}
className={`p-6 rounded-2xl transition hover:scale-105 ${
darkMode
? "bg-white/5 backdrop-blur-md border border-white/10"
: "bg-white shadow"
}`}
>

<h2 className="text-xl font-semibold mb-2">{fav.name}</h2>

<p className="text-sm opacity-70">
Platform: {fav.platform}
</p>

<p className="text-sm opacity-70">
City: {fav.city}
</p>

<p className="text-xl font-bold text-green-500 mt-3">
₹{fav.price}
</p>

</div>

))}

</div>

)}

</div>

</div>

);

}