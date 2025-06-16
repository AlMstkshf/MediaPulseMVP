/**
 * Security middleware for the Media Pulse API
 * Implements various security headers and protections
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import xss from 'xss-clean';

/**
 * Configure and apply security middleware to Express app
 */
export const setupSecurityMiddleware = (app: any) => {
  // Set security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://*'],
          connectSrc: ["'self'", 'https://*'],
        },
      },
      crossOriginEmbedderPolicy: false, // For compatibility with certain iframe embeds
    })
  );

  // Set strict CORS policy
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Get origin from request
    const origin = req.headers.origin;
    
    // Only allow specific origins, or all origins in development
    if (
      process.env.NODE_ENV === 'development' || 
      (origin && (
        origin.endsWith('.mediapulse.com') || 
        origin === 'https://mediapulse.com'
      ))
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type,Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // Speed limiter for excessive requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes without delay
    delayMs: request => request.slowDown.current * 500, // Add 500ms of delay per request above threshold
  });

  // Apply speed limiting to API routes
  app.use('/api/', speedLimiter);

  // Prevent XSS attacks
  app.use(xss());

  // Add CSRF protection for non-GET requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'];
    const sessionToken = req.cookies?.['csrf-token']; // This should be set elsewhere in the app

    // Skip CSRF check in development or for API token requests
    if (
      process.env.NODE_ENV === 'development' ||
      req.path.startsWith('/api/auth/') ||
      req.headers['authorization']?.startsWith('Bearer ')
    ) {
      return next();
    }

    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return res.status(403).json({
        error: 'Invalid or missing CSRF token',
      });
    }

    next();
  });

  // Prevent clickjacking
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Add security logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    // Check for potential security risks in the response
    res.send = function (body) {
      // Log certain types of responses for security auditing
      if (res.statusCode >= 400) {
        console.warn(
          `Security log: ${req.method} ${req.path} returned ${res.statusCode}`,
          {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
          }
        );
      }

      return originalSend.call(this, body);
    };

    next();
  });
};