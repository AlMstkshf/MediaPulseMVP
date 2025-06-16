/**
 * Rasa NLU Service Adapter
 * 
 * This module provides a resilient interface to the Rasa NLU service with proper fallbacks
 * for environments where Rasa is not available.
 */

import axios from 'axios';
import { logger } from './logger';

// Configure Rasa service connection
const RASA_ENABLED = process.env.DISABLE_RASA !== 'true';
const RASA_HOST = process.env.RASA_HOST || '127.0.0.1';
const RASA_PORT = process.env.RASA_PORT || '5005';
const RASA_URL = `http://${RASA_HOST}:${RASA_PORT}`;

// Constants for default responses
const DEFAULT_INTENT = 'fallback';
const DEFAULT_CONFIDENCE = 0.5;

/**
 * Interface for Rasa response data
 */
interface RasaResponse {
  intent: {
    name: string;
    confidence: number;
  };
  entities: any[];
  text: string;
  intent_ranking: any[];
}

/**
 * Send a message to Rasa for intent classification
 * Falls back gracefully when Rasa is not available
 */
export async function classifyIntent(message: string): Promise<RasaResponse> {
  if (!RASA_ENABLED) {
    logger.warn('Rasa is disabled. Using fallback response.');
    return createFallbackResponse(message);
  }

  try {
    // Set a short timeout for Rasa requests to avoid long hanging requests
    const response = await axios.post(
      `${RASA_URL}/model/parse`,
      { text: message },
      { timeout: 3000 } // 3 second timeout
    );
    
    logger.info(`Rasa intent classified: ${response.data.intent.name}`);
    return response.data;
  } catch (error) {
    // If Rasa fails, log the error and use the fallback
    logger.error(`Rasa service error: ${(error as Error).message}`, { service: 'rasa' });
    return createFallbackResponse(message);
  }
}

/**
 * Create a fallback response when Rasa is unavailable
 */
function createFallbackResponse(message: string): RasaResponse {
  // Simple keyword matching as a fallback
  let intent = DEFAULT_INTENT;
  let confidence = DEFAULT_CONFIDENCE;

  // Basic keyword matching when Rasa is unavailable
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    intent = 'greet';
    confidence = 0.8;
  } else if (lowerMessage.includes('thank')) {
    intent = 'thank';
    confidence = 0.8;
  } else if (lowerMessage.includes('help')) {
    intent = 'help';
    confidence = 0.7;
  } else if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    intent = 'request_report';
    confidence = 0.7;
  } else if (lowerMessage.includes('sentiment') || lowerMessage.includes('opinion')) {
    intent = 'sentiment_analysis';
    confidence = 0.7;
  }

  return {
    intent: {
      name: intent,
      confidence: confidence
    },
    entities: [],
    text: message,
    intent_ranking: [{
      name: intent,
      confidence: confidence
    }]
  };
}

/**
 * Health check for Rasa service
 * Returns true if Rasa is available and responding
 */
export async function isRasaHealthy(): Promise<boolean> {
  if (!RASA_ENABLED) {
    return false;
  }
  
  try {
    const response = await axios.get(`${RASA_URL}/status`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    logger.warn('Rasa health check failed, service unavailable');
    return false;
  }
}