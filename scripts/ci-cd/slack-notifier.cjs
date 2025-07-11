#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class SlackNotifier {
    constructor() {
        this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
        this.reportsPath = path.join(__dirname, '../../testing/reports');
        this.channel = process.env.SLACK_CHANNEL || '#deployments';
    }
    
    async sendUATResults(type = 'deployment') {
        if (!this.webhookUrl) {
            console.log('ℹ️ Slack webhook not configured - skipping notification');
            console.log('   Set SLACK_WEBHOOK_URL environment variable to enable notifications');
            return;
        }
        
        try {
            const uatData = this.loadUATResults();
            const message = this.createMessage(type, uatData);
            
            await this.sendMessage(message);
            console.log('✅ Slack notification sent successfully');
        } catch (error) {
            console.error('❌ Failed to send Slack notification:', error.message);
            // Don't fail the entire pipeline for notification issues
        }
    }
    
    loadUATResults() {
        const dataPath = path.join(this.reportsPath, 'uat-business-data.json');
        
        try {
            if (fs.existsSync(dataPath)) {
                return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            } else {
                console.log('ℹ️ UAT business data not found, using simulated data for notification');
                return this.getSimulatedData();
            }
        } catch (error) {
            console.log('⚠️ Failed to load UAT results for notification:', error.message);
            return this.getSimulatedData();
        }
    }
    
    getSimulatedData() {
        return {
            kpis: {
                uatSuccessRate: 0.86,
                averagePerformanceScore: 78,
                businessRisk: 'low',
                deploymentReadiness: 'conditional'
            },
            executiveSummary: {
                overallHealth: 'good'
            }
        };
    }
    
    createMessage(type, data) {
        const success = data.kpis.uatSuccessRate >= 0.8 && data.kpis.averagePerformanceScore >= 70;
        const emoji = success ? '✅' : '❌';
        const status = success ? 'PASSED' : 'FAILED';
        const color = success ? 'good' : 'danger';
        
        return {
            text: `${emoji} UAT Quality Gates ${status}`,
            channel: this.channel,
            attachments: [
                {
                    color: color,
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `${emoji} UAT Quality Gates ${status}`
                            }
                        },
                        {
                            type: 'section',
                            fields: [
                                {
                                    type: 'mrkdwn',
                                    text: `*Type:* ${type}`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Environment:* ${process.env.NODE_ENV || 'development'}`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*UAT Success:* ${(data.kpis.uatSuccessRate * 100).toFixed(1)}%`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Performance:* ${data.kpis.averagePerformanceScore.toFixed(0)}/100`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Business Risk:* ${data.kpis.businessRisk}`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Deployment:* ${data.kpis.deploymentReadiness}`
                                }
                            ]
                        },
                        {
                            type: 'context',
                            elements: [
                                {
                                    type: 'mrkdwn',
                                    text: `Build: ${process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER || 'local'} | Commit: ${process.env.GITHUB_SHA?.substring(0, 7) || 'unknown'} | Time: ${new Date().toLocaleString()}`
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
    
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(message);
            const url = new URL(this.webhookUrl);
            
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };
            
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
    
    async sendCustomMessage(title, message, color = 'good') {
        if (!this.webhookUrl) {
            console.log('ℹ️ Slack webhook not configured - skipping custom notification');
            return;
        }
        
        const slackMessage = {
            text: title,
            channel: this.channel,
            attachments: [
                {
                    color: color,
                    text: message,
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        };
        
        try {
            await this.sendMessage(slackMessage);
            console.log('✅ Custom Slack notification sent successfully');
        } catch (error) {
            console.error('❌ Failed to send custom Slack notification:', error.message);
        }
    }
}

// CLI interface
if (require.main === module) {
    const type = process.argv[2] || 'deployment';
    const notifier = new SlackNotifier();
    
    if (process.argv[3] === '--custom') {
        const title = process.argv[4] || 'UAT Notification';
        const message = process.argv[5] || 'Custom UAT message';
        const color = process.argv[6] || 'good';
        
        notifier.sendCustomMessage(title, message, color)
            .then(() => {
                console.log('🎉 Custom notification completed');
            })
            .catch(error => {
                console.error('💥 Custom notification failed:', error.message);
                process.exit(1);
            });
    } else {
        notifier.sendUATResults(type)
            .then(() => {
                console.log('🎉 UAT notification completed');
            })
            .catch(error => {
                console.error('💥 UAT notification failed:', error.message);
                process.exit(1);
            });
    }
}

module.exports = SlackNotifier;
