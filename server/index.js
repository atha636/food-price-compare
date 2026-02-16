const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.post("/compare", (req, res) => {
  const { item, city } = req.body;

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

  const zomatoPrice = calculatePrice(item, city, "zomato");
  const swiggyPrice = calculatePrice(item, city, "swiggy");
  

  res.json({
  item,
  city,
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