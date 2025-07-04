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
├── DELETE /:id             # Delete user
└── GET    /:id/participants # Get study participants

/api/admin/
├── GET    /users           # List all users
├── PATCH  /users/:id       # Update user
├── DELETE /users/:id       # Delete user
├── GET    /analytics       # System analytics
├── GET    /health          # System health check
└── payments/               # Payment management (✅ IMPLEMENTED)
    ├── GET    /requests    # List payment requests
    ├── GET    /analytics   # Payment analytics
    ├── PUT    /requests/:id/verify  # Verify payment
    ├── PUT    /requests/:id/reject  # Reject payment
    └── POST   /credits/add # Add credits to user
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

---

## 💳 Payment Management System

### Overview
The payment management system provides comprehensive admin tools for handling payment requests, processing verifications, and managing user credits. **Status: ✅ PRODUCTION READY (July 2025)**

### Database Schema
```sql
-- Payment requests table
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    payment_method VARCHAR(100),
    payment_proof_url TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

#### GET /api/admin/payments/requests
**Purpose:** Retrieve all payment requests with user details  
**Authentication:** Admin role required  
**Response:** List of payment requests with user information

```typescript
interface PaymentRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  planType: 'basic' | 'pro' | 'enterprise';
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'rejected';
  paymentMethod: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}
```

#### GET /api/admin/payments/analytics
**Purpose:** Get payment analytics and statistics  
**Authentication:** Admin role required  
**Response:** Payment analytics summary

```typescript
interface PaymentAnalytics {
  totalRequests: number;
  pendingRequests: number;
  verifiedRequests: number;
  rejectedRequests: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}
```

#### PUT /api/admin/payments/requests/:id/verify
**Purpose:** Verify a payment request  
**Authentication:** Admin role required  
**Body:** `{ adminNotes?: string }`  
**Response:** Updated payment request status

#### PUT /api/admin/payments/requests/:id/reject
**Purpose:** Reject a payment request  
**Authentication:** Admin role required  
**Body:** `{ adminNotes?: string }`  
**Response:** Updated payment request status

#### POST /api/admin/payments/credits/add
**Purpose:** Manually add credits to a user account  
**Authentication:** Admin role required  
**Body:** `{ email: string, credits: number, planType?: string, expiresAt?: string }`  
**Response:** Credit addition confirmation

### Security Features
- **JWT Authentication:** All endpoints require valid admin tokens
- **Role-Based Access:** Only admin users can access payment endpoints
- **Row Level Security:** Database policies enforce admin-only data access
- **Audit Trail:** All payment actions are logged with admin ID and timestamps
- **Input Validation:** Server-side validation for all payment operations

### Implementation Status
- ✅ **Database Schema:** Complete with RLS policies
- ✅ **API Endpoints:** All 5 endpoints fully implemented
- ✅ **Real Data Integration:** No mock data, all operations use database
- ✅ **Authentication:** JWT token validation with admin role checking
- ✅ **Error Handling:** Comprehensive error handling and logging
- ✅ **Frontend Integration:** Admin UI fully connected to backend
- ✅ **Testing:** Complete test interface available

### Usage Example
```typescript
// Verify a payment request
const response = await fetch('/api/admin/payments/requests/123/verify', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    adminNotes: 'Payment verified successfully'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Payment verified:', result.data);
}
```

---

## 🎯 Points Management System

### Points System Overview

The Points Management System is a comprehensive admin-controlled credit system that replaces traditional payment processing. It provides researchers with a flexible, secure way to manage study creation costs while giving administrators full control over point distribution and usage. **Status: ✅ ENHANCED PRODUCTION READY (January 2025)**

### Points System Features

- **Admin-Controlled Point Assignment**: Administrators can assign points to researchers with expiration dates
- **Dynamic Cost Calculation**: Automatic calculation of study creation costs based on blocks and participants
- **Comprehensive Transaction Tracking**: Full audit trail of all point operations
- **Balance Management**: Real-time balance tracking with automatic updates
- **Point Expiration**: Automatic expiration of unused points with configurable timeouts
- **Usage Analytics**: Detailed statistics and reporting for administrators
- **Security First**: Row-level security policies and proper access controls

### Points Database Schema

#### Points Balance Table

```sql
-- Core balance tracking table
CREATE TABLE points_balance (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    expired_points INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints for data integrity
    CONSTRAINT chk_points_balance_non_negative 
        CHECK (total_points >= 0 AND available_points >= 0 AND used_points >= 0 AND expired_points >= 0),
    CONSTRAINT chk_points_balance_consistency 
        CHECK (total_points = available_points + used_points + expired_points)
);
```

#### Points Transactions Table
```sql
-- Transaction audit trail table
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('assigned', 'consumed', 'earned', 'spent', 'expired', 'refunded', 'admin_assigned', 'admin_deducted')),
    amount INTEGER NOT NULL CHECK (amount != 0),
    balance INTEGER NOT NULL,
    reason TEXT NOT NULL,
    study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Database Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_points_balance_user_id ON points_balance(user_id);
CREATE INDEX idx_points_balance_available_points ON points_balance(available_points);
CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_type ON points_transactions(type);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX idx_points_transactions_user_type_created ON points_transactions(user_id, type, created_at DESC);
```

### API Endpoints

#### Core User Endpoints

**GET /api/points?action=balance**
- **Purpose**: Get current user's points balance
- **Authentication**: User token required
- **Response**: User balance with current, earned, and spent points

```typescript
interface PointsBalanceResponse {
  success: boolean;
  balance: {
    userId: string;
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    lastUpdated: string;
  };
}
```

**POST /api/points?action=calculate-cost**
- **Purpose**: Calculate cost for creating a study
- **Authentication**: User token required
- **Body**: `{ blockCount: number, participantCount: number }`
- **Response**: Detailed cost breakdown

```typescript
interface StudyCostResponse {
  success: boolean;
  cost: {
    blockCount: number;
    participantCount: number;
    baseCost: number;
    blockCost: number;
    participantCost: number;
    totalCost: number;
  };
}
```

**POST /api/points?action=spend**
- **Purpose**: Spend points for study creation (enhanced version of consume)
- **Authentication**: User token required
- **Body**: `{ amount: number, reason: string, studyId?: string, blockCount?: number, participantCount?: number }`
- **Response**: Transaction confirmation and new balance

**POST /api/points?action=consume**
- **Purpose**: Consume points for any operation
- **Authentication**: User token required
- **Body**: `{ amount: number, reason: string, studyId?: string }`
- **Response**: Transaction confirmation and new balance

**GET /api/points?action=history**
- **Purpose**: Get user's transaction history
- **Authentication**: User token required
- **Query Parameters**: `limit`, `offset`
- **Response**: Paginated transaction history

**GET /api/points?action=stats**
- **Purpose**: Get user's usage statistics
- **Authentication**: User token required
- **Response**: Usage analytics summary

```typescript
interface UsageStatsResponse {
  success: boolean;
  stats: {
    studiesCreated: number;
    pointsSpent: number;
    pointsEarned: number;
    averageCostPerStudy: number;
  };
}
```

#### Administrative Endpoints

**POST /api/points?action=assign**
- **Purpose**: Assign points to a user
- **Authentication**: Admin role required
- **Body**: `{ targetUserId?: string, userEmail?: string, amount: number, reason: string, expiresInDays?: number }`
- **Response**: Assignment confirmation

**GET /api/points?action=admin-balances**
- **Purpose**: Get all user balances for admin overview
- **Authentication**: Admin role required
- **Response**: List of all user balances with user details

**GET /api/points?action=admin-transactions**
- **Purpose**: Get all transactions for admin monitoring
- **Authentication**: Admin role required
- **Query Parameters**: `limit`, `offset`
- **Response**: Paginated transaction history for all users

**POST /api/points?action=expire-points**
- **Purpose**: Manually expire points for a user
- **Authentication**: Admin role required
- **Body**: `{ userId: string, amount: number, reason: string }`
- **Response**: Expiration confirmation

### Security Features

#### Row Level Security (RLS)
- **Points Balance**: Users can only access their own balance; admins can access all
- **Transactions**: Users can only view their own transactions; admins can view all
- **Insert Permissions**: Users can only create transactions for themselves; admins can create for any user

#### Authentication & Authorization
- **JWT Token Validation**: All endpoints require valid authentication tokens
- **Role-Based Access Control**: Admin-only endpoints properly protected
- **Input Validation**: Server-side validation for all parameters
- **SQL Injection Prevention**: Parameterized queries throughout

#### Data Integrity
- **Database Constraints**: Prevent negative balances and inconsistent data
- **Atomic Transactions**: All operations use database transactions
- **Audit Trail**: Complete transaction history maintained
- **Balance Reconciliation**: Automatic balance updates via triggers

### Cost Calculation Logic

#### Default Pricing Structure
```typescript
const POINTS_CONFIG = {
  STUDY_BASE_COST: 10,           // Base cost per study
  COST_PER_BLOCK: 2,             // Cost per block after free blocks
  COST_PER_PARTICIPANT: 1,       // Cost per participant after free participants
  MAX_BLOCKS_FREE: 5,            // Free blocks included
  MAX_PARTICIPANTS_FREE: 10,     // Free participants included
  EXPIRATION_DAYS_DEFAULT: 365   // Default expiration period
};
```

#### Cost Calculation Formula
```typescript
const calculateStudyCost = (blockCount, participantCount) => {
  const baseCost = POINTS_CONFIG.STUDY_BASE_COST;
  const blockCost = Math.max(0, blockCount - POINTS_CONFIG.MAX_BLOCKS_FREE) * POINTS_CONFIG.COST_PER_BLOCK;
  const participantCost = Math.max(0, participantCount - POINTS_CONFIG.MAX_PARTICIPANTS_FREE) * POINTS_CONFIG.COST_PER_PARTICIPANT;
  const totalCost = baseCost + blockCost + participantCost;
  
  return { baseCost, blockCost, participantCost, totalCost };
};
```

### Implementation Status

#### ✅ Completed Features
- **Core API Endpoints**: All 10 endpoints fully implemented and tested
- **Database Schema**: Complete with RLS policies, constraints, and indexes
- **Authentication System**: JWT validation with role-based access control
- **Transaction Management**: Atomic operations with audit trail
- **Cost Calculation**: Dynamic pricing with configurable parameters
- **Usage Analytics**: Comprehensive statistics and reporting
- **Admin Interface**: Complete administrative control panel
- **Frontend Integration**: Service layer with proper error handling
- **Security Measures**: RLS policies, input validation, and access controls
- **Database Optimization**: Indexes, constraints, and performance tuning

#### 🔄 Enhanced Features (January 2025)
- **API-Frontend Contract Alignment**: Fixed data structure mismatches
- **Missing Endpoint Implementation**: Added calculate-cost, spend, stats, admin-transactions
- **Transaction Type Consistency**: Standardized transaction types across system
- **Point Expiration Management**: Complete expiration handling with automated cleanup
- **Advanced Analytics**: Enhanced usage statistics and admin reporting
- **Database Triggers**: Automatic balance updates and consistency checks
- **Stored Procedures**: Common operations optimized for performance

#### 🚀 Advanced Features (Future Roadmap)
- **Real-time Updates**: WebSocket integration for live balance updates
- **Point Transfers**: User-to-user point transfers
- **Bulk Operations**: Admin bulk point assignment and management
- **Advanced Analytics**: Detailed reporting and trend analysis
- **API Rate Limiting**: Enhanced security with request throttling
- **Point Rewards**: Automated point earning for user actions

### Usage Examples

#### Frontend Service Integration
```typescript
// Check balance before study creation
const balanceResponse = await pointsService.getBalance();
if (!balanceResponse.success) {
  throw new Error('Failed to fetch balance');
}

// Calculate study cost
const costResponse = await pointsService.calculateStudyCost(8, 25);
if (!costResponse.success) {
  throw new Error('Failed to calculate cost');
}

// Check if user has sufficient points
const sufficientPoints = await pointsService.checkSufficientPoints(costResponse.cost.totalCost);
if (!sufficientPoints.sufficient) {
  throw new Error(`Insufficient points. Need ${sufficientPoints.shortfall} more points.`);
}

// Spend points for study creation
const spendResponse = await pointsService.spendPoints(
  costResponse.cost.totalCost,
  'Study creation',
  studyId
);
```

#### Admin Point Assignment
```typescript
// Admin assigns points to researcher
const response = await fetch('/api/points?action=assign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userEmail: 'researcher@example.com',
    amount: 100,
    reason: 'Monthly point allocation',
    expiresInDays: 30
  })
});

const result = await response.json();
if (result.success) {
  console.log('Points assigned successfully:', result.message);
}
```

#### Database Query Examples
```sql
-- Get user's current balance
SELECT * FROM get_user_points_balance('user-uuid-here');

-- Check if user has sufficient points
SELECT check_sufficient_points('user-uuid-here', 25);

-- Get recent transactions for all users (admin view)
SELECT * FROM recent_points_transactions LIMIT 50;

-- Get points summary for all users
SELECT * FROM user_points_summary ORDER BY available_points DESC;
```

### Migration and Deployment

#### Database Migration
```sql
-- Apply the enhanced points system migration
-- File: database/migrations/points-system-enhancement.sql
\i database/migrations/points-system-enhancement.sql;
```

#### API Deployment
```bash
# Deploy the enhanced points API
# File: api/points-improved.js
# Replace the existing api/points.js with api/points-improved.js

# Verify deployment
curl -X GET "https://your-domain.com/api/points?action=balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testing and Validation

#### Test Coverage
- **Unit Tests**: All API endpoints tested with various scenarios
- **Integration Tests**: Database operations and transaction consistency
- **Security Tests**: Authentication, authorization, and RLS policies
- **Performance Tests**: Load testing with concurrent operations
- **Error Handling**: Edge cases and error scenarios

#### Test Data Setup
```sql
-- Create test users with different point balances
INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
VALUES 
  ('test-user-1', 100, 75, 20, 5),
  ('test-user-2', 50, 50, 0, 0),
  ('test-user-3', 200, 150, 40, 10);
```

### Monitoring and Maintenance

#### Key Metrics
- **Total Points in System**: Sum of all user balances
- **Active Users**: Users with non-zero balances
- **Transaction Volume**: Daily/weekly/monthly transaction counts
- **Average Study Cost**: Cost trends over time
- **Point Utilization**: Percentage of assigned points used

#### Maintenance Tasks
- **Point Expiration**: Automated cleanup of expired points
- **Balance Reconciliation**: Regular balance verification
- **Transaction Audit**: Monthly transaction reviews
- **Performance Monitoring**: Query performance and optimization
- **Security Audits**: Regular security policy reviews

This comprehensive points system provides a robust, secure, and scalable foundation for managing study creation costs while maintaining full administrative control and detailed audit trails.
