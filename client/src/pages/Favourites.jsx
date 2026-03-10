import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";

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

/* REMOVE FAVOURITE UI */

const removeFavourite = (index) => {
const newFav = favourites.filter((_,i)=>i !== index);
setFavourites(newFav);
};

return (

<div className={`min-h-screen flex ${
darkMode
? "bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white"
: "bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800"
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
onClick={()=>navigate("/")}
className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${
location.pathname === "/"
? "bg-blue-600 text-white shadow-lg"
: "hover:bg-white/10"
}`}
>
🏠 Home
</button>
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

<div className="flex-1 p-10">

<h1 className="text-4xl font-bold mb-10 flex items-center gap-3">
<Heart className="text-red-500"/> Your Favourite Restaurants
</h1>

{favourites.length === 0 ? (

<div className="text-center mt-20">

<p className="text-lg text-gray-400">
No favourites yet.
</p>

<p className="text-sm text-gray-500 mt-2">
Add restaurants from search results ❤️
</p>

</div>

) : (

<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

{favourites.map((fav,index)=>(

<div
key={index}
className={`relative rounded-2xl overflow-hidden transition transform hover:scale-105 hover:shadow-2xl ${
darkMode
? "bg-white/5 backdrop-blur-md border border-white/10"
: "bg-white shadow"
}`}
>

{/* IMAGE */}

<div className="h-40 overflow-hidden">

<img
src={`https://loremflickr.com/600/400/${fav.name}?random=${index}`}
alt={fav.name}
className="w-full h-full object-cover hover:scale-110 transition"
/>

</div>

{/* CONTENT */}

<div className="p-5">

<h2 className="text-lg font-semibold mb-1">
{fav.name}
</h2>

<p className="text-sm opacity-70">
📍 {fav.city}
</p>

{/* PLATFORM BADGE */}

<span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
fav.platform === "zomato"
? "bg-red-500/20 text-red-400"
: "bg-orange-500/20 text-orange-400"
}`}>
{fav.platform.toUpperCase()}
</span>

<p className="text-xl font-bold text-green-500 mt-3">
₹{fav.price}
</p>

</div>

{/* REMOVE BUTTON */}

<button
onClick={()=>removeFavourite(index)}
className="absolute top-3 right-3 p-2 rounded-full
bg-black/60 backdrop-blur
hover:scale-110 transition"
>
<Trash2 size={16} className="text-red-500"/>
</button>

</div>

))}

</div>

)}

</div>

</div>

);

}