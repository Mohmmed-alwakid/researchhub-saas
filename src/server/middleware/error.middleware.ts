import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new APIError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Log error for debugging
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user ? req.user._id : 'anonymous'
  });

  // Handle different error types
  if (error instanceof APIError) {
    // Custom API errors
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'API_ERROR';
    details = error.details;
  } else if (error instanceof mongoose.Error.ValidationError) {
    // Mongoose validation errors
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {} as any);
  } else if (error instanceof mongoose.Error.CastError) {
    // Mongoose cast errors (invalid ObjectId, etc.)
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
    code = 'CAST_ERROR';
  } else if ((error as any).code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = 'Duplicate field value entered';
    code = 'DUPLICATE_ERROR';
    
    // Extract field name from error
    const field = Object.keys((error as any).keyValue)[0];
    details = { field, value: (error as any).keyValue[field] };
  } else if (error.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    message = `File upload error: ${error.message}`;
    code = 'UPLOAD_ERROR';
  } else if ((error as any).type === 'StripeCardError') {
    // Stripe card errors
    statusCode = 400;
    message = `Payment error: ${error.message}`;
    code = 'PAYMENT_ERROR';
  } else if ((error as any).type === 'StripeInvalidRequestError') {
    // Stripe invalid request
    statusCode = 400;
    message = `Payment request error: ${error.message}`;
    code = 'PAYMENT_REQUEST_ERROR';
  }

  // Response object
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code,
      statusCode
    }
  };

  // Add details if available
  if (details) {
    errorResponse.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  // Add request ID if available
  if (req.headers['x-request-id']) {
    errorResponse.error.requestId = req.headers['x-request-id'];
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Validation error handler for express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().reduce((acc: any, error: any) => {
      acc[error.path || error.param] = error.msg;
      return acc;
    }, {});

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
    return;
  }

  next();
};

/**
 * Create standard API error responses
 */
export const createError = {
  badRequest: (message: string = 'Bad Request', details?: any) => 
    new APIError(message, 400, 'BAD_REQUEST', details),
    
  unauthorized: (message: string = 'Unauthorized') => 
    new APIError(message, 401, 'UNAUTHORIZED'),
    
  forbidden: (message: string = 'Forbidden') => 
    new APIError(message, 403, 'FORBIDDEN'),
    
  notFound: (message: string = 'Resource not found') => 
    new APIError(message, 404, 'NOT_FOUND'),
    
  conflict: (message: string = 'Conflict') => 
    new APIError(message, 409, 'CONFLICT'),
    
  tooManyRequests: (message: string = 'Too many requests') => 
    new APIError(message, 429, 'TOO_MANY_REQUESTS'),
    
  internal: (message: string = 'Internal Server Error') => 
    new APIError(message, 500, 'INTERNAL_ERROR'),
    
  serviceUnavailable: (message: string = 'Service Unavailable') => 
    new APIError(message, 503, 'SERVICE_UNAVAILABLE'),
    
  subscriptionRequired: (message: string = 'Active subscription required') => 
    new APIError(message, 402, 'SUBSCRIPTION_REQUIRED'),
    
  quotaExceeded: (message: string = 'Usage quota exceeded') => 
    new APIError(message, 429, 'QUOTA_EXCEEDED'),
    
  invalidInput: (message: string, details?: any) => 
    new APIError(message, 422, 'INVALID_INPUT', details),
    
  paymentRequired: (message: string = 'Payment required') => 
    new APIError(message, 402, 'PAYMENT_REQUIRED')
};

/**
 * Error logger middleware (for external services like Sentry)
 */
export const errorLogger = (
  error: Error,
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Log to external service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { req });
    console.error('Production error:', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: {
            message: 'Request timeout',
            code: 'REQUEST_TIMEOUT',
            statusCode: 408
          }
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Mongoose connection error handler
 */
export const handleMongooseErrors = (): void => {
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server & exit process
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Close server & exit process
    process.exit(1);
  });
};
