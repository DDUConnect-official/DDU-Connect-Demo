require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Adjust path if needed

const app = express();

// Allow requests from your frontend (local and deployed)
const allowedOrigins = [
  'http://localhost:3000', // local development
  'https://ddu-connect-frontend-4ccn.vercel.app/' // replace this later with actual Vercel frontend URL
];

const corsOptions = {
   origin: function (origin, callback) {
     if(!origin) return callback(null,true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}
// Middleware
app.use(cors(corsOptions));
app.options("*",cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Port from env or default to 5000
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
