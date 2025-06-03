// Vercel API entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:5175',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    vercel: true
  });
});

// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working on Vercel!' });
});

// For now, add a placeholder for other routes
app.use('/api/*', (req, res) => {
  res.status(503).json({ 
    error: 'API routes are being configured',
    path: req.path,
    method: req.method
  });
});

// Export for Vercel
module.exports = app;