const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcryptjs");

// ✅ Test route
router.get('/test', (req, res) => {
  res.send("✅ Auth Route is working");
});


// ✅ Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, role, accessibility } = req.body;

  try {
    // 🔍 Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 🔒 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧠 Create new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      accessibility 
    });

    await newUser.save();

    // ✅ Send back safe user info (not password)
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        accessibility: newUser.accessibility
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Login success – Send minimal safe info
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessibility: user.accessibility
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
