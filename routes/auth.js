const express = require("express");
const router = express.Router();
const jwtKey = process.env.db_url;
const jwt = require("jsonwebtoken");
const user = require("../db/user");
const hehe = { this: "nothinf" };
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const existingUser = await user.findOne({ email });

    // Check if user exists
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: existingUser._id }, jwtKey, {
      expiresIn: "4h",
    });

    // Remove password field from the user object
    const { password: _, ...userData } = existingUser.toObject();

    // Send response with token and user data
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  console.log(req.body.email, req.body.password);
  try {
    // Check if email already exists in the database
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user object including the 'coin' field
    const newUser = new user({
      email: req.body.email,
      password: hashedPassword,
      coin: 25, // Set default coin value to 25
    });

    // Save the new user to the database
    const result = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ _id: result._id }, jwtKey, { expiresIn: "4h" });

    // Remove password field from the result object
    const { password, ...userData } = result.toObject();

    // Send response with token and user data
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Define route to get user's coin value
// Define route to get user's coin value
router.get("/get-coin/:email", async (req, res) => {
  try {
    // Find the user by email
    const userEmail = req.params.email;
    const userData = await user.findOne({ email: userEmail });

    // Log userData to see if it's retrieving the correct user data
    console.log("User Data:", userData);

    // Check if user exists
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user's coin value
    res.status(200).json({ coin: userData.coin });
  } catch (error) {
    console.error("Error fetching user's coin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update-coin/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const coin = parseInt(req.body.coin);
    console.log(coin);
    // Find the user by email
    const existingUser = await user.findOne({ email });

    // Check if user exists
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the coin value
    existingUser.coin += coin;

    // Save the updated user data
    await existingUser.save();

    // Send success response
    res.status(200).json({ message: "Coin value updated successfully" });
  } catch (error) {
    console.error("Error updating coin value:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/reduce-coin/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const coin = parseInt(req.body.coin);
    console.log(coin);
    // Find the user by email
    const existingUser = await user.findOne({ email });

    // Check if user exists
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the coin value
    existingUser.coin -= coin;

    // Save the updated user data
    await existingUser.save();

    // Send success response
    res.status(200).json({ message: "Coin value reduced successfully" });
  } catch (error) {
    console.error("Error updating coin value:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;