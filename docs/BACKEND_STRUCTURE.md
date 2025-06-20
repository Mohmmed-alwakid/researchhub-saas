# ResearchHub - Backend Structure Documentation

**Version:** 2.0  
**Date:** June 15, 2025  
**Status:** Under Development - Not Production Ready  

---

## 🏗️ Architecture Overview

ResearchHub backend follows a layered architecture pattern with clear separation of concerns, ensuring maintainability, scalability, and testability.

### Architecture Layers
```
┌─────────────────────────┐
│     Presentation Layer  │  ← Routes & Controllers
├─────────────────────────┤
│     Service Layer       │  ← Business Logic
├─────────────────────────┤
│     Data Access Layer   │  ← Models & Database
├─────────────────────────┤
│     Database Layer      │  ← MongoDB
└─────────────────────────┘
```

---

## 📁 Directory Structure

### Backend File Organization
```
src/server/
├── controllers/         # Route handlers and request processing
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── study.controller.ts
│   ├── admin.controller.ts
│   ├── session.controller.ts
│   └── participant.controller.ts
├── middleware/          # Express middleware functions
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   ├── cors.middleware.ts
│   └── rateLimit.middleware.ts
├── models/              # Database models and schemas
│   ├── User.model.ts
│   ├── Study.model.ts
│   ├── Session.model.ts
│   ├── ParticipantApplication.model.ts
│   └── Analytics.model.ts
├── routes/              # Express route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── study.routes.ts
│   ├── admin.routes.ts
│   └── index.ts
├── services/            # Business logic and external integrations
│   ├── auth.service.ts
│   ├── email.service.ts
│   ├── upload.service.ts
│   ├── analytics.service.ts
│   └── notification.service.ts
├── utils/               # Utility functions and helpers
│   ├── database.ts
│   ├── jwt.ts
│   ├── validation.ts
│   ├── logger.ts
│   └── constants.ts
├── config/              # Configuration files
│   ├── database.config.ts
│   ├── cors.config.ts
│   ├── jwt.config.ts
│   └── environment.ts
└── server.ts            # Application entry point
```

---

## 🚪 API Route Structure

### Route Organization
```typescript
// routes/index.ts - Main router configuration
import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import studyRoutes from './study.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

// API versioning
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/studies', studyRoutes);
router.use('/api/admin', adminRoutes);

export default router;
```

### Route Patterns
```typescript
// ✅ Good - RESTful route structure
/api/auth/
├── POST   /register        # User registration
├── POST   /login           # User authentication
├── POST   /refresh         # Token refresh
├── POST   /logout          # User logout
└── GET    /profile         # Get current user

/api/studies/
├── GET    /                # List all studies
├── POST   /                # Create new study
├── GET    /:id             # Get specific study
├── PATCH  /:id             # Update study
├── DELETE /:id             # Delete study
└── GET    /:id/participants # Get study participants

/api/admin/
├── GET    /users           # List all users
├── PATCH  /users/:id       # Update user
├── DELETE /users/:id       # Delete user
├── GET    /analytics       # System analytics
└── GET    /health          # System health check
```

---

## 🎮 Controller Architecture

### Controller Pattern
```typescript
// ✅ Good - Controller structure
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../types/api.types';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  public register = async (
    req: Request,
    res: Response<ApiResponse<{ user: User; token: string }>>,
    next: NextFunction
  ) => {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response<ApiResponse<{ user: User; tokens: Tokens }>>,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          tokens: { accessToken: result.tokens.accessToken }
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export const authController = new AuthController(
  new AuthService(),
  new UserService()
);
```

### Error Handling Pattern
```typescript
// ✅ Good - Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

---

## 🛡️ Middleware Architecture

### Authentication Middleware
```typescript
// ✅ Good - JWT authentication middleware
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { UserService } from '../services/user.service';

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await UserService.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};
```

### Authorization Middleware
```typescript
// ✅ Good - Role-based authorization
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};

// Usage in routes
router.get('/admin/users', 
  authenticateToken, 
  requireRole(['admin']), 
  adminController.getUsers
);
```

### Validation Middleware
```typescript
// ✅ Good - Zod validation middleware
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};

// Schema definitions
export const createStudySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.array(z.string()).optional(),
    maxParticipants: z.number().positive().optional()
  })
});
```

---

## 🗄️ Database Models

### Mongoose Schema Pattern
```typescript
// ✅ Good - User model with proper typing
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'researcher' | 'participant';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  toJSON(): Partial<UserDocument>;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'researcher', 'participant'],
    default: 'participant'
  },
  profile: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 }
  },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.firstName': 'text', 'profile.lastName': 'text' });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Virtual fields
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

export const User = mongoose.model<UserDocument>('User', userSchema);
```

### Study Model Example
```typescript
// ✅ Good - Study model with relationships
export interface StudyDocument extends Document {
  title: string;
  description: string;
  researcher: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  requirements: string[];
  maxParticipants: number;
  currentParticipants: number;
  configuration: {
    duration: number; // in minutes
    allowRecording: boolean;
    requireConsent: boolean;
    instructions: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studySchema = new Schema<StudyDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  researcher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  requirements: [{ type: String, trim: true }],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 1,
    max: 1000
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  configuration: {
    duration: { type: Number, required: true, min: 5, max: 180 },
    allowRecording: { type: Boolean, default: true },
    requireConsent: { type: Boolean, default: true },
    instructions: { type: String, maxlength: 1000 }
  },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true
});

// Compound indexes
studySchema.index({ researcher: 1, status: 1 });
studySchema.index({ status: 1, createdAt: -1 });
studySchema.index({ tags: 1 });

export const Study = mongoose.model<StudyDocument>('Study', studySchema);
```

---

## 🔧 Service Layer

### Service Pattern
```typescript
// ✅ Good - Service class structure
export class StudyService {
  async createStudy(studyData: CreateStudyData, researcherId: string): Promise<Study> {
    try {
      // Validate researcher
      const researcher = await User.findById(researcherId);
      if (!researcher || researcher.role !== 'researcher') {
        throw new ForbiddenError('Only researchers can create studies');
      }

      // Create study
      const study = new Study({
        ...studyData,
        researcher: researcherId
      });

      await study.save();
      await study.populate('researcher', 'profile email');

      return study;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }

  async getStudies(filters: StudyFilters, userId?: string): Promise<Study[]> {
    const query: any = {};

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.researcher) {
      query.researcher = filters.researcher;
    }

    if (filters.tags?.length) {
      query.tags = { $in: filters.tags };
    }

    // Role-based filtering
    if (userId) {
      const user = await User.findById(userId);
      if (user?.role === 'researcher') {
        query.researcher = userId;
      }
    }

    return Study.find(query)
      .populate('researcher', 'profile email')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20);
  }

  async updateStudy(studyId: string, updates: Partial<StudyDocument>, userId: string): Promise<Study> {
    const study = await Study.findById(studyId);
    
    if (!study) {
      throw new NotFoundError('Study');
    }

    // Check ownership
    if (study.researcher.toString() !== userId) {
      throw new ForbiddenError('You can only update your own studies');
    }

    // Apply updates
    Object.assign(study, updates);
    await study.save();

    return study.populate('researcher', 'profile email');
  }

  async deleteStudy(studyId: string, userId: string): Promise<void> {
    const study = await Study.findById(studyId);
    
    if (!study) {
      throw new NotFoundError('Study');
    }

    if (study.researcher.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own studies');
    }

    // Check if study has active participants
    if (study.currentParticipants > 0) {
      throw new ValidationError('Cannot delete study with active participants');
    }

    await Study.findByIdAndDelete(studyId);
  }
}
```

---

## 🔐 Authentication & Security

### JWT Token Management
```typescript
// ✅ Good - JWT service
export class JWTService {
  private accessTokenSecret = process.env.JWT_SECRET!;
  private refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  private accessTokenExpiry = '15m';
  private refreshTokenExpiry = '7d';

  generateTokens(user: UserDocument): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'researchhub',
      audience: 'researchhub-client'
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'researchhub',
        audience: 'researchhub-client'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'researchhub',
        audience: 'researchhub-client'
      }) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'researchhub',
        audience: 'researchhub-client'
      }) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

export const jwtService = new JWTService();
```

### Password Security
```typescript
// ✅ Good - Password utilities
export class PasswordService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const passwordService = new PasswordService();
```

---

## 📊 Database Configuration

### Connection Setup
```typescript
// ✅ Good - Database configuration
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export class DatabaseService {
  private connectionString: string;
  
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/researchhub';
  }

  async connect(): Promise<void> {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(this.connectionString, options);
      
      logger.info('Successfully connected to MongoDB');
      
      // Handle connection events
      this.setupConnectionEvents();
      
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  private setupConnectionEvents(): void {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const databaseService = new DatabaseService();
```

---

## 📝 Logging & Monitoring

### Logger Configuration
```typescript
// ✅ Good - Winston logger setup
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'researchhub-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
};
```

---

## 🔧 Environment Configuration

### Configuration Management
```typescript
// ✅ Good - Environment configuration
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3002),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  CORS_ORIGINS: z.string().transform(str => str.split(',')),
  
  // Optional services
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export const config = envSchema.parse(process.env);

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
```

---

## 🚀 Application Startup

### Server Entry Point
```typescript
// ✅ Good - Server startup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from './config/environment';
import { databaseService } from './config/database.config';
import { logger, requestLogger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';

class Application {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.CORS_ORIGINS,
      credentials: true
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }));

    // General middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'ResearchHub API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use(routes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await databaseService.connect();

      // Start server
      this.app.listen(config.PORT, () => {
        logger.info(`Server started on port ${config.PORT}`);
        logger.info(`Environment: ${config.NODE_ENV}`);
      });
    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }
}

// Start application
const app = new Application();
app.start();
```

---

## 📋 API Response Standards

### Standardized Response Format
```typescript
// ✅ Good - API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  statusCode: number;
}

// Usage in controllers
res.status(200).json({
  success: true,
  data: studies,
  message: 'Studies retrieved successfully',
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
});
```

---

## 🧪 Testing Structure

### Test Organization
```
tests/
├── unit/                # Unit tests
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── utils/
├── integration/         # Integration tests
│   ├── auth.test.ts
│   ├── studies.test.ts
│   └── users.test.ts
├── fixtures/            # Test data
│   ├── users.json
│   └── studies.json
└── helpers/             # Test utilities
    ├── database.ts
    ├── auth.ts
    └── request.ts
```

---

## 📞 Contact & Updates

**Backend Lead:** ResearchHub Development Team  
**Last Updated:** June 15, 2025  
**Next Review:** September 15, 2025  

---

*This backend structure documentation serves as the definitive guide for backend development patterns and practices in the ResearchHub platform.*
