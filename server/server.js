require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route files
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────

// Dynamic CORS: allow any localhost / 127.0.0.1 origin (for Vite dev server)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // REST clients / same-origin
      if (
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Database ──────────────────────────────────────────────────────────────────

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih-db';

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Running without DB — register/login will not work until connected.');
  });

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Industrial Approval Platform API is running',
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Auth routes: /auth/register, /auth/login, /auth/me
app.use('/auth', authRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});