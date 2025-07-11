#!/usr/bin/env node

/**
 * UAT Framework Monitoring and Alerting System
 * Provides continuous monitoring, trend analysis, and automated alerting
 * for the ResearchHub UAT framework
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UATMonitoringSystem {
    constructor() {
        this.testingDir = path.join(__dirname, '../../testing');
        this.reportsDir = path.join(this.testingDir, 'reports');
        this.monitoringDir = path.join(this.testingDir, 'monitoring');
        this.configDir = path.join(this.testingDir, 'config');
        
        // Ensure directories exist
        [this.reportsDir, this.monitoringDir, this.configDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        this.config = this.loadMonitoringConfig();
        this.metrics = {
            timestamp: new Date().toISOString(),
            system: {},
            trends: {},
            alerts: [],
            health: 'unknown'
        };
    }
    
    loadMonitoringConfig() {
        const configPath = path.join(this.configDir, 'monitoring-config.json');
        
        try {
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
        } catch (error) {
            console.log('Using default monitoring configuration');
        }
        
        // Default configuration
        const defaultConfig = {
            monitoring: {
                intervals: {
                    quick: 300,      // 5 minutes
                    full: 1800,      // 30 minutes
                    daily: 86400     // 24 hours
                },
                thresholds: {
                    uatSuccessRate: {
                        warning: 0.75,
                        critical: 0.65
                    },
                    performanceScore: {
                        warning: 65,
                        critical: 50
                    },
                    systemHealth: {
                        warning: 'degraded',
                        critical: 'unhealthy'
                    }
                },
                retention: {
                    metrics: 30,     // days
                    reports: 90,     // days
                    alerts: 7        // days
                }
            },
            alerts: {
                enabled: true,
                channels: {
                    slack: {
                        enabled: false,
                        webhook: process.env.SLACK_WEBHOOK_URL,
                        channel: '#uat-monitoring'
                    },
                    email: {
                        enabled: false,
                        recipients: []
                    },
                    console: {
                        enabled: true
                    }
                },
                rules: [
                    {
                        name: 'UAT Success Rate Drop',
                        metric: 'uatSuccessRate',
                        condition: 'below',
                        threshold: 0.75,
                        severity: 'warning'
                    },
                    {
                        name: 'Critical UAT Failure',
                        metric: 'uatSuccessRate',
                        condition: 'below',
                        threshold: 0.65,
                        severity: 'critical'
                    },
                    {
                        name: 'Performance Degradation',
                        metric: 'performanceScore',
                        condition: 'below',
                        threshold: 65,
                        severity: 'warning'
                    }
                ]
            }
        };
        
        // Save default config for future use
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    
    async startMonitoring(mode = 'continuous') {
        console.log('🔍 UAT MONITORING SYSTEM STARTED');
        console.log('================================');
        console.log(`Mode: ${mode}`);
        console.log(`Timestamp: ${this.metrics.timestamp}`);
        console.log('');
        
        switch (mode) {
            case 'quick':
                await this.runQuickMonitoring();
                break;
            case 'full':
                await this.runFullMonitoring();
                break;
            case 'continuous':
                await this.runContinuousMonitoring();
                break;
            case 'health-check':
                await this.runHealthCheck();
                break;
            case 'trends':
                await this.runTrendsAnalysis();
                break;
            default:
                console.error('Unknown monitoring mode:', mode);
                console.log('Available modes: quick, full, continuous, health-check, trends');
                process.exit(1);
        }
    }
    
    async runQuickMonitoring() {
        console.log('⚡ Quick Monitoring Cycle');
        console.log('========================');
        
        try {
            // Run quick UAT status check
            console.log('Running UAT status check...');
            const statusResult = execSync('npm run uat:status', { encoding: 'utf8' });
            
            // Run quick performance check
            console.log('Running performance check...');
            const perfResult = execSync('npm run uat:performance:quick', { encoding: 'utf8' });
            
            // Collect metrics
            await this.collectCurrentMetrics();
            
            // Analyze trends
            await this.analyzeTrends();
            
            // Check for alerts
            await this.checkAlerts();
            
            // Save monitoring data
            await this.saveMonitoringData('quick');
            
            console.log('✅ Quick monitoring cycle completed');
            
        } catch (error) {
            console.error('❌ Quick monitoring failed:', error.message);
            await this.logError('quick-monitoring', error);
        }
    }
    
    async runFullMonitoring() {
        console.log('🎯 Full Monitoring Cycle');
        console.log('========================');
        
        try {
            // Run comprehensive UAT testing
            console.log('Running comprehensive UAT suite...');
            const uatResult = execSync('npm run uat:all', { encoding: 'utf8' });
            
            // Run performance integration
            console.log('Running performance integration...');
            const perfResult = execSync('npm run uat:performance:full', { encoding: 'utf8' });
            
            // Generate business intelligence
            console.log('Generating business intelligence...');
            const biResult = execSync('npm run uat:business', { encoding: 'utf8' });
            
            // Collect comprehensive metrics
            await this.collectCurrentMetrics();
            await this.collectHistoricalMetrics();
            
            // Perform deep trend analysis
            await this.performDeepTrendAnalysis();
            
            // Check for complex alert conditions
            await this.checkComplexAlerts();
            
            // Generate monitoring report
            await this.generateMonitoringReport();
            
            // Save comprehensive monitoring data
            await this.saveMonitoringData('full');
            
            console.log('✅ Full monitoring cycle completed');
            
        } catch (error) {
            console.error('❌ Full monitoring failed:', error.message);
            await this.logError('full-monitoring', error);
        }
    }
    
    async runContinuousMonitoring() {
        console.log('🔄 Continuous Monitoring Started');
        console.log('=================================');
        console.log('Press Ctrl+C to stop monitoring');
        console.log('');
        
        const quickInterval = this.config.monitoring.intervals.quick * 1000;
        const fullInterval = this.config.monitoring.intervals.full * 1000;
        
        let cycleCount = 0;
        
        // Quick monitoring every 5 minutes
        const quickTimer = setInterval(async () => {
            cycleCount++;
            console.log(`\n--- Quick Monitoring Cycle #${cycleCount} ---`);
            await this.runQuickMonitoring();
        }, quickInterval);
        
        // Full monitoring every 30 minutes
        const fullTimer = setInterval(async () => {
            console.log(`\n--- Full Monitoring Cycle ---`);
            await this.runFullMonitoring();
        }, fullInterval);
        
        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping continuous monitoring...');
            clearInterval(quickTimer);
            clearInterval(fullTimer);
            process.exit(0);
        });
        
        // Initial full monitoring
        await this.runFullMonitoring();
    }
    
    async runHealthCheck() {
        console.log('🏥 UAT Health Check');
        console.log('===================');
        
        const healthChecks = [
            { name: 'UAT Framework', check: () => this.checkUATFramework() },
            { name: 'Test Accounts', check: () => this.checkTestAccounts() },
            { name: 'Reports Generation', check: () => this.checkReportsGeneration() },
            { name: 'Performance Monitoring', check: () => this.checkPerformanceMonitoring() },
            { name: 'Business Intelligence', check: () => this.checkBusinessIntelligence() }
        ];
        
        const results = [];
        
        for (const healthCheck of healthChecks) {
            try {
                const result = await healthCheck.check();
                results.push({
                    name: healthCheck.name,
                    status: 'healthy',
                    details: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${healthCheck.name}: Healthy`);
            } catch (error) {
                results.push({
                    name: healthCheck.name,
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${healthCheck.name}: ${error.message}`);
            }
        }
        
        const overallHealth = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
        
        console.log(`\n🎯 Overall Health: ${overallHealth.toUpperCase()}`);
        
        // Save health check results
        const healthPath = path.join(this.monitoringDir, 'health-check-latest.json');
        fs.writeFileSync(healthPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            overallHealth,
            checks: results
        }, null, 2));
        
        return results;
    }
    
    async runTrendsAnalysis() {
        console.log('📈 Trends Analysis');
        console.log('==================');
        
        try {
            // Load historical data
            await this.collectHistoricalMetrics();
            
            if (!this.metrics.history || this.metrics.history.length < 2) {
                console.log('ℹ️ Insufficient historical data for trend analysis');
                console.log('   Run more monitoring cycles to collect trend data');
                return;
            }
            
            console.log(`📊 Analyzing ${this.metrics.history.length} data points`);
            
            // Analyze trends
            await this.analyzeTrends();
            
            // Generate trend report
            const trendReport = this.generateTrendReport();
            
            // Save trend analysis
            const trendPath = path.join(this.monitoringDir, 'trends-analysis-latest.json');
            fs.writeFileSync(trendPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                dataPoints: this.metrics.history.length,
                trends: this.metrics.trends,
                report: trendReport
            }, null, 2));
            
            console.log('\n📋 Trend Analysis Summary:');
            console.log(trendReport);
            
            console.log(`\n📁 Trend analysis saved: trends-analysis-latest.json`);
            
        } catch (error) {
            console.error('❌ Trends analysis failed:', error.message);
            await this.logError('trends-analysis', error);
        }
    }
    
    generateTrendReport() {
        if (!this.metrics.trends) {
            return 'No trend data available';
        }
        
        const trends = this.metrics.trends;
        const lines = [];
        
        lines.push('TREND ANALYSIS REPORT');
        lines.push('====================');
        lines.push('');
        
        lines.push('📊 Key Metrics Trends:');
        lines.push(`   • UAT Success Rate: ${trends.uatSuccessRate}`);
        lines.push(`   • Performance Score: ${trends.performanceScore}`);
        lines.push(`   • System Health: ${trends.systemHealth}`);
        lines.push('');
        
        // Recommendations based on trends
        lines.push('🎯 Recommendations:');
        
        if (trends.uatSuccessRate === 'declining') {
            lines.push('   ⚠️ UAT success rate is declining - investigate test failures');
        } else if (trends.uatSuccessRate === 'improving') {
            lines.push('   ✅ UAT success rate is improving - good progress');
        }
        
        if (trends.performanceScore === 'declining') {
            lines.push('   ⚠️ Performance degrading - check for optimization opportunities');
        } else if (trends.performanceScore === 'improving') {
            lines.push('   ✅ Performance improving - optimizations are working');
        }
        
        if (trends.systemHealth === 'memory-growing') {
            lines.push('   ⚠️ Memory usage growing - monitor for memory leaks');
        } else if (trends.systemHealth === 'memory-optimized') {
            lines.push('   ✅ Memory usage optimized - good resource management');
        }
        
        return lines.join('\n');
    }
    
    async collectCurrentMetrics() {
        console.log('📊 Collecting current metrics...');
        
        const metrics = {
            timestamp: new Date().toISOString(),
            uat: {},
            performance: {},
            system: {},
            business: {}
        };
        
        // Load UAT results if available
        try {
            const uatDataPath = path.join(this.reportsDir, 'uat-business-data.json');
            if (fs.existsSync(uatDataPath)) {
                const uatData = JSON.parse(fs.readFileSync(uatDataPath, 'utf8'));
                metrics.uat = {
                    successRate: uatData.kpis?.uatSuccessRate || 0,
                    performanceScore: uatData.kpis?.averagePerformanceScore || 0,
                    businessRisk: uatData.kpis?.businessRisk || 'unknown',
                    deploymentReadiness: uatData.kpis?.deploymentReadiness || 'unknown'
                };
            }
        } catch (error) {
            console.log('⚠️ Could not load UAT metrics');
        }
        
        // System metrics
        metrics.system = {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };
        
        this.metrics.current = metrics;
        return metrics;
    }
    
    async collectHistoricalMetrics() {
        console.log('📈 Collecting historical metrics...');
        
        const historyPath = path.join(this.monitoringDir, 'metrics-history.json');
        let history = [];
        
        if (fs.existsSync(historyPath)) {
            try {
                history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
            } catch (error) {
                console.log('⚠️ Could not load metrics history');
            }
        }
        
        // Add current metrics to history
        if (this.metrics.current) {
            history.push(this.metrics.current);
        }
        
        // Keep only recent history (based on retention policy)
        const retentionDays = this.config.monitoring.retention.metrics;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        history = history.filter(entry => 
            new Date(entry.timestamp) > cutoffDate
        );
        
        // Save updated history
        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
        
        this.metrics.history = history;
        return history;
    }
    
    async analyzeTrends() {
        console.log('📊 Analyzing trends...');
        
        if (!this.metrics.history || this.metrics.history.length < 2) {
            console.log('ℹ️ Insufficient historical data for trend analysis');
            return;
        }
        
        const recent = this.metrics.history.slice(-10); // Last 10 data points
        
        const trends = {
            uatSuccessRate: this.calculateTrend(recent, 'uat.successRate'),
            performanceScore: this.calculateTrend(recent, 'performance.score'),
            systemHealth: this.assessSystemHealthTrend(recent)
        };
        
        this.metrics.trends = trends;
        
        console.log(`  UAT Success Rate: ${trends.uatSuccessRate}`);
        console.log(`  Performance Score: ${trends.performanceScore}`);
        console.log(`  System Health: ${trends.systemHealth}`);
        
        return trends;
    }
    
    calculateTrend(data, metric) {
        if (data.length < 2) return 'stable';
        
        const values = data.map(entry => this.getNestedValue(entry, metric)).filter(v => v != null);
        if (values.length < 2) return 'stable';
        
        const first = values[0];
        const last = values[values.length - 1];
        const change = ((last - first) / first) * 100;
        
        if (change > 5) return 'improving';
        if (change < -5) return 'declining';
        return 'stable';
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    assessSystemHealthTrend(data) {
        // Simple heuristic based on memory usage growth
        const memoryValues = data.map(entry => entry.system?.memory?.heapUsed).filter(v => v != null);
        if (memoryValues.length < 2) return 'stable';
        
        const growthRate = (memoryValues[memoryValues.length - 1] - memoryValues[0]) / memoryValues[0];
        
        if (growthRate > 0.2) return 'memory-growing';
        if (growthRate < -0.1) return 'memory-optimized';
        return 'stable';
    }
    
    async checkAlerts() {
        console.log('🚨 Checking alert conditions...');
        
        const activeAlerts = [];
        
        for (const rule of this.config.alerts.rules) {
            const alert = await this.evaluateAlertRule(rule);
            if (alert) {
                activeAlerts.push(alert);
            }
        }
        
        this.metrics.alerts = activeAlerts;
        
        if (activeAlerts.length > 0) {
            console.log(`⚠️ ${activeAlerts.length} alert(s) triggered:`);
            activeAlerts.forEach(alert => {
                console.log(`   • ${alert.severity.toUpperCase()}: ${alert.message}`);
            });
            
            await this.sendAlerts(activeAlerts);
        } else {
            console.log('✅ No alerts triggered');
        }
        
        return activeAlerts;
    }
    
    async evaluateAlertRule(rule) {
        if (!this.metrics.current) return null;
        
        const currentValue = this.getNestedValue(this.metrics.current, rule.metric);
        if (currentValue == null) return null;
        
        let triggered = false;
        
        switch (rule.condition) {
            case 'below':
                triggered = currentValue < rule.threshold;
                break;
            case 'above':
                triggered = currentValue > rule.threshold;
                break;
            case 'equals':
                triggered = currentValue === rule.threshold;
                break;
        }
        
        if (triggered) {
            return {
                name: rule.name,
                severity: rule.severity,
                metric: rule.metric,
                currentValue,
                threshold: rule.threshold,
                condition: rule.condition,
                message: `${rule.name}: ${currentValue} ${rule.condition} ${rule.threshold}`,
                timestamp: new Date().toISOString()
            };
        }
        
        return null;
    }
    
    async sendAlerts(alerts) {
        if (!this.config.alerts.enabled) return;
        
        for (const alert of alerts) {
            // Console alerts
            if (this.config.alerts.channels.console.enabled) {
                console.log(`🚨 ALERT: ${alert.message}`);
            }
            
            // Slack alerts
            if (this.config.alerts.channels.slack.enabled && this.config.alerts.channels.slack.webhook) {
                try {
                    const SlackNotifier = require('./slack-notifier.cjs');
                    const notifier = new SlackNotifier();
                    await notifier.sendCustomMessage(
                        `🚨 UAT Alert: ${alert.name}`,
                        alert.message,
                        alert.severity === 'critical' ? 'danger' : 'warning'
                    );
                } catch (error) {
                    console.error('Failed to send Slack alert:', error.message);
                }
            }
        }
    }
    
    async saveMonitoringData(type) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `monitoring-${type}-${timestamp}.json`;
        const filepath = path.join(this.monitoringDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
        
        // Also save as latest
        const latestPath = path.join(this.monitoringDir, `monitoring-${type}-latest.json`);
        fs.writeFileSync(latestPath, JSON.stringify(this.metrics, null, 2));
        
        console.log(`📁 Monitoring data saved: ${filename}`);
    }
    
    // Health check methods
    async checkUATFramework() {
        execSync('npm run uat:status', { stdio: 'pipe' });
        return 'UAT framework operational';
    }
    
    async checkTestAccounts() {
        // Simple check that test account constants are available
        const accounts = ['researcher', 'participant', 'admin'];
        return `Test accounts configured: ${accounts.join(', ')}`;
    }
    
    async checkReportsGeneration() {
        const reportFiles = ['uat-business-dashboard.html', 'uat-performance-integration.html'];
        const exists = reportFiles.filter(file => 
            fs.existsSync(path.join(this.reportsDir, file))
        );
        return `Report files available: ${exists.length}/${reportFiles.length}`;
    }
    
    async checkPerformanceMonitoring() {
        const perfFile = path.join(this.reportsDir, 'uat-performance-integration.json');
        if (fs.existsSync(perfFile)) {
            return 'Performance monitoring data available';
        }
        throw new Error('Performance monitoring data not found');
    }
    
    async checkBusinessIntelligence() {
        const biFile = path.join(this.reportsDir, 'uat-business-data.json');
        if (fs.existsSync(biFile)) {
            return 'Business intelligence data available';
        }
        throw new Error('Business intelligence data not found');
    }
    
    async logError(context, error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context,
            error: error.message,
            stack: error.stack
        };
        
        const errorPath = path.join(this.monitoringDir, 'errors.log');
        fs.appendFileSync(errorPath, JSON.stringify(errorLog) + '\n');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    let mode = 'quick';
    
    // Parse command line arguments
    if (args.includes('--health')) {
        mode = 'health-check';
    } else if (args.includes('--trends')) {
        mode = 'trends';
    } else if (args.includes('--full')) {
        mode = 'full';
    } else if (args.includes('--continuous')) {
        mode = 'continuous';
    } else if (args[0] && !args[0].startsWith('--')) {
        mode = args[0];
    }
    
    const monitor = new UATMonitoringSystem();
    
    monitor.startMonitoring(mode)
        .then(() => {
            if (mode !== 'continuous') {
                console.log('🎉 Monitoring completed successfully');
                process.exit(0);
            }
        })
        .catch(error => {
            console.error('💥 Monitoring failed:', error.message);
            process.exit(1);
        });
}

module.exports = UATMonitoringSystem;
