const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  coin: { type: Number, default: 25 }, // Corrected 'coint' to 'coin', and changed to Number
});

module.exports = mongoose.model("User", userSchema);
