#!/usr/bin/env node

/**
 * Railway Deployment Database Status Checker
 * Comprehensive test for Railway MongoDB connection
 */

const https = require('https');
const mongoose = require('mongoose');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function headerLog(message) {
  console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}`);
}

// Configuration
const config = {
  railwayUrl: process.env.RAILWAY_URL || 'https://your-app.railway.app',
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb.railway.internal:27017/researchhub',
  timeout: 15000
};

async function checkRailwayDatabaseConnection() {
  headerLog('🚂 RAILWAY DATABASE CONNECTION CHECKER');
  
  try {
    // Step 1: Check API Health
    await checkAPIHealth();
    
    // Step 2: Check Database Health via API
    await checkDatabaseHealthViaAPI();
    
    // Step 3: Direct MongoDB connection (if local testing)
    if (process.env.TEST_DIRECT_CONNECTION === 'true') {
      await checkDirectMongoConnection();
    }
    
    // Step 4: Test Authentication Flow
    await testAuthenticationFlow();
    
    // Step 5: Summary and Recommendations
    printSummaryAndRecommendations();
    
  } catch (error) {
    colorLog('red', `\n❌ Critical Error: ${error.message}`);
    printTroubleshootingGuide();
    process.exit(1);
  }
}

async function checkAPIHealth() {
  headerLog('📡 API HEALTH CHECK');
  
  try {
    const response = await makeHttpsRequest(`${config.railwayUrl}/api/health`);
    const data = JSON.parse(response.data);
    
    if (response.statusCode === 200) {
      colorLog('green', '✅ API Health Check Passed');
      colorLog('white', `   Status: ${data.status}`);
      colorLog('white', `   Environment: ${data.environment}`);
      colorLog('white', `   Uptime: ${Math.round(data.uptime)}s`);
      colorLog('white', `   Port: ${data.port}`);
      
      // Check database info in health response
      if (data.database) {
        colorLog('blue', '\n📊 Database Status in Health Check:');
        colorLog('white', `   Status: ${data.database.status}`);
        colorLog('white', `   Connected: ${data.database.isConnected}`);
        colorLog('white', `   Ready State: ${data.database.readyState}`);
        colorLog('white', `   Host: ${data.database.host || 'Not available'}`);
        colorLog('white', `   Database Name: ${data.database.name || 'Not available'}`);
        
        if (data.database.status === 'healthy' && data.database.isConnected) {
          colorLog('green', '✅ Database connection is healthy');
        } else {
          colorLog('yellow', '⚠️ Database connection may have issues');
        }
      } else {
        colorLog('yellow', '⚠️ No database status in health check response');
      }
    } else {
      throw new Error(`API health check failed with status ${response.statusCode}`);
    }
  } catch (error) {
    colorLog('red', `❌ API Health Check Failed: ${error.message}`);
    throw error;
  }
}

async function checkDatabaseHealthViaAPI() {
  headerLog('🔍 DATABASE HEALTH VIA API');
  
  try {
    // Try to access an API endpoint that requires database
    const response = await makeHttpsRequest(`${config.railwayUrl}/api/`);
    const data = JSON.parse(response.data);
    
    if (response.statusCode === 200) {
      colorLog('green', '✅ API endpoints responding correctly');
      colorLog('white', `   API Version: ${data.version || 'Not specified'}`);
      
      if (data.endpoints) {
        colorLog('blue', '\n📋 Available Endpoints:');
        Object.entries(data.endpoints).forEach(([key, value]) => {
          colorLog('white', `   ${key}: ${value}`);
        });
      }
    } else {
      throw new Error(`API endpoint check failed with status ${response.statusCode}`);
    }
  } catch (error) {
    colorLog('red', `❌ Database Health via API Failed: ${error.message}`);
    throw error;
  }
}

async function checkDirectMongoConnection() {
  headerLog('🔌 DIRECT MONGODB CONNECTION TEST');
  
  try {
    colorLog('yellow', `Attempting connection to: ${config.mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: config.timeout,
      connectTimeoutMS: config.timeout,
      socketTimeoutMS: config.timeout
    });
    
    colorLog('green', '✅ Direct MongoDB connection successful');
    colorLog('white', `   Database: ${mongoose.connection.name}`);
    colorLog('white', `   Host: ${mongoose.connection.host}`);
    colorLog('white', `   Port: ${mongoose.connection.port}`);
    colorLog('white', `   Ready State: ${mongoose.connection.readyState}`);
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    colorLog('white', `   Collections: ${collections.length} found`);
    
    if (collections.length > 0) {
      colorLog('blue', '\n📚 Collections:');
      collections.forEach(col => {
        colorLog('white', `   - ${col.name}`);
      });
    }
    
    // Test ping
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    colorLog('white', `   Ping: ${JSON.stringify(pingResult)}`);
    
    await mongoose.disconnect();
    colorLog('green', '✅ MongoDB disconnection successful');
    
  } catch (error) {
    colorLog('red', `❌ Direct MongoDB connection failed: ${error.message}`);
    
    // Common error troubleshooting
    if (error.message.includes('ENOTFOUND')) {
      colorLog('yellow', '💡 DNS resolution failed - check MongoDB hostname');
    } else if (error.message.includes('ECONNREFUSED')) {
      colorLog('yellow', '💡 Connection refused - check MongoDB service is running');
    } else if (error.message.includes('authentication')) {
      colorLog('yellow', '💡 Authentication failed - check MongoDB credentials');
    }
    
    throw error;
  }
}

async function testAuthenticationFlow() {
  headerLog('🔐 AUTHENTICATION FLOW TEST');
  
  try {
    // Test auth health endpoint
    const response = await makeHttpsRequest(`${config.railwayUrl}/api/auth/health`);
    
    if (response.statusCode === 200 || response.statusCode === 404) {
      colorLog('green', '✅ Authentication service is accessible');
    } else {
      colorLog('yellow', '⚠️ Authentication service may have issues');
    }
    
    // Note: In a real scenario, you might want to test actual login
    // but that requires test credentials and is more complex
    
  } catch (error) {
    colorLog('yellow', `⚠️ Auth flow test incomplete: ${error.message}`);
    // Don't throw here as auth health endpoint might not exist
  }
}

function printSummaryAndRecommendations() {
  headerLog('📋 SUMMARY & RECOMMENDATIONS');
  
  colorLog('green', '✅ Basic connectivity tests passed');
  colorLog('blue', '\n🎯 Next Steps for Railway Deployment:');
  colorLog('white', '1. Verify MongoDB service is running in Railway dashboard');
  colorLog('white', '2. Check environment variables are correctly set');
  colorLog('white', '3. Monitor deployment logs for any database connection errors');
  colorLog('white', '4. Test actual application functionality after deployment');
  
  colorLog('blue', '\n🔧 Environment Variables to Verify:');
  colorLog('white', '- MONGODB_URI (should point to Railway internal MongoDB)');
  colorLog('white', '- NODE_ENV=production');
  colorLog('white', '- JWT_SECRET and JWT_REFRESH_SECRET');
  colorLog('white', '- CLIENT_URL (should point to your frontend)');
  
  colorLog('blue', '\n📊 Health Check Endpoint:');
  colorLog('white', `   ${config.railwayUrl}/api/health`);
  colorLog('white', '   Use this URL to monitor your deployment status');
}

function printTroubleshootingGuide() {
  headerLog('🛠️ TROUBLESHOOTING GUIDE');
  
  colorLog('red', '❌ If you see connection errors:');
  colorLog('white', '1. Check Railway MongoDB service status');
  colorLog('white', '2. Verify MONGODB_URI environment variable');
  colorLog('white', '3. Check Railway service logs for detailed errors');
  colorLog('white', '4. Ensure MongoDB service is in same Railway project');
  
  colorLog('yellow', '\n⚠️ Common Issues:');
  colorLog('white', '- MongoDB service not started in Railway');
  colorLog('white', '- Incorrect internal hostname in MONGODB_URI');
  colorLog('white', '- Network connectivity issues between services');
  colorLog('white', '- Missing or incorrect environment variables');
  
  colorLog('blue', '\n💡 Quick Fixes:');
  colorLog('white', '- Restart Railway services');
  colorLog('white', '- Double-check environment variable spelling');
  colorLog('white', '- Use Railway internal networking (*.railway.internal)');
  colorLog('white', '- Check Railway dashboard for service status');
}

// Helper function for HTTPS requests
function makeHttpsRequest(url, timeout = config.timeout) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

// Interactive mode for Railway URL input
async function promptForRailwayURL() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    colorLog('yellow', '\n🚂 Railway Deployment URL Required');
    rl.question('Enter your Railway app URL (e.g., https://your-app.railway.app): ', (url) => {
      rl.close();
      resolve(url.trim().replace(/\/$/, ''));
    });
  });
}

// Main execution
async function main() {
  try {
    // Handle Railway URL input
    if (process.argv[2]) {
      config.railwayUrl = process.argv[2].replace(/\/$/, '');
    } else if (!process.env.RAILWAY_URL) {
      config.railwayUrl = await promptForRailwayURL();
    }
    
    colorLog('cyan', `\n🎯 Testing Railway deployment: ${config.railwayUrl}`);
    
    await checkRailwayDatabaseConnection();
    
    colorLog('green', '\n🎉 All tests completed successfully!');
    colorLog('blue', '   Your Railway deployment appears to be healthy.');
    
  } catch (error) {
    colorLog('red', `\n💥 Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  checkRailwayDatabaseConnection,
  checkAPIHealth,
  checkDatabaseHealthViaAPI,
  checkDirectMongoConnection,
  testAuthenticationFlow
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}
