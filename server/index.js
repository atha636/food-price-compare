const { getZomatoPrice } = require("./services/zomatoService");
const { getSwiggyPrice } = require("./services/swiggyService");

const express = require("express");
const cors = require("cors");

const app = express();

// middlewares
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
