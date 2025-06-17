#!/usr/bin/env node

// ResearchHub Cleanup Script
const fs = require('fs');

const filesToRemove = [
  "docker-compose.yml",
  "Dockerfile",
  "Dockerfile.frontend",
  "nginx.conf",
  "railway-test.toml",
  "railway-main.toml",
  "railway-test-server.js",
  "ADMIN_API_TEST.html",
  "ADMIN_DASHBOARD_TEST.html",
  "ADMIN_LOGIN_TEST.html",
  "admin-login-debug.html",
  "admin-user-management-test.html",
  "auth-debug-test.html",
  "auth-refresh-test.html",
  "AUTOMATED_AUTH_TEST.html",
  "complete-admin-flow-test.html",
  "complete-auth-test.html",
  "comprehensive-feature-test.html",
  "comprehensive-study-workflow-test.html",
  "debug-admin-login.html",
  "debug-server-load.cjs",
  "login-fix-test.html",
  "MANUAL_AUTH_TEST.html",
  "manual-payment-system-test.html",
  "phase3-4-workflow-test.html",
  "quick-admin-test.html",
  "deploy-to-railway.ps1",
  "deployment-check.ps1",
  "find-railway-url.ps1",
  "monitor-deployment-progress.js",
  "monitor-json-fix-deployment.ps1",
  "monitor-railway-deployment.ps1",
  "phase3-test.ps1",
  "phase4-final-verification.ps1",
  "quick-railway-check.cjs",
  "quick-railway-test.cjs",
  "quick-railway-test.js",
  "quick-railway-test.ps1",
  "simple-railway-fix.ps1",
  "verify-railway-deployment.ps1",
  "railway-precheck-fixed.ps1",
  "railway-mongodb-fix.ps1",
  "railway-mongodb-troubleshooting.cjs",
  "railway-mongodb-fix-verification.cjs",
  "railway-mongodb-fix-complete.js",
  "railway-mongodb-fix-complete.cjs",
  "railway-redeploy.cjs",
  "railway-quick-test.cjs",
  "railway-monitor.ps1",
  "railway-monitor.js",
  "railway-health-check.mjs",
  "atlas-quick-setup.cjs",
  "check-atlas-cluster.cjs",
  "check-atlas-cluster.js",
  "check-railway-database.cjs",
  "check-railway-database.js",
  "check-railway-db.ps1",
  "mongodb-atlas-test.cjs",
  "quick-mongodb-setup.cjs",
  "mock-server.cjs",
  "mock-server.js",
  "integration-test-server.js",
  "test-railway-db-connection.js",
  "test-railway-db-connection.cjs",
  "test-railway-deployment.bat",
  "production-deployment-check.cjs",
  "production-deployment-check.js",
  "healthcheck.js",
  "generate-server-package.cjs",
  "generate-server-package.js",
  ".env.development",
  ".env.production.frontend",
  "analyze-railway-services.cjs",
  "deploy-atlas-to-railway.cjs",
  "deploy-atlas-to-railway.js",
  "deploy-atlas-to-railway.ps1",
  "manual-atlas-deployment.md"
];

console.log('🧹 Starting ResearchHub cleanup...');

let removed = 0;
let errors = 0;

filesToRemove.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`✅ Removed: ${file}`);
            removed++;
        }
    } catch (error) {
        console.error(`❌ Error removing ${file}:, error.message`);
        errors++;
    }
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`- Files removed: ${removed}`);
console.log(`- Errors: ${errors}`);
console.log(`\n🚀 Your project is now clean and ready for production!`);
