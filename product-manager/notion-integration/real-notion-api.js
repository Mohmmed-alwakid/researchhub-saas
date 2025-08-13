/**
 * Real Notion API Implementation
 * Connects to actual Notion workspace using your API token
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class RealNotionAPI {
  constructor() {
    this.loadConfiguration();
    this.baseURL = 'https://api.notion.com/v1';
    this.headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
  }

  loadConfiguration() {
    try {
      // Try to load from .env file
      const envPath = join(__dirname, '.env');
      const envContent = readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        if (line.startsWith('NOTION_API_TOKEN=')) {
          this.apiToken = line.split('=')[1].trim();
        }
        if (line.startsWith('NOTION_PARENT_PAGE_ID=')) {
          this.parentPageId = line.split('=')[1].trim();
        }
      }
    } catch (error) {
      console.log('📝 .env file not found, using direct configuration');
    }

    // Fallback to direct token if provided
    if (!this.apiToken) {
      this.apiToken = 'your_notion_api_token_here'; // Replace with your actual token
    }
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notion API Error: ${response.status} - ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Notion API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Create a new database in Notion
   */
  async createDatabase(parentPageId, databaseConfig) {
    console.log(`  📊 Creating database: ${databaseConfig.name}`);
    
    const requestBody = {
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: databaseConfig.name
          }
        }
      ],
      properties: databaseConfig.properties
    };

    try {
      const result = await this.makeRequest('/databases', 'POST', requestBody);
      console.log(`  ✅ Created: ${result.title[0].text.content}`);
      return result;
    } catch (error) {
      console.error(`  ❌ Failed to create database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new page (for parent workspace)
   */
  async createPage(parentPageId, title) {
    console.log(`  📄 Creating page: ${title}`);
    
    const requestBody = {
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        }
      }
    };

    try {
      const result = await this.makeRequest('/pages', 'POST', requestBody);
      console.log(`  ✅ Created page: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`  ❌ Failed to create page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get workspace information
   */
  async getWorkspaceInfo() {
    try {
      const result = await this.makeRequest('/users/me');
      console.log(`📋 Connected to Notion workspace: ${result.name || result.id}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to get workspace info:', error.message);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    console.log('🔗 Testing Notion API connection...');
    
    try {
      const userInfo = await this.getWorkspaceInfo();
      console.log('✅ Notion API connection successful!');
      console.log(`📧 Connected as: ${userInfo.person?.email || 'Integration User'}`);
      return true;
    } catch (error) {
      console.error('❌ Notion API connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get or create parent page for the product management hub
   */
  async setupParentPage() {
    console.log('📄 Setting up parent page for Product Management Hub...');
    
    // For this implementation, we'll need the user to provide a parent page ID
    // In a real implementation, you'd list pages and let user select
    if (!this.parentPageId) {
      console.log('⚠️  Parent page ID needed. Please:');
      console.log('1. Create a page in your Notion workspace');
      console.log('2. Share it with your integration');
      console.log('3. Copy the page ID from the URL');
      console.log('4. Add it to your .env file as NOTION_PARENT_PAGE_ID=your_page_id');
      
      // For now, return a placeholder that guides the user
      return {
        id: 'PLACEHOLDER_PARENT_PAGE_ID',
        instructions: 'Please set up your parent page ID in .env file'
      };
    }

    return {
      id: this.parentPageId,
      ready: true
    };
  }
}

export { RealNotionAPI };
