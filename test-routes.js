// Test script to identify problematic route
const express = require('express');

console.log('🧪 Testing individual route modules...');

const app = express();

// Test each route module individually
const routeModules = [
  { name: 'index', path: './dist/server/server/routes/index.js' },
  { name: 'auth', path: './dist/server/server/routes/auth.routes.js' },
  { name: 'study', path: './dist/server/server/routes/study.routes.js' },
  { name: 'task', path: './dist/server/server/routes/task.routes.js' },
  { name: 'session', path: './dist/server/server/routes/session.routes.js' },
  { name: 'participant', path: './dist/server/server/routes/participant.routes.js' },
  { name: 'participantApplication', path: './dist/server/server/routes/participantApplication.routes.js' },
  { name: 'upload', path: './dist/server/server/routes/upload.routes.js' },
  { name: 'subscription', path: './dist/server/server/routes/subscription.routes.js' },
  { name: 'admin', path: './dist/server/server/routes/admin.routes.js' }
];

async function testRoutes() {
  for (const module of routeModules) {
    try {
      console.log(`Testing ${module.name} routes...`);
      const router = require(module.path);
      
      // Try to mount the router
      const testApp = express();
      testApp.use(`/${module.name}`, router.default || router);
      
      console.log(`✅ ${module.name} routes loaded successfully`);
    } catch (error) {
      console.error(`❌ ${module.name} routes failed:`, error.message);
      if (error.message.includes('Missing parameter name')) {
        console.error(`🔍 Found the problematic route in ${module.name}!`);
        process.exit(1);
      }
    }
  }
  
  console.log('✅ All routes tested successfully');
}

testRoutes();
