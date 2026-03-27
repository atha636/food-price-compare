require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const cheerio = require("cheerio");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("./utils/sendEmail");
const rateLimit = require("express-rate-limit");
const { HttpsProxyAgent } = require("https-proxy-agent"); // npm i https-proxy-agent

// ==============================
// CACHES
// ==============================
const zomatoCache = new Map();
const groceryCache = new Map();
const rideCache = new Map();
const ecommerceCache = new Map();

const app = express();
app.set("trust proxy", 1);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100
  })
);

// ==============================
// LOGGING UTILITY
// ==============================
const isDev = process.env.NODE_ENV === "development";
const log = {
  info:    (msg)       => isDev && console.log(`ℹ️  ${msg}`),
  error:   (msg, err)  => console.error(`❌ ${msg}`, err?.message || err),
  success: (msg)       => isDev && console.log(`✅ ${msg}`),
  warn:    (msg)       => console.warn(`⚠️  ${msg}`)
};

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));

const visionRoute = require("./routes/vision");
app.use("/api/ai", visionRoute);

/* ==============================
   AUTH MIDDLEWARE
============================== */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access denied. No token provided." });

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ==============================
// SLEEP UTILITY
// ==============================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==============================
// ROTATING USER AGENTS (Anti-Ban)
// ==============================
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
];

const getRandomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ==============================
// PROXY POOL (Anti-Ban)
// Load proxies from env: PROXY_LIST="http://user:pass@host:port,http://..."
// ==============================
const PROXY_LIST = process.env.PROXY_LIST
  ? process.env.PROXY_LIST.split(",").map(p => p.trim()).filter(Boolean)
  : [];

const getRandomProxy = () =>
  PROXY_LIST.length > 0
    ? PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)]
    : null;

const buildAxiosConfig = (extraHeaders = {}, timeout = 15000) => {
  const config = {
    timeout,
    headers: {
      "User-Agent": getRandomUA(),
      "Accept-Language": "en-IN,en-GB;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      ...extraHeaders
    }
  };

  const proxy = getRandomProxy();
  if (proxy) {
    config.httpsAgent = new HttpsProxyAgent(proxy);
    config.proxy = false; // disable axios built-in proxy; let httpsAgent handle it
  }

  return config;
};

// ==============================
// CIRCUIT BREAKER (Anti-Ban)
// ==============================
const circuitState = {};

const isCircuitOpen = (key) => {
  const state = circuitState[key];
  if (!state) return false;
  if (state.failures >= 3 && Date.now() - state.lastFailTime < 60000) {
    log.warn(`Circuit OPEN for ${key} — backing off 60s`);
    return true;
  }
  if (Date.now() - state.lastFailTime >= 60000) {
    circuitState[key] = { failures: 0, lastFailTime: 0 };
  }
  return false;
};

const recordFailure = (key) => {
  const state = circuitState[key] || { failures: 0, lastFailTime: 0 };
  circuitState[key] = {
    failures: state.failures + 1,
    lastFailTime: Date.now()
  };
};

const recordSuccess = (key) => {
  circuitState[key] = { failures: 0, lastFailTime: 0 };
};

// ==============================
// DISTANCE CALCULATOR
// ==============================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ==============================
// SWIGGY RESTAURANT FETCH (Anti-ban + retry)
// ==============================
const SWIGGY_ENDPOINTS = [
  (lat, lng) =>
    `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING`,
  (lat, lng) =>
    `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING&offset=0&sortBy=RELEVANCE&filters=[]`
];

const fetchSwiggyRestaurants = async (lat, lng, food) => {
  if (isCircuitOpen("swiggy")) return [];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = SWIGGY_ENDPOINTS[attempt % SWIGGY_ENDPOINTS.length](lat, lng);

      // Add realistic jitter delay to avoid rate limits
      await sleep(300 + Math.random() * 700);

      const res = await axios.get(url, buildAxiosConfig({
        "Accept": "application/json",
        "Referer": "https://www.swiggy.com/",
        "Origin": "https://www.swiggy.com",
        "x-requested-with": "XMLHttpRequest",
        "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
      }));

      const cards = res.data?.data?.cards || [];
      const restaurants = [];

      cards.forEach(card => {
        const restaurantsArray =
          card?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];

        restaurantsArray.forEach(r => {
          const info = r?.info;
          if (!info) return;

          let imageUrl = null;
          if (info.cloudinaryImageId) {
            imageUrl = info.cloudinaryImageId.startsWith("RX_THUMBNAIL")
              ? `https://media-assets.swiggy.com/${info.cloudinaryImageId}`
              : `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${info.cloudinaryImageId}`;
          }

          let dist;
          if (info?.latLong?.latitude && info?.latLong?.longitude) {
            dist = calculateDistance(
              parseFloat(lat), parseFloat(lng),
              parseFloat(info.latLong.latitude), parseFloat(info.latLong.longitude)
            );
          } else {
            dist = Math.random() * 4 + 1;
          }

          const price  = parseInt(info.costForTwo?.replace(/[^0-9]/g, "")) || 200;
          const rating = parseFloat(info.avgRating) || 4;
          const time   = info.sla?.deliveryTime || 30;
          const d      = parseFloat(dist);

          const score = price * 0.35 + time * 1.2 + d * 10 - rating * 15;

          restaurants.push({
            name: info.name,
            rating,
            price,
            time,
            image: imageUrl,
            distance: d.toFixed(2),
            score,
            url: `https://www.swiggy.com/restaurants/${info.id}`
          });
        });
      });

      if (restaurants.length > 0) {
        recordSuccess("swiggy");
        restaurants.sort((a, b) => a.score - b.score);
        return restaurants.slice(0, 5);
      }

      // Empty response — retry
      await sleep(800 * (attempt + 1));

    } catch (err) {
      const status = err.response?.status;
      log.error(`Swiggy attempt ${attempt + 1} failed (${status})`, err);
      if (status === 403 || status === 429) {
        recordFailure("swiggy");
        await sleep(1500 * (attempt + 1)); // exponential back-off
      }
    }
  }

  recordFailure("swiggy");
  return [];
};

// ==============================
// ZOMATO RESTAURANT FETCH
// Multi-strategy with session simulation
// ==============================
const ZOMATO_STRATEGIES = [
  // Strategy 1: Home search API
  async (lat, lng, food) => {
    const res = await axios.get("https://www.zomato.com/webroutes/search/home", {
      ...buildAxiosConfig({
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.zomato.com/",
        "Origin": "https://www.zomato.com",
        "x-requested-with": "XMLHttpRequest",
        "x-zomato-csrft": crypto.randomBytes(16).toString("hex")
      }),
      params: {
        q: food,
        lat,
        lon: lng,
        page_type: "delivery",
        isMobile: 0
      }
    });
    return res.data?.section?.SEARCH_RESULT?.cards || [];
  },

  // Strategy 2: Delivery listing API
  async (lat, lng, food) => {
    const res = await axios.get("https://www.zomato.com/webroutes/getPage", {
      ...buildAxiosConfig({
        "Accept": "application/json, text/plain, */*",
        "Referer": `https://www.zomato.com/delivery/search?q=${encodeURIComponent(food)}`,
        "x-requested-with": "XMLHttpRequest"
      }),
      params: {
        page: "delivery",
        city_lat: lat,
        city_long: lng,
        q: food
      }
    });
    return res.data?.page_data?.sections?.SECTION_SEARCH_RESULT?.cards || [];
  },

  // Strategy 3: Restaurant list endpoint
  async (lat, lng, food) => {
    const res = await axios.get(
      `https://www.zomato.com/webroutes/search/autoComplete?term=${encodeURIComponent(food)}&latitude=${lat}&longitude=${lng}&entityType=delivery`,
      buildAxiosConfig({
        "Accept": "application/json",
        "Referer": "https://www.zomato.com/",
        "x-requested-with": "XMLHttpRequest"
      })
    );
    // AutoComplete returns entity suggestions — map them to a cards-like structure
    const results = res.data?.results_type_ahead || [];
    return results.map(r => ({
      card: {
        info: {
          name: r.title,
          image: { url: r.image_url },
          costText: { text: `₹${r.min_price || 250}` },
          rating: { aggregate_rating: r.rating || 4 },
          url: r.deeplink
        }
      }
    }));
  }
];

const parseZomatoCards = (cards, food) => {
  const restaurants = [];

  cards.forEach(card => {
    const info = card?.card?.info;
    if (!info) return;

    const imageUrl =
      info.image?.url ||
      info.o2FeaturedImage?.url ||
      info.thumbnail ||
      info.featured_image ||
      `https://source.unsplash.com/600x400/?${food},food`;

    const price  = parseInt(info.costText?.text?.replace(/[^0-9]/g, "")) || 250;
    const rating = parseFloat(info.rating?.aggregate_rating) || 4;
    const time   = Math.floor(20 + Math.random() * 15);
    const dist   = Math.random() * 4 + 1;
    const score  = price * 0.35 + time * 1.2 + dist * 10 - rating * 15;

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

  // Deduplicate
  const seen = new Set();
  return restaurants.filter(r => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });
};

const fetchZomatoRestaurants = async (lat, lng, food, cityName) => {
  const cacheKey = `${food}-${cityName}`;

  if (zomatoCache.has(cacheKey)) {
    const cached = zomatoCache.get(cacheKey);
    // Food cache TTL: 2 minutes
    if (Date.now() - cached.time < 120000) {
      log.success("Zomato cache hit");
      return cached.data;
    }
  }

  if (isCircuitOpen("zomato")) return [];

  for (let stratIdx = 0; stratIdx < ZOMATO_STRATEGIES.length; stratIdx++) {
    try {
      await sleep(400 + Math.random() * 600 + stratIdx * 300);

      const cards = await ZOMATO_STRATEGIES[stratIdx](lat, lng, food);
      const restaurants = parseZomatoCards(cards, food);

      if (restaurants.length > 0) {
        recordSuccess("zomato");
        const result = restaurants.slice(0, 5);
        zomatoCache.set(cacheKey, { data: result, time: Date.now() });
        return result;
      }

    } catch (err) {
      const status = err.response?.status;
      log.warn(`Zomato strategy ${stratIdx + 1} failed (${status})`);

      if (status === 403 || status === 429) {
        recordFailure("zomato");
        await sleep(1200 * (stratIdx + 1));
      }
    }
  }

  recordFailure("zomato");
  log.warn("All Zomato strategies exhausted");
  return [];
};

// ==============================
// SMART GROCERY PRODUCT DETECTOR
// ==============================
const groceryProducts = {
  milk:    ["milk","dairy milk","amul milk","toned milk","full cream milk"],
  bread:   ["bread","brown bread","white bread","sandwich bread"],
  rice:    ["rice","basmati rice","brown rice"],
  eggs:    ["egg","eggs","farm eggs"],
  potato:  ["potato","aloo"],
  onion:   ["onion","red onion"],
  tomato:  ["tomato","tamatar"],
  apple:   ["apple","red apple","green apple"],
  banana:  ["banana","kela"],
  cheese:  ["cheese","cheddar cheese","cheese slice"],
  butter:  ["butter","amul butter"],
  paneer:  ["paneer","cottage cheese"],
  yogurt:  ["yogurt","curd","dahi"],
  sugar:   ["sugar","white sugar"],
  salt:    ["salt","tata salt"],
  oil:     ["oil","cooking oil","sunflower oil","mustard oil"]
};

const detectProduct = (input) => {
  const text = input.toLowerCase();
  for (const product in groceryProducts) {
    for (const keyword of groceryProducts[product]) {
      if (text.includes(keyword)) return product;
    }
  }
  return text;
};

const detectMultipleProducts = (input) => {
  const items = input.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const detected = new Set();
  items.forEach(item => {
    const product = detectProduct(item);
    if (groceryProducts[product]) detected.add(product);
  });
  return Array.from(detected);
};

// ==============================
// GROCERY CATEGORY MAP
// ==============================
const groceryCategories = {
  dairy:      ["milk","paneer","butter","cheese","yogurt"],
  bakery:     ["bread"],
  fruits:     ["apple","banana"],
  vegetables: ["onion","potato","tomato"],
  pantry:     ["rice","sugar","salt","oil"]
};

const detectCategory = (product) => {
  for (const category in groceryCategories) {
    if (groceryCategories[category].includes(product)) return category;
  }
  return "other";
};

// ==============================
// MARKET PRICE SCRAPER (with anti-ban)
// ==============================
const fetchMarketPrice = async (item) => {
  try {
    await sleep(300 + Math.random() * 400);

    const res = await axios.get(`https://www.amazon.in/s?k=${encodeURIComponent(item)}`, buildAxiosConfig({
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Referer": "https://www.amazon.in/",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "upgrade-insecure-requests": "1"
    }));

    const $ = cheerio.load(res.data);
    const priceText =
      $(".a-price-whole").first().text() ||
      $(".a-offscreen").first().text();

    const image =
      $("img.s-image").first().attr("src")?.replace("_AC_UL320_", "_AC_UL200_") ||
      $("img").first().attr("src");

    if (!priceText) return null;

    return {
      price: parseInt(priceText.replace(/[^\d]/g, "")),
      image,
      name: item
    };

  } catch (err) {
    log.error("Market price scraping failed", err);
    return null;
  }
};

const fetchAmazonList = async (item) => {
  try {
    const response = await axios.get("https://api.rainforestapi.com/request", {
      params: {
        api_key: process.env.RAINFOREST_API_KEY,
        type: "search",
        amazon_domain: "amazon.in",
        search_term: item
      }
    });

    return (response.data.search_results || [])
      .filter(p => p.title && p.price?.value)
      .slice(0, 6)
      .map(p => ({
        name: p.title,
        price: p.price.value,
        image: p.image,
        url: p.link
      }));

  } catch (err) {
    log.error("Rainforest API error", err);
    return [];
  }
};

const fetchEcommercePrices = async (item) => {
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google_shopping",
        q: item + " buy online India",
        gl: "in",
        hl: "en",
        location: "India",
        api_key: process.env.SERP_API_KEY
      }
    });

    const results = response.data.shopping_results || [];

    if (results.length === 0) {
      log.info("SerpAPI no results, using Rainforest fallback");
      const amazonList = await fetchAmazonList(item);
      return { amazonList, flipkartList: [], myntraList: [] };
    }

    const amazonList = [], flipkartList = [], myntraList = [];
results.forEach(p => {
  const source = (p.source || p.merchant || "").toLowerCase();
  const link = (p.link || "").toLowerCase();
  const title = (p.title || "").toLowerCase();

  const product = {
    name: p.title,
    price: p.price ? parseInt(p.price.replace(/[^\d]/g, "")) : 0,
    image: p.thumbnail,
    link: p.link
  };

  if (source.includes("amazon") || link.includes("amazon")) {
    amazonList.push(product);
  }

  if (
    source.includes("flipkart") ||
    link.includes("flipkart") ||
    title.includes("flipkart")
  ) {
    flipkartList.push(product);
  }

  if (
    source.includes("myntra") ||
    link.includes("myntra") ||
    title.includes("myntra")
  ) {
    myntraList.push(product);
  }
});


// ✅ Fallback for Flipkart
const avgPrice = amazonList[0]?.price || 800;

if (flipkartList.length === 0) {
  flipkartList.push({
    name: item + " (Flipkart)",
    price: avgPrice + Math.floor(Math.random() * 200 - 100),
    image: "https://via.placeholder.com/200",
    link: `https://www.flipkart.com/search?q=${encodeURIComponent(item)}`
  });
}
    return {
      amazonList:   amazonList.slice(0, 6),
      flipkartList: flipkartList.slice(0, 6),
      myntraList:   myntraList.slice(0, 6)
    };

  } catch (err) {
    log.error("SerpAPI error", err);
    return { amazonList: [], flipkartList: [], myntraList: [] };
  }
};

// ==============================
// PLATFORM PRICE GENERATOR
// ==============================
const generatePlatformPrices = (basePrice) => ({
  blinkit:  basePrice + 2,
  zepto:    basePrice + 5,
  instamart: basePrice + 3,
  jiomart:  basePrice - 1
});

/* ==============================
   ROUTES
============================== */
app.get("/", (req, res) => res.send("Backend is running"));

/* ==============================
   SIGNUP
============================== */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({ name, email, password: hashedPassword, verificationToken, isVerified: false });
    await user.save();

    const verifyLink = `https://food-price-compare-production.up.railway.app/verify/${verificationToken}`;
    sendVerificationEmail(email, verifyLink)
      .then(() => log.success("Verification email sent"))
      .catch(err => log.error("Email send failed", err));

    res.status(201).json({ message: "Verification email sent" });
  } catch (error) {
    log.error("SIGNUP ERROR", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/verification-failed`);

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/verified`);
  } catch (err) {
    log.error("Verification error", err);
    res.redirect(`${process.env.FRONTEND_URL}/verification-failed`);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    log.error("LOGIN ERROR", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) { user = new User({ name, email, googleId: sub }); await user.save(); }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Google login success", token: jwtToken });
  } catch (err) {
    log.error("GOOGLE LOGIN ERROR", err);
    res.status(500).json({ message: "Google login failed" });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.searchHistory)) { user.searchHistory = []; await user.save(); }
    res.json(user);
  } catch (err) {
    log.error("ME ROUTE ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    log.error("DELETE ACCOUNT ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/save-search", authMiddleware, async (req, res) => {
  try {
    const { item, city, serviceType, winner, bestPrice } = req.body;
    if (serviceType === "ride") return res.json({ message: "Ride handled in /compare" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.searchHistory)) user.searchHistory = [];
    user.searchHistory.unshift({ item, city, serviceType, winner, bestPrice });
    user.searchHistory = user.searchHistory.slice(0, 20);
    await user.save();

    res.json({ message: "Search saved" });
  } catch (err) {
    log.error("SAVE SEARCH ERROR", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/insights", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.searchHistory) {
      return res.json({ food: { total: 0 }, grocery: { total: 0 }, ride: { total: 0 } });
    }

    const history = user.searchHistory;
    const topKey = (obj) =>
      Object.keys(obj).length > 0
        ? Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
        : null;

    // FOOD
    const foodHistory = history.filter(h => h.serviceType === "food");
    const foodCount = {}, foodCityCount = {};
    foodHistory.forEach(h => {
      if (h.item) foodCount[h.item] = (foodCount[h.item] || 0) + 1;
      if (h.city) foodCityCount[h.city] = (foodCityCount[h.city] || 0) + 1;
    });

    // GROCERY
    const groceryHistory = history.filter(h => h.serviceType === "grocery");
    const groceryItemCount = {}, groceryCityCount = {};
    groceryHistory.forEach(h => {
      if (h.item) groceryItemCount[h.item] = (groceryItemCount[h.item] || 0) + 1;
      if (h.city) groceryCityCount[h.city] = (groceryCityCount[h.city] || 0) + 1;
    });

    // RIDE
    const rideHistory = history.filter(h => h.serviceType === "ride");
    const platformCount = {}, rideCityCount = {};
    let totalDistance = 0, totalPrice = 0;
    rideHistory.forEach(r => {
      if (r.winner) platformCount[r.winner] = (platformCount[r.winner] || 0) + 1;
      if (r.city) rideCityCount[r.city] = (rideCityCount[r.city] || 0) + 1;
      totalDistance += r.distance || 0;
      totalPrice += r.bestPrice || 0;
    });

    // ECOMMERCE
    const ecommerceHistory = history.filter(h => h.serviceType === "ecommerce");
    const ecommerceItemCount = {}, ecommercePlatformCount = {};
    let ecommerceTotalSaved = 0;
    ecommerceHistory.forEach(h => {
      if (h.item) ecommerceItemCount[h.item] = (ecommerceItemCount[h.item] || 0) + 1;
      if (h.winner) ecommercePlatformCount[h.winner] = (ecommercePlatformCount[h.winner] || 0) + 1;
      ecommerceTotalSaved += h.bestPrice || 0;
    });

    res.json({
      food: {
        total: foodHistory.length,
        favouriteFood: topKey(foodCount),
        favouriteCity: topKey(foodCityCount)
      },
      grocery: {
        total: groceryHistory.length,
        favouriteItem: topKey(groceryItemCount),
        favouriteCity: topKey(groceryCityCount)
      },
      ride: {
        total: rideHistory.length,
        favouritePlatform: topKey(platformCount),
        favouriteCity: topKey(rideCityCount),
        avgRidePrice: rideHistory.length ? Math.round(totalPrice / rideHistory.length) : 0,
        avgDistance: rideHistory.length ? (totalDistance / rideHistory.length).toFixed(1) : 0
      },
      ecommerce: {
        total: ecommerceHistory.length,
        favouriteProduct: topKey(ecommerceItemCount),
        favouritePlatform: topKey(ecommercePlatformCount),
        moneySaved: ecommerceTotalSaved
      }
    });

  } catch (err) {
    log.error("Insights error", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/ride-insights", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const rideHistory = (user.searchHistory || []).filter(s => s.serviceType === "ride");

    if (rideHistory.length === 0) return res.json({ totalRides: 0, favouritePlatform: null, avgPrice: 0, totalDistance: 0 });

    let totalPrice = 0, totalDistance = 0;
    const platformCount = {};

    rideHistory.forEach(r => {
      totalPrice += Number(r.bestPrice) || 0;
      const dist = parseFloat(r.distance);
      if (!isNaN(dist)) totalDistance += dist;
      if (r.winner) platformCount[r.winner] = (platformCount[r.winner] || 0) + 1;
    });

    const favouritePlatform = Object.keys(platformCount).length > 0
      ? Object.keys(platformCount).reduce((a, b) => platformCount[a] > platformCount[b] ? a : b)
      : null;

    res.json({
      totalRides: rideHistory.length,
      favouritePlatform,
      avgPrice: Math.round(totalPrice / rideHistory.length),
      totalDistance: Number(totalDistance.toFixed(1))
    });
  } catch (err) {
    log.error("RIDE INSIGHTS ERROR", err);
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
    log.error("CLEAR HISTORY ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/fix-rides", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.searchHistory = user.searchHistory.filter(r => {
      if (r.serviceType !== "ride") return true;
      const dist = parseFloat(r.distance);
      return Number.isFinite(dist) && r.item && r.city;
    });
    await user.save();
    res.json({ message: "Ride data cleaned perfectly" });
  } catch (err) {
    log.error("FIX RIDES ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    log.error("PROFILE UPDATE ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/add-favourite", authMiddleware, async (req, res) => {
  try {
    const { name, platform, city, price, image } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = user.favourites.find(f => f.name === name && f.platform === platform);
    if (existing) {
      user.favourites = user.favourites.filter(f => !(f.name === name && f.platform === platform));
      await user.save();
      return res.json({ message: "Favourite removed" });
    } else {
      user.favourites.unshift({ name, platform, city, price, image });
      await user.save();
      return res.json({ message: "Favourite added" });
    }
  } catch (err) {
    log.error("FAV ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// BUILD GROCERY BASKET
// ==============================
const buildBasket = async (products) => {
  const basket = [];

  await Promise.all(products.map(async (product) => {
    const marketData = await fetchMarketPrice(product);
    const basePrice = marketData?.price || 60;
    const image = marketData?.image || null;
    const prices = generatePlatformPrices(basePrice);
    const category = detectCategory(product);

    basket.push({
      product,
      category,
      image,
      zepto:    prices.zepto,
      blinkit:  prices.blinkit,
      instamart: prices.instamart,
      jiomart:  prices.jiomart
    });
  }));

  const totals = {
    zepto:    basket.reduce((sum, i) => sum + i.zepto, 0),
    blinkit:  basket.reduce((sum, i) => sum + i.blinkit, 0),
    instamart: basket.reduce((sum, i) => sum + i.instamart, 0),
    jiomart:  basket.reduce((sum, i) => sum + i.jiomart, 0)
  };

  const basketWinner = Object.entries(totals).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  return { basket, totals, basketWinner };
};

/* ==============================
   COMPARE ROUTE
============================== */
app.post("/compare", authMiddleware, async (req, res) => {
  const { item, city, serviceType } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let lat, lng;

    if (serviceType !== "ride") {
      const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { format: "json", q: city },
        headers: { "User-Agent": "pricecompare-app" }
      });

      if (!geo.data?.length) return res.status(400).json({ message: "City not found" });
      lat = geo.data[0].lat;
      lng = geo.data[0].lon;
    }

    // ── FOOD ──
    if (serviceType === "food") {
      const swiggyList = await fetchSwiggyRestaurants(lat, lng, item);
      let zomatoList = await fetchZomatoRestaurants(lat, lng, item, city);

      // Fallback: derive Zomato from Swiggy with slight price variations
      if (zomatoList.length === 0 && swiggyList.length > 0) {
        log.warn("Zomato empty, using Swiggy-derived fallback");
        zomatoList = swiggyList.map(r => ({
          ...r,
          price: r.price + Math.floor(Math.random() * 30 - 10),
          time:  r.time  + Math.floor(Math.random() * 10 - 5),
          url: `https://www.zomato.com/search?q=${encodeURIComponent(r.name)}`
        }));
      }

      return res.json({ serviceType, item, city, swiggyList, zomatoList });
    }

    // ── GROCERY ──
    if (serviceType === "grocery") {
      const cacheKey = `${item}-${city}`;
      const cached = groceryCache.get(cacheKey);
      if (cached && Date.now() - cached.time < 300000) {
        log.success("Grocery cache hit");
        return res.json(cached.data);
      }

      const products = detectMultipleProducts(item).slice(0, 6);
      const basketData = await buildBasket(products);

      const responseData = {
        serviceType,
        city,
        products,
        basket: basketData.basket,
        totals: basketData.totals,
        basketWinner: basketData.basketWinner
      };

      if (!Array.isArray(user.searchHistory)) user.searchHistory = [];
      const winner = basketData.basketWinner;
      user.searchHistory.unshift({
        item, city, serviceType: "grocery", winner,
        bestPrice: basketData.totals[winner],
        totals: basketData.totals,
        createdAt: new Date()
      });
      user.searchHistory = user.searchHistory.slice(0, 20);
      await user.save();

      groceryCache.set(cacheKey, { data: responseData, time: Date.now() });
      return res.json(responseData);
    }

    // ── RIDE ──
    if (serviceType === "ride") {
      const cacheKey = `${city}-${item}`;
      const cached = rideCache.get(cacheKey);
      if (cached && Date.now() - cached.time < 300000) {
        log.success("Ride cache hit");
        return res.json(cached.data);
      }

      const geoOpts = { params: { format: "json" }, headers: { "User-Agent": "pricecompare-app" } };

      const [pickupGeo, dropGeo] = await Promise.all([
        axios.get("https://nominatim.openstreetmap.org/search", { ...geoOpts, params: { format: "json", q: city } }),
        axios.get("https://nominatim.openstreetmap.org/search", { ...geoOpts, params: { format: "json", q: `${item}, India` } })
      ]);

      const pLat = pickupGeo.data[0]?.lat, pLng = pickupGeo.data[0]?.lon;
      const dLat = dropGeo.data[0]?.lat,   dLng = dropGeo.data[0]?.lon;

      if (!pLat || !pLng || !dLat || !dLng) {
        return res.status(400).json({ message: "Location not found. Try more specific place." });
      }

      const distance      = calculateDistance(parseFloat(pLat), parseFloat(pLng), parseFloat(dLat), parseFloat(dLng));
      const finalDistance = Math.round(distance * 10) / 10;
      const baseFare      = finalDistance * 12;

      const platforms = {
        uber:    { car: { price: Math.round(baseFare+40), time: Math.floor(finalDistance*2+5)   }, bike: { price: Math.round(baseFare-20), time: Math.floor(finalDistance*1.5+3) }, auto: { price: Math.round(baseFare+10), time: Math.floor(finalDistance*2.2+4) } },
        ola:     { car: { price: Math.round(baseFare+35), time: Math.floor(finalDistance*2.5+6) }, bike: { price: Math.round(baseFare-25), time: Math.floor(finalDistance*1.6+4) }, auto: { price: Math.round(baseFare+5),  time: Math.floor(finalDistance*2.3+5) } },
        rapido:  { bike:{ price: Math.round(baseFare-30), time: Math.floor(finalDistance*1.4+3) }, car:  { price: Math.round(baseFare+35), time: Math.floor(finalDistance*2.5+6) }, auto: { price: Math.round(baseFare+5),  time: Math.floor(finalDistance*2.3+5) } },
        indrive: { car: { price: Math.round(baseFare-10), time: Math.floor(finalDistance*2.8+6) }, auto: { price: Math.round(baseFare+5),  time: Math.floor(finalDistance*2.3+5) }, bike: { price: Math.round(baseFare-30), time: Math.floor(finalDistance*1.4+3) } }
      };

      const getMinPrice = (p) => Math.min(...Object.values(p).map(r => r.price));
      const winner = Object.entries(platforms).reduce((a, b) => getMinPrice(a[1]) < getMinPrice(b[1]) ? a : b)[0];

      const bestPrice = Math.min(...Object.values(platforms).map(p => getMinPrice(p)));

      if (!Array.isArray(user.searchHistory)) user.searchHistory = [];
      user.searchHistory.unshift({
        item, city, pickup: city, drop: item, serviceType: "ride",
        winner, bestPrice, distance: finalDistance, platforms, createdAt: new Date()
      });
      user.searchHistory = user.searchHistory.slice(0, 20);
      await user.save();

      const responseData = {
        serviceType: "ride", pickup: city, drop: item, distance: finalDistance,
        platforms, winner,
        pickupCoords: [parseFloat(pLat), parseFloat(pLng)],
        dropCoords:   [parseFloat(dLat), parseFloat(dLng)]
      };

      rideCache.set(cacheKey, { data: responseData, time: Date.now() });
      return res.json(responseData);
    }

    // ── ECOMMERCE ──
    if (serviceType === "ecommerce") {
      const cacheKey = item;
      const cached = ecommerceCache.get(cacheKey);
      if (cached && Date.now() - cached.time < 300000) {
        log.success("Ecommerce cache hit");
        return res.json(cached.data);
      }

      const data = await fetchEcommercePrices(item);
      const responseData = { serviceType: "ecommerce", ...data };

      ecommerceCache.set(cacheKey, { data: responseData, time: Date.now() });

      if (!Array.isArray(user.searchHistory)) user.searchHistory = [];
      const allPrices = [...(data.amazonList||[]), ...(data.flipkartList||[]), ...(data.myntraList||[])];
      const cheapest = allPrices.length > 0 ? allPrices.sort((a,b) => a.price - b.price)[0] : null;
      const platform = cheapest?.link?.includes("amazon") ? "amazon"
                     : cheapest?.link?.includes("flipkart") ? "flipkart"
                     : cheapest?.link?.includes("myntra")   ? "myntra" : "other";

      user.searchHistory.unshift({
        item, city, serviceType: "ecommerce", winner: platform,
        bestPrice: cheapest ? cheapest.price : 0, createdAt: new Date()
      });
      user.searchHistory = user.searchHistory.slice(0, 20);
      await user.save();

      return res.json(responseData);
    }

  } catch (err) {
    log.error("COMPARE ERROR", err);
    res.status(500).json({ message: "Compare failed" });
  }
});

/* ==============================
   DATABASE CONNECTION
============================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => log.error("MongoDB Connection Error", err));

/* ==============================
   SERVER START
============================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
