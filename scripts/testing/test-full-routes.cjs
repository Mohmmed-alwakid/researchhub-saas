// Test script to reproduce the path-to-regexp error
const express = require('express');

console.log('🧪 Testing full route integration...');

async function testFullRoutes() {
  try {
    console.log('Creating Express app...');
    const app = express();
    
    console.log('Loading main route index...');
    const apiRoutes = require('./dist/server/server/routes/index.js');
    
    console.log('Mounting routes...');
    app.use('/api', apiRoutes.default || apiRoutes);
    
    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Route loading failed:', error.message);
    console.error('Full error:', error);
    if (error.message.includes('Missing parameter name')) {
      console.error('🔍 Found the path-to-regexp error!');
    }
    process.exit(1);
  }
}

testFullRoutes();
