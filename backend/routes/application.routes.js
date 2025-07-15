// routes/application.routes.js

const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const Job = require("../models/job");
const User = require("../models/user");

// POST /api/applications — using resume URL from frontend (already uploaded)
router.post("/", async (req, res) => {
  try {
    const { job, applicant, resume } = req.body;
     
    console.log(req.body)
    // Validate input
    if (!job || !applicant || !resume) {
      console.log("missing job")

      return res.status(400).json({
        success: false,
        message: "Missing job ID, applicant ID, or resume URL",
      });
    }

    // Check job exists
    const jobExists = await Job.findById(job);
    if (!jobExists) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Check user exists
    const userExists = await User.findById(applicant);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check duplicate application
    const existing = await Application.findOne({ job, applicant });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You've already applied to this job",
      });
    }

    // Save application
    const application = new Application({
      job,
      applicant,
      resume, // This is just a URL now
    });

    await application.save();

    res.status(201).json({
      success: true,
      application,
      message: "✅ Application submitted successfully",
    });

  } catch (error) {
    console.error("Application error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during application",
      error: error.message,
    });
  }
});

module.exports = router;
