const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    default: null
  },
isVerified: {
  type: Boolean,
  default: false
},
verificationToken: String,

  // 🔥 MUST be inside schema
  searchHistory: {
  type: [
    {
      item: String,
      city: String,
      serviceType: String,
      winner: String,
      bestPrice: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  default: []
},
favourites: {
  type: [
    {
      name: String,
      platform: String,
      city: String,
      price: Number,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  default: []
}


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);