require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const axios = require("axios");


// ==============================
// REQUEST DELAY
// ==============================

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
const cheerio = require("cheerio");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("./utils/sendEmail");
const zomatoCache = new Map();
const groceryCache = new Map();


const app = express();

/* ==============================
   MIDDLEWARE (MUST BE ON TOP)
============================== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ],
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());
/* ==============================
   AUTH MIDDLEWARE
============================== */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ==============================
// DISTANCE CALCULATOR
// ====
const calculateDistance = (lat1, lon1, lat2, lon2) => {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
// ==============================
// SWIGGY RESTAURANT FETCH
// ==============================

const fetchSwiggyRestaurants = async (lat, lng, food) => {
  try {

const url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING`;
const res = await axios.get(url, {
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.swiggy.com/",
    "Origin": "https://www.swiggy.com",
    "Accept-Language": "en-IN,en;q=0.9",
    "x-requested-with": "XMLHttpRequest"
  }
});

    const cards = res.data?.data?.cards || [];
    console.log("SWIGGY RAW RESPONSE:", JSON.stringify(res.data).slice(0,500));

    const restaurants = [];

    cards.forEach(card => {

  const restaurantsArray =
    card?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];

  restaurantsArray.forEach(r => {

    const info = r?.info;

    if (!info) return;
    console.log("IMAGE ID:", info.cloudinaryImageId);

    let imageUrl = null;

if (info.cloudinaryImageId) {

  if (info.cloudinaryImageId.startsWith("RX_THUMBNAIL")) {
    imageUrl = `https://media-assets.swiggy.com/${info.cloudinaryImageId}`;
  } else {
    imageUrl = `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${info.cloudinaryImageId}`;
  }

}
    let distance;

if (info?.latLong?.latitude && info?.latLong?.longitude) {

  const restLat = info.latLong.latitude;
  const restLng = info.latLong.longitude;

  distance = calculateDistance(
    parseFloat(lat),
    parseFloat(lng),
    parseFloat(restLat),
    parseFloat(restLng)
  );

} else {

  // fallback if swiggy doesn't give coordinates
  distance = Math.random() * 4 + 1;

}

const price = parseInt(info.costForTwo?.replace(/[^0-9]/g, "")) || 200;
const rating = parseFloat(info.avgRating) || 4;
const time = info.sla?.deliveryTime || 30;
const dist = parseFloat(distance);

const score =
  price * 0.35 +
  time * 1.2 +
  dist * 10 -
  rating * 15;

restaurants.push({
  name: info.name,
  rating,
  price,
  time,
  image: imageUrl,
  distance: dist.toFixed(2),
  score,
  url: `https://www.swiggy.com/restaurants/${info.id}`
});

  });

});
    restaurants.sort((a,b)=>a.score - b.score);

return restaurants.slice(0,5);

  } catch (err) {

    console.log("Swiggy API error:", err.message);

    return [];

  }
};

// ==============================
// ZOMATO RESTAURANT FETCH (HTML SCRAPING)
// ==============================

const fetchZomatoRestaurants = async (lat, lng, food, cityName) => {
  const cacheKey = `${food}-${cityName}`;

if (zomatoCache.has(cacheKey)) {
  console.log("Returning Zomato data from cache");
  return zomatoCache.get(cacheKey);
}

  try {

    const url = "https://www.zomato.com/webroutes/search/home";

    let res;

    // retry system
    for (let i = 0; i < 2; i++) {

      try {

        res = await axios.get(url, {
  timeout: 15000,
  params: {
    q: food,
    lat,
    lon: lng,
    page_type: "delivery",
    isMobile: 0,
    entity_type: "city"
  },
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept":
      "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": "https://www.zomato.com/",
    "Origin": "https://www.zomato.com",
    "Connection": "keep-alive",
    "x-requested-with": "XMLHttpRequest"
  }
});
        break;

      } catch (err) {

        if (i === 1) throw err;

        console.log("Retrying Zomato request...");
        await sleep(1200);

      }
    }

    const restaurants = [];

    const list =
      res.data?.section?.SEARCH_RESULT?.cards || [];

    list.forEach((card) => {

      const info = card?.card?.info;

      if (!info) return;

      const imageUrl =
  info.image?.url ||
  info.o2FeaturedImage?.url ||
  info.thumbnail ||
  info.featured_image ||
  `https://source.unsplash.com/600x400/?${food}`;

const price = parseInt(info.costText?.text?.replace(/[^0-9]/g, "")) || 250;
const rating = parseFloat(info.rating?.aggregate_rating) || 4;
const time = Math.floor(20 + Math.random() * 15);
const dist = Math.random() * 4 + 1;

const score =
  price * 0.35 +
  time * 1.2 +
  dist * 10 -
  rating * 15;

restaurants.push({
  name: info.name || "Restaurant",
  rating,
  price,
  time,
  image: imageUrl,
  distance: dist.toFixed(2),
  score,
  url: info.url
    ? `https://www.zomato.com${info.url}`
    : `https://www.zomato.com/search?q=${encodeURIComponent(info.name)}`
});

    });

   // remove duplicate restaurants
const unique = [];
const names = new Set();

restaurants.forEach(r => {
  if (!names.has(r.name)) {
    names.add(r.name);
    unique.push(r);
  }
});

// take top 5 after removing duplicates
const result = unique.slice(0, 5);

// save in cache
zomatoCache.set(cacheKey, result);

return result;

  } catch (err) {

    if (err.response?.status === 403) {
      console.log("Zomato blocked request (403)");
    } else {
      console.log("Zomato API error:", err.message);
    }

    return [];

  }
};



// ==============================
// SMART GROCERY PRODUCT DETECTOR
// ==============================

const groceryProducts = {

  milk: ["milk", "dairy milk", "amul milk", "toned milk", "full cream milk"],

  bread: ["bread", "brown bread", "white bread", "sandwich bread"],

  rice: ["rice", "basmati rice", "brown rice"],

  eggs: ["egg", "eggs", "farm eggs"],

  potato: ["potato", "aloo"],

  onion: ["onion", "red onion"],

  tomato: ["tomato", "tamatar"],

  apple: ["apple", "red apple", "green apple"],

  banana: ["banana", "kela"],

  cheese: ["cheese", "cheddar cheese", "cheese slice"],

  butter: ["butter", "amul butter"],

  paneer: ["paneer", "cottage cheese"],

  yogurt: ["yogurt", "curd", "dahi"],

  sugar: ["sugar", "white sugar"],

  salt: ["salt", "tata salt"],

  oil: ["oil", "cooking oil", "sunflower oil", "mustard oil"]

};

const detectProduct = (input) => {

  const text = input.toLowerCase();

  for (const product in groceryProducts) {

    const keywords = groceryProducts[product];

    for (const keyword of keywords) {

      if (text.includes(keyword)) {
        return product;
      }

    }

  }

  return input.toLowerCase(); // fallback
};
// ==============================
// MULTI ITEM DETECTION
// ==============================

const detectMultipleProducts = (input) => {

  const items = input
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);

  const detected = new Set();

  items.forEach(item => {

    const product = detectProduct(item);

    if (groceryProducts[product]) {
      detected.add(product);
    }

  });

  return Array.from(detected);

};

// ==============================
// GROCERY CATEGORY MAP
// ==============================

const groceryCategories = {

  dairy: ["milk", "paneer", "butter", "cheese", "yogurt"],

  bakery: ["bread"],

  fruits: ["apple", "banana"],

  vegetables: ["onion", "potato", "tomato"],

  pantry: ["rice", "sugar", "salt", "oil"]

};

const detectCategory = (product) => {

  for (const category in groceryCategories) {

    const products = groceryCategories[category];

    if (products.includes(product)) {
      return category;
    }

  }

  return "other";
};




// ==============================
// MARKET PRICE SCRAPER (HYBRID METHOD)
// ==============================

const fetchMarketPrice = async (item) => {

  try {

    const url = `https://www.amazon.in/s?k=${item}`;

    await sleep(300 + Math.random()*400);

    const res = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language":"en-IN,en;q=0.9"
      }
    });

    const $ = cheerio.load(res.data);

    // ✅ PRICE
    const priceText =
      $(".a-price-whole").first().text() ||
      $(".a-offscreen").first().text();

    // ✅ IMAGE (NEW)
    const image =
  $("img.s-image").first().attr("src")?.replace("_AC_UL320_", "_AC_UL200_") ||
  $("img").first().attr("src");

    if(!priceText) return null;

    const clean = priceText.replace(/[^\d]/g,"");

    return {
      price: parseInt(clean),
      image
    };

  } catch(err){

    console.log("Market price scraping failed:", err.message);

    return null;

  }

};


// ==============================
// PLATFORM PRICE GENERATOR
// ==============================

const generatePlatformPrices = (basePrice) => {

return {

blinkit: basePrice + 2,
zepto: basePrice + 5,
instamart: basePrice + 3,
jiomart: basePrice - 1

};

};

/* ==============================
   ROUTES
============================== */

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ==============================
   SIGNUP ROUTE
============================== */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false
    });

    await user.save();
const verifyLink = `https://food-price-compare-production.up.railway.app/verify/${verificationToken}`;
    sendVerificationEmail(email, verifyLink)
  .then(() => console.log("Verification email sent"))
  .catch(err => console.log("Email failed:", err));
    res.status(201).json({
      message: "Verification email sent"
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verification-failed`
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/verified`);

  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/verification-failed`);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }


    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId: sub,
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login success",
      token: jwtToken,
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});
app.get("/me", authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure searchHistory exists for old users
    if (!Array.isArray(user.searchHistory)) {
      user.searchHistory = [];
      await user.save();
    }

    res.json(user);   // 🔥 THIS WAS MISSING

  } catch (err) {
    console.error("ME ROUTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/delete-account", authMiddleware, async (req, res) => {

  try {

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Account deleted" });

  } catch (err) {

    console.log("DELETE ACCOUNT ERROR:", err);

    res.status(500).json({ message: "Server error" });

  }

});
app.post("/save-search", authMiddleware, async (req, res) => {
  try {
    const { item, city, serviceType, winner, bestPrice } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 FIX — ensure array exists
    if (!Array.isArray(user.searchHistory)) {
      user.searchHistory = [];
    }

    user.searchHistory.unshift({
  item,
  city,
  serviceType,
  winner,
bestPrice
});

    // Keep only last 5
    user.searchHistory = user.searchHistory.slice(0, 20);

    await user.save();

    res.json({ message: "Search saved" });

  } catch (err) {
    console.error("SAVE SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
app.get("/insights", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.searchHistory) {
      return res.json({
        totalSearches: 0,
        favouriteFood: null,
        favouriteCity: null,
      });
    }

    const history = user.searchHistory;

    const totalSearches = history.length;

    const foodCount = {};
    const cityCount = {};

    history.forEach(search => {
      foodCount[search.item] = (foodCount[search.item] || 0) + 1;
      cityCount[search.city] = (cityCount[search.city] || 0) + 1;
    });

    const favouriteFood =
  Object.keys(foodCount).length > 0
    ? Object.keys(foodCount).reduce((a, b) =>
        foodCount[a] > foodCount[b] ? a : b
      )
    : null;

const favouriteCity =
  Object.keys(cityCount).length > 0
    ? Object.keys(cityCount).reduce((a, b) =>
        cityCount[a] > cityCount[b] ? a : b
      )
    : null;

    res.json({
      totalSearches,
      favouriteFood,
      favouriteCity
    });

  } catch (err) {
    console.error("INSIGHTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/ride-insights", authMiddleware, async (req, res) => {
  try {
    
   const user = await User.findById(req.user.id);
    const rideHistory = (user.searchHistory || []).filter(
      s => s.serviceType === "ride"
    );

    if (rideHistory.length === 0) {
      return res.json({
        totalRides: 0,
        favouritePlatform: null,
        avgPrice: 0,
        totalDistance: 0
      });
    }

    let totalPrice = 0;
    let totalDistance = 0;
    const platformCount = {};
rideHistory.forEach(r => {

  totalPrice += r.bestPrice || 0;

  // ✅ FIX DISTANCE SAFELY
  if (r.distance && !isNaN(r.distance)) {
    totalDistance += Number(r.distance);
  }

  if (r.winner) {
    platformCount[r.winner] =
      (platformCount[r.winner] || 0) + 1;
  }

});

    const favouritePlatform =
  Object.keys(platformCount).length > 0
    ? Object.keys(platformCount).reduce((a, b) =>
        platformCount[a] > platformCount[b] ? a : b
      )
    : null;

    res.json({
      totalRides: rideHistory.length,
      favouritePlatform,
      avgPrice: Math.round(totalPrice / rideHistory.length),
      totalDistance: Number(totalDistance.toFixed(1))
    });

  } catch (err) {
    console.log("RIDE INSIGHTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.delete("/clear-history", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.searchHistory = [];

    await user.save();

    res.json({ message: "History cleared" });

  } catch (err) {
    console.error("CLEAR HISTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.put("/update-profile", authMiddleware, async (req, res) => {
  try {

    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated",
      user
    });

  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/add-favourite", authMiddleware, async (req, res) => {

try{

const { name, platform, city, price, image } = req.body;

const user = await User.findById(req.user.id);

if(!user){
return res.status(404).json({ message:"User not found" });
}

const existing = user.favourites.find(
f => f.name === name && f.platform === platform
);

if(existing){

// REMOVE favourite
user.favourites = user.favourites.filter(
f => !(f.name === name && f.platform === platform)
);

await user.save();

return res.json({ message:"Favourite removed" });

}else{

// ADD favourite
user.favourites.unshift({
name,
platform,
city,
price,
image
});

await user.save();

return res.json({ message:"Favourite added" });

}

}catch(err){

console.log("FAV ERROR:",err);
res.status(500).json({ message:"Server error" });

}

});


// ==============================
// BUILD GROCERY BASKET
// ==============================

const buildBasket = async (products) => {

let zeptoTotal = 0;
let blinkitTotal = 0;
let instamartTotal = 0;
let jiomartTotal = 0;

const basket = [];

await Promise.all(products.map(async (product) => {

console.log("Scraping grocery product:", product);

// ⭐ get real market price
const marketData = await fetchMarketPrice(product);
console.log("Market price:", product, marketData);

const basePrice = marketData?.price || 60;
const image = marketData?.image || null;

// ⭐ generate platform prices
const prices = generatePlatformPrices(basePrice);

zeptoTotal += prices.zepto;
blinkitTotal += prices.blinkit;
instamartTotal += prices.instamart;
jiomartTotal += prices.jiomart;

const category = detectCategory(product);

basket.push({
  product,
  category,
  image, // ✅ ADD THIS LINE
  zepto: prices.zepto,
  blinkit: prices.blinkit,
  instamart: prices.instamart,
  jiomart: prices.jiomart
});

}));

const totals = {
zepto: basket.reduce((sum,i)=>sum+i.zepto,0),
blinkit: basket.reduce((sum,i)=>sum+i.blinkit,0),
instamart: basket.reduce((sum,i)=>sum+i.instamart,0),
jiomart: basket.reduce((sum,i)=>sum+i.jiomart,0)
};

const basketWinner = Object.entries(totals)
.reduce((a,b)=>a[1] < b[1] ? a : b)[0];

return {
basket,
totals,
basketWinner
};


};
/* ==============================
   COMPARE ROUTE (Your Existing Logic)
============================== */
app.post("/compare", authMiddleware, async (req, res) => {

  const { item, city, serviceType } = req.body;

  try {
const user = await User.findById(req.user.id);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}
    let lat, lng;


// ✅ ONLY for food & grocery
if (serviceType !== "ride") {

  const geo = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        format: "json",
        q: city
      },
      headers: {
        "User-Agent": "pricecompare-app"
      }
    }
  );

  if (!geo.data || geo.data.length === 0) {
    return res.status(400).json({
      message: "City not found"
    });
  }

  lat = geo.data[0].lat;
  lng = geo.data[0].lon;
}

if (serviceType !== "ride" && (!lat || !lng)) {
  return res.status(400).json({
    message: "Invalid city. Please try another location."
  });
}
console.log("CITY:", city);
console.log("LAT:", lat);
console.log("LNG:", lng);
console.log("ITEM:", item);
    if (serviceType === "food") {

  const swiggyList = await fetchSwiggyRestaurants(lat, lng, item);

 let zomatoList = await fetchZomatoRestaurants(lat, lng, item, city);

if (zomatoList.length === 0) {

  console.log("Using fallback Zomato data");

  zomatoList = swiggyList.map(r => ({
    ...r,
    price: r.price + Math.floor(Math.random()*30),

    // ⭐ FIX: correct Zomato URL
    url: `https://www.zomato.com/search?q=${encodeURIComponent(r.name)}`
  }));

}

  return res.json({
    serviceType,
    item,
    city,
    swiggyList,
    zomatoList
  });

}

   if (serviceType === "grocery") {

  const cacheKey = `${item}-${city}`;

  // ⭐ CHECK CACHE FIRST
 const cached = groceryCache.get(cacheKey);

if (cached && Date.now() - cached.time < 300000) { // 5 minutes
  console.log("Returning grocery data from cache");
  return res.json(cached.data);
}

  const products = detectMultipleProducts(item).slice(0,6);

  const basketData = await buildBasket(products);

  const responseData = {
    serviceType,
    city,
    products,
    basket: basketData.basket,
    totals: basketData.totals,
    basketWinner: basketData.basketWinner
  };


  
  /* ⭐ SAVE SEARCH HISTORY */

  

  if (user) {

    if (!Array.isArray(user.searchHistory)) {
      user.searchHistory = [];
    }

    const winner = basketData.basketWinner;
    const bestPrice = basketData.totals[winner];
user.searchHistory.unshift({
  item,
  city,
  serviceType: "grocery",
  winner,
  bestPrice,
  totals: basketData.totals,
  createdAt: new Date()
});

    user.searchHistory = user.searchHistory.slice(0, 20);

    await user.save();
  }

  // ⭐ SAVE RESULT IN CACHE
  groceryCache.set(cacheKey, {
  data: responseData,
  time: Date.now()
});

  return res.json(responseData);

}


 // ride panel
if (serviceType === "ride") {

  const pickupGeo = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { format: "json", q: city },
      headers: { "User-Agent": "pricecompare-app" }
    }
  );

  const dropGeo = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { format: "json", q: `${item}, India` },
      headers: { "User-Agent": "pricecompare-app" }
    }
  );

  const pickupLat = pickupGeo.data[0]?.lat;
  const pickupLng = pickupGeo.data[0]?.lon;
  const dropLat = dropGeo.data[0]?.lat;
  const dropLng = dropGeo.data[0]?.lon;

  if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
    console.log("Geo failed:", { pickup: city, drop: item });
    return res.status(400).json({
      message: "Location not found. Try more specific place."
    });
  }

  console.log("Pickup Geo:", pickupGeo.data[0]);
  console.log("Drop Geo:", dropGeo.data[0]);

  const distance = calculateDistance(
    parseFloat(pickupLat),
    parseFloat(pickupLng),
    parseFloat(dropLat),
    parseFloat(dropLng)
  );

  const finalDistance = Math.round(distance * 10) / 10;
  const baseFare = finalDistance * 12;

  const platforms = {
  uber: {
    car: {
      price: Math.round(baseFare + 40),
      time: Math.floor(finalDistance * 2 + 5)
    },
    bike: {
      price: Math.round(baseFare - 20),
      time: Math.floor(finalDistance * 1.5 + 3)
    },
    auto: {
      price: Math.round(baseFare + 10),
      time: Math.floor(finalDistance * 2.2 + 4)
    }
  },

  ola: {
    car: {
      price: Math.round(baseFare + 35),
      time: Math.floor(finalDistance * 2.5 + 6)
    },
    bike: {
      price: Math.round(baseFare - 25),
      time: Math.floor(finalDistance * 1.6 + 4)
    },
    auto: {
      price: Math.round(baseFare + 5),
      time: Math.floor(finalDistance * 2.3 + 5)
    }
  },

  rapido: {
    bike: {
      price: Math.round(baseFare - 30),
      time: Math.floor(finalDistance * 1.4 + 3)
    },
    car: {
      price: Math.round(baseFare + 35),
      time: Math.floor(finalDistance * 2.5 + 6)
    },
    auto: {
      price: Math.round(baseFare + 5),
      time: Math.floor(finalDistance * 2.3 + 5)
    }
  },

  indrive: {
    car: {
      price: Math.round(baseFare - 10),
      time: Math.floor(finalDistance * 2.8 + 6)
    },
    auto: {
      price: Math.round(baseFare + 5),
      time: Math.floor(finalDistance * 2.3 + 5)
    },
    bike: {
      price: Math.round(baseFare - 30),
      time: Math.floor(finalDistance * 1.4 + 3)
    },
  }
};
  const getMinPrice = (platform) => {
  return Math.min(...Object.values(platform).map(r => r.price));
};

const winner = Object.entries(platforms).reduce((a, b) =>
  getMinPrice(a[1]) < getMinPrice(b[1]) ? a : b
)[0];


// ⭐ SAVE RIDE HISTORY


if (user) {
  if (!Array.isArray(user.searchHistory)) {
    user.searchHistory = [];
  }

  const bestPrice = Math.min(
    ...Object.values(platforms).map(p =>
      Math.min(...Object.values(p).map(r => r.price))
    )
  );

  user.searchHistory.unshift({
  pickup: city,
  drop: item,
  serviceType: "ride",
  winner,
  bestPrice,
  distance: finalDistance,
  platforms,
  createdAt: new Date()
});

  user.searchHistory = user.searchHistory.slice(0, 20);

  await user.save();
}

  return res.json({
    serviceType: "ride",
    pickup: city,
    drop: item,
    distance: finalDistance,
    platforms,
    winner,
    pickupCoords: [parseFloat(pickupLat), parseFloat(pickupLng)],
    dropCoords: [parseFloat(dropLat), parseFloat(dropLng)]
  });

}


  } catch (err) {

    console.log("COMPARE ERROR:", err.message);

    res.status(500).json({
      message: "Compare failed"
    });

  }

});



/* ==============================
   DATABASE CONNECTION
============================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ==============================
   SERVER START
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});