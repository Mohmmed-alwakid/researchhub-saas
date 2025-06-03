// Simple Railway deployment test server
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0';

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ResearchHub API Server - Railway Test',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    host: HOST,
    nodeVersion: process.version
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'API health check passed',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Railway Test Server running on ${HOST}:${PORT}`);
  console.log(`📊 Node.js version: ${process.version}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
