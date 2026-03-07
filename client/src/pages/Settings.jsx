import { useState, useEffect } from "react";
import axios from "axios";
import { Palette, User, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function Settings({ theme, setTheme }) {

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [status, setStatus] = useState("");
const [toast,setToast] = useState("");
const token = localStorage.getItem("token");

useEffect(()=>{

const fetchUser = async()=>{

try{

const res = await axios.get(
"https://food-price-compare-1.onrender.com/me",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setName(res.data.name);
setEmail(res.data.email);

}catch(err){
console.log("Failed to load user");
}

};

fetchUser();

},[]);

const updateProfile = async () => {

const token = localStorage.getItem("token");

try{

const res = await axios.put(
"https://food-price-compare-1.onrender.com/update-profile",
{ name,email },
{
headers:{
Authorization:`Bearer ${token}`
}
}
);


setName(res.data.user.name);
setEmail(res.data.user.email);

setToast("Profile updated successfully");

setTimeout(()=>{
setToast("");
},3000);

}catch(err){

setToast("Update failed");

setTimeout(()=>{
setToast("");
},3000);

}

};

const deleteAccount = async()=>{

const confirmDelete = prompt("Type DELETE to confirm account deletion");

if(confirmDelete !== "DELETE") return;

try{

await axios.delete(
"https://food-price-compare-1.onrender.com/delete-account",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

localStorage.removeItem("token");

window.location.href="/";

}catch(err){
console.log("Delete failed");
}

};

return(

<div className="min-h-screen p-10 bg-slate-100 dark:bg-gray-900">

<h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
⚙ Settings
</h1>

<div className="grid md:grid-cols-2 gap-10 max-w-6xl">

{/* LEFT COLUMN — THEME */}

<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">

<div className="flex items-center gap-2 mb-4">
<Palette size={20} className="text-blue-500"/>
<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
Theme
</h2>
</div>

<div className="space-y-3">

<button
onClick={()=>setTheme("light")}
className={`w-full text-left p-3 rounded-xl border transition ${
theme==="light"
? "bg-blue-500 text-white shadow"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
☀ Light Mode
</button>

<button
onClick={()=>setTheme("dark")}
className={`w-full text-left p-3 rounded-xl border transition ${
theme==="dark"
? "bg-blue-500 text-white shadow"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
🌙 Dark Mode
</button>

<button
onClick={()=>setTheme("system")}
className={`w-full text-left p-3 rounded-xl border transition ${
theme==="system"
? "bg-blue-500 text-white shadow"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
💻 System Default
</button>

</div>

</div>

{/* RIGHT COLUMN */}

<div className="space-y-8">

{/* EDIT PROFILE */}

<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">

<div className="flex items-center gap-2 mb-4">
<User size={20} className="text-green-500"/>
<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
Edit Profile
</h2>
</div>

<input
type="text"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full p-3 mb-3 rounded-xl border dark:bg-gray-700 dark:text-white"
/>

<input
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full p-3 mb-4 rounded-xl border dark:bg-gray-700 dark:text-white"
/>

<button
onClick={updateProfile}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
>
Update Profile
</button>
{status && (
<p className="text-sm mt-3 text-center text-green-500">
{status}
</p>
)}
<AnimatePresence>

{toast && (

<motion.div
initial={{ opacity:0, y:-20, x:50 }}
animate={{ opacity:1, y:0, x:0 }}
exit={{ opacity:0, y:-20, x:50 }}
transition={{ duration:0.3 }}
className="fixed top-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50"
>

{toast}

</motion.div>

)}

</AnimatePresence>

</div>

{/* DELETE ACCOUNT */}

<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">

<div className="flex items-center gap-2 mb-4">
<AlertTriangle size={20} className="text-red-500"/>
<h2 className="text-lg font-semibold text-red-500">
Danger Zone
</h2>
</div>

<button
onClick={deleteAccount}
className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
>
Delete Account
</button>

</div>

</div>

</div>

</div>

);

}