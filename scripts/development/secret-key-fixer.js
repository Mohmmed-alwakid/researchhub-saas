#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecretKeyFixer {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../..');
        this.supabaseKeyPatterns = [
            /eyJ[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*/g, // JWT-like pattern
            /sb-[a-z0-9-]+-[a-z0-9]{40}/g, // Supabase URL pattern
            /supabase_key_[a-zA-Z0-9]{64}/g, // Generic Supabase key pattern
        ];
        this.foundSecrets = [];
        this.fixedFiles = [];
    }

    async scanAndFix() {
        console.log('🔒 Supabase Secret Key Scanner & Fixer');
        console.log('=====================================\n');

        await this.scanForSecrets();
        await this.createEnvTemplate();
        await this.fixExposedSecrets();
        await this.createGitignoreEntries();
        
        this.generateSecurityReport();
    }

    async scanForSecrets() {
        console.log('🔍 Scanning for exposed Supabase keys...');
        
        const directories = [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'scripts'),
            path.join(this.projectRoot, 'database'),
            path.join(this.projectRoot, 'docs'),
            path.join(this.projectRoot, 'api'),
        ];

        for (const dir of directories) {
            if (fs.existsSync(dir)) {
                await this.scanDirectory(dir);
            }
        }

        console.log(`   🚨 Found ${this.foundSecrets.length} potential secrets`);
    }

    async scanDirectory(dir) {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    if (!this.shouldSkipDirectory(item.name)) {
                        await this.scanDirectory(fullPath);
                    }
                } else if (item.isFile() && this.shouldScanFile(item.name)) {
                    await this.scanFile(fullPath);
                }
            }
        } catch (error) {
            // Skip directories we can't access
        }
    }

    async scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            for (const pattern of this.supabaseKeyPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        this.foundSecrets.push({
                            file: relativePath,
                            secret: match.substring(0, 20) + '...', // Truncated for security
                            fullSecret: match,
                            line: this.findLineNumber(content, match)
                        });
                    }
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    findLineNumber(content, secret) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(secret)) {
                return i + 1;
            }
        }
        return 0;
    }

    async createEnvTemplate() {
        console.log('📝 Creating .env template...');
        
        const envTemplate = `# Supabase Configuration
# Copy this file to .env and fill in your actual values
# NEVER commit .env file to git!

# Supabase URL (public)
SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public)
SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (PRIVATE - never expose!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Custom environment variables
NODE_ENV=development
VITE_SUPABASE_URL=\${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
`;

        const envTemplatePath = path.join(this.projectRoot, '.env.template');
        fs.writeFileSync(envTemplatePath, envTemplate);
        console.log('   ✅ Created .env.template');
    }

    async fixExposedSecrets() {
        console.log('🔧 Fixing exposed secrets in files...');
        
        for (const secret of this.foundSecrets) {
            await this.fixSecretInFile(secret);
        }
        
        console.log(`   ✅ Fixed ${this.fixedFiles.length} files`);
    }

    async fixSecretInFile(secretInfo) {
        const filePath = path.join(this.projectRoot, secretInfo.file);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Replace the exposed secret with environment variable usage
            const envVarName = this.determineEnvVarName(secretInfo.fullSecret);
            
            // Different replacement patterns based on context
            if (secretInfo.file.includes('BaseService') || secretInfo.file.includes('api')) {
                content = content.replace(
                    new RegExp(secretInfo.fullSecret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    `process.env.${envVarName} || 'your_${envVarName.toLowerCase()}_here'`
                );
            } else {
                content = content.replace(
                    new RegExp(secretInfo.fullSecret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    `'PLACEHOLDER_${envVarName}'`
                );
            }
            
            if (content !== originalContent) {
                // Create backup
                const backupPath = filePath + `.backup-secrets-${Date.now()}`;
                fs.writeFileSync(backupPath, originalContent);
                
                // Write fixed content
                fs.writeFileSync(filePath, content);
                
                this.fixedFiles.push({
                    file: secretInfo.file,
                    backup: path.relative(this.projectRoot, backupPath),
                    envVar: envVarName
                });
            }
        } catch (error) {
            console.log(`   ⚠️ Could not fix ${secretInfo.file}: ${error.message}`);
        }
    }

    determineEnvVarName(secret) {
        // Determine appropriate environment variable name based on secret pattern
        if (secret.includes('eyJ') && secret.includes('.')) {
            return 'SUPABASE_SERVICE_ROLE_KEY';
        } else if (secret.startsWith('sb-')) {
            return 'SUPABASE_URL';
        } else {
            return 'SUPABASE_ANON_KEY';
        }
    }

    async createGitignoreEntries() {
        console.log('📋 Updating .gitignore...');
        
        const gitignorePath = path.join(this.projectRoot, '.gitignore');
        let gitignoreContent = '';
        
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        
        const securityEntries = `
# Security - Never commit these files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.backup-secrets-*
secrets/
*.key
*.pem
`;
        
        if (!gitignoreContent.includes('.env')) {
            fs.writeFileSync(gitignorePath, gitignoreContent + securityEntries);
            console.log('   ✅ Updated .gitignore with security entries');
        } else {
            console.log('   ℹ️ .gitignore already has security entries');
        }
    }

    shouldScanFile(filename) {
        const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt'];
        return extensions.some(ext => filename.endsWith(ext)) && 
               !filename.includes('.backup-');
    }

    shouldSkipDirectory(dirname) {
        const skipDirs = ['node_modules', '.git', 'dist', 'build', '.vercel', 'test-results'];
        return skipDirs.includes(dirname);
    }

    generateSecurityReport() {
        console.log('\n🔒 SECURITY FIX REPORT');
        console.log('======================');
        
        console.log(`\n🚨 SECRETS FOUND: ${this.foundSecrets.length}`);
        if (this.foundSecrets.length > 0) {
            console.log('\n📁 FILES WITH EXPOSED SECRETS:');
            const fileGroups = {};
            
            this.foundSecrets.forEach(secret => {
                if (!fileGroups[secret.file]) {
                    fileGroups[secret.file] = [];
                }
                fileGroups[secret.file].push(secret);
            });
            
            Object.entries(fileGroups).forEach(([file, secrets]) => {
                console.log(`   📄 ${file} - ${secrets.length} secret(s) found`);
                secrets.forEach(secret => {
                    console.log(`      🔑 Line ${secret.line}: ${secret.secret}`);
                });
            });
        }
        
        console.log(`\n🔧 FILES FIXED: ${this.fixedFiles.length}`);
        if (this.fixedFiles.length > 0) {
            this.fixedFiles.forEach(fix => {
                console.log(`   ✅ ${fix.file} - Replaced with ${fix.envVar}`);
                console.log(`      📦 Backup: ${fix.backup}`);
            });
        }
        
        console.log('\n⚠️ CRITICAL NEXT STEPS:');
        console.log('1. 📝 Create .env file from .env.template');
        console.log('2. 🔑 Add your actual Supabase keys to .env (not committed)');
        console.log('3. 🔄 Regenerate exposed Supabase service keys in dashboard');
        console.log('4. 🧪 Test application with environment variables');
        console.log('5. 🚀 Commit the fixed files (secrets now use env vars)');
        
        console.log('\n🔐 SUPABASE DASHBOARD ACTIONS REQUIRED:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Settings > API');
        console.log('4. Generate new service role key');
        console.log('5. Update your .env file with new keys');
        
        console.log('\n✨ Security scan and fix complete!');
        console.log('🚨 Remember: NEVER commit .env files to git!');
    }
}

// Run the scanner and fixer
const fixer = new SecretKeyFixer();
fixer.scanAndFix().catch(console.error);