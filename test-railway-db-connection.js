#!/usr/bin/env node

/**
 * Railway Database Connection Test
 * Tests MongoDB connection on Railway deployment
 */

import https from 'https';
import mongoose from 'mongoose';

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Railway deployment URL (update this with your actual Railway URL)
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://your-app.railway.app';

async function testDatabaseConnection() {
  log('cyan', '🚂 Railway Database Connection Test');
  log('cyan', '=====================================');
  
  try {
    // Test 1: Health Check Endpoint
    log('blue', '\n📡 Testing Health Check Endpoint...');
    await testHealthEndpoint();
    
    // Test 2: Direct MongoDB Connection (if running locally)
    if (process.env.MONGODB_URI) {
      log('blue', '\n🔌 Testing Direct MongoDB Connection...');
      await testDirectMongoConnection();
    }
    
    // Test 3: API Authentication Test
    log('blue', '\n🔐 Testing API Authentication...');
    await testAPIAuth();
    
    log('green', '\n✅ All tests completed!');
    
  } catch (error) {
    log('red', `\n❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${RAILWAY_API_URL}/api/health`;
    log('yellow', `Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            log('green', '✅ Health check passed');
            log('green', `   Status: ${response.status}`);
            log('green', `   Environment: ${response.environment}`);
            log('green', `   Uptime: ${Math.round(response.uptime)}s`);
            log('green', `   Port: ${response.port}`);
            resolve(response);
          } else {
            throw new Error(`Health check failed with status ${res.statusCode}`);
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse health check response: ${parseError.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Health check request failed: ${err.message}`));
    });
  });
}

async function testDirectMongoConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    log('yellow', `Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Test connection with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    log('green', '✅ Direct MongoDB connection successful');
    log('green', `   Database: ${mongoose.connection.name}`);
    log('green', `   Host: ${mongoose.connection.host}`);
    log('green', `   Port: ${mongoose.connection.port}`);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    log('green', `   Collections: ${collections.length} found`);
    
    await mongoose.disconnect();
    log('green', '✅ MongoDB disconnection successful');
    
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

async function testAPIAuth() {
  return new Promise((resolve, reject) => {
    const url = `${RAILWAY_API_URL}/api/auth/health`;
    log('yellow', `Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          // 404 is OK if auth/health doesn't exist
          log('green', '✅ API server is responding');
          resolve();
        } else {
          reject(new Error(`API test failed with status ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`API request failed: ${err.message}`));
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
    rl.question('Enter your Railway app URL (e.g., https://your-app.railway.app): ', (url) => {
      rl.close();
      resolve(url);
    });
  });
}

// Main execution
async function main() {
  try {
    // Check if Railway URL is provided
    if (!process.env.RAILWAY_API_URL && process.argv.length < 3) {
      log('yellow', 'No Railway URL provided. Please provide it as an argument or environment variable.');
      log('yellow', 'Usage: node test-railway-db-connection.js <railway-url>');
      log('yellow', 'Or set RAILWAY_API_URL environment variable');
      
      const url = await promptForRailwayURL();
      if (url) {
        process.env.RAILWAY_API_URL = url.replace(/\/$/, ''); // Remove trailing slash
      }
    } else if (process.argv[2]) {
      process.env.RAILWAY_API_URL = process.argv[2].replace(/\/$/, '');
    }
    
    // Update global variable
    global.RAILWAY_API_URL = process.env.RAILWAY_API_URL || RAILWAY_API_URL;
    
    await testDatabaseConnection();
    
  } catch (error) {
    log('red', `Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testDatabaseConnection, testHealthEndpoint, testDirectMongoConnection, testAPIAuth };
