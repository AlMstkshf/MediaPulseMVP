/**
 * Replit Configuration Utilities
 * 
 * This module provides utilities for dynamically configuring the application
 * to work properly in the Replit environment.
 */

/**
 * Determine if the application is running in the Replit environment
 */
export function isRunningInReplit(): boolean {
  // Check if the URL contains 'replit', '.repl.co', or the custom domain
  const hostname = window.location.hostname;
  return hostname.includes('replit') || 
         hostname.includes('.repl.co') || 
         hostname.includes('almstkshf.com') ||
         hostname.includes('media-pulse');
}

/**
 * Get the base URL for API requests
 */
export function getApiBaseUrl(): string {
  // In Replit, API requests should go to the same origin
  if (isRunningInReplit()) {
    return window.location.origin;
  }
  
  // In development, use the environment variable or default
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
}

/**
 * Get the WebSocket URL
 */
export function getWebSocketUrl(): string {
  // In Replit or production (including custom domains), WebSocket connections should use the same hostname 
  // but with appropriate protocol based on whether the connection is secure
  if (isRunningInReplit()) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  
  // In development, use the environment variable or default
  return import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
}

/**
 * Get the complete WebSocket URL with path
 * @param path The path to append to the base URL
 */
export function getWebSocketUrlWithPath(path: string = '/ws'): string {
  return `${getWebSocketUrl()}${path}`;
}