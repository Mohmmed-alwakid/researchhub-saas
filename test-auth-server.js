/**
 * Simple test server for authentication
 */

import express from 'express';
import cors from 'cors';
import authHandler from './api/auth-consolidated.js';

const app = express();
const PORT = 3005; // Updated to fixed port configuration

// Middleware
app.use(cors());
app.use(express.json());

// Mock Vercel request/response for our auth handler (handle both POST and GET)
app.all('/api/auth-consolidated', async (req, res) => {
  console.log('📝 Auth request received:', {
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  try {
    // Create a mock Vercel-style response object
    const mockRes = {
      status: (code) => {
        res.status(code);
        return mockRes;
      },
      json: (data) => {
        console.log('📤 Auth response:', data);
        res.json(data);
      },
      setHeader: (key, value) => {
        res.setHeader(key, value);
      }
    };

    // Pass through the query parameters
    req.query = { ...req.query };
    
    await authHandler(req, mockRes);
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(500).json({ error: 'Authentication server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test auth server running on http://localhost:${PORT}`);
  console.log(`📍 Auth endpoint: http://localhost:${PORT}/api/auth-consolidated`);
});
