const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {                      // ✅ NEW FIELD
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: true
  },

  // ✅ Add these for OTP handling
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
