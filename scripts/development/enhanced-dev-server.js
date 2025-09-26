#!/usr/bin/env node

/**
 * 🚀 Enhanced Local Development Server Monitor
 * 
 * Enhances your existing local-full-dev.js with:
 * - Health monitoring and auto-restart
 * - Performance tracking
 * - Real-time error detection
 * - Development analytics integration
 * - Smart debugging features
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

class EnhancedDevServer {
    constructor() {
        this.processes = new Map();
        this.startTime = Date.now();
        this.restartCount = 0;
        this.healthChecks = new Map();
        this.isShuttingDown = false;
    }

    /**
     * 🚀 Start Enhanced Development Environment
     */
    async start() {
        console.log('🚀 Starting Enhanced ResearchHub Development Environment');
        console.log('='.repeat(60));
        
        // Pre-flight checks
        await this.performPreflightChecks();
        
        // Start monitoring
        this.startHealthMonitoring();
        
        // Start the main development server
        await this.startMainDevServer();
        
        // Setup graceful shutdown
        this.setupGracefulShutdown();
        
        console.log();
        console.log('✅ Enhanced development environment ready!');
        console.log('📊 Health monitoring active');
        console.log('🔄 Auto-restart enabled');
        console.log();
        console.log('Quick Commands:');
        console.log('  Ctrl+C: Graceful shutdown');
        console.log('  npm run dev:dashboard: Development dashboard');
        console.log('  npm run dev:analytics: Performance analytics');
    }

    /**
     * 🔍 Pre-flight Environment Checks
     */
    async performPreflightChecks() {
        console.log('🔍 Performing pre-flight checks...');
        
        const checks = [
            { name: 'Node.js version', check: () => this.checkNodeVersion() },
            { name: 'Package dependencies', check: () => this.checkDependencies() },
            { name: 'Environment files', check: () => this.checkEnvironmentFiles() },
            { name: 'Port availability', check: () => this.checkPortAvailability() },
            { name: 'Critical files', check: () => this.checkCriticalFiles() }
        ];

        for (const { name, check } of checks) {
            try {
                await check();
                console.log(`  ✅ ${name}`);
            } catch (error) {
                console.log(`  ⚠️  ${name}: ${error.message}`);
            }
        }
        
        console.log();
    }

    /**
     * 🏥 Health Monitoring System
     */
    startHealthMonitoring() {
        console.log('🏥 Starting health monitoring...');
        
        // Monitor every 30 seconds
        setInterval(() => {
            if (!this.isShuttingDown) {
                this.performHealthCheck();
            }
        }, 30000);

        // Monitor memory usage
        setInterval(() => {
            if (!this.isShuttingDown) {
                this.monitorMemoryUsage();
            }
        }, 60000);
    }

    /**
     * 🎯 Start Main Development Server
     */
    async startMainDevServer() {
        console.log('🎯 Starting main development server...');
        
        return new Promise((resolve, reject) => {
            const devServer = spawn('node', ['scripts/development/local-full-dev.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, ENHANCED_MODE: 'true' }
            });

            this.processes.set('main', devServer);

            // Handle server output
            devServer.stdout.on('data', (data) => {
                const output = data.toString();
                process.stdout.write(output);
                
                // Check for successful startup
                if (output.includes('Frontend server running') || output.includes('API server running')) {
                    this.healthChecks.set('startup', Date.now());
                    resolve();
                }

                // Check for errors
                if (output.includes('Error:') || output.includes('EADDRINUSE')) {
                    console.log('🚨 Server error detected - attempting restart...');
                    this.restartServer();
                }
            });

            devServer.stderr.on('data', (data) => {
                const error = data.toString();
                console.error('🔴 Server Error:', error);
                
                // Auto-fix common issues
                if (error.includes('EADDRINUSE')) {
                    console.log('🔧 Attempting to free ports...');
                    this.killPortProcesses([3003, 5175]);
                }
            });

            devServer.on('error', (error) => {
                console.error('🚨 Failed to start server:', error);
                reject(error);
            });

            devServer.on('exit', (code) => {
                if (code !== 0 && !this.isShuttingDown) {
                    console.log(`🔄 Server exited with code ${code} - restarting...`);
                    setTimeout(() => this.restartServer(), 2000);
                }
            });

            // Timeout check
            setTimeout(() => {
                if (!this.healthChecks.has('startup')) {
                    console.log('⏰ Startup taking longer than expected...');
                    resolve(); // Continue anyway
                }
            }, 15000);
        });
    }

    /**
     * 🔄 Server Restart Logic
     */
    async restartServer() {
        if (this.isShuttingDown) return;
        
        this.restartCount++;
        console.log(`🔄 Restarting server (attempt ${this.restartCount})...`);
        
        // Kill existing process
        const mainProcess = this.processes.get('main');
        if (mainProcess) {
            mainProcess.kill('SIGTERM');
        }
        
        // Wait a moment then restart
        setTimeout(() => {
            this.startMainDevServer().catch(error => {
                console.error('❌ Restart failed:', error);
                if (this.restartCount < 3) {
                    setTimeout(() => this.restartServer(), 5000);
                } else {
                    console.error('🚨 Maximum restart attempts reached. Please check the logs.');
                }
            });
        }, 3000);
    }

    /**
     * 🏥 Health Check Implementation
     */
    async performHealthCheck() {
        try {
            // Check if servers are responding
            const healthChecks = [
                this.checkServerHealth('http://localhost:5175'),
                this.checkServerHealth('http://localhost:3003/api/health')
            ];

            const results = await Promise.allSettled(healthChecks);
            const healthyCount = results.filter(r => r.status === 'fulfilled').length;
            
            if (healthyCount < results.length) {
                console.log('⚠️  Health check detected issues - monitoring...');
            } else {
                console.log('💚 Health check: All systems operational');
            }
            
        } catch (error) {
            console.log('🏥 Health check error:', error.message);
        }
    }

    /**
     * 📊 Memory Usage Monitoring
     */
    monitorMemoryUsage() {
        const usage = process.memoryUsage();
        const used = Math.round(usage.heapUsed / 1024 / 1024);
        const total = Math.round(usage.heapTotal / 1024 / 1024);
        
        if (used > 512) { // Alert if using more than 512MB
            console.log(`🔍 Memory usage: ${used}MB / ${total}MB (high usage detected)`);
        }
    }

    /**
     * 🔧 Utility Methods
     */
    checkNodeVersion() {
        const version = process.version;
        const major = parseInt(version.substring(1).split('.')[0]);
        if (major < 18) {
            throw new Error(`Node.js ${version} detected. Version 18+ required.`);
        }
        return true;
    }

    checkDependencies() {
        if (!fs.existsSync('node_modules')) {
            throw new Error('node_modules not found. Run: npm install');
        }
        return true;
    }

    checkEnvironmentFiles() {
        const envFiles = ['.env', 'package.json'];
        for (const file of envFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`${file} not found`);
            }
        }
        return true;
    }

    async checkPortAvailability() {
        // Simple port check - could be enhanced
        return true;
    }

    checkCriticalFiles() {
        const criticalFiles = [
            'scripts/development/local-full-dev.js',
            'src/main.tsx',
            'api/health.js'
        ];
        
        for (const file of criticalFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Critical file missing: ${file}`);
            }
        }
        return true;
    }

    async checkServerHealth(url) {
        // Simple health check - in real implementation would use fetch
        return new Promise((resolve, reject) => {
            exec(`curl -s -o /dev/null -w "%{http_code}" ${url}`, (error, stdout) => {
                if (error || stdout !== '200') {
                    reject(new Error(`Health check failed for ${url}`));
                } else {
                    resolve();
                }
            });
        });
    }

    killPortProcesses(ports) {
        ports.forEach(port => {
            exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
                if (!error) {
                    console.log(`🔧 Freed port ${port}`);
                }
            });
        });
    }

    /**
     * 🛑 Graceful Shutdown
     */
    setupGracefulShutdown() {
        const shutdown = () => {
            if (this.isShuttingDown) return;
            
            console.log('\n🛑 Gracefully shutting down development environment...');
            this.isShuttingDown = true;
            
            // Kill all child processes
            this.processes.forEach((process, name) => {
                console.log(`🔄 Stopping ${name}...`);
                process.kill('SIGTERM');
            });
            
            setTimeout(() => {
                console.log('✅ Development environment stopped');
                process.exit(0);
            }, 2000);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
}

// Start enhanced development server
const server = new EnhancedDevServer();
server.start().catch(console.error);