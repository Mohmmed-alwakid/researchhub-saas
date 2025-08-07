/**
 * PORT MANAGEMENT SOLUTION FOR RESEARCHHUB
 * Ensures consistent ports across all services and prevents conflicts
 */

// STANDARD PORT CONFIGURATION (FIXED TO YOUR PREFERENCE)
export const RESEARCHHUB_PORTS = {
  // Frontend Development Server
  FRONTEND: 5175,           // YOUR PREFERRED PORT - NEVER CHANGES!
  
  // Backend API Server
  API: 3003,               // MATCHING local-full-dev.js - CONSISTENT!
  
  // WebSocket Real-time Server
  WEBSOCKET: 8080,         // Keep as is - working
  
  // Database (External)
  SUPABASE: 443,          // External service
  
  // Development Tools
  DEVTOOLS: 3006,         // For debug/monitoring tools
};

// Environment Variables for Consistency
export const ENV_CONFIG = {
  VITE_PORT: RESEARCHHUB_PORTS.FRONTEND,
  VITE_API_URL: `http://localhost:${RESEARCHHUB_PORTS.API}`,
  VITE_WS_URL: `ws://localhost:${RESEARCHHUB_PORTS.WEBSOCKET}`,
  API_PORT: RESEARCHHUB_PORTS.API,
  WS_PORT: RESEARCHHUB_PORTS.WEBSOCKET,
};

// Port checking utilities
export async function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, (err) => {
      if (err) {
        resolve(false);
      } else {
        server.once('close', () => resolve(true));
        server.close();
      }
    });
    server.on('error', () => resolve(false));
  });
}

export async function findAvailablePort(startPort, range = 10) {
  for (let i = 0; i < range; i++) {
    const port = startPort + i;
    if (await checkPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + range}`);
}

// Startup validation
export async function validatePortConfiguration() {
  const results = {};
  
  for (const [service, port] of Object.entries(RESEARCHHUB_PORTS)) {
    if (service === 'SUPABASE') continue; // Skip external service
    
    const available = await checkPortAvailable(port);
    results[service] = { port, available };
    
    if (!available) {
      console.warn(`⚠️  Port ${port} for ${service} is already in use`);
    } else {
      console.log(`✅ Port ${port} for ${service} is available`);
    }
  }
  
  return results;
}

// Kill processes on our ports (cleanup utility)
export function killProcessesOnPorts() {
  const { exec } = require('child_process');
  const ports = Object.values(RESEARCHHUB_PORTS).filter(port => port !== 443);
  
  ports.forEach(port => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        lines.forEach(line => {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            const pid = match[1];
            exec(`taskkill /F /PID ${pid}`, (err) => {
              if (!err) console.log(`🔄 Killed process ${pid} on port ${port}`);
            });
          }
        });
      }
    });
  });
}

console.log('📍 ResearchHub Port Configuration:');
console.log('  Frontend:  http://localhost:' + RESEARCHHUB_PORTS.FRONTEND);
console.log('  API:       http://localhost:' + RESEARCHHUB_PORTS.API);
console.log('  WebSocket: ws://localhost:' + RESEARCHHUB_PORTS.WEBSOCKET);
console.log('  DevTools:  http://localhost:' + RESEARCHHUB_PORTS.DEVTOOLS);
