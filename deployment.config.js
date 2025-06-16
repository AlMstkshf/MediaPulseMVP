/**
 * Media Pulse Platform - Replit Deployment Configuration
 * 
 * This configuration ensures proper deployment in the Replit environment.
 * It helps avoid common issues with Replit's file watcher limits (ENOSPC errors)
 * and ensures the server is accessible through the Replit proxy.
 */

module.exports = {
  // Define the server deployment
  server: {
    // Port configuration
    port: 4000,
    host: '0.0.0.0',
    
    // Use a simplified server implementation in Replit
    // This avoids ENOSPC errors by not using file watchers
    useUnifiedServer: true,
    
    // Start command for Replit environment
    startCommand: 'bash start-reliable.sh',
    
    // Environment settings
    environment: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  },
  
  // Define paths to serve static content
  staticPaths: [
    { path: '/server/public', url: '/' },
    { path: '/uploads', url: '/uploads' }
  ],
  
  // WebSocket configuration
  websocket: {
    enabled: true,
    path: '/ws'
  },
  
  // Database configuration
  database: {
    type: 'postgresql',
    // Use environment variables for database connection
    useDatabaseUrl: true
  },
  
  // Features configuration
  features: {
    nlp: {
      enabled: true,
      // Use environment variables for API keys
      useApiKey: true
    },
    internationalization: {
      enabled: true,
      languages: ['en', 'ar']
    },
    websocketNotifications: {
      enabled: true
    }
  }
};