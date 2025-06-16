/**
 * Error handling middleware for the Media Pulse API
 * Implements centralized error tracking, logging, and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../logger';

// Define a standard error structure for the API
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Initialize Sentry error tracking
 */
export const initializeErrorTracking = () => {
  // Only enable Sentry in production or staging
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        integrations: [
          // Enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // Enable Express.js middleware tracing
          new Sentry.Integrations.Express(),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.2, // Capture 20% of transactions for performance monitoring
      });
      
      logger.info('Sentry error tracking initialized');
    } else {
      logger.warn('Sentry DSN not found, error tracking disabled');
    }
  }
};

/**
 * Setup error handling middleware for Express
 */
export const setupErrorHandling = (app: any) => {
  // The Sentry request handler must be the first middleware on the app
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  // Global error handler - must be added after all controllers
  app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    // Default values
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';
    const details = err.details || null;
    
    // Determine if this is an operational error (expected error)
    const isOperational = err.isOperational === true;
    
    // Log the error
    if (statusCode >= 500) {
      logger.error(`Error: ${message}`, {
        code,
        statusCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
        details
      });
      
      // Send to Sentry only if it's a server error and not an operational error
      if (!isOperational && process.env.SENTRY_DSN) {
        Sentry.captureException(err);
      }
    } else {
      logger.warn(`Warning: ${message}`, {
        code,
        statusCode,
        path: req.path,
        method: req.method,
        details
      });
    }
    
    // Send error response to client
    res.status(statusCode).json({
      error: {
        message,
        code,
        statusCode,
        ...(details && { details }),
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  });

  // The Sentry error handler must be before any other error middleware
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
};

/**
 * Create a custom API error
 */
export const createApiError = (
  message: string,
  statusCode: number,
  code: string,
  details?: any,
  isOperational: boolean = true
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  error.isOperational = isOperational;
  return error;
};

/**
 * Async error handler for route handlers
 * Wraps an async function and catches any errors to pass to Express error handler
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found error handler - for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createApiError(
    `Not Found - ${req.originalUrl}`,
    404,
    'RESOURCE_NOT_FOUND'
  );
  next(error);
};