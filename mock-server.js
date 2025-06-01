const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock study creation endpoint
app.post('/api/studies', (req, res) => {
  console.log('📋 Study creation request received:', req.body);
  
  // Simulate study creation
  const newStudy = {
    _id: `study_${Date.now()}`,
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: {
      target: req.body.settings?.maxParticipants || 10,
      enrolled: 0,
      completed: 0,
      active: [],
      qualified: [],
      disqualified: []
    }
  };
  
  res.status(201).json({
    success: true,
    data: newStudy,
    message: 'Study created successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: http://localhost:5175`);
});
