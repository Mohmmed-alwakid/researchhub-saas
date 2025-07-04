#!/usr/bin/env node

/**
 * Team Improvement Starter - Initialize new improvements with framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImprovementStarter {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async startNewImprovement() {
        console.log("🎯 Starting New Improvement with Systematic Framework\n");
        
        const name = await this.ask("Improvement name (e.g., 'Error Handling Enhancement'): ");
        const id = name.toLowerCase().replace(/\s+/g, '-');
        
        const criteria = [];
        console.log("\nEnter completion criteria (press Enter twice when done):");
        
        let criterion;
        while (true) {
            criterion = await this.ask("Criterion: ");
            if (!criterion.trim()) break;
            criteria.push(criterion);
        }
        
        const category = await this.ask("Category (ui-ux/backend/feature/infrastructure): ");
        
        const improvement = {
            id,
            name,
            category,
            status: "IN_PROGRESS",
            progress: 0,
            completionCriteria: criteria,
            started: new Date().toISOString(),
            teamMember: process.env.USER || 'Unknown'
        };
        
        await this.addToTracker(improvement);
        await this.createImprovementDirectory(improvement);
        
        console.log(`\n✅ Improvement '${name}' initialized successfully!`);
        console.log(`📁 Working directory: improvements/${id}/`);
        console.log(`🎯 Track progress with: npm run track-progress`);
        
        this.rl.close();
    }
    
    async addToTracker(improvement) {
        const trackerPath = path.join(__dirname, '../../completion-tracking.json');
        const data = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
        
        data.items[improvement.id] = improvement;
        data.lastUpdated = new Date().toISOString();
        
        fs.writeFileSync(trackerPath, JSON.stringify(data, null, 2));
    }
    
    async createImprovementDirectory(improvement) {
        const improvementDir = path.join(__dirname, `../../improvements/${improvement.id}`);
        
        if (!fs.existsSync(improvementDir)) {
            fs.mkdirSync(improvementDir, { recursive: true });
        }
        
        // Create improvement README
        const readme = `# ${improvement.name}

## 🎯 Completion Criteria

${improvement.completionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 📊 Progress Tracking

Use the framework tools to track progress:

\`\`\`bash
# Update progress
npm run update-progress ${improvement.id} <percentage>

# Run validation
npm run validate-improvement ${improvement.id}

# Generate report
npm run improvement-report ${improvement.id}
\`\`\`

## 📁 Implementation Files

- Implementation code goes here
- Tests and validation
- Documentation updates

## ✅ Quality Gates

- [ ] All completion criteria met
- [ ] Automated validation passing
- [ ] Code review completed
- [ ] Documentation updated
`;

        fs.writeFileSync(path.join(improvementDir, 'README.md'), readme);
    }
    
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// CLI usage
const starter = new ImprovementStarter();
starter.startNewImprovement().catch(console.error);
