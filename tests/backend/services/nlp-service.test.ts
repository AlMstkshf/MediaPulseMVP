import { analyzeSentiment, detectLanguage, extractEntities } from '../../../server/services/nlp-service';

// Mock external service modules
jest.mock('@google-cloud/language', () => {
  return {
    LanguageServiceClient: jest.fn().mockImplementation(() => ({
      analyzeSentiment: jest.fn().mockResolvedValue([{
        documentSentiment: {
          score: 0.8,
          magnitude: 0.9
        },
        language: 'en'
      }]),
      analyzeEntities: jest.fn().mockResolvedValue([{
        entities: [
          { name: 'Dubai', type: 'LOCATION', salience: 0.8 },
          { name: 'Tourism', type: 'ORGANIZATION', salience: 0.5 }
        ],
        language: 'en'
      }])
    }))
  };
});

jest.mock('@aws-sdk/client-comprehend', () => {
  return {
    ComprehendClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation((command) => {
        if (command.constructor.name === 'DetectSentimentCommand') {
          return Promise.resolve({
            Sentiment: 'POSITIVE',
            SentimentScore: {
              Positive: 0.85,
              Negative: 0.02,
              Neutral: 0.12,
              Mixed: 0.01
            }
          });
        } else if (command.constructor.name === 'DetectDominantLanguageCommand') {
          return Promise.resolve({
            Languages: [
              { LanguageCode: 'ar', Score: 0.95 },
              { LanguageCode: 'fa', Score: 0.05 }
            ]
          });
        } else if (command.constructor.name === 'DetectEntitiesCommand') {
          return Promise.resolve({
            Entities: [
              { Text: 'دبي', Type: 'LOCATION', Score: 0.95 },
              { Text: 'السياحة', Type: 'ORGANIZATION', Score: 0.82 }
            ]
          });
        }
        return Promise.resolve({});
      })
    })),
    DetectSentimentCommand: jest.fn(),
    DetectDominantLanguageCommand: jest.fn(),
    DetectEntitiesCommand: jest.fn()
  };
});

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  sentiment: 'positive',
                  confidence: 0.9,
                  entities: [
                    { name: 'Dubai', type: 'LOCATION', relevance: 0.85 },
                    { name: 'Tourism', type: 'TOPIC', relevance: 0.78 }
                  ]
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('NLP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeSentiment', () => {
    test('should analyze English text using Google Cloud NL API', async () => {
      const result = await analyzeSentiment('This is a very positive text about Dubai tourism.', 'en');
      
      expect(result).toHaveProperty('sentiment', 'positive');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result.score).toBeGreaterThan(0.5);
    });

    test('should analyze Arabic text using AWS Comprehend', async () => {
      const result = await analyzeSentiment('هذا نص إيجابي للغاية حول السياحة في دبي.', 'ar');
      
      expect(result).toHaveProperty('sentiment', 'positive');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result.score).toBeGreaterThan(0.5);
    });

    test('should use OpenAI for unknown languages', async () => {
      const result = await analyzeSentiment('Some text in an unknown language.', 'unknown');
      
      expect(result).toHaveProperty('sentiment', 'positive');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should handle service errors gracefully', async () => {
      // Mock a failure in Google Cloud API
      require('@google-cloud/language').LanguageServiceClient.mockImplementationOnce(() => ({
        analyzeSentiment: jest.fn().mockRejectedValue(new Error('API Error'))
      }));

      // It should fall back to OpenAI
      const result = await analyzeSentiment('This text should be analyzed by the fallback service.', 'en');
      
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('detectLanguage', () => {
    test('should detect language using AWS Comprehend', async () => {
      const result = await detectLanguage('هذا نص باللغة العربية.');
      
      expect(result).toHaveProperty('language', 'ar');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should handle service errors gracefully', async () => {
      // Mock a failure in AWS Comprehend
      const mockSend = jest.fn().mockRejectedValue(new Error('API Error'));
      require('@aws-sdk/client-comprehend').ComprehendClient.mockImplementationOnce(() => ({
        send: mockSend
      }));

      // It should return a default value
      const result = await detectLanguage('This is some text.');
      
      expect(result).toHaveProperty('language', 'en'); // Default fallback
      expect(result).toHaveProperty('confidence', 0.5); // Default confidence
    });
  });

  describe('extractEntities', () => {
    test('should extract entities from English text using Google Cloud NL API', async () => {
      const result = await extractEntities('Dubai Tourism is booming in 2025.', 'en');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', 'Dubai');
      expect(result[0]).toHaveProperty('type', 'LOCATION');
      expect(result[1]).toHaveProperty('name', 'Tourism');
      expect(result[1]).toHaveProperty('type', 'ORGANIZATION');
    });

    test('should extract entities from Arabic text using AWS Comprehend', async () => {
      const result = await extractEntities('السياحة في دبي مزدهرة في عام 2025.', 'ar');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', 'دبي');
      expect(result[0]).toHaveProperty('type', 'LOCATION');
      expect(result[1]).toHaveProperty('name', 'السياحة');
      expect(result[1]).toHaveProperty('type', 'ORGANIZATION');
    });

    test('should use OpenAI for unknown languages', async () => {
      const result = await extractEntities('Some text with entities.', 'unknown');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', 'Dubai');
      expect(result[0]).toHaveProperty('type', 'LOCATION');
      expect(result[1]).toHaveProperty('name', 'Tourism');
      expect(result[1]).toHaveProperty('type', 'TOPIC');
    });

    test('should handle service errors gracefully', async () => {
      // Mock a failure in Google Cloud API
      require('@google-cloud/language').LanguageServiceClient.mockImplementationOnce(() => ({
        analyzeEntities: jest.fn().mockRejectedValue(new Error('API Error'))
      }));

      // It should fall back to OpenAI
      const result = await extractEntities('This text should be analyzed by the fallback service.', 'en');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});