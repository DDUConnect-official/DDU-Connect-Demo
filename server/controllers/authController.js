require('dotenv').config();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validIds = require('../data/validIds');
const transporter = require('../utils/mailer'); // <-- Nodemailer transporter

const JWT_SECRET = process.env.JWT_SECRET;


// ---------------- SIGNUP ----------------
const signupUser = async (req, res) => {
  const { studentId, name, email, password } = req.body;

  try {
    if (!validIds.includes(studentId)) {
      return res.status(400).json({ error: '❌ Not a valid student ID' });
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ error: '❌ ID already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      studentId,
      name,
      email,
      passwordHash,
      xp: 0,
    });

    await newStudent.save();

    res.status(201).json({ message: '✅ Signup successful!' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: '❌ Signup failed. Server error.' });
  }
};

// ---------------- LOGIN ----------------
const loginUser = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(400).json({ error: '❌ ID not registered' });
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '❌ Incorrect password' });
    }

    const token = jwt.sign(
      { studentId: student.studentId, name: student.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '✅ Login successful!',
      token,
      student: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        xp: student.xp
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: '❌ Server error during login' });
  }
};

// ---------------- SEND OTP ----------------
const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: '❌ No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 60 * 1000); // 10 minutes

    // Save OTP to student
    student.otp = otp;
    student.otpExpiry = otpExpiry;
    await student.save();

    const mailOptions = {
      from: 'dduconnectbot@gmail.com',
      to: email,
      subject: 'Password Reset OTP - DDU Connect',
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 1 minute only.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: '✅ OTP sent successfully to your email.' });

  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    res.status(500).json({ error: '❌ Failed to send OTP email' });
  }
};

// ---------------- RESEND OTP ----------------
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: '❌ No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // new OTP
    const otpExpiry = new Date(Date.now() + 60 * 1000); // 1 min from now

    student.otp = otp;
    student.otpExpiry = otpExpiry;
    await student.save();

    const mailOptions = {
      from: 'dduconnectbot@gmail.com',
      to: email,
      subject: 'Resent OTP - DDU Connect',
      text: `Your new OTP is: ${otp}\n\nThis OTP is valid for 1 minute.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: '✅ New OTP sent successfully!' });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: '❌ Failed to resend OTP' });
  }
};

// ---------------- RESET PASSWORD ----------------
const resetPassword = async (req, res) => {
  const { studentId, email, otp, newPassword } = req.body;

  try {
    const student = await Student.findOne({ studentId, email });

    if (!student) {
      return res.status(404).json({ error: '❌ Student not found' });
    }

    if (
      !student.otp ||
      !student.otpExpiry ||
      student.otp !== otp ||
      new Date() > new Date(student.otpExpiry)
    ) {
      return res.status(400).json({ error: '❌ Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    student.passwordHash = passwordHash;
    student.otp = undefined;
    student.otpExpiry = undefined;

    await student.save();

    res.status(200).json({ message: '✅ Password reset successfully!' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: '❌ Failed to reset password' });
  }
};



module.exports = {
  signupUser,
  loginUser,
  sendOtp,
  resetPassword,
  resendOtp,
};
