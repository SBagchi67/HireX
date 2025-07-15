const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  resume: {
    type: String,
    required: [true, 'Resume URL is required'],
    // ❌ Removed strict URL validation — allows local file paths too
  },
  status: {
    type: String,
    enum: {
      values: ['Applied', 'Viewed', 'Rejected', 'Accepted'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
