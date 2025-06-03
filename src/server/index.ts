import express, { type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import apiRoutes from './routes/index';

// Import middleware
import { errorHandler } from './middleware/error.middleware';

// Import database connection
import { connectDB } from '../database/connection';
import { initializeDatabaseWithRetries } from '../database/initializeDatabase';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = createServer(app);
// Socket.io configuration for hybrid architecture
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5175',
  'https://researchhub-saas.vercel.app', // Vercel frontend
  'http://localhost:5175', // Local development
  'http://localhost:3000', // Alternative local port
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS middleware for hybrid architecture
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log unauthorized origin attempts
    console.warn(`🚫 CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Root health check endpoint for Railway
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ResearchHub Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ResearchHub API Server',
    version: '1.0.0',
    health: '/api/health',
    documentation: '/api'
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-study', (studyId: string) => {
    socket.join(`study-${studyId}`);
    console.log(`User ${socket.id} joined study ${studyId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '3002', 10);
const HOST = process.env.HOST || '0.0.0.0'; // Railway requires binding to 0.0.0.0

const startServer = async (): Promise<void> => {
  // Start the HTTP server first
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5175'}`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
  });

  // Connect to database after server is listening (for Railway healthcheck)
  try {
    await connectDB();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️  Server will continue without database');
  }
  
  // Initialize database with admin accounts (only if DB connected)
  try {
    await initializeDatabaseWithRetries();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('⚠️  Server will continue but admin account may not be available');
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export { io };