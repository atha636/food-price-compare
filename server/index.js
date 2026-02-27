require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

/* ==============================
   MIDDLEWARE (MUST BE ON TOP)
============================== */
app.use(cors());
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
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
app.post("/save-search", authMiddleware, async (req, res) => {
  try {
    const { item, city, serviceType } = req.body;

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
      serviceType
    });

    // Keep only last 5
    user.searchHistory = user.searchHistory.slice(0, 5);

    await user.save();

    res.json({ message: "Search saved" });

  } catch (err) {
    console.error("SAVE SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==============================
   COMPARE ROUTE (Your Existing Logic)
============================== */
app.post("/compare", authMiddleware, (req, res) => {
  const { item, city, serviceType } = req.body;

  const calculatePrice = (item, city, platform) => {
    const basePrices = {
      pizza: 180,
      burger: 120,
      pasta: 200,
      biryani: 220,
    };

    const cityMultiplier = {
      indore: 1,
      delhi: 1.2,
      mumbai: 1.3,
      jaipur: 1.1,
    };

    const platformFee = platform === "zomato" ? 15 : 10;

    const base = basePrices[item?.toLowerCase()] || 150;
    const cityFactor = cityMultiplier[city?.toLowerCase()] || 1;
    const randomFactor = Math.floor(Math.random() * 20);

    return Math.round(base * cityFactor + platformFee + randomFactor);
  };

  if (serviceType === "food") {
    const zomatoRestaurants = [
      "Domino's",
      "Pizza Hut",
      "Oven Story",
      "Local Pizza Hub",
      "Italiano Cafe",
    ];

    const swiggyRestaurants = [
      "La Pino'z",
      "Chicago Pizza",
      "Domino's",
      "Urban Tandoor",
      "Food Factory",
    ];

    const zomatoList = zomatoRestaurants.map(name => ({
      name,
      price: calculatePrice(item, city, "zomato"),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      time: Math.floor(20 + Math.random() * 15),
    }));

    const swiggyList = swiggyRestaurants.map(name => ({
      name,
      price: calculatePrice(item, city, "swiggy"),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      time: Math.floor(18 + Math.random() * 18),
    }));

    return res.json({
      serviceType,
      item,
      city,
      zomatoList,
      swiggyList,
    });
  }

  // Grocery & Ride
  let zomatoPrice = Math.floor(200 + Math.random() * 200);
  let swiggyPrice = Math.floor(180 + Math.random() * 200);
  let zomatoTime = Math.floor(10 + Math.random() * 10);
  let swiggyTime = Math.floor(8 + Math.random() * 12);

  res.json({
    item,
    city,
    serviceType,
    zomato: zomatoPrice,
    swiggy: swiggyPrice,
    zomatoTime,
    swiggyTime,
    cheapest: zomatoPrice < swiggyPrice ? "zomato" : "swiggy",
    fastest: zomatoTime < swiggyTime ? "zomato" : "swiggy",
  });
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