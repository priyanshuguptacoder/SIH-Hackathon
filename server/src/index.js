require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const industryRoutes      = require('./routes/industryRoutes');
const approvalsRoutes     = require('./routes/approvalsRoutes');
const applicationsRoutes  = require('./routes/applicationsRoutes');
const documentsRoutes     = require('./routes/documentsRoutes');
const complianceRoutes    = require('./routes/complianceRoutes');
const schemesRoutes       = require('./routes/schemesRoutes');
const aiRoutes            = require('./routes/aiRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const inspectionsRoutes   = require('./routes/inspectionsRoutes');
const adminRoutes         = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
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
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Database ─────────────────────────────────────────────────────────────────
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih-db';

mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('Running without DB — most routes will fail until connected.');
  });

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (no auth required)
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'SIH Industrial Approval Platform API',
      version: '1.0.0',
      mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    }
  });
});

app.use('/auth',          authRoutes);
app.use('/industries',    industryRoutes);
app.use('/approvals',     approvalsRoutes);
app.use('/applications',  applicationsRoutes);
app.use('/documents',     documentsRoutes);
app.use('/compliance',    complianceRoutes);
app.use('/schemes',       schemesRoutes);
app.use('/ai',            aiRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/inspections',   inspectionsRoutes);
app.use('/admin',         adminRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` }
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Ensures no stack trace / secrets leak to the client
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app; // export for testing