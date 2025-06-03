// Test script to load server with detailed debugging
console.log('🔧 Loading server with detailed debugging...');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  
  console.log('2. Loading express...');
  const express = require('express');
  
  console.log('3. Creating express app...');
  const app = express();
  
  console.log('4. Loading cors...');
  const cors = require('cors');
  
  console.log('5. Setting up CORS...');
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  console.log('6. Setting up JSON middleware...');
  app.use(express.json({ limit: '10mb' }));
  
  console.log('7. Setting up URL encoding...');
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  console.log('8. Loading API routes...');
  const apiRoutes = require('./dist/server/server/routes/index.js');
  
  console.log('9. Mounting API routes...');
  app.use('/api', apiRoutes.default || apiRoutes);
  
  console.log('10. Adding health check route...');
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  console.log('11. Adding catch-all route...');
  app.all('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  console.log('✅ Server components loaded successfully - no path-to-regexp error');
  
} catch (error) {
  console.error('❌ Error during server loading:', error.message);
  console.error('Stack trace:', error.stack);
  
  if (error.message.includes('Missing parameter name')) {
    console.error('🔍 Found the path-to-regexp error!');
  }
}
