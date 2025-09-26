/**
 * 🔗 Navigation & Route Fixer
 * Automatically fixes broken navigation links and route issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class NavigationFixer {
  constructor() {
    this.fixesApplied = [];
    this.routes = new Map();
    this.components = new Map();
  }

  async fixAllNavigationIssues() {
    console.log('🔗 ResearchHub Navigation & Route Fixer');
    console.log('=======================================\n');

    try {
      // Step 1: Analyze existing routes and components
      await this.analyzeRoutes();
      await this.analyzeComponents();
      
      // Step 2: Fix common navigation issues
      await this.fixBrokenNavigateRoutes();
      await this.fixMissingRoutes();
      await this.addMissingErrorBoundaries();
      
      // Step 3: Optimize route structure
      await this.optimizeRouteStructure();
      
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Navigation fix failed:', error.message);
    }
  }

  async analyzeRoutes() {
    console.log('🔍 Analyzing Route Structure...');
    
    // Find all routing files
    const routeFiles = await this.findRoutingFiles();
    
    for (const file of routeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Extract Route definitions
        const routeMatches = [...content.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<(\w+)[^}]*\}\s*\/>/g)];
        routeMatches.forEach(match => {
          this.routes.set(match[1], {
            path: match[1],
            component: match[2],
            file: file
          });
        });
        
        // Extract Navigate redirects
        const navigateMatches = [...content.matchAll(/<Navigate\s+to="([^"]+)"/g)];
        navigateMatches.forEach(match => {
          this.routes.set(`redirect:${match[1]}`, {
            path: match[1],
            type: 'redirect',
            file: file
          });
        });
        
      } catch (err) {
        console.log(`   ⚠️  Could not analyze ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }
    
    console.log(`   ✅ Found ${this.routes.size} routes`);
  }

  async analyzeComponents() {
    console.log('🧩 Analyzing Components...');
    
    const srcDir = path.join(projectRoot, 'src');
    const componentFiles = this.getAllFiles(srcDir, ['.tsx', '.jsx']);
    
    for (const file of componentFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find exported components
        const exportMatches = [...content.matchAll(/export\s+(?:const|function)\s+(\w+)/g)];
        exportMatches.forEach(match => {
          this.components.set(match[1], {
            name: match[1],
            file: file,
            isPage: file.includes('pages') || file.includes('Page')
          });
        });
        
        // Find default exports
        const defaultExports = [...content.matchAll(/export\s+default\s+(?:function\s+)?(\w+)/g)];
        defaultExports.forEach(match => {
          const componentName = match[1];
          this.components.set(componentName, {
            name: componentName,
            file: file,
            isDefault: true,
            isPage: file.includes('pages') || file.includes('Page')
          });
        });
        
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    console.log(`   ✅ Found ${this.components.size} components`);
  }

  async fixBrokenNavigateRoutes() {
    console.log('🚪 Fixing Navigation Routes...');
    
    const srcDir = path.join(projectRoot, 'src');
    const sourceFiles = this.getAllFiles(srcDir, ['.tsx', '.jsx']);
    let fixedCount = 0;
    
    for (const file of sourceFiles) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Find navigate() calls with potentially broken routes
        const navigateMatches = [...content.matchAll(/navigate\(['"`]([^'"`]+)['"`]/g)];
        
        for (const match of navigateMatches) {
          const route = match[1];
          
          // Check for common broken route patterns and fix them
          if (route === '/admin' && !this.routes.has('/admin')) {
            content = content.replace(
              `navigate('${route}')`,
              `navigate('/app/admin')`
            );
            modified = true;
          } else if (route === '/dashboard' && !this.routes.has('/dashboard')) {
            content = content.replace(
              `navigate('${route}')`,
              `navigate('/app/dashboard')`
            );
            modified = true;
          } else if (route === '/templates' && !this.routes.has('/templates')) {
            content = content.replace(
              `navigate('${route}')`,
              `navigate('/app/templates')`
            );
            modified = true;
          } else if (route === '/studies/create' && !this.routes.has('/studies/create')) {
            content = content.replace(
              `navigate('${route}')`,
              `navigate('/app/studies/create')`
            );
            modified = true;
          }
        }
        
        // Fix Link components with broken routes
        const linkMatches = [...content.matchAll(/<Link\s+to=['"`]([^'"`]+)['"`]/g)];
        
        for (const match of linkMatches) {
          const route = match[1];
          
          if (route === '/admin' && !this.routes.has('/admin')) {
            content = content.replace(
              `to="${route}"`,
              `to="/app/admin"`
            );
            modified = true;
          } else if (route === '/dashboard' && !this.routes.has('/dashboard')) {
            content = content.replace(
              `to="${route}"`,
              `to="/app/dashboard"`
            );
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(file, content);
          fixedCount++;
          
          this.fixesApplied.push({
            type: 'navigation-routes',
            file: path.relative(projectRoot, file),
            description: 'Fixed broken navigation routes',
          });
        }
        
      } catch (err) {
        console.log(`   ⚠️  Could not fix ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }
    
    console.log(`   ✅ Fixed ${fixedCount} navigation files`);
  }

  async fixMissingRoutes() {
    console.log('➕ Adding Missing Routes...');
    
    const appFile = path.join(projectRoot, 'src/App.tsx');
    if (!fs.existsSync(appFile)) {
      console.log('   ⚠️  App.tsx not found');
      return;
    }
    
    let content = fs.readFileSync(appFile, 'utf8');
    let modified = false;
    
    // Common routes that might be missing
    const commonRoutes = [
      { path: '/app/admin', component: 'AdminDashboard', import: '@/pages/admin/AdminDashboard' },
      { path: '/app/templates', component: 'TemplatesPage', import: '@/pages/templates/TemplatesPage' },
      { path: '/app/participants', component: 'ParticipantManagement', import: '@/pages/participants/ParticipantManagement' }
    ];
    
    let newImports = [];
    let newRoutes = [];
    
    for (const route of commonRoutes) {
      // Check if route already exists
      if (!content.includes(`path="${route.path}"`)) {
        // Check if component exists
        const componentExists = this.components.has(route.component);
        
        if (componentExists || this.findAlternativeComponent(route.component)) {
          const actualComponent = componentExists ? route.component : this.findAlternativeComponent(route.component);
          const actualImport = componentExists ? route.import : this.components.get(actualComponent).file;
          
          newImports.push(`import ${actualComponent} from '${this.getImportPath(actualImport)}';`);
          newRoutes.push(`            <Route path="${route.path}" element={<${actualComponent} />} />`);
          modified = true;
        }
      }
    }
    
    if (modified) {
      // Add imports after existing imports
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLastImport + 1) + 
                  newImports.join('\n') + '\n' +
                  content.slice(endOfLastImport + 1);
      }
      
      // Add routes before closing Routes tag
      const routesEndIndex = content.lastIndexOf('</Routes>');
      if (routesEndIndex !== -1) {
        content = content.slice(0, routesEndIndex) +
                  newRoutes.join('\n') + '\n          ' +
                  content.slice(routesEndIndex);
      }
      
      fs.writeFileSync(appFile, content);
      
      this.fixesApplied.push({
        type: 'missing-routes',
        file: 'src/App.tsx',
        description: `Added ${newRoutes.length} missing routes`,
        routes: newRoutes
      });
    }
    
    console.log(`   ✅ Added ${newRoutes.length} missing routes`);
  }

  async addMissingErrorBoundaries() {
    console.log('🛡️  Adding Error Boundaries...');
    
    const routingFiles = await this.findRoutingFiles();
    let fixedCount = 0;
    
    for (const file of routingFiles) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Check if Routes exist without ErrorBoundary
        if (content.includes('<Routes>') && !content.includes('ErrorBoundary')) {
          
          // Add ErrorBoundary import
          if (!content.includes("import ErrorBoundary")) {
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
              const endOfLastImport = content.indexOf('\n', lastImportIndex);
              content = content.slice(0, endOfLastImport + 1) + 
                        "import ErrorBoundary from '@/shared/errors/ErrorBoundary';\n" +
                        content.slice(endOfLastImport + 1);
            }
          }
          
          // Wrap Routes with ErrorBoundary
          content = content.replace(
            /<Routes>/g,
            '<ErrorBoundary>\n        <Routes>'
          );
          
          content = content.replace(
            /<\/Routes>/g,
            '</Routes>\n      </ErrorBoundary>'
          );
          
          fs.writeFileSync(file, content);
          fixedCount++;
          
          this.fixesApplied.push({
            type: 'error-boundaries',
            file: path.relative(projectRoot, file),
            description: 'Added ErrorBoundary around Routes'
          });
        }
        
      } catch (err) {
        console.log(`   ⚠️  Could not add ErrorBoundary to ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }
    
    console.log(`   ✅ Added ErrorBoundaries to ${fixedCount} files`);
  }

  async optimizeRouteStructure() {
    console.log('⚡ Optimizing Route Structure...');
    
    const appFile = path.join(projectRoot, 'src/App.tsx');
    if (!fs.existsSync(appFile)) return;
    
    let content = fs.readFileSync(appFile, 'utf8');
    let modified = false;
    
    // Count redirects - if too many, suggest consolidation
    const redirects = [...content.matchAll(/<Navigate\s+to="([^"]+)"/g)];
    
    if (redirects.length > 5) {
      // Create a comment with optimization suggestions
      const optimizationComment = `
// OPTIMIZATION SUGGESTION: Consider consolidating ${redirects.length} redirects
// into a centralized routing configuration to improve maintainability.
// Common redirects found: ${redirects.slice(0, 3).map(r => r[1]).join(', ')}
`;
      
      // Add comment at the top of the routing section
      const routesIndex = content.indexOf('<Routes>');
      if (routesIndex !== -1) {
        content = content.slice(0, routesIndex) +
                  optimizationComment +
                  content.slice(routesIndex);
        
        fs.writeFileSync(appFile, content);
        modified = true;
      }
    }
    
    if (modified) {
      this.fixesApplied.push({
        type: 'route-optimization',
        file: 'src/App.tsx',
        description: `Added optimization suggestions for ${redirects.length} redirects`
      });
    }
    
    console.log(`   ✅ Analyzed route structure`);
  }

  findAlternativeComponent(componentName) {
    // Try to find similar components
    const alternatives = Array.from(this.components.keys()).filter(name => 
      name.toLowerCase().includes(componentName.toLowerCase().replace(/page|dashboard/g, ''))
    );
    
    return alternatives.length > 0 ? alternatives[0] : null;
  }

  getImportPath(filePath) {
    // Convert file path to import path
    const relativePath = path.relative(path.join(projectRoot, 'src'), filePath);
    return './' + relativePath.replace(/\\/g, '/').replace(/\.tsx?$/, '');
  }

  async findRoutingFiles() {
    const srcDir = path.join(projectRoot, 'src');
    const allFiles = this.getAllFiles(srcDir, ['.tsx', '.ts']);
    
    return allFiles.filter(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('<Route') || content.includes('Routes') || file.includes('App.tsx');
    });
  }

  getAllFiles(dirPath, extensions) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        try {
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.getAllFiles(fullPath, extensions));
          } else if (extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (err) {
          // Skip files we can't access
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
    
    return files;
  }

  displayResults() {
    console.log('\n🎯 NAVIGATION FIX RESULTS');
    console.log('==========================');
    
    if (this.fixesApplied.length === 0) {
      console.log('✅ No navigation issues found!');
      console.log('   Your routing structure is healthy.');
    } else {
      console.log(`🔧 Applied ${this.fixesApplied.length} navigation fixes:\n`);
      
      // Group fixes by type
      const fixTypes = {};
      this.fixesApplied.forEach(fix => {
        if (!fixTypes[fix.type]) {
          fixTypes[fix.type] = [];
        }
        fixTypes[fix.type].push(fix);
      });

      Object.entries(fixTypes).forEach(([type, fixes]) => {
        console.log(`📋 ${type.toUpperCase().replace('-', ' ')}`);
        console.log(''.padEnd(40, '-'));
        
        fixes.forEach(fix => {
          console.log(`✅ ${fix.file}`);
          console.log(`   ${fix.description}`);
          if (fix.routes) {
            fix.routes.forEach(route => {
              console.log(`   ➕ ${route.trim()}`);
            });
          }
          console.log('');
        });
      });

      console.log('🚀 NEXT STEPS');
      console.log('-------------');
      console.log('1. Test navigation: npm run dev:fullstack');
      console.log('2. Check all routes work correctly');
      console.log('3. Run health scan: npm run health:scan');
      console.log('4. Update any remaining broken links manually');
      
      console.log('\n📊 ROUTE SUMMARY');
      console.log('----------------');
      console.log(`Total routes found: ${this.routes.size}`);
      console.log(`Total components found: ${this.components.size}`);
      console.log(`Page components: ${Array.from(this.components.values()).filter(c => c.isPage).length}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new NavigationFixer();
  fixer.fixAllNavigationIssues().catch(console.error);
}

export default NavigationFixer;