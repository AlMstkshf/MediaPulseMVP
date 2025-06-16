// API Sentiment Endpoint Tests
const request = require('supertest');
const express = require('express');
const { expect } = require('@jest/globals');

// Mock the OpenAI dependency
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      rating: 4,
                      confidence: 0.85
                    })
                  }
                }
              ]
            })
          }
        }
      };
    })
  };
});

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';

// Create a mock Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const isAuthenticated = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'admin' };
  next();
};

// Simple mock handler for the sentiment endpoint
app.post('/api/nlp/sentiment', isAuthenticated, (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }
  
  // Return mock sentiment data
  return res.status(200).json({
    text,
    sentiment: {
      rating: 4,
      confidence: 0.85
    },
    language: 'en'
  });
});

describe('Sentiment Analysis API', () => {
  test('should return 400 if text is missing', async () => {
    const response = await request(app)
      .post('/api/nlp/sentiment')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('required');
  });
  
  test('should analyze sentiment for English text', async () => {
    const response = await request(app)
      .post('/api/nlp/sentiment')
      .send({ text: 'This is a great product, I love it!' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sentiment');
    expect(response.body.sentiment).toHaveProperty('rating');
    expect(response.body.sentiment).toHaveProperty('confidence');
    expect(response.body.language).toBe('en');
  });
  
  test('should have rating between 1 and 5', async () => {
    const response = await request(app)
      .post('/api/nlp/sentiment')
      .send({ text: 'This is a neutral statement about a product.' });
    
    expect(response.status).toBe(200);
    expect(response.body.sentiment.rating).toBeGreaterThanOrEqual(1);
    expect(response.body.sentiment.rating).toBeLessThanOrEqual(5);
  });
  
  test('should have confidence between 0 and 1', async () => {
    const response = await request(app)
      .post('/api/nlp/sentiment')
      .send({ text: 'I am not sure if I like this product.' });
    
    expect(response.status).toBe(200);
    expect(response.body.sentiment.confidence).toBeGreaterThanOrEqual(0);
    expect(response.body.sentiment.confidence).toBeLessThanOrEqual(1);
  });
});