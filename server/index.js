require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.post("/compare", (req, res) => {
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
  rating: (3.5 + Math.random() * 1.5).toFixed(1), // 3.5 - 5.0
  time: Math.floor(20 + Math.random() * 15) // 20-35 mins
}));

const swiggyList = swiggyRestaurants.map(name => ({
  name,
  price: calculatePrice(item, city, "swiggy"),
  rating: (3.5 + Math.random() * 1.5).toFixed(1),
  time: Math.floor(18 + Math.random() * 18)
}));


    return res.json({
      serviceType,
      item,
      city,
      zomatoList,
      swiggyList
    });
  }

  // Grocery & Ride logic (unchanged)
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


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});