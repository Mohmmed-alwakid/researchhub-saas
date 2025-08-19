# 🔄 N8N Workflow Implementation Guide

## Overview

This guide provides complete implementation details for deploying the ResearchHub documentation automation workflow using n8n. The workflow automates documentation analysis, categorization, and migration using AI-powered processing.

## Prerequisites

### Required Tools
- **n8n Instance**: Self-hosted or cloud version
- **OpenAI API Key**: For AI-powered content analysis
- **File System Access**: For reading and writing documentation files
- **Git Integration**: For version control and deployment

### Environment Setup

```bash
# Install n8n (choose one method)

# Option 1: npm (recommended for development)
npm install -g n8n
n8n start

# Option 2: Docker (recommended for production)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Option 3: Docker Compose (recommended for full setup)
```

**docker-compose.yml:**
```yaml
version: '3.7'
services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ~/.n8n:/home/node/.n8n
    command: n8n start
```

## Workflow Configuration

### 1. OpenAI Credentials Setup

**Navigate to**: Settings → Credentials → Add Credential

```json
{
  "name": "OpenAI API",
  "type": "openAiApi",
  "data": {
    "apiKey": "your_openai_api_key_here"
  }
}
```

### 2. File System Access

For local file operations, ensure n8n has appropriate file system permissions:

```bash
# Give n8n access to your documentation directory
chmod -R 755 /path/to/your/docs
```

### 3. GitHub Integration (Optional)

For automated git operations:

```json
{
  "name": "GitHub",
  "type": "githubApi",
  "data": {
    "accessToken": "your_github_token",
    "server": "https://api.github.com"
  }
}
```

## Complete Workflow Implementation

### Workflow JSON

```json
{
  "name": "ResearchHub Documentation Automation",
  "version": 1,
  "createdAt": "2025-08-19T10:00:00.000Z",
  "updatedAt": "2025-08-19T10:00:00.000Z",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "options": {}
      },
      "id": "manual-trigger",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [
        240,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "list",
        "path": "docs",
        "options": {
          "recursive": true
        }
      },
      "id": "list-files",
      "name": "List Documentation Files",
      "type": "n8n-nodes-base.fs",
      "position": [
        460,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.name}}",
              "operation": "endsWith",
              "value2": ".md"
            }
          ]
        }
      },
      "id": "filter-markdown",
      "name": "Filter Markdown Files",
      "type": "n8n-nodes-base.if",
      "position": [
        680,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "read",
        "path": "={{$json.path}}"
      },
      "id": "read-file",
      "name": "Read File Content",
      "type": "n8n-nodes-base.fs",
      "position": [
        900,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "model": "gpt-4",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "message": "You are a documentation expert. Analyze the provided markdown content and categorize it according to the Diátaxis framework: Tutorial, How-to Guide, Reference, or Explanation. Also extract key metadata."
            },
            {
              "role": "user", 
              "message": "Analyze this documentation content and return a JSON response with:\n1. category (tutorial|how-to|reference|explanation)\n2. title\n3. description\n4. tags\n5. difficulty_level\n6. estimated_reading_time\n7. target_audience\n8. quality_score (1-10)\n9. improvement_suggestions\n\nContent:\n{{$json.content}}"
            }
          ]
        },
        "options": {
          "temperature": 0.3,
          "maxTokens": 1000
        }
      },
      "id": "analyze-content",
      "name": "Analyze with AI",
      "type": "n8n-nodes-base.openAi",
      "position": [
        1120,
        300
      ],
      "typeVersion": 1,
      "credentials": {
        "openAiApi": {
          "id": "openai-credentials",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Parse AI response and prepare file metadata\nconst aiResponse = JSON.parse($input.first().json.message.content);\nconst originalFile = $('read-file').first().json;\n\nconst fileMetadata = {\n  original_path: originalFile.path,\n  original_name: originalFile.name,\n  category: aiResponse.category,\n  title: aiResponse.title,\n  description: aiResponse.description,\n  tags: aiResponse.tags,\n  difficulty_level: aiResponse.difficulty_level,\n  estimated_reading_time: aiResponse.estimated_reading_time,\n  target_audience: aiResponse.target_audience,\n  quality_score: aiResponse.quality_score,\n  improvement_suggestions: aiResponse.improvement_suggestions,\n  content: originalFile.content,\n  processed_at: new Date().toISOString()\n};\n\n// Determine new file path based on category\nconst categoryPaths = {\n  'tutorial': 'docs/tutorials/',\n  'how-to': 'docs/how-to-guides/',\n  'reference': 'docs/reference/',\n  'explanation': 'docs/explanation/'\n};\n\nconst newPath = categoryPaths[aiResponse.category] || 'docs/uncategorized/';\nfileMetadata.new_path = newPath + originalFile.name;\n\nreturn [fileMetadata];"
      },
      "id": "process-metadata",
      "name": "Process Metadata",
      "type": "n8n-nodes-base.code",
      "position": [
        1340,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.quality_score}}",
              "operation": "largerEqual",
              "value2": 7
            }
          ]
        }
      },
      "id": "quality-check",
      "name": "Quality Check",
      "type": "n8n-nodes-base.if",
      "position": [
        1560,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "create",
        "path": "={{$json.new_path}}",
        "content": "={{$json.content}}"
      },
      "id": "create-organized-file",
      "name": "Create Organized File",
      "type": "n8n-nodes-base.fs",
      "position": [
        1780,
        240
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "append",
        "path": "docs/MIGRATION_LOG.md",
        "content": "## {{new Date().toISOString()}}\n- **File**: {{$json.original_path}}\n- **Category**: {{$json.category}}\n- **Quality Score**: {{$json.quality_score}}/10\n- **New Location**: {{$json.new_path}}\n- **Suggestions**: {{$json.improvement_suggestions.join(', ')}}\n\n"
      },
      "id": "log-migration",
      "name": "Log Migration",
      "type": "n8n-nodes-base.fs",
      "position": [
        2000,
        240
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "create",
        "path": "docs/quality-review/{{$json.original_name}}.review.json",
        "content": "{{JSON.stringify({\n  original_path: $json.original_path,\n  quality_score: $json.quality_score,\n  improvements_needed: $json.improvement_suggestions,\n  reviewed_at: new Date().toISOString(),\n  status: 'needs_improvement'\n}, null, 2)}}"
      },
      "id": "create-review-file",
      "name": "Create Review File",
      "type": "n8n-nodes-base.fs",
      "position": [
        1780,
        360
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "jsCode": "// Generate comprehensive summary report\nconst allItems = $input.all();\n\nconst summary = {\n  total_files_processed: allItems.length,\n  categorization: {\n    tutorial: allItems.filter(item => item.json.category === 'tutorial').length,\n    'how-to': allItems.filter(item => item.json.category === 'how-to').length,\n    reference: allItems.filter(item => item.json.category === 'reference').length,\n    explanation: allItems.filter(item => item.json.category === 'explanation').length\n  },\n  quality_distribution: {\n    high_quality: allItems.filter(item => item.json.quality_score >= 8).length,\n    medium_quality: allItems.filter(item => item.json.quality_score >= 6 && item.json.quality_score < 8).length,\n    low_quality: allItems.filter(item => item.json.quality_score < 6).length\n  },\n  average_quality_score: allItems.reduce((sum, item) => sum + item.json.quality_score, 0) / allItems.length,\n  files_needing_review: allItems.filter(item => item.json.quality_score < 7).length,\n  processed_at: new Date().toISOString()\n};\n\nreturn [summary];"
      },
      "id": "generate-summary",
      "name": "Generate Summary",
      "type": "n8n-nodes-base.code",
      "position": [
        2220,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "create",
        "path": "docs/AUTOMATION_SUMMARY.json",
        "content": "{{JSON.stringify($json, null, 2)}}"
      },
      "id": "save-summary",
      "name": "Save Summary Report",
      "type": "n8n-nodes-base.fs",
      "position": [
        2440,
        300
      ],
      "typeVersion": 1
    },
    {
      "parameters": {
        "message": "📊 **ResearchHub Documentation Automation Complete**\n\n✅ **Files Processed**: {{$json.total_files_processed}}\n\n📋 **Categorization Results**:\n- Tutorials: {{$json.categorization.tutorial}}\n- How-to Guides: {{$json.categorization['how-to']}}\n- Reference: {{$json.categorization.reference}}\n- Explanations: {{$json.categorization.explanation}}\n\n⭐ **Quality Assessment**:\n- Average Score: {{$json.average_quality_score.toFixed(1)}}/10\n- High Quality (8+): {{$json.quality_distribution.high_quality}}\n- Medium Quality (6-7): {{$json.quality_distribution.medium_quality}}\n- Needs Review (<6): {{$json.quality_distribution.low_quality}}\n\n🔍 **Files Requiring Review**: {{$json.files_needing_review}}\n\nDetailed report saved to: `docs/AUTOMATION_SUMMARY.json`",
        "options": {
          "allowUnauthorizedCerts": true
        }
      },
      "id": "slack-notification",
      "name": "Send Completion Notification",
      "type": "n8n-nodes-base.slack",
      "position": [
        2660,
        300
      ],
      "typeVersion": 1,
      "credentials": {
        "slackApi": {
          "id": "slack-credentials",
          "name": "Slack API"
        }
      }
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "List Documentation Files",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "List Documentation Files": {
      "main": [
        [
          {
            "node": "Filter Markdown Files",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Filter Markdown Files": {
      "main": [
        [
          {
            "node": "Read File Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Read File Content": {
      "main": [
        [
          {
            "node": "Analyze with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze with AI": {
      "main": [
        [
          {
            "node": "Process Metadata",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Metadata": {
      "main": [
        [
          {
            "node": "Quality Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Quality Check": {
      "main": [
        [
          {
            "node": "Create Organized File",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Create Review File",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Organized File": {
      "main": [
        [
          {
            "node": "Log Migration",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Log Migration": {
      "main": [
        [
          {
            "node": "Generate Summary",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Review File": {
      "main": [
        [
          {
            "node": "Generate Summary",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Summary": {
      "main": [
        [
          {
            "node": "Save Summary Report",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Save Summary Report": {
      "main": [
        [
          {
            "node": "Send Completion Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [
    "documentation",
    "automation",
    "ai",
    "researchhub"
  ],
  "triggerCount": 1,
  "updatedAt": "2025-08-19T10:00:00.000Z"
}
```

## Deployment Steps

### 1. Import Workflow

1. **Open n8n Interface**: Navigate to `http://localhost:5678`
2. **Import Workflow**:
   - Click "Import from file" or "Import from URL"
   - Paste the workflow JSON above
   - Click "Import"

### 2. Configure Credentials

**OpenAI Credentials:**
```
Name: OpenAI API
Type: OpenAI
API Key: your_openai_api_key
```

**Slack Credentials (Optional):**
```
Name: Slack API
Type: Slack
Auth Type: OAuth2
Access Token: your_slack_bot_token
```

### 3. Test Workflow

1. **Activate Workflow**: Toggle the active switch
2. **Manual Execution**: Click "Execute Workflow"
3. **Monitor Execution**: Watch the node execution in real-time
4. **Review Results**: Check generated files and logs

### 4. Schedule Automation (Optional)

Replace the Manual Trigger with a Cron Trigger for automatic execution:

```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 2 * * 1"
        }
      ]
    }
  },
  "name": "Weekly Documentation Audit",
  "type": "n8n-nodes-base.cron",
  "position": [240, 300],
  "typeVersion": 1
}
```

## Customization Options

### AI Prompt Customization

Modify the AI analysis prompt for specific requirements:

```json
{
  "role": "user",
  "message": "Analyze this ResearchHub documentation content with focus on:\n1. User research methodology accuracy\n2. Technical implementation clarity\n3. Beginner-friendliness\n4. Actionability of instructions\n\nProvide detailed improvement suggestions for:\n- Code examples\n- Step-by-step instructions\n- Screenshots or diagrams needed\n- Cross-references to other docs\n\nContent:\n{{$json.content}}"
}
```

### File Organization Rules

Customize the categorization logic:

```javascript
// Enhanced categorization logic
const categoryPaths = {
  'tutorial': 'docs/tutorials/',
  'how-to': 'docs/how-to-guides/',
  'reference': 'docs/reference/',
  'explanation': 'docs/explanation/'
};

// Sub-categorization by topic
const subCategories = {
  'tutorial': {
    'study-creation': 'study-creation/',
    'ai-features': 'ai-features/',
    'analytics': 'analytics/',
    'api': 'api/'
  },
  'how-to': {
    'study-management': 'study-management/',
    'participant-flow': 'participant-flow/',
    'integrations': 'integrations/',
    'troubleshooting': 'troubleshooting/'
  }
};

// Determine sub-category based on content analysis
const detectSubCategory = (content, category) => {
  const keywords = {
    'study-creation': ['study builder', 'blocks', 'templates'],
    'ai-features': ['ai', 'machine learning', 'artificial intelligence'],
    'analytics': ['metrics', 'reports', 'data analysis'],
    'api': ['endpoint', 'rest', 'api', 'integration']
  };
  
  // Find best matching sub-category
  for (const [subCat, terms] of Object.entries(keywords)) {
    if (terms.some(term => content.toLowerCase().includes(term))) {
      return subCategories[category]?.[subCat] || '';
    }
  }
  
  return '';
};
```

### Quality Thresholds

Adjust quality assessment criteria:

```javascript
// Quality scoring weights
const qualityWeights = {
  clarity: 0.25,
  completeness: 0.25,
  accuracy: 0.20,
  examples: 0.15,
  structure: 0.15
};

// Custom quality check
const assessQuality = (analysis) => {
  let score = 0;
  
  // Clarity assessment
  if (analysis.clarity_score >= 8) score += qualityWeights.clarity * 10;
  else if (analysis.clarity_score >= 6) score += qualityWeights.clarity * 7;
  else score += qualityWeights.clarity * 4;
  
  // Completeness check
  if (analysis.has_examples && analysis.has_code_samples) {
    score += qualityWeights.completeness * 10;
  } else if (analysis.has_examples || analysis.has_code_samples) {
    score += qualityWeights.completeness * 7;
  } else {
    score += qualityWeights.completeness * 3;
  }
  
  return Math.round(score);
};
```

## Monitoring and Maintenance

### Execution Monitoring

**Built-in Monitoring:**
- Execution history in n8n interface
- Error logs and stack traces
- Performance metrics per node
- Resource usage statistics

**Custom Monitoring:**
```javascript
// Add monitoring node
{
  "parameters": {
    "jsCode": "// Log execution metrics\nconst executionData = {\n  workflow_id: $workflow.id,\n  execution_id: $execution.id,\n  started_at: $execution.startedAt,\n  status: $execution.finished ? 'completed' : 'running',\n  nodes_executed: $execution.data?.resultData?.runData ? Object.keys($execution.data.resultData.runData).length : 0,\n  total_items_processed: $input.all().length,\n  errors: $execution.data?.resultData?.error ? [$execution.data.resultData.error] : []\n};\n\n// Send to monitoring service or log file\nconsole.log('Workflow Execution:', JSON.stringify(executionData, null, 2));\n\nreturn [executionData];"
  },
  "name": "Execution Monitor",
  "type": "n8n-nodes-base.code"
}
```

### Error Handling

**Add Error Recovery:**
```json
{
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{$node['Analyze with AI'].json.error !== undefined}}",
          "value2": true
        }
      ]
    }
  },
  "name": "Check for AI Errors",
  "type": "n8n-nodes-base.if"
}
```

### Backup and Recovery

**Workflow Backup:**
```bash
# Export workflow definition
curl -X GET \
  'http://localhost:5678/api/v1/workflows/export' \
  -H 'Authorization: Bearer your_api_key' \
  > researchhub-docs-workflow-backup.json

# Schedule regular backups
echo "0 3 * * * /usr/local/bin/backup-n8n-workflows.sh" | crontab -
```

## Advanced Features

### Batch Processing

For large documentation sets:

```javascript
// Batch processor node
{
  "parameters": {
    "jsCode": "// Process files in batches to avoid API rate limits\nconst allFiles = $input.all();\nconst batchSize = 5;\nconst batches = [];\n\nfor (let i = 0; i < allFiles.length; i += batchSize) {\n  batches.push(allFiles.slice(i, i + batchSize));\n}\n\n// Return first batch, store others for subsequent processing\n$workflow.staticData.remainingBatches = batches.slice(1);\n\nreturn batches[0] || [];"
  },
  "name": "Batch Processor",
  "type": "n8n-nodes-base.code"
}
```

### Multi-Language Support

Extend for international documentation:

```javascript
// Language detection and processing
{
  "parameters": {
    "jsCode": "// Detect document language\nconst content = $json.content;\n\n// Simple language detection (can be enhanced with proper detection library)\nconst detectLanguage = (text) => {\n  const indicators = {\n    'en': ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to'],\n    'es': ['el', 'la', 'y', 'o', 'pero', 'en', 'con', 'para'],\n    'fr': ['le', 'la', 'et', 'ou', 'mais', 'dans', 'sur', 'pour'],\n    'de': ['der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'auf']\n  };\n  \n  let maxScore = 0;\n  let detectedLang = 'en';\n  \n  for (const [lang, words] of Object.entries(indicators)) {\n    const score = words.filter(word => \n      text.toLowerCase().includes(` ${word} `)\n    ).length;\n    \n    if (score > maxScore) {\n      maxScore = score;\n      detectedLang = lang;\n    }\n  }\n  \n  return detectedLang;\n};\n\nconst language = detectLanguage(content);\n\nreturn [{ \n  ...($json), \n  detected_language: language,\n  needs_translation: language !== 'en'\n}];"
  },
  "name": "Language Detection",
  "type": "n8n-nodes-base.code"
}
```

## Troubleshooting

### Common Issues

**OpenAI API Errors:**
```javascript
// Error handling for API calls
try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });
  
  return response;
} catch (error) {
  if (error.httpCode === 429) {
    // Rate limit exceeded - wait and retry
    await new Promise(resolve => setTimeout(resolve, 60000));
    return this.helpers.httpRequest(options);
  } else if (error.httpCode === 401) {
    throw new Error('OpenAI API key is invalid');
  } else {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
```

**File System Permission Issues:**
```bash
# Fix common permission issues
sudo chown -R n8n:n8n /home/node/.n8n
sudo chmod -R 755 /path/to/docs
```

**Memory Issues with Large Files:**
```javascript
// Stream processing for large files
{
  "parameters": {
    "jsCode": "// Process large files in chunks\nconst fs = require('fs');\nconst path = $json.path;\n\nif (fs.statSync(path).size > 1024 * 1024) { // > 1MB\n  // Split into smaller chunks\n  const content = fs.readFileSync(path, 'utf8');\n  const chunks = content.match(/.{1,10000}/g) || [];\n  \n  return chunks.map((chunk, index) => ({\n    ...($json),\n    content: chunk,\n    chunk_index: index,\n    total_chunks: chunks.length\n  }));\n} else {\n  return [$json];\n}"
  },
  "name": "Large File Handler",
  "type": "n8n-nodes-base.code"
}
```

## Performance Optimization

### Caching Strategy

```javascript
// Implement caching for repeated operations
{
  "parameters": {
    "jsCode": "// Simple in-memory cache\nif (!$workflow.staticData.cache) {\n  $workflow.staticData.cache = {};\n}\n\nconst cacheKey = require('crypto')\n  .createHash('md5')\n  .update($json.content)\n  .digest('hex');\n\n// Check cache first\nif ($workflow.staticData.cache[cacheKey]) {\n  return [$workflow.staticData.cache[cacheKey]];\n}\n\n// Process and cache result\nconst result = processContent($json.content);\n$workflow.staticData.cache[cacheKey] = result;\n\nreturn [result];"
  },
  "name": "Content Cache",
  "type": "n8n-nodes-base.code"
}
```

### Parallel Processing

```json
{
  "parameters": {
    "mode": "parallel",
    "options": {
      "maxConcurrency": 3
    }
  },
  "name": "Parallel AI Analysis",
  "type": "n8n-nodes-base.splitInBatches"
}
```

## Next Steps

1. **Deploy Workflow**: Import and configure in your n8n instance
2. **Test with Sample Data**: Run on a small subset of documentation
3. **Review Results**: Check categorization accuracy and quality scores
4. **Customize Prompts**: Adjust AI prompts for your specific needs
5. **Schedule Regular Runs**: Set up automated documentation audits
6. **Monitor Performance**: Track execution metrics and optimize as needed

---

**Implementation Guide Version**: 1.0.0  
**Last Updated**: August 19, 2025  
**Compatibility**: n8n v1.0+, OpenAI API v1
