#!/usr/bin/env node

/**
 * Team Dashboard - Overview of all team improvements and framework status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TeamDashboard {
    constructor() {
        this.trackingFile = path.join(__dirname, '../completion-tracking.json');
    }

    generateDashboard() {
        console.log("🎯 TEAM COMPLETION FRAMEWORK DASHBOARD");
        console.log("================================================\n");
        
        if (!fs.existsSync(this.trackingFile)) {
            console.log("❌ No tracking data found. Initialize framework first.");
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(this.trackingFile, 'utf8'));
        
        this.showOverallStats(data);
        this.showByStatus(data);
        this.showByTeamMember(data);
        this.showRecentActivity(data);
        
        console.log("\n================================================");
        console.log("Use 'npm run start-improvement' to begin new improvements");
    }
    
    showOverallStats(data) {
        const items = Object.values(data.items);
        const total = items.length;
        const completed = items.filter(item => item.status === 'COMPLETED').length;
        const inProgress = items.filter(item => item.status === 'IN_PROGRESS').length;
        const notStarted = items.filter(item => item.status === 'NOT_STARTED').length;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        console.log("📊 OVERALL TEAM PROGRESS");
        console.log(`Total Improvements: ${total}`);
        console.log(`✅ Completed: ${completed}`);
        console.log(`🟡 In Progress: ${inProgress}`);
        console.log(`⚪ Not Started: ${notStarted}`);
        console.log(`📈 Completion Rate: ${completionRate}%\n`);
    }
    
    showByStatus(data) {
        console.log("📋 IMPROVEMENTS BY STATUS");
        
        const byStatus = {};
        Object.entries(data.items).forEach(([id, item]) => {
            if (!byStatus[item.status]) byStatus[item.status] = [];
            byStatus[item.status].push({ id, ...item });
        });
        
        Object.entries(byStatus).forEach(([status, items]) => {
            const icon = status === 'COMPLETED' ? '✅' : 
                       status === 'IN_PROGRESS' ? '🟡' : '⚪';
            console.log(`\n${icon} ${status} (${items.length}):`);
            items.forEach(item => {
                console.log(`  • ${item.name} (${item.progress}%)`);
            });
        });
        
        console.log();
    }
    
    showByTeamMember(data) {
        console.log("👥 IMPROVEMENTS BY TEAM MEMBER");
        
        const byMember = {};
        Object.entries(data.items).forEach(([id, item]) => {
            const member = item.teamMember || 'Unknown';
            if (!byMember[member]) byMember[member] = [];
            byMember[member].push({ id, ...item });
        });
        
        Object.entries(byMember).forEach(([member, items]) => {
            const completed = items.filter(i => i.status === 'COMPLETED').length;
            console.log(`\n👤 ${member} (${completed}/${items.length} completed):`);
            items.forEach(item => {
                const icon = item.status === 'COMPLETED' ? '✅' : 
                           item.status === 'IN_PROGRESS' ? '🟡' : '⚪';
                console.log(`  ${icon} ${item.name} (${item.progress}%)`);
            });
        });
        
        console.log();
    }
    
    showRecentActivity(data) {
        console.log("🕒 RECENT ACTIVITY");
        
        const items = Object.values(data.items)
            .filter(item => item.started || item.lastUpdated)
            .sort((a, b) => {
                const dateA = new Date(a.lastUpdated || a.started);
                const dateB = new Date(b.lastUpdated || b.started);
                return dateB - dateA;
            })
            .slice(0, 5);
            
        items.forEach(item => {
            const date = new Date(item.lastUpdated || item.started).toLocaleDateString();
            const icon = item.status === 'COMPLETED' ? '✅' : 
                       item.status === 'IN_PROGRESS' ? '🟡' : '⚪';
            console.log(`${icon} ${item.name} - ${date}`);
        });
    }
}

// CLI usage
const dashboard = new TeamDashboard();
dashboard.generateDashboard();
