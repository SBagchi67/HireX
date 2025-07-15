const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🧱 Create the shape of a User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer'], 
    required: true
  }
}, {
  timestamps: true 
});

// 🔐 Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // only hash if password changed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 📤 Export
const User = mongoose.model('User', userSchema);
module.exports = User;
