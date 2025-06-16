/**
 * Client-side error tracking functionality for Media Pulse
 * Uses Sentry to track and report client-side errors
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for client-side error tracking
 */
export const initializeErrorTracking = () => {
  // Only initialize in production environment and if Sentry DSN is available
  if (
    (import.meta.env.PROD || import.meta.env.MODE === 'production') &&
    import.meta.env.VITE_SENTRY_DSN
  ) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN as string,
      integrations: [
        new BrowserTracing({
          // Set sampling based on URL to avoid excessive tracking
          tracingOrigins: ['localhost', 'mediapulse.com'],
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Sample 10% of transactions for performance monitoring
      // Only send errors in production
      enabled: import.meta.env.PROD || import.meta.env.MODE === 'production',
      // Set the environment based on VITE_APP_ENV or NODE_ENV
      environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
      // Capture in-app breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Don't capture sensitive data in breadcrumbs
        if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
          // Sanitize URL to remove API keys or tokens
          if (breadcrumb.data?.url) {
            const url = new URL(breadcrumb.data.url);
            // Remove sensitive query parameters
            ['key', 'token', 'api_key', 'apikey', 'password'].forEach(param => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
              }
            });
            breadcrumb.data.url = url.toString();
          }
        }
        return breadcrumb;
      },
    });

    console.info('Sentry error tracking initialized');
  } else {
    console.info('Sentry error tracking disabled');
  }
};

/**
 * Set user context for error reporting
 * @param user User object containing id, email, and role
 */
export const setUserContext = (user: { 
  id: number; 
  email?: string; 
  username?: string; 
  role?: string;
}) => {
  if (
    (import.meta.env.PROD || import.meta.env.MODE === 'production') &&
    import.meta.env.VITE_SENTRY_DSN
  ) {
    Sentry.setUser({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });
  }
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUserContext = () => {
  if (
    (import.meta.env.PROD || import.meta.env.MODE === 'production') &&
    import.meta.env.VITE_SENTRY_DSN
  ) {
    Sentry.setUser(null);
  }
};

/**
 * Manually report an error to Sentry
 * @param error Error object or string
 * @param context Additional context information
 */
export const reportError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  // Create proper error object if string provided
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  // Capture with Sentry if enabled
  if (
    (import.meta.env.PROD || import.meta.env.MODE === 'production') &&
    import.meta.env.VITE_SENTRY_DSN
  ) {
    if (context) {
      Sentry.withScope(scope => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(errorObj);
      });
    } else {
      Sentry.captureException(errorObj);
    }
  }
  
  // Always log to console for debugging
  console.error('Error:', errorObj, context);
};

/**
 * Create error boundary component for React
 */
export const ErrorBoundary = Sentry.ErrorBoundary;