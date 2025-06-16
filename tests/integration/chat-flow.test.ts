import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock the services used in the chat flow
jest.mock('../../server/services/rasa-service', () => ({
  sendMessageToRasa: jest.fn().mockImplementation(async (message, sessionId, language) => {
    if (message.toLowerCase().includes('hello')) {
      return {
        intent: 'greeting',
        confidence: 0.95,
        entities: [],
        response: 'Hello! How can I help you today?'
      };
    } else if (message.toLowerCase().includes('kpi')) {
      return {
        intent: 'ask_kpi_report',
        confidence: 0.92,
        entities: [{ entity: 'report_type', value: 'kpi' }],
        response: 'I can help you with KPI reports. What time period are you interested in?'
      };
    } else if (message.toLowerCase().includes('sentiment')) {
      return {
        intent: 'analyze_sentiment',
        confidence: 0.90,
        entities: [{ entity: 'analysis_type', value: 'sentiment' }],
        response: 'I can analyze sentiment for you. Please provide the text or content you would like me to analyze.'
      };
    } else {
      return {
        intent: 'fallback',
        confidence: 0.60,
        entities: [],
        response: "I'm sorry, I didn't understand that. Could you please rephrase?"
      };
    }
  })
}));

// Mock the database operations
jest.mock('../../server/db', () => ({
  pool: {
    query: jest.fn().mockImplementation(async (query, params) => {
      // Mock chat history
      if (query.includes('SELECT') && query.includes('chat_messages')) {
        return {
          rows: [
            { id: 1, user_id: 1, message: 'Hello', role: 'user', timestamp: new Date(), session_id: 'test-session' },
            { id: 2, user_id: null, message: 'Hello! How can I help you today?', role: 'assistant', timestamp: new Date(), session_id: 'test-session' },
          ],
          rowCount: 2
        };
      }
      
      // Mock inserting chat message
      if (query.includes('INSERT INTO') && query.includes('chat_messages')) {
        return {
          rows: [{ id: 3, user_id: 1, message: params[0], role: params[1], timestamp: new Date(), session_id: params[2] }],
          rowCount: 1
        };
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
  },
}));

// Mock the action service
jest.mock('../../server/services/action-service', () => ({
  executeAction: jest.fn().mockImplementation(async (action, params) => {
    if (action === 'generate_kpi_report') {
      return {
        reportUrl: 'https://example.com/reports/kpi-123.pdf',
        reportType: 'KPI',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'analyze_text_sentiment') {
      return {
        sentiment: 'positive',
        score: 0.85,
        confidence: 0.92
      };
    } else {
      return { success: false, error: 'Unknown action' };
    }
  })
}));

describe('Chat Flow Integration Tests', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    // Create an Express app and register the routes
    app = express();
    app.use(express.json());
    
    // Mock the isAuthenticated middleware
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = { id: 1, username: 'testuser', role: 'user' };
      next();
    });
    
    await registerRoutes(app);
    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up
    jest.restoreAllMocks();
  });

  describe('Complete Chat Flows', () => {
    test('should handle a simple greeting conversation', async () => {
      // User sends a greeting
      const response1 = await request
        .post('/api/chat/message')
        .send({
          message: 'Hello there',
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response1.status).toBe(200);
      expect(response1.body).toHaveProperty('response', 'Hello! How can I help you today?');
      expect(response1.body).toHaveProperty('intent', 'greeting');
      
      // Get chat history to verify the conversation was saved
      const historyResponse = await request
        .get('/api/chat/history')
        .query({ sessionId: 'test-session' });
      
      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body).toHaveProperty('messages');
      expect(historyResponse.body.messages).toHaveLength(2);
    });

    test('should handle a KPI report request flow', async () => {
      // User asks for KPI report
      const response1 = await request
        .post('/api/chat/message')
        .send({
          message: 'I need a KPI report for last month',
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response1.status).toBe(200);
      expect(response1.body).toHaveProperty('intent', 'ask_kpi_report');
      
      // User confirms report generation
      const response2 = await request
        .post('/api/chat/action')
        .send({
          action: 'generate_kpi_report',
          parameters: {
            periodStart: '2025-04-01',
            periodEnd: '2025-04-30',
            reportType: 'monthly'
          },
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty('reportUrl');
      expect(response2.body.reportUrl).toContain('reports/kpi-');
    });

    test('should handle a sentiment analysis flow', async () => {
      // User asks for sentiment analysis
      const response1 = await request
        .post('/api/chat/message')
        .send({
          message: 'Can you do sentiment analysis on this news article?',
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response1.status).toBe(200);
      expect(response1.body).toHaveProperty('intent', 'analyze_sentiment');
      
      // User provides text for analysis
      const response2 = await request
        .post('/api/chat/action')
        .send({
          action: 'analyze_text_sentiment',
          parameters: {
            text: 'This is a great product that exceeds all expectations. The service was excellent too!',
            language: 'en'
          },
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty('sentiment', 'positive');
      expect(response2.body).toHaveProperty('score');
      expect(response2.body).toHaveProperty('confidence');
    });

    test('should handle multilingual conversation (Arabic)', async () => {
      // Mock the Rasa service for Arabic
      require('../../server/services/rasa-service').sendMessageToRasa.mockImplementationOnce(
        async (message, sessionId, language) => {
          return {
            intent: 'greeting',
            confidence: 0.95,
            entities: [],
            response: 'مرحبا! كيف يمكنني مساعدتك اليوم؟'
          };
        }
      );

      // User sends a greeting in Arabic
      const response = await request
        .post('/api/chat/message')
        .send({
          message: 'مرحبا',
          sessionId: 'test-session-ar',
          language: 'ar'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response', 'مرحبا! كيف يمكنني مساعدتك اليوم؟');
      expect(response.body).toHaveProperty('intent', 'greeting');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing message parameter', async () => {
      const response = await request
        .post('/api/chat/message')
        .send({
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Message is required');
    });

    test('should handle service unavailability', async () => {
      // Mock service failure
      require('../../server/services/rasa-service').sendMessageToRasa.mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const response = await request
        .post('/api/chat/message')
        .send({
          message: 'Hello',
          sessionId: 'test-session',
          language: 'en'
        });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Failed to process chat message');
    });
  });
});