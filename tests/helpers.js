// Common test helpers and utilities
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../client/src/lib/queryClient';

/**
 * Custom render function that wraps the component with necessary providers
 * @param {React.ReactElement} ui - The React component to render
 * @param {Object} options - Additional options for render
 * @returns {Object} The render result
 */
export function renderWithProviders(ui, options = {}) {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return render(ui, { wrapper, ...options });
}

/**
 * Creates a mock WebSocket server for testing
 * @returns {Object} The mock WebSocket server
 */
export function createMockWebSocketServer() {
  const mockServer = {
    clients: new Set(),
    messages: [],
    
    // Methods to interact with the mock server
    connect(client) {
      this.clients.add(client);
      if (client.onopen) {
        client.onopen({});
      }
    },
    
    disconnect(client) {
      this.clients.delete(client);
      if (client.onclose) {
        client.onclose({});
      }
    },
    
    send(message, excludeClient = null) {
      this.messages.push(message);
      this.clients.forEach(client => {
        if (client !== excludeClient && client.onmessage) {
          client.onmessage({ data: message });
        }
      });
    },
    
    // Clear all state (useful between tests)
    reset() {
      this.clients.clear();
      this.messages = [];
    }
  };
  
  return mockServer;
}

/**
 * Mock data generator for different entity types
 */
export const mockData = {
  // User-related mocks
  users: [
    { id: 1, username: 'admin', fullName: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: 2, username: 'editor', fullName: 'Editor User', email: 'editor@example.com', role: 'editor' },
    { id: 3, username: 'user', fullName: 'Regular User', email: 'user@example.com', role: 'user' }
  ],
  
  // Social media post mocks
  socialPosts: [
    { 
      id: 1, 
      platform: 'twitter', 
      content: 'This is a positive tweet about Dubai tourism! #Dubai #Tourism',
      authorName: 'Travel Blogger',
      authorUsername: 'travelblogger',
      sentiment: 0.85,
      keywords: ['Dubai', 'Tourism'],
      postedAt: new Date('2025-04-05T10:30:00Z')
    },
    { 
      id: 2, 
      platform: 'facebook', 
      content: 'Mixed feelings about the new development in the city center.',
      authorName: 'Local Resident',
      authorUsername: 'localresident',
      sentiment: 0.5,
      keywords: ['Development', 'City'],
      postedAt: new Date('2025-04-02T14:15:00Z')
    },
    { 
      id: 3, 
      platform: 'instagram', 
      content: 'Disappointing service at the new hotel. Not worth the price. #BadExperience',
      authorName: 'Tourist',
      authorUsername: 'tourist123',
      sentiment: 0.2,
      keywords: ['Hotel', 'Service', 'Experience'],
      postedAt: new Date('2025-04-01T18:45:00Z')
    }
  ],
  
  // Sentiment analysis mocks
  sentimentData: {
    overall: {
      positive: 45,
      neutral: 30,
      negative: 25
    },
    trend: [
      { date: '2025-03-01', positive: 42, neutral: 33, negative: 25 },
      { date: '2025-03-02', positive: 48, neutral: 28, negative: 24 },
      { date: '2025-03-03', positive: 52, neutral: 26, negative: 22 }
    ],
    byPlatform: [
      { platform: 'twitter', positive: 48, neutral: 27, negative: 25 },
      { platform: 'facebook', positive: 52, neutral: 33, negative: 15 },
      { platform: 'instagram', positive: 40, neutral: 35, negative: 25 }
    ]
  },
  
  // Chat message mocks
  chatMessages: [
    { 
      id: 1, 
      message: 'Hello', 
      role: 'user', 
      timestamp: new Date('2025-05-10T10:00:00Z'),
      sessionId: 'test-session'
    },
    { 
      id: 2, 
      message: 'Hello! How can I help you today?', 
      role: 'assistant', 
      timestamp: new Date('2025-05-10T10:00:05Z'),
      sessionId: 'test-session'
    },
    { 
      id: 3, 
      message: 'I need a KPI report for last month', 
      role: 'user', 
      timestamp: new Date('2025-05-10T10:01:00Z'),
      sessionId: 'test-session'
    }
  ]
};

/**
 * Common test setup for API route tests
 */
export function setupApiTest() {
  // Mock the database
  jest.mock('../server/db', () => ({
    pool: {
      query: jest.fn().mockImplementation((query, params) => {
        if (query.includes('users')) {
          return { rows: mockData.users, rowCount: mockData.users.length };
        } else if (query.includes('social_posts')) {
          return { rows: mockData.socialPosts, rowCount: mockData.socialPosts.length };
        } else if (query.includes('chat_messages')) {
          return { rows: mockData.chatMessages, rowCount: mockData.chatMessages.length };
        }
        return { rows: [], rowCount: 0 };
      })
    },
    db: {
      query: jest.fn(),
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    }
  }));
  
  // Mock the authentication middleware
  const mockAuthMiddleware = (req, res, next) => {
    req.isAuthenticated = () => true;
    req.user = mockData.users[0]; // Default to admin user
    next();
  };
  
  return { mockAuthMiddleware };
}

/**
 * Helper to create a mock response object for testing Express routes
 */
export function createMockResponse() {
  const res = {
    statusCode: 200,
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    headers: {},
    set: jest.fn().mockImplementation(function(header, value) {
      this.headers[header] = value;
      return this;
    })
  };
  return res;
}

/**
 * Helper to create a mock request object for testing Express routes
 */
export function createMockRequest(options = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    cookies: {},
    session: { id: 'test-session' },
    user: mockData.users[0],
    isAuthenticated: () => true,
    ...options
  };
}