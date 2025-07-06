/**
 * Example Vercel API endpoint for Server-Sent Events notifications
 * Integrates with ResearchHub notification system
 * Based on Vibe-Coder-MCP architectural patterns
 * 
 * Place this file in: /api/notifications/sse.js
 */

import { globalNotificationManager } from '../../src/shared/notifications/index.js';

/**
 * SSE Notifications endpoint
 * GET /api/notifications/sse?userId=123&channels=job-progress,user-notifications
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create SSE endpoint using notification manager
    const sseHandler = globalNotificationManager.createSSEEndpoint();
    
    // Convert Vercel request to standard Request object
    const url = new URL(req.url, `http://${req.headers.host}`);
    const standardRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
    });

    // Get SSE response
    const response = await sseHandler(standardRequest);
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // If response is not ok, return error
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    // Stream the SSE response
    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).send('Failed to create stream');
    }

    // Handle client disconnect
    req.on('close', () => {
      reader.cancel();
    });

    // Stream data to client
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert Uint8Array to string if needed
        const chunk = typeof value === 'string' ? value : new TextDecoder().decode(value);
        res.write(chunk);
      }
    } catch (streamError) {
      console.error('SSE streaming error:', streamError);
    } finally {
      res.end();
    }

  } catch (error) {
    console.error('SSE endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Alternative implementation for Express.js (for local development)
export function createExpressSSEEndpoint() {
  return async (req, res) => {
    try {
      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      });

      const userId = req.query.userId;
      const channels = req.query.channels ? req.query.channels.split(',') : ['user-notifications'];

      if (!userId) {
        res.write('data: {"error": "Missing userId parameter"}\n\n');
        return res.end();
      }

      // Create SSE handler
      const sseHandler = globalNotificationManager.createSSEEndpoint();
      
      // Create standard request
      const url = new URL(req.url, `http://${req.get('host')}`);
      const standardRequest = new Request(url.toString(), {
        method: 'GET',
        headers: req.headers,
      });

      // Get response and stream it
      const response = await sseHandler(standardRequest);
      
      if (!response.ok) {
        res.write(`data: {"error": "Failed to create SSE connection"}\n\n`);
        return res.end();
      }

      const reader = response.body?.getReader();
      if (!reader) {
        res.write(`data: {"error": "Failed to create stream reader"}\n\n`);
        return res.end();
      }

      // Handle client disconnect
      req.on('close', () => {
        reader.cancel();
      });

      // Stream data
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = typeof value === 'string' ? value : new TextDecoder().decode(value);
          res.write(chunk);
        }
      } catch (streamError) {
        console.error('Express SSE streaming error:', streamError);
      } finally {
        res.end();
      }

    } catch (error) {
      console.error('Express SSE endpoint error:', error);
      res.write(`data: {"error": "Internal server error: ${error.message}"}\n\n`);
      res.end();
    }
  };
}
