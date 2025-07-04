// Test script to isolate path-to-regexp error by loading server components step by step
const express = require('express');

console.log('🧪 Testing server components step by step...');

async function testServerComponents() {
  try {
    console.log('1. Creating Express app...');
    const app = express();
    
    console.log('2. Setting up basic middleware...');
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    console.log('3. Loading route modules...');
    const apiRoutes = require('./dist/server/server/routes/index.js');
    
    console.log('4. Mounting API routes...');
    app.use('/api', apiRoutes.default || apiRoutes);
    
    console.log('5. Adding catch-all route...');
    app.all('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
    
    console.log('✅ All server components loaded successfully');
    
    // Try to create a test server briefly
    console.log('6. Testing server creation...');
    const server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`✅ Test server started on port ${port}`);
      server.close();
      console.log('✅ Test server stopped successfully');
    });
    
  } catch (error) {
    console.error('❌ Server component failed:', error.message);
    console.error('Stack trace:', error.stack);
    if (error.message.includes('Missing parameter name')) {
      console.error('🔍 Found the path-to-regexp error!');
    }
    process.exit(1);
  }
}

testServerComponents();
