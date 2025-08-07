#!/usr/bin/env node
/**
 * RESEARCHHUB DEVELOPMENT STARTUP SCRIPT
 * Ensures clean port configuration and starts all services correctly
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Port Configuration (FIXED TO MATCH YOUR PREFERENCE)
const PORTS = {
  FRONTEND: 5175,  // YOUR PREFERRED PORT!
  API: 3003,       // MATCHING local-full-dev.js
  WEBSOCKET: 8080,
  DEVTOOLS: 3006
};

class ResearchHubDevServer {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
  }

  async checkPort(port) {
    try {
      await execAsync(`netstat -an | findstr :${port}`);
      return false; // Port is in use
    } catch (error) {
      return true; // Port is available
    }
  }

  async killPortProcesses(port) {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      if (stdout) {
        const lines = stdout.split('\n');
        for (const line of lines) {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            const pid = match[1];
            try {
              await execAsync(`taskkill /F /PID ${pid}`);
              console.log(`🔄 Killed process ${pid} on port ${port}`);
            } catch (e) {
              // Process might already be dead
            }
          }
        }
      }
    } catch (error) {
      // No processes found on port
    }
  }

  async cleanupPorts() {
    console.log('🧹 Cleaning up ports...');
    
    for (const [service, port] of Object.entries(PORTS)) {
      const available = await this.checkPort(port);
      if (!available) {
        console.log(`🔄 Port ${port} (${service}) is in use, cleaning up...`);
        await this.killPortProcesses(port);
        
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async validatePorts() {
    console.log('🔍 Validating port availability...');
    
    for (const [service, port] of Object.entries(PORTS)) {
      const available = await this.checkPort(port);
      if (available) {
        console.log(`✅ Port ${port} (${service}) is available`);
      } else {
        console.log(`❌ Port ${port} (${service}) is still in use`);
        return false;
      }
    }
    return true;
  }

  spawnProcess(name, command, args, options = {}) {
    console.log(`🚀 Starting ${name}...`);
    
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${name}] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      console.log(`[${name}] Process exited with code ${code}`);
      this.processes.delete(name);
    });

    this.processes.set(name, process);
    return process;
  }

  async startWebSocketServer() {
    this.spawnProcess('WebSocket', 'node', ['websocket-server.js']);
    
    // Wait for WebSocket server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async startAPIServer() {
    this.spawnProcess('API', 'node', ['test-auth-server.js']);
    
    // Wait for API server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async startFrontend() {
    this.spawnProcess('Frontend', 'npm', ['run', 'dev:client']);
    
    // Wait for frontend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  async start() {
    console.log('🎯 Starting ResearchHub Development Environment...');
    console.log('📍 Port Configuration:');
    console.log(`   Frontend:  http://localhost:${PORTS.FRONTEND}`);
    console.log(`   API:       http://localhost:${PORTS.API}`);
    console.log(`   WebSocket: ws://localhost:${PORTS.WEBSOCKET}`);
    console.log('');

    try {
      // Step 1: Cleanup existing processes
      await this.cleanupPorts();
      
      // Step 2: Validate ports are available
      const portsReady = await this.validatePorts();
      if (!portsReady) {
        console.error('❌ Some ports are still in use. Please check manually.');
        process.exit(1);
      }

      // Step 3: Start services in order
      await this.startWebSocketServer();
      await this.startAPIServer();
      await this.startFrontend();

      console.log('');
      console.log('✅ All services started successfully!');
      console.log('🌐 Open your browser to: http://localhost:' + PORTS.FRONTEND);
      console.log('🔑 Login with: abwanwr77+Researcher@gmail.com / Testtest123');
      console.log('');
      console.log('Press Ctrl+C to stop all services...');

    } catch (error) {
      console.error('❌ Failed to start development environment:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('🛑 Shutting down development environment...');
    
    for (const [name, process] of this.processes) {
      console.log(`🔄 Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);
    }

    console.log('✅ All services stopped');
    process.exit(0);
  }
}

// Handle graceful shutdown
const devServer = new ResearchHubDevServer();

process.on('SIGINT', () => devServer.shutdown());
process.on('SIGTERM', () => devServer.shutdown());
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  devServer.shutdown();
});

// Start the development environment
devServer.start().catch(console.error);
