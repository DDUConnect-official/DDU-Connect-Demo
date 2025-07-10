require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ✅ Make sure there's NO trailing slash in the URL
const allowedOrigins = [
  'http://localhost:3000', // local
  'https://ddu-connect-frontend-4ccn.vercel.app' // deployed Vercel frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ preflight requests

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// MongoDB + server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(🚀 Server running on port ${PORT});
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
