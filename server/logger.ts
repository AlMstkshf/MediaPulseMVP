/**
 * Logger utility for the application
 * 
 * This module provides standardized logging functionality across the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Default to INFO in production, DEBUG in development
const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// Get configured log level from environment or use default
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || DEFAULT_LOG_LEVEL 
  : DEFAULT_LOG_LEVEL;

// Adds timestamp and log level to messages
const formatLogMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

export const logger = {
  error(message: string, meta?: any): void {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const formattedMessage = formatLogMessage('ERROR', message);
      console.error(formattedMessage, meta ? meta : '');
    }
  },
  
  warn(message: string, meta?: any): void {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const formattedMessage = formatLogMessage('WARN', message);
      console.warn(formattedMessage, meta ? meta : '');
    }
  },
  
  info(message: string, meta?: any): void {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const formattedMessage = formatLogMessage('INFO', message);
      console.log(formattedMessage, meta ? meta : '');
    }
  },
  
  debug(message: string, meta?: any): void {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const formattedMessage = formatLogMessage('DEBUG', message);
      console.log(formattedMessage, meta ? meta : '');
    }
  }
};

export default logger;