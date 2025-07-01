// Simple test server for points system testing
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Import and use API endpoints
import authHandler from './api/auth.js';
import studiesHandler from './api/studies.js';
import pointsHandler from './api/points.js';
import performanceHandler from './api/performance.js';

// API routes
app.all('/api/auth', authHandler);
app.all('/api/studies*', studiesHandler);
app.all('/api/points*', pointsHandler);
app.all('/api/performance*', performanceHandler);

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Points system test server running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Points System Test Server running at http://localhost:${PORT}`);
  console.log(`📋 Test Interface: http://localhost:${PORT}/points-system-integration-test.html`);
  console.log(`🔧 API Health Check: http://localhost:${PORT}/api/health`);
});
