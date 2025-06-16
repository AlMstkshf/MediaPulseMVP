# Monitoring and Error Tracking Documentation

This document outlines the monitoring and error tracking setup for the Media Pulse platform.

## Table of Contents

1. [Error Tracking with Sentry](#error-tracking-with-sentry)
2. [Logging System](#logging-system)
3. [Security Monitoring](#security-monitoring)
4. [Performance Monitoring](#performance-monitoring)
5. [Operational Alerts](#operational-alerts)
6. [Client-Side Error Tracking](#client-side-error-tracking)
7. [Monitoring Dashboard](#monitoring-dashboard)

## Error Tracking with Sentry

The Media Pulse platform uses Sentry for comprehensive error tracking in both server and client environments.

### Server-Side Setup

The server-side error tracking is implemented in `server/middleware/errorHandling.ts`:

- Automatically captures and tracks all unhandled exceptions
- Groups similar errors and tracks occurrence frequency
- Provides detailed context including:
  - HTTP request data
  - User information (if available)
  - Environment details
  - Error stacktraces

### Configuration

To enable Sentry, set the `SENTRY_DSN` environment variable with your Sentry project DSN:

```
SENTRY_DSN=https://[key]@[organization].ingest.sentry.io/[project]
```

### Error Categorization

Errors are categorized as:

1. **Operational Errors**: Expected errors that are part of normal operation (e.g., validation errors, not found errors)
2. **Programming Errors**: Unexpected errors that indicate bugs or issues in the codebase

Only programming errors are sent to Sentry to avoid noise.

## Logging System

The Media Pulse platform uses a structured logging system implemented in `server/logger.ts`.

### Log Levels

- **Error**: Critical failures that require immediate attention
- **Warn**: Issues that don't cause service disruption but need investigation
- **Info**: Important application events (startup, shutdown, significant state changes)
- **Debug**: Detailed information useful for debugging

### Log Format

Logs are formatted as structured JSON objects with the following fields:

- `timestamp`: ISO 8601 date and time
- `level`: Log level (error, warn, info, debug)
- `message`: Human-readable log message
- `meta`: Additional structured data specific to the log entry

### Log Storage

In production, logs are:
- Written to log files with daily rotation
- Centralized in the ELK stack (Elasticsearch, Logstash, Kibana)
- Retained for 30 days

## Security Monitoring

Security monitoring is implemented in `server/middleware/security.ts`.

### Features

- Rate limiting to prevent abuse
- Speed limiting to prevent brute force attacks
- Security headers with Helmet
- XSS protection
- CSRF protection
- Detailed logging of security events

### Security Event Logging

Security events are logged with the following information:
- Event type
- IP address
- User agent
- Timestamp
- Request details
- Response code

## Performance Monitoring

The Media Pulse platform includes performance monitoring for critical operations:

### Key Metrics

- API response times
- Database query performance
- WebSocket connection statistics
- NLP processing times
- Media processing times

### Implementation

Performance metrics are collected using:
- Express middleware for API response times
- Database query logs
- Custom timing functions for critical operations

## Operational Alerts

Operational alerts are sent for critical issues that require immediate attention:

### Alert Triggers

- Server error rate exceeds threshold
- API endpoint response time exceeds threshold
- Database connection failures
- External API availability issues
- Memory usage exceeds threshold

### Alert Channels

Alerts are sent via:
- Email
- Slack
- SMS (for critical alerts)

## Client-Side Error Tracking

Client-side errors are tracked using Sentry's browser SDK.

### Implementation

The client-side error tracking is initialized in `client/src/lib/errorTracking.ts`:

```typescript
import * as Sentry from '@sentry/react';

export const initializeErrorTracking = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 0.1,
    });
  }
};
```

### User Context

When a user is authenticated, additional context is added:

```typescript
export const setUserContext = (user) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  }
};
```

## Monitoring Dashboard

A comprehensive monitoring dashboard is available at `/admin/monitoring` for administrators.

### Dashboard Features

- Real-time error rates
- API response times
- Active users
- System health metrics
- Security events
- Recent critical errors
- Performance bottlenecks

### Access Control

Access to the monitoring dashboard is restricted to users with the `admin` role.