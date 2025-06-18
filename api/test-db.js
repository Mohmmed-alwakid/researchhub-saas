// Simple MongoDB connection test endpoint
import connectDB from '../utils/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Test MongoDB connection
    const mongoose = await connectDB();
    
    // Get connection status
    const connectionState = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.status(200).json({
      success: true,
      message: 'Database connection test completed',
      database: {
        status: stateNames[connectionState] || 'unknown',
        host: mongoose.connection.host || 'not available',
        name: mongoose.connection.name || 'not available',
        readyState: connectionState
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      details: error.code || 'Unknown error'
    });
  }
}
