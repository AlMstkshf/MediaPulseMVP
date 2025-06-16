import supertest from 'supertest';
import express from 'express';
import { pool } from '../../../server/db';
import { registerRoutes } from '../../../server/routes';

// Mock the services used in the sentiment analysis routes
jest.mock('../../../server/services/nlp-service', () => ({
  analyzeSentiment: jest.fn().mockImplementation(async (text, language) => {
    if (text.includes('positive')) {
      return { sentiment: 'positive', score: 0.85, confidence: 0.92 };
    } else if (text.includes('negative')) {
      return { sentiment: 'negative', score: 0.25, confidence: 0.88 };
    } else {
      return { sentiment: 'neutral', score: 0.50, confidence: 0.75 };
    }
  }),
}));

// Mock the database pool
jest.mock('../../../server/db', () => ({
  pool: {
    query: jest.fn(),
  },
  db: {
    query: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock the authentication middleware
const mockAuthMiddleware = jest.fn((req, res, next) => next());

describe('Sentiment Analysis API Routes', () => {
  let app: express.Express;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    // Create an Express app and register the routes
    app = express();
    app.use(express.json());
    
    // Mock the isAuthenticated middleware
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = { id: 1, username: 'testuser', role: 'admin' };
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

  describe('POST /api/analysis/sentiment', () => {
    test('should analyze sentiment of positive text', async () => {
      const response = await request
        .post('/api/analysis/sentiment')
        .send({
          text: 'This is a positive sentiment text',
          language: 'en'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sentiment: 'positive',
        score: 0.85,
        confidence: 0.92,
        language: 'en'
      });
    });

    test('should analyze sentiment of negative text', async () => {
      const response = await request
        .post('/api/analysis/sentiment')
        .send({
          text: 'This is a negative sentiment text',
          language: 'en'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sentiment: 'negative',
        score: 0.25,
        confidence: 0.88,
        language: 'en'
      });
    });

    test('should handle empty text', async () => {
      const response = await request
        .post('/api/analysis/sentiment')
        .send({
          text: '',
          language: 'en'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Text is required');
    });
  });

  describe('GET /api/sentiment-analysis', () => {
    test('should return sentiment analysis statistics', async () => {
      // Mock the database response
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { sentiment: 'positive', count: 45 },
          { sentiment: 'neutral', count: 30 },
          { sentiment: 'negative', count: 25 }
        ]
      }).mockResolvedValueOnce({
        rows: [
          { date: '2025-03-01', positive: 42, neutral: 33, negative: 25 },
          { date: '2025-03-02', positive: 48, neutral: 28, negative: 24 }
        ]
      }).mockResolvedValueOnce({
        rows: [
          { platform: 'twitter', positive: 48, neutral: 27, negative: 25 },
          { platform: 'facebook', positive: 52, neutral: 33, negative: 15 }
        ]
      }).mockResolvedValueOnce({
        rows: [
          { entity: 'Dubai', positive: 65, neutral: 27, negative: 8 },
          { entity: 'Tourism', positive: 58, neutral: 32, negative: 10 }
        ]
      });

      const response = await request
        .get('/api/sentiment-analysis')
        .query({
          dateFrom: '2025-03-01',
          dateTo: '2025-03-31',
          platform: 'twitter',
          entity: 'Dubai'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overall');
      expect(response.body).toHaveProperty('trend');
      expect(response.body).toHaveProperty('byPlatform');
      expect(response.body).toHaveProperty('byEntity');
      
      // Check specific data
      expect(response.body.overall).toEqual({
        positive: 45,
        neutral: 30,
        negative: 25
      });
      
      expect(response.body.trend).toHaveLength(2);
      expect(response.body.byPlatform).toHaveLength(2);
      expect(response.body.byEntity).toHaveLength(2);
    });

    test('should handle database errors', async () => {
      // Mock the database to throw an error
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request
        .get('/api/sentiment-analysis');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Failed to fetch sentiment analysis data');
    });
  });
});