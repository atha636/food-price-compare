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

  let zomatoPrice;
let swiggyPrice;
let zomatoTime;
let swiggyTime;

if (serviceType === "food") {
  zomatoPrice = calculatePrice(item, city, "zomato");
  swiggyPrice = calculatePrice(item, city, "swiggy");

  zomatoTime = Math.floor(25 + Math.random() * 10);
  swiggyTime = Math.floor(20 + Math.random() * 15);
}

else if (serviceType === "grocery") {
  zomatoPrice = Math.floor(500 + Math.random() * 300); // Blinkit
  swiggyPrice = Math.floor(480 + Math.random() * 350); // Instamart

  zomatoTime = Math.floor(10 + Math.random() * 10);
  swiggyTime = Math.floor(8 + Math.random() * 12);
}

else if (serviceType === "ride") {
  zomatoPrice = Math.floor(150 + Math.random() * 200); // Uber
  swiggyPrice = Math.floor(140 + Math.random() * 220); // Ola

  zomatoTime = Math.floor(3 + Math.random() * 5);
  swiggyTime = Math.floor(2 + Math.random() * 6);
}

else {
  // fallback (default food)
  zomatoPrice = calculatePrice(item, city, "zomato");
  swiggyPrice = calculatePrice(item, city, "swiggy");

  zomatoTime = Math.floor(25 + Math.random() * 10);
  swiggyTime = Math.floor(20 + Math.random() * 15);
}

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


const PORT = process.env.PORT;


app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});