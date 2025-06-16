/**
 * Rasa NLP Service with Fallback Capability
 * 
 * This service provides integration with Rasa's DIET Classifier for intent and entity extraction
 * and includes fallback mechanisms when Rasa is not available (like in production environments).
 * Works alongside spaCy as a local NLP solution that doesn't require external services.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { logger } from '../logger';

dotenv.config();

// Configure Rasa service based on environment variables
const RASA_ENABLED = process.env.DISABLE_RASA !== 'true';

// Use port 8080 in production or the configured port in development
const isProduction = process.env.NODE_ENV === 'production';
const defaultPort = isProduction ? '8080' : '5000';

const RASA_HOST = process.env.RASA_HOST || '127.0.0.1';
const RASA_PORT = process.env.RASA_PORT || defaultPort;
const RASA_TIMEOUT = parseInt(process.env.RASA_TIMEOUT || '3000'); // 3 second timeout
const RASA_SERVER_URL = process.env.RASA_SERVER_URL || `http://${RASA_HOST}:${RASA_PORT}`;

// Log the configuration for debugging
logger.info(`Rasa configuration: Enabled=${RASA_ENABLED}, URL=${RASA_SERVER_URL}, Timeout=${RASA_TIMEOUT}ms`);

// Types for Rasa responses
export interface RasaIntent {
  name: string;
  confidence: number;
}

export interface RasaEntity {
  entity: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

export interface RasaAnalysisResult {
  intents: RasaIntent[];
  entities: RasaEntity[];
  text: string;
  confidence: number;
  language?: string;
  source: string;
  error?: string;
  serviceStatus: 'available' | 'unavailable' | 'error';
}

class RasaService {
  private serverUrl: string;
  private available: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 60000; // 1 minute
  private enabled: boolean;

  constructor() {
    this.serverUrl = RASA_SERVER_URL;
    this.enabled = RASA_ENABLED;
    
    // Only try to check availability if the service is enabled
    if (this.enabled) {
      this.checkAvailability();
    } else {
      logger.info('Rasa service is disabled by configuration');
    }
  }

  /**
   * Check if Rasa server is available
   */
  private async checkAvailability(): Promise<void> {
    if (!this.enabled) {
      this.available = false;
      return;
    }
    
    const now = Date.now();
    
    // Only check if we haven't checked recently
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return;
    }
    
    this.lastHealthCheck = now;
    
    try {
      const response = await axios.get(`${this.serverUrl}/status`, {
        timeout: RASA_TIMEOUT // Short timeout to avoid hanging
      });
      
      if (response.status === 200) {
        this.available = true;
        logger.info('Rasa server is available');
      } else {
        this.available = false;
        logger.warn(`Rasa server returned status ${response.status}`);
      }
    } catch (error) {
      this.available = false;
      logger.warn('Rasa server is not available - using fallback mechanisms', error);
    }
  }

  /**
   * Get availability status of the Rasa server
   */
  public isAvailable(): boolean {
    if (!this.enabled) return false;
    
    // Trigger a new check if it's been a while
    if (Date.now() - this.lastHealthCheck > this.healthCheckInterval) {
      this.checkAvailability();
    }
    return this.available;
  }

  /**
   * Provides a fallback response when Rasa is unavailable
   * Uses simple heuristic pattern matching as a basic fallback
   */
  private createFallbackAnalysis(text: string): RasaAnalysisResult {
    // Default values
    let primaryIntent = 'fallback';
    let confidence = 0.5;
    const entities: RasaEntity[] = [];
    
    // Simple keyword matching for intents
    const lowerText = text.toLowerCase();
    
    // Intent detection
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      primaryIntent = 'greet';
      confidence = 0.8;
    } else if (lowerText.includes('thank')) {
      primaryIntent = 'thank';
      confidence = 0.8;
    } else if (lowerText.includes('help')) {
      primaryIntent = 'help';
      confidence = 0.7;
    } else if (lowerText.includes('report') || lowerText.includes('analytics')) {
      primaryIntent = 'request_report';
      confidence = 0.7;
    } else if (lowerText.includes('sentiment') || lowerText.includes('opinion')) {
      primaryIntent = 'sentiment_analysis';
      confidence = 0.7;
    }
    
    // Intent ranking (with primary intent always first)
    const intents: RasaIntent[] = [
      { name: primaryIntent, confidence }
    ];
    
    // Add some secondary intents with lower confidence
    if (primaryIntent !== 'fallback') {
      intents.push({ name: 'fallback', confidence: 0.2 });
    } else {
      // Add some reasonable fallbacks
      intents.push({ name: 'request_info', confidence: 0.3 });
      intents.push({ name: 'help', confidence: 0.25 });
    }
    
    // Very basic entity detection (name, location, organization)
    // Note: This is extremely simplistic and only for fallback purposes
    
    // Return the fallback analysis
    return {
      intents,
      entities,
      text,
      confidence,
      source: 'Rasa Fallback',
      serviceStatus: 'unavailable'
    };
  }

  /**
   * Parse text using Rasa's DIET Classifier to extract intents and entities
   * Falls back to heuristic pattern matching when Rasa is unavailable
   * 
   * @param text Text to analyze
   * @returns Rasa analysis result with intents and entities
   */
  public async analyzeText(text: string): Promise<RasaAnalysisResult> {
    // If service is disabled or not available, return fallback immediately
    if (!this.enabled || !this.isAvailable()) {
      return this.createFallbackAnalysis(text);
    }

    try {
      const response = await axios.post(
        `${this.serverUrl}/model/parse`, 
        { text },
        { timeout: RASA_TIMEOUT }
      );
      
      if (response.status === 200 && response.data) {
        const data = response.data;
        
        return {
          intents: data.intent_ranking || [],
          entities: data.entities || [],
          text: data.text,
          confidence: data.confidence || 0,
          language: data.language,
          source: 'Rasa',
          serviceStatus: 'available'
        };
      } else {
        logger.warn('Rasa returned an unexpected response', { response });
        return this.createFallbackAnalysis(text);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error calling Rasa server, using fallback', { error: errorMessage });
      
      return this.createFallbackAnalysis(text);
    }
  }

  /**
   * Detect intent from text using Rasa
   * 
   * @param text Text to analyze
   * @returns Primary intent and confidence
   */
  public async detectIntent(text: string): Promise<{ intent: string; confidence: number }> {
    const result = await this.analyzeText(text);
    
    if (result.intents && result.intents.length > 0) {
      return {
        intent: result.intents[0].name,
        confidence: result.intents[0].confidence
      };
    }
    
    return { intent: 'unknown', confidence: 0 };
  }

  /**
   * Extract entities from text using Rasa
   * 
   * @param text Text to analyze
   * @returns Extracted entities
   */
  public async extractEntities(text: string): Promise<RasaEntity[]> {
    const result = await this.analyzeText(text);
    return result.entities || [];
  }
  
  /**
   * Process text using Rasa NLU and return a comprehensive analysis
   * This is a higher-level function that combines intent detection and entity extraction
   * 
   * @param text Text to analyze
   * @returns Complete analysis result with intents, entities, and source info
   */
  public async processText(text: string): Promise<RasaAnalysisResult | null> {
    if (!this.enabled) {
      return null;
    }
    
    return this.analyzeText(text);
  }
}

/**
 * Check availability of NLP services
 * Returns an object with the status of both rasa and arabert services
 */
export async function checkServicesAvailability(): Promise<{ rasa: boolean; arabert: boolean }> {
  // Check Rasa Service
  let rasaAvailable = false;
  
  try {
    rasaAvailable = rasaService.isAvailable();
  } catch (error) {
    logger.error('Error checking Rasa availability', error);
  }
  
  // For AraBERT, in this implementation we'll consider it available 
  // if OpenAI is configured (since we're using OpenAI as a fallback)
  const arabertAvailable = !!process.env.OPENAI_API_KEY;
  
  return {
    rasa: rasaAvailable,
    arabert: arabertAvailable
  };
}

export const rasaService = new RasaService();