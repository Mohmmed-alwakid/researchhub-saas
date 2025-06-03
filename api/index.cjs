// Vercel API entry point - Clean version
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ResearchHub API is running on Vercel' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    vercel: true
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API test successful on Vercel!' });
});

// Export for Vercel
module.exports = app;