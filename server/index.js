const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.post("/compare", (req, res) => {
  const { item, city, distance = 3 } = req.body;

  // Base item prices (simple mock database)
  const basePrices = {
    pizza: 200,
    burger: 150,
    biryani: 180,
    pasta: 220,
  };

  const basePrice =
    basePrices[item?.toLowerCase()] || 200;

  // City multiplier
  const cityMultiplierMap = {
    mumbai: 1.15,
    delhi: 1.1,
    bangalore: 1.12,
    indore: 1.0,
  };

  const cityMultiplier =
    cityMultiplierMap[city?.toLowerCase()] || 1.05;

  // Time-based surge
  const hour = new Date().getHours();
  const surge =
    hour >= 19 && hour <= 22 ? 1.15 : 1.0;

  // Platform calculations
  function calculatePrice({
    commission,
    deliveryFee,
    distanceFeePerKm,
  }) {
    const commissionAmount = basePrice * commission;
    const distanceFee = distance * distanceFeePerKm;

    const final =
      (basePrice +
        commissionAmount +
        deliveryFee +
        distanceFee) *
      surge *
      cityMultiplier;

    return Math.round(final);
  }

  const zomatoPrice = calculatePrice({
    commission: 0.18,
    deliveryFee: 30,
    distanceFeePerKm: 5,
  });

  const swiggyPrice = calculatePrice({
    commission: 0.2,
    deliveryFee: 25,
    distanceFeePerKm: 6,
  });

  res.json({
    item,
    city,
    surgeApplied: surge > 1,
    zomato: zomatoPrice,
    swiggy: swiggyPrice,
    cheapest:
      zomatoPrice < swiggyPrice
        ? "zomato"
        : "swiggy",
  });
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});


/*const { getZomatoPrice } = require("./services/zomatoService");
const { getSwiggyPrice } = require("./services/swiggyService");

const express = require("express");
const cors = require("cors");

const app = express();

// middlewares
app.use(cors());hij
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// compare API (dummy data for now)
app.post("/compare", (req, res) => {
  const { item, city } = req.body;

  const zomatoPrice = getZomatoPrice(item, city);
const swiggyPrice = getSwiggyPrice(item, city);


  res.json({
    item,
    city,
    zomato: zomatoPrice,
    swiggy: swiggyPrice,
    cheapest: zomatoPrice < swiggyPrice ? "zomato" : "swiggy",
  });
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
*/