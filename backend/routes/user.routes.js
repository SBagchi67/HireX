const express = require("express");
const router = express.Router();
const User = require("../models/user");

// ✅ GET user by ID (without password)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
});

module.exports = router;
