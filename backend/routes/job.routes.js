const express = require('express');
const router = express.Router();
const Job = require('../models/job');

// Get all jobs (filtered) - Public access
router.get('/', async (req, res) => {
  try {
    const { 
      title, 
      location, 
      jobType, 
      skills,
      accessibility // Added new filter
    } = req.query;
    
    const filter = {};
    
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (skills) filter.skillsRequired = { $in: skills.split(',') };
    if (accessibility) filter.accessibilityFeatures = { $in: accessibility.split(',') }; // New

    // Added pagination (optional)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
});

// Get single job - Public access
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('applications'); // If you want to see applications

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    res.json({
      success: true,
      job  // ✅ fixed key name
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});

// Temporary removal of auth middleware - Add back later
const mongoose = require("mongoose");

router.post('/', async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: new mongoose.Types.ObjectId(req.body.postedBy) // ✅ Proper conversion
    };

    const newJob = new Job(jobData);
    await newJob.save();

    res.status(201).json({
      success: true,
      data: newJob
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors || err.message
    });
  }
});

module.exports = router;