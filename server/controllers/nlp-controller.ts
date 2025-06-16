/**
 * NLP Controller
 * 
 * Provides API endpoints for accessing NLP services including:
 * - Sentiment analysis (spaCy, OpenAI)
 * - Entity extraction (spaCy, Rasa, OpenAI)
 * - Intent classification (Rasa, OpenAI)
 */

import { Request, Response } from 'express';
import nlpService from '../services/nlp-service';
import { logger } from '../logger';

/**
 * Analyze text using multiple NLP providers
 * Returns sentiment, entities, and intents from all available providers
 */
export async function analyzeText(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text parameter'
      });
    }
    
    logger.info(`Analyzing text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    const results = await nlpService.combinedNLPAnalysis(text);
    
    // Add service availability info
    const serviceStatus = {
      spaCy: true, // We have spaCy installed locally
      rasa: false, // Rasa needs to be checked
      openai: true // We have OpenAI configured
    };
    
    return res.json({
      text,
      results,
      serviceStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in NLP analysis:', { error });
    return res.status(500).json({
      error: 'An error occurred during NLP analysis',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Analyze sentiment of text
 */
export async function analyzeSentiment(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text parameter'
      });
    }
    
    const results = await nlpService.multiProviderSentimentAnalysis(text);
    const bestResult = await nlpService.getBestSentimentAnalysis(text);
    
    return res.json({
      text,
      results,
      bestResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in sentiment analysis:', { error });
    return res.status(500).json({
      error: 'An error occurred during sentiment analysis',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Extract entities from text
 */
export async function extractEntities(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text parameter'
      });
    }
    
    const results = await nlpService.multiProviderEntityExtraction(text);
    
    return res.json({
      text,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in entity extraction:', { error });
    return res.status(500).json({
      error: 'An error occurred during entity extraction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Detect intent from text
 */
export async function detectIntent(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text parameter'
      });
    }
    
    const results = await nlpService.multiProviderIntentAnalysis(text);
    
    return res.json({
      text,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in intent detection:', { error });
    return res.status(500).json({
      error: 'An error occurred during intent detection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}