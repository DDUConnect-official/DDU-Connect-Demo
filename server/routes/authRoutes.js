const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  sendOtp,
  resetPassword,
  resendOtp
} = require('../controllers/authController');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);           // 🔐 Send OTP to email
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword); // 🔒 Verify OTP and reset password



module.exports = router;
