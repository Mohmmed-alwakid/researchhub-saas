import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';

class PlaywrightTestClient {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  async navigateAndTest(url) {
    if (!this.page) {
      await this.initialize();
    }

    console.log(`🌐 Navigating to: ${url}`);
    await this.page.goto(url);
    
    // Take screenshot
    const screenshot = await this.page.screenshot({ fullPage: true });
    
    // Get page title
    const title = await this.page.title();
    
    // Get page content
    const content = await this.page.textContent('body');
    
    // Check for common elements
    const hasHeader = await this.page.locator('header').count() > 0;
    const hasNav = await this.page.locator('nav').count() > 0;
    const hasMain = await this.page.locator('main').count() > 0;
    
    const result = {
      url,
      title,
      screenshot: screenshot.toString('base64'),
      contentLength: content?.length || 0,
      hasHeader,
      hasNav,
      hasMain,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Page loaded successfully:`);
    console.log(`   Title: ${title}`);
    console.log(`   Content length: ${result.contentLength} characters`);
    console.log(`   Has header: ${hasHeader}`);
    console.log(`   Has navigation: ${hasNav}`);
    console.log(`   Has main content: ${hasMain}`);

    return result;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Test the MCP Playwright functionality
async function testMCPPlaywright() {
  console.log('🎭 Starting MCP Playwright Test');
  
  const client = new PlaywrightTestClient();
  
  try {
    // Test the ResearchHub local application
    const result = await client.navigateAndTest('http://localhost:5175/');
    
    // Save screenshot
    const fs = await import('fs');
    const screenshotPath = 'playwright-test-screenshot.png';
    fs.writeFileSync(screenshotPath, Buffer.from(result.screenshot, 'base64'));
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);
    
    // Generate test report
    const report = {
      testName: 'MCP Playwright Local Test',
      url: result.url,
      status: 'SUCCESS',
      results: {
        pageTitle: result.title,
        contentLength: result.contentLength,
        structureAnalysis: {
          hasHeader: result.hasHeader,
          hasNavigation: result.hasNav,
          hasMainContent: result.hasMain
        },
        screenshotPath,
        timestamp: result.timestamp
      }
    };
    
    fs.writeFileSync('mcp-playwright-test-report.json', JSON.stringify(report, null, 2));
    console.log(`📊 Test report saved to: mcp-playwright-test-report.json`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      testName: 'MCP Playwright Local Test',
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await client.close();
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMCPPlaywright()
    .then(result => {
      console.log('\n🎉 Test completed!');
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'SUCCESS' ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testMCPPlaywright, PlaywrightTestClient };
