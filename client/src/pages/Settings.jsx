
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
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [confirmText, setConfirmText] = useState("");

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

const deleteAccount = async () => {

if(confirmText !== "DELETE"){
setToast("You must type DELETE");
return;
}

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

setShowDeleteModal(false);

window.location.href="/";

}catch(err){
console.log("Delete failed");
}

};

return(

<div className="min-h-screen p-10 bg-slate-100 dark:bg-gray-900">

<h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
⚙ Settings
</h1>

<p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
Manage your account preferences
</p>

<div className="grid md:grid-cols-2 gap-10 max-w-6xl">

{/* LEFT COLUMN — THEME */}

<div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">

<div className="flex items-center gap-2 mb-4">
<Palette size={20} className="text-blue-500"/>
<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
Theme
</h2>
</div>

<div className="grid grid-cols-3 gap-3">

<button
onClick={()=>setTheme("light")}
className={`p-5 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200 ${
theme==="light"
? "bg-blue-500 text-white shadow-lg scale-105"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
☀
<span className="text-sm">Light</span>
</button>

<button
onClick={()=>setTheme("dark")}
className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
theme==="dark"
? "bg-blue-500 text-white"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
🌙
<span className="text-sm">Dark</span>
</button>

<button
onClick={()=>setTheme("system")}
className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
theme==="system"
? "bg-blue-500 text-white"
: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
}`}
>
💻
<span className="text-sm">System</span>
</button>

</div>

</div>


{/* RIGHT COLUMN */}

<div className="space-y-8">

{/* EDIT PROFILE */}

<div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">

<div className="flex items-center gap-2 mb-4">
<User size={20} className="text-green-500"/>
<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
Edit Profile
</h2>
</div>

<div className="flex items-center gap-4 mb-4">

<div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
{name ? name.charAt(0).toUpperCase() : "U"}
</div>

<div>
<p className="font-semibold text-slate-800 dark:text-white">{name}</p>
<p className="text-sm text-gray-500">{email}</p>
</div>

</div>
<input
type="text"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full p-3 mb-3 rounded-xl border border-gray-300 dark:border-gray-600
bg-white/80 dark:bg-gray-700/50 backdrop-blur focus:ring-2 focus:ring-blue-500 outline-none"
/>

<input
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full p-3 mb-4 rounded-xl border border-gray-300 dark:border-gray-600
bg-white/80 dark:bg-gray-700/50 backdrop-blur focus:ring-2 focus:ring-blue-500 outline-none"
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
className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg z-50 ${
toast.includes("success")
? "bg-green-500 text-white"
: "bg-red-500 text-white"
}`}
>

{toast}

</motion.div>

)}

</AnimatePresence>

</div>

{/* DELETE ACCOUNT */}

<div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">

<div className="flex items-center gap-2 mb-4">
<AlertTriangle size={20} className="text-red-500"/>
<h2 className="text-lg font-semibold text-red-500">
Danger Zone
</h2>
</div>

<div className="border border-red-300 dark:border-red-700 p-4 rounded-xl">

<p className="text-sm text-red-400 mb-3">
Deleting your account will remove:
</p>

<ul className="text-xs text-red-400 mb-4 space-y-1">
<li>• All favourites</li>
<li>• Search history</li>
<li>• Account data</li>
</ul>

<button
onClick={() => setShowDeleteModal(true)}
className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
>
Delete Account
</button>

</div>

</div>

</div>

</div>
<AnimatePresence>
{showDeleteModal && (

<motion.div
initial={{ opacity:0 }}
animate={{ opacity:1 }}
exit={{ opacity:0 }}
className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
>

<motion.div
initial={{ scale:0.8, opacity:0 }}
animate={{ scale:1, opacity:1 }}
exit={{ scale:0.8, opacity:0 }}
transition={{ duration:0.2 }}
className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-[350px] shadow-xl border border-red-200 dark:border-red-700"
>

<h3 className="text-lg font-bold text-red-500 mb-2">
⚠ Delete Account
</h3>

<p className="text-sm text-gray-500 mb-4">
This action cannot be undone. Type DELETE to confirm.
</p>

<input
type="text"
placeholder="Type DELETE"
value={confirmText}
onChange={(e)=>setConfirmText(e.target.value)}
className="w-full p-3 mb-4 rounded-xl border border-gray-300 dark:border-gray-600
bg-white/80 dark:bg-gray-700/50 backdrop-blur focus:ring-2 focus:ring-blue-500 outline-none"
/>

<div className="flex gap-3">

<button
onClick={()=>{
setShowDeleteModal(false);
setConfirmText("");
}}
className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-xl"
>
Cancel
</button>

<button
onClick={deleteAccount}
className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl"
>
Delete
</button>

</div>

</motion.div>

</motion.div>

)}
</AnimatePresence>

</div>

);

}