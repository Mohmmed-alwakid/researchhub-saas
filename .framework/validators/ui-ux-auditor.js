#!/usr/bin/env node

/**
 * UI/UX Error Detection Tool
 * Systematically scans codebase for UI/UX issues and inconsistencies
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class UIUXAuditor {
  constructor() {
    this.issues = {
      designSystemInconsistencies: [],
      accessibilityViolations: [],
      mobileResponsiveIssues: [],
      performanceIssues: [],
      usabilityProblems: []
    };
  }

  // Scan for design system inconsistencies
  scanDesignSystemUsage() {
    console.log('🔍 Scanning for design system inconsistencies...');
    
    const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for manual button styling instead of design system
      if (content.includes('className=') && content.includes('bg-blue-') && 
          !content.includes('import { Button }')) {
        this.issues.designSystemInconsistencies.push({
          file,
          type: 'manual-button-styling',
          message: 'Manual button styling found - should use Button component',
          severity: 'medium'
        });
      }
      
      // Check for manual input styling
      if (content.includes('border-gray-300') && content.includes('focus:ring-') &&
          !content.includes('import { Input }')) {
        this.issues.designSystemInconsistencies.push({
          file,
          type: 'manual-input-styling', 
          message: 'Manual input styling found - should use Input component',
          severity: 'medium'
        });
      }
      
      // Check for hardcoded colors instead of design tokens
      const hardcodedColors = content.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g);
      if (hardcodedColors) {
        this.issues.designSystemInconsistencies.push({
          file,
          type: 'hardcoded-colors',
          message: `Hardcoded colors found: ${hardcodedColors.join(', ')}`,
          severity: 'low'
        });
      }
    });
  }

  // Scan for accessibility violations
  scanAccessibility() {
    console.log('♿ Scanning for accessibility violations...');
    
    const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for buttons without accessible names
      if (content.includes('<button') && !content.includes('aria-label') && 
          !content.includes('aria-labelledby')) {
        const buttonMatches = content.match(/<button[^>]*>/g);
        if (buttonMatches) {
          buttonMatches.forEach(match => {
            if (!match.includes('aria-label') && !match.includes('aria-labelledby')) {
              this.issues.accessibilityViolations.push({
                file,
                type: 'button-missing-accessible-name',
                message: 'Button missing accessible name (aria-label or aria-labelledby)',
                severity: 'high'
              });
            }
          });
        }
      }
      
      // Check for images without alt text
      if (content.includes('<img') && !content.includes('alt=')) {
        this.issues.accessibilityViolations.push({
          file,
          type: 'image-missing-alt',
          message: 'Image missing alt attribute',
          severity: 'high'
        });
      }
      
      // Check for clickable elements without keyboard support
      if (content.includes('onClick') && !content.includes('onKeyDown') && 
          !content.includes('<button') && !content.includes('<a')) {
        this.issues.accessibilityViolations.push({
          file,
          type: 'clickable-without-keyboard',
          message: 'Clickable element without keyboard support',
          severity: 'high'
        });
      }
      
      // Check for form inputs without labels
      if (content.includes('<input') && !content.includes('aria-label') && 
          !content.includes('aria-labelledby') && !content.includes('<label')) {
        this.issues.accessibilityViolations.push({
          file,
          type: 'input-missing-label',
          message: 'Input missing label or accessible name',
          severity: 'high'
        });
      }
    });
  }

  // Scan for mobile responsiveness issues
  scanMobileResponsiveness() {
    console.log('📱 Scanning for mobile responsiveness issues...');
    
    const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for fixed pixel widths/heights
      const fixedSizes = content.match(/w-\[\d+px\]|h-\[\d+px\]|text-\[\d+px\]/g);
      if (fixedSizes) {
        this.issues.mobileResponsiveIssues.push({
          file,
          type: 'fixed-pixel-sizes',
          message: `Fixed pixel sizes found: ${fixedSizes.join(', ')} - should use responsive units`,
          severity: 'medium'
        });
      }
      
      // Check for small touch targets
      const smallButtons = content.match(/className="[^"]*\bp-1\b[^"]*"/g);
      if (smallButtons) {
        this.issues.mobileResponsiveIssues.push({
          file,
          type: 'small-touch-targets',
          message: 'Small touch targets found - buttons should be at least 44px',
          severity: 'medium'
        });
      }
      
      // Check for missing responsive breakpoints on grid/flex layouts
      if ((content.includes('grid-cols-') || content.includes('flex-row')) && 
          !content.includes('sm:') && !content.includes('md:') && !content.includes('lg:')) {
        this.issues.mobileResponsiveIssues.push({
          file,
          type: 'missing-responsive-breakpoints',
          message: 'Layout without responsive breakpoints',
          severity: 'low'
        });
      }
    });
  }

  // Scan for performance issues
  scanPerformance() {
    console.log('⚡ Scanning for performance issues...');
    
    const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for inline styles (performance impact)
      if (content.includes('style={{')) {
        this.issues.performanceIssues.push({
          file,
          type: 'inline-styles',
          message: 'Inline styles found - should use CSS classes or styled components',
          severity: 'low'
        });
      }
      
      // Check for large images without optimization
      if (content.includes('.jpg') || content.includes('.png')) {
        this.issues.performanceIssues.push({
          file,
          type: 'unoptimized-images',
          message: 'Images should be optimized (WebP, proper sizing)',
          severity: 'medium'
        });
      }
      
      // Check for missing lazy loading on images
      if (content.includes('<img') && !content.includes('loading="lazy"')) {
        this.issues.performanceIssues.push({
          file,
          type: 'missing-lazy-loading',
          message: 'Images should use lazy loading for performance',
          severity: 'low'
        });
      }
    });
  }

  // Scan for usability problems
  scanUsability() {
    console.log('👤 Scanning for usability problems...');
    
    const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for missing loading states
      if (content.includes('fetch(') && !content.includes('loading') && !content.includes('isLoading')) {
        this.issues.usabilityProblems.push({
          file,
          type: 'missing-loading-states',
          message: 'API calls without loading states',
          severity: 'medium'
        });
      }
      
      // Check for missing error handling
      if (content.includes('fetch(') && !content.includes('catch') && !content.includes('error')) {
        this.issues.usabilityProblems.push({
          file,
          type: 'missing-error-handling',
          message: 'API calls without error handling',
          severity: 'high'
        });
      }
      
      // Check for forms without validation feedback
      if (content.includes('<form') && !content.includes('error') && !content.includes('invalid')) {
        this.issues.usabilityProblems.push({
          file,
          type: 'missing-form-validation',
          message: 'Form without validation feedback',
          severity: 'medium'
        });
      }
    });
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 UI/UX Audit Report');
    console.log('========================\n');
    
    const totalIssues = Object.values(this.issues).reduce((sum, category) => sum + category.length, 0);
    
    if (totalIssues === 0) {
      console.log('✅ No UI/UX issues found! Your codebase is in excellent shape.');
      return;
    }
    
    console.log(`Found ${totalIssues} UI/UX issues across your codebase:\n`);
    
    // Design System Issues
    if (this.issues.designSystemInconsistencies.length > 0) {
      console.log(`🎨 Design System Inconsistencies (${this.issues.designSystemInconsistencies.length}):`);
      this.issues.designSystemInconsistencies.forEach(issue => {
        console.log(`  ${this.getSeverityIcon(issue.severity)} ${issue.file}: ${issue.message}`);
      });
      console.log('');
    }
    
    // Accessibility Issues
    if (this.issues.accessibilityViolations.length > 0) {
      console.log(`♿ Accessibility Violations (${this.issues.accessibilityViolations.length}):`);
      this.issues.accessibilityViolations.forEach(issue => {
        console.log(`  ${this.getSeverityIcon(issue.severity)} ${issue.file}: ${issue.message}`);
      });
      console.log('');
    }
    
    // Mobile Issues
    if (this.issues.mobileResponsiveIssues.length > 0) {
      console.log(`📱 Mobile Responsiveness Issues (${this.issues.mobileResponsiveIssues.length}):`);
      this.issues.mobileResponsiveIssues.forEach(issue => {
        console.log(`  ${this.getSeverityIcon(issue.severity)} ${issue.file}: ${issue.message}`);
      });
      console.log('');
    }
    
    // Performance Issues
    if (this.issues.performanceIssues.length > 0) {
      console.log(`⚡ Performance Issues (${this.issues.performanceIssues.length}):`);
      this.issues.performanceIssues.forEach(issue => {
        console.log(`  ${this.getSeverityIcon(issue.severity)} ${issue.file}: ${issue.message}`);
      });
      console.log('');
    }
    
    // Usability Issues
    if (this.issues.usabilityProblems.length > 0) {
      console.log(`👤 Usability Problems (${this.issues.usabilityProblems.length}):`);
      this.issues.usabilityProblems.forEach(issue => {
        console.log(`  ${this.getSeverityIcon(issue.severity)} ${issue.file}: ${issue.message}`);
      });
      console.log('');
    }
    
    // Recommendations
    this.generateRecommendations();
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '💡';
      default: return '📝';
    }
  }

  generateRecommendations() {
    console.log('🎯 Recommended Actions:\n');
    
    const highPriorityIssues = Object.values(this.issues)
      .flat()
      .filter(issue => issue.severity === 'high');
    
    if (highPriorityIssues.length > 0) {
      console.log('🔥 High Priority (Fix Immediately):');
      console.log('  1. Fix all accessibility violations');
      console.log('  2. Add error handling to API calls');
      console.log('  3. Add accessible names to buttons and images\n');
    }
    
    console.log('📈 Medium Priority (Fix This Week):');
    console.log('  1. Migrate manual styling to design system components');
    console.log('  2. Add loading states to all data fetching');
    console.log('  3. Optimize touch targets for mobile\n');
    
    console.log('🔧 Low Priority (Ongoing Improvement):');
    console.log('  1. Replace hardcoded colors with design tokens');
    console.log('  2. Add responsive breakpoints to layouts');
    console.log('  3. Optimize images and add lazy loading\n');
    
    console.log('📚 Resources:');
    console.log('  • WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
    console.log('  • React Accessibility: https://reactjs.org/docs/accessibility.html');
    console.log('  • Mobile UX Guidelines: https://developers.google.com/web/fundamentals/design-and-ux/principles');
  }

  // Run complete audit
  runAudit() {
    console.log('🚀 Starting comprehensive UI/UX audit...\n');
    
    this.scanDesignSystemUsage();
    this.scanAccessibility();
    this.scanMobileResponsiveness();
    this.scanPerformance();
    this.scanUsability();
    
    this.generateReport();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new UIUXAuditor();
  auditor.runAudit();
}

module.exports = UIUXAuditor;
