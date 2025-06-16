import { LanguageServiceClient } from '@google-cloud/language';
import OpenAI from 'openai';
import { SocialPost } from '@shared/schema';

// Import local NLP services
import * as arabertService from './arabert-service';
import { logger } from '../logger';
import { spacyService, SpacySentimentResult, SpacyEntityResult } from './spacy-service';
import { rasaService, RasaAnalysisResult, RasaEntity } from './rasa-service';

// OpenAI client (reusing existing key)
const openai = new OpenAI({
  apiKey: "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"
});

// Initialize Google Cloud NLP
let googleNLPClient: LanguageServiceClient | null = null;
// We'll defer the actual initialization of the Google NLP client until it's needed
// This way we avoid crashing the entire application if credentials are missing
console.log('Google NLP client initialization deferred until needed');

// Check if spaCy is available
if (spacyService.isAvailable()) {
  console.log('spaCy service initialized successfully');
} else {
  console.warn('spaCy service not available, using fallback methods');
}

/**
 * Common interface for sentiment analysis results
 * Normalized across different providers
 */
export interface NLPSentimentResult {
  score: number; // Normalized score from 1-5 for consistency
  sentiment: string; // Original sentiment label from the provider
  confidence: number; // Confidence score (0-1)
  source: string; // NLP provider name
  language?: string; // Detected language code
  error?: string; // Optional error message for diagnostic purposes
  serviceStatus?: 'available' | 'unavailable' | 'error'; // Status of the service
}

/**
 * Common interface for entity extraction results
 */
export interface NLPEntityResult {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  keyPhrases: string[];
  source: string; // NLP provider name
}

/**
 * Common interface for intent classification results
 */
export interface NLPIntentResult {
  intent: string;
  confidence: number;
  source: string; // NLP provider name
  error?: string;
  serviceStatus?: 'available' | 'unavailable' | 'error';
}

/**
 * Detect the language of a text string
 * This function routes through the Rasa/AraBERT architecture as needed
 * 
 * @param text The text to analyze
 * @returns The two-letter language code (e.g., 'en', 'ar')
 */
export async function detectLanguage(text: string): Promise<'en' | 'ar'> {
  logger.info(`Detecting language for text: ${text.substring(0, 50)}...`);

  try {
    // Try to use spaCy for language detection if available
    if (spacyService.isAvailable()) {
      const result = spacyService.detectLanguage(text);
      
      // For our purposes, we're mainly concerned with Arabic vs. English/other
      if (result.language === 'ar') {
        logger.info('Language detected as Arabic by spaCy');
        return 'ar';
      } else {
        logger.info(`Language detected as ${result.language}, treating as English`);
        return 'en';
      }
    }
    
    // Fallback to simple heuristics if AWS detection isn't available
    // This is a more comprehensive detection for Arabic script
    
    // Unicode ranges for Arabic script
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    // Count Arabic characters
    let arabicCharCount = 0;
    for (let i = 0; i < text.length; i++) {
      if (arabicPattern.test(text[i])) {
        arabicCharCount++;
      }
    }
    
    // If more than 40% of characters are Arabic, classify as Arabic
    if (arabicCharCount > 0 && arabicCharCount / text.length > 0.4) {
      logger.info('Language detected as Arabic (pattern-based)');
      return 'ar';
    }
    
    // Default to English for any other text
    logger.info('Language detected as English (default)');
    return 'en';
  } catch (error) {
    logger.error(`Error detecting language: ${error instanceof Error ? error.message : String(error)}`);
    // Default to English if detection fails
    return 'en';
  }
}

/**
 * Common interface for text embedding results
 */
export interface NLPEmbeddingResult {
  embedding: number[];
  dimensions: number;
  source: string; // NLP provider name
}

/**
 * Analyze sentiment using Google Cloud NLP
 * Following the Rasa/AraBERT architecture for English text
 */
export async function analyzeWithGoogleNLP(text: string): Promise<NLPSentimentResult | null> {
  if (!googleNLPClient) {
    logger.warn('Google NLP client not available. Check Google Cloud credentials.');
    return {
      score: 3, // Neutral default
      sentiment: 'UNAVAILABLE',
      confidence: 0,
      source: 'google_nlp',
      language: 'en',
      error: 'Service unavailable - credentials missing or invalid',
      serviceStatus: 'unavailable'
    };
  }
  
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT' as const,
    };

    const [result] = await googleNLPClient.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;
    
    if (!sentiment) {
      logger.warn('Google NLP returned no sentiment');
      return {
        score: 3,
        sentiment: 'UNKNOWN',
        confidence: 0,
        source: 'Google Cloud NLP',
        language: result.language || 'en',
        error: 'No sentiment detected in text',
        serviceStatus: 'available'
      };
    }

    // Google NLP score is between -1 and 1
    // Convert to 1-5 scale for consistency
    const normalizedScore = Math.round((sentiment.score + 1) * 2) + 1;
    
    return {
      score: Math.min(5, Math.max(1, normalizedScore)),
      sentiment: sentiment.score > 0.25 ? 'positive' : 
                 sentiment.score < -0.25 ? 'negative' : 'neutral',
      confidence: sentiment.magnitude || 0,
      source: 'Google Cloud NLP',
      language: result.language || 'en',
      serviceStatus: 'available'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Google NLP API error:', { error: errorMessage });
    
    return {
      score: 3,
      sentiment: 'ERROR',
      confidence: 0,
      source: 'Google Cloud NLP',
      language: 'en',
      error: errorMessage,
      serviceStatus: 'error'
    };
  }
}

/**
 * Analyze sentiment using spaCy
 * Replaces AWS Comprehend with local spaCy processing
 */
export async function analyzeWithSpaCy(text: string): Promise<NLPSentimentResult | null> {
  if (!spacyService.isAvailable()) {
    logger.warn('spaCy service not available. Check if spaCy is installed.');
    return {
      score: 3, // Neutral default
      sentiment: 'UNAVAILABLE',
      confidence: 0,
      source: 'spaCy',
      language: 'en',
      error: 'Service unavailable - spaCy not installed or initialized',
      serviceStatus: 'unavailable'
    };
  }
  
  try {
    // Use our spaCy service for sentiment analysis
    const result = spacyService.analyzeSentiment(text);
    
    return {
      score: result.score,
      sentiment: result.sentiment,
      confidence: result.confidence,
      source: result.source,
      language: result.language || 'en',
      serviceStatus: 'available'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('spaCy sentiment analysis error:', { error: errorMessage });
    
    return {
      score: 3,
      sentiment: 'ERROR',
      confidence: 0,
      source: 'spaCy',
      language: 'en',
      error: errorMessage,
      serviceStatus: 'error'
    };
  }
}

/**
 * Extract entities using Google Cloud NLP
 */
export async function extractEntitiesWithGoogleNLP(text: string): Promise<NLPEntityResult | null> {
  if (!googleNLPClient) {
    console.log('Google NLP client not available');
    return null;
  }
  
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT' as const,
    };

    const [result] = await googleNLPClient.analyzeEntities({ document });
    
    if (!result.entities || result.entities.length === 0) {
      console.warn('Google NLP found no entities');
      return {
        entities: [],
        keyPhrases: [],
        source: 'Google Cloud NLP'
      };
    }

    const entities = result.entities.map(entity => ({
      text: entity.name || '',
      type: entity.type || 'UNKNOWN',
      confidence: entity.salience || 0
    }));
    
    return {
      entities,
      keyPhrases: entities.map(e => e.text),
      source: 'Google Cloud NLP'
    };
  } catch (error) {
    console.error('Google NLP API error:', error);
    return null;
  }
}

/**
 * Extract entities and key phrases using AWS Comprehend
 */
/**
 * Extract entities and key phrases using spaCy
 */
export async function extractEntitiesWithSpaCy(text: string): Promise<NLPEntityResult | null> {
  if (!spacyService.isAvailable()) {
    logger.warn('spaCy service not available. Check if spaCy is installed.');
    return {
      entities: [],
      keyPhrases: [],
      source: 'spaCy',
    };
  }
  
  try {
    // Use our spaCy service for entity extraction
    const result = spacyService.extractEntities(text);
    
    return {
      entities: result.entities,
      keyPhrases: result.keyPhrases,
      source: 'spaCy'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('spaCy entity extraction error:', { error: errorMessage });
    
    // Return empty arrays on error
    return {
      entities: [],
      keyPhrases: [],
      source: 'spaCy',
    };
  }
}

/**
 * Generate text embeddings using OpenAI
 */
export async function generateEmbeddings(text: string): Promise<NLPEmbeddingResult | null> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });
    
    return {
      embedding: response.data[0].embedding,
      dimensions: response.data[0].embedding.length,
      source: 'OpenAI'
    };
  } catch (error) {
    console.error('OpenAI embeddings API error:', error);
    return null;
  }
}

/**
 * Create semantically similar post groups using embeddings
 */
export async function groupPostsBySimilarity(posts: SocialPost[], threshold: number = 0.8): Promise<SocialPost[][]> {
  try {
    // Generate embeddings for all posts
    const postEmbeddings: { post: SocialPost; embedding: number[] }[] = [];
    
    for (const post of posts) {
      const embeddingResult = await generateEmbeddings(post.content);
      if (embeddingResult?.embedding) {
        postEmbeddings.push({
          post,
          embedding: embeddingResult.embedding
        });
      }
    }
    
    // Function to calculate cosine similarity between two embeddings
    const cosineSimilarity = (a: number[], b: number[]): number => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      
      if (normA === 0 || normB === 0) return 0;
      
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    
    // Group posts by similarity
    const groups: SocialPost[][] = [];
    const assigned = new Set<number>();
    
    for (let i = 0; i < postEmbeddings.length; i++) {
      if (assigned.has(i)) continue;
      
      const group: SocialPost[] = [postEmbeddings[i].post];
      assigned.add(i);
      
      for (let j = i + 1; j < postEmbeddings.length; j++) {
        if (assigned.has(j)) continue;
        
        const similarity = cosineSimilarity(
          postEmbeddings[i].embedding,
          postEmbeddings[j].embedding
        );
        
        if (similarity >= threshold) {
          group.push(postEmbeddings[j].post);
          assigned.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  } catch (error) {
    console.error('Error grouping posts by similarity:', error);
    return []; // Return empty array on error
  }
}

/**
 * Multi-provider sentiment analysis
 * Attempts to use multiple NLP providers and returns results from all available ones
 */
export async function multiProviderSentimentAnalysis(text: string): Promise<NLPSentimentResult[]> {
  const results: NLPSentimentResult[] = [];
  
  // Try Google NLP
  const googleResult = await analyzeWithGoogleNLP(text);
  if (googleResult) results.push(googleResult);
  
  // Try spaCy instead of AWS Comprehend
  const spacyResult = await analyzeWithSpaCy(text);
  if (spacyResult) results.push(spacyResult);
  
  // Always use OpenAI as a fallback
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the following text and respond with a JSON object containing: score (1-5 where 1 is very negative, 5 is very positive), sentiment (string label), and confidence (0-1)."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    results.push({
      score: Math.min(5, Math.max(1, result.score)),
      sentiment: result.sentiment || '',
      confidence: result.confidence || 0.5,
      source: 'OpenAI'
    });
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
    // We'll continue with the results we have
  }
  
  return results;
}

/**
 * Get the best sentiment analysis result across providers
 * Prioritizes results with higher confidence
 */
export async function getBestSentimentAnalysis(text: string): Promise<NLPSentimentResult | null> {
  const results = await multiProviderSentimentAnalysis(text);
  
  if (results.length === 0) return null;
  
  // Sort by confidence and return the highest
  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
}

/**
 * Multi-provider entity extraction
 */
export async function multiProviderEntityExtraction(text: string): Promise<NLPEntityResult[]> {
  const results: NLPEntityResult[] = [];
  
  // Try Google NLP
  const googleResult = await extractEntitiesWithGoogleNLP(text);
  if (googleResult) results.push(googleResult);
  
  // Try spaCy
  const spacyResult = await extractEntitiesWithSpaCy(text);
  if (spacyResult) results.push(spacyResult);
  
  // Try Rasa
  const rasaResult = await extractEntitiesWithRasa(text);
  if (rasaResult && rasaResult.entities.length > 0) {
    results.push(rasaResult);
  }
  
  // Always use OpenAI as a fallback
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract entities from the following text and respond with a JSON object containing 'entities' (array of {text, type, confidence}) and 'keyPhrases' (array of strings)."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    results.push({
      entities: result.entities || [],
      keyPhrases: result.keyPhrases || [],
      source: 'OpenAI'
    });
  } catch (error) {
    console.error('OpenAI entity extraction error:', error);
    // We'll continue with the results we have
  }
  
  return results;
}

/**
 * Combined NLP analysis across providers
 * Returns sentiment, entities, intents, and key phrases from various providers
 */
export async function combinedNLPAnalysis(text: string): Promise<{
  sentiment: NLPSentimentResult[];
  entities: NLPEntityResult[];
  intents: NLPIntentResult[];
}> {
  // Run sentiment analysis, entity extraction, and intent analysis in parallel
  const [sentimentResults, entityResults, intentResults] = await Promise.all([
    multiProviderSentimentAnalysis(text),
    multiProviderEntityExtraction(text),
    multiProviderIntentAnalysis(text)
  ]);
  
  return {
    sentiment: sentimentResults,
    entities: entityResults,
    intents: intentResults
  };
}

/**
 * Generate content for social media based on a prompt
 * This replaces the previous AI Assistant functionality with direct LLM calls
 */
export async function generateSocialMediaContent(options: {
  prompt: string;
  platform: string;
  includeArabic?: boolean;
  creativityLevel?: number;
}): Promise<{
  content: string;
  hashtags: string[];
  bestTimeToPost?: string;
  estimatedEngagement?: { likes: number; comments: number; shares: number; };
  mediaSuggestions?: string[];
}> {
  try {
    const { prompt, platform, includeArabic = true, creativityLevel = 0.7 } = options;
    
    // Use OpenAI to generate the content
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a social media content creation assistant for the Ajman Police. 
          Create engaging, professional content for the ${platform} platform that represents 
          government police services appropriately. The content should be informative, 
          respectful, and align with public safety messaging.
          ${includeArabic ? 'Include an Arabic translation of the content.' : ''}
          Respond with a JSON object containing:
          - content: the generated social media post text
          - hashtags: array of relevant hashtags (4-6)
          - bestTimeToPost: suggested day and time to post
          - mediaSuggestions: array of 2-3 ideas for visual content to accompany the post`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: creativityLevel,
    });
    
    // Parse the content
    const result = JSON.parse(response.choices[0].message.content);
    
    // Generate realistic engagement estimates based on platform
    const baseLikes = platform === 'twitter' ? 35 : platform === 'instagram' ? 80 : platform === 'facebook' ? 50 : 25;
    const baseComments = platform === 'twitter' ? 5 : platform === 'instagram' ? 15 : platform === 'facebook' ? 10 : 3;
    const baseShares = platform === 'twitter' ? 8 : platform === 'instagram' ? 5 : platform === 'facebook' ? 12 : 4;
    
    // Add random variation
    const estimatedEngagement = {
      likes: Math.floor(baseLikes * (0.8 + Math.random() * 0.4)),
      comments: Math.floor(baseComments * (0.8 + Math.random() * 0.4)),
      shares: Math.floor(baseShares * (0.8 + Math.random() * 0.4))
    };
    
    return {
      content: result.content || `Generated post about: ${prompt}`,
      hashtags: result.hashtags || ['#AjmanPolice', '#Safety', '#Security', '#Community'],
      bestTimeToPost: result.bestTimeToPost || 'Thursday, 9:00 AM',
      estimatedEngagement,
      mediaSuggestions: result.mediaSuggestions || []
    };
  } catch (error) {
    console.error('Social media content generation error:', error);
    
    // Fallback content in case of an error
    return {
      content: `Generated post about: ${options.prompt}`,
      hashtags: ['#AjmanPolice', '#Safety', '#Security', '#Community'],
      bestTimeToPost: 'Thursday, 9:00 AM',
      estimatedEngagement: {
        likes: 45,
        comments: 8,
        shares: 12
      },
      mediaSuggestions: [
        "Include an image of police officers engaging with the community",
        "Consider a short video showing Ajman Police in action"
      ]
    };
  }
}

/**
 * Extract themes and topics from text
 * Replaces the AI assistant theme extraction functionality
 */
export async function extractThemesAndTopics(text: string): Promise<{
  themes: string[];
  topics: string[];
  summary: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Analyze the following text and extract the main themes, topics, and provide a brief summary. Respond with a JSON object containing 'themes' (array of strings), 'topics' (array of strings), and 'summary' (string)."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      themes: result.themes || [],
      topics: result.topics || [],
      summary: result.summary || ''
    };
  } catch (error) {
    console.error('Theme extraction error:', error);
    return {
      themes: [],
      topics: [],
      summary: 'Unable to analyze text content.'
    };
  }
}

/**
 * Analyze intent using Rasa DIET Classifier
 * 
 * @param text The text to analyze
 * @returns Intent classification result
 */
export async function analyzeWithRasa(text: string): Promise<NLPIntentResult> {
  if (!rasaService.isAvailable()) {
    logger.warn('Rasa service not available');
    return {
      intent: 'unknown',
      confidence: 0,
      source: 'Rasa',
      error: 'Rasa service unavailable',
      serviceStatus: 'unavailable'
    };
  }
  
  try {
    const result = await rasaService.detectIntent(text);
    
    return {
      intent: result.intent,
      confidence: result.confidence,
      source: 'Rasa',
      serviceStatus: 'available'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Rasa intent analysis error:', { error: errorMessage });
    
    return {
      intent: 'error',
      confidence: 0,
      source: 'Rasa',
      error: errorMessage,
      serviceStatus: 'error'
    };
  }
}

/**
 * Extract entities using Rasa DIET Classifier
 * 
 * @param text The text to analyze
 * @returns Entity extraction result
 */
export async function extractEntitiesWithRasa(text: string): Promise<NLPEntityResult> {
  if (!rasaService.isAvailable()) {
    logger.warn('Rasa service not available');
    return {
      entities: [],
      keyPhrases: [],
      source: 'Rasa'
    };
  }
  
  try {
    const entities = await rasaService.extractEntities(text);
    
    // Convert Rasa entities to our common format
    const convertedEntities = entities.map(entity => ({
      text: entity.value,
      type: entity.entity,
      confidence: entity.confidence
    }));
    
    // Extract key phrases (for Rasa, we'll use entity values as key phrases)
    const keyPhrases = entities.map(entity => entity.value);
    
    return {
      entities: convertedEntities,
      keyPhrases: [...new Set(keyPhrases)], // Remove duplicates
      source: 'Rasa'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Rasa entity extraction error:', { error: errorMessage });
    
    return {
      entities: [],
      keyPhrases: [],
      source: 'Rasa'
    };
  }
}

/**
 * Multi-provider intent analysis
 * Attempts to use multiple providers and returns results from all available ones
 */
export async function multiProviderIntentAnalysis(text: string): Promise<NLPIntentResult[]> {
  const results: NLPIntentResult[] = [];
  
  // Try Rasa for intent classification
  const rasaResult = await analyzeWithRasa(text);
  if (rasaResult.intent !== 'unknown' && rasaResult.intent !== 'error') {
    results.push(rasaResult);
  }
  
  // Always use OpenAI as a fallback
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the intent of the following text. Respond with a JSON object containing: intent (a single word describing the primary intent) and confidence (0-1 value of your confidence in this classification)."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    results.push({
      intent: result.intent || 'unknown',
      confidence: result.confidence || 0.5,
      source: 'OpenAI',
      serviceStatus: 'available'
    });
  } catch (error) {
    console.error('OpenAI intent analysis error:', error);
    // We'll continue with the results we have
  }
  
  return results;
}

/**
 * Generate smart hashtag recommendations based on content, trends, and platform
 * Combines trending topics with content analysis for relevant hashtag suggestions
 */
export async function generateSmartHashtags(options: {
  content: string;
  platform: string;
  trendingTopics?: Array<{topic: string; count: number; change: number}>;
  count?: number;
  includeGenericHashtags?: boolean;
}): Promise<{
  hashtags: string[];
  trending: string[];
  relevanceScores: Record<string, number>;
  insightSummary: string;
}> {
  try {
    const { 
      content, 
      platform, 
      trendingTopics = [], 
      count = 10, 
      includeGenericHashtags = true 
    } = options;
    
    // Extract entities from content using NLP
    const entityResults = await multiProviderEntityExtraction(content);
    
    // Extract key entities and phrases
    const entities = entityResults.flatMap(result => result.entities.map(e => e.text.toLowerCase()));
    const keyPhrases = entityResults.flatMap(result => result.keyPhrases.map(p => p.toLowerCase()));
    
    // Get content-based hashtags from OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a social media hashtag expert. Analyze the provided content and generate relevant hashtags specifically for the ${platform} platform.
          The hashtags should be relevant to the content, appropriate for a police/government entity, and follow platform best practices.
          Respond with a JSON object containing:
          - hashtags: array of hashtag strings (without the # symbol)
          - relevance: object mapping each hashtag to a relevance score (0-100)
          - insight: a short summary of why these hashtags were chosen`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    // Parse OpenAI's response
    const openAIResult = JSON.parse(openAIResponse.choices[0].message.content);
    
    // Get hashtags from all sources
    const contentHashtags = openAIResult.hashtags || [];
    const relevanceScores = openAIResult.relevance || {};
    
    // Extract trending hashtags
    const trendingHashtags = trendingTopics
      .filter(topic => topic.change > 0) // Only positive trending topics
      .sort((a, b) => b.change - a.change) // Sort by trend growth
      .map(topic => topic.topic.toLowerCase())
      .slice(0, 5); // Top 5 trending
    
    // Generic hashtags relevant for police/government social media
    const genericHashtags = [
      'ajmanpolice', 'safety', 'security', 'community', 'uae', 
      'ajman', 'police', 'publicsafety', 'emiratespolice'
    ];
    
    // Prioritize and combine hashtags
    const allHashtags = new Set<string>();
    
    // 1. First add the most relevant content-based hashtags
    contentHashtags.forEach(tag => allHashtags.add(tag.toLowerCase().replace(/^#/, '')));
    
    // 2. Add trending hashtags that are somewhat relevant to the content
    trendingHashtags.forEach(tag => {
      // Check if the trending topic is somewhat related to the content
      const isRelevant = entities.some(entity => 
        entity.includes(tag) || tag.includes(entity)
      ) || keyPhrases.some(phrase => 
        phrase.includes(tag) || tag.includes(phrase)
      );
      
      if (isRelevant) {
        allHashtags.add(tag.toLowerCase().replace(/^#/, ''));
      }
    });
    
    // 3. If we don't have enough hashtags, add some generic ones
    if (includeGenericHashtags && allHashtags.size < count) {
      genericHashtags.forEach(tag => {
        if (allHashtags.size < count) {
          allHashtags.add(tag.toLowerCase());
        }
      });
    }
    
    // Convert to array and limit to requested count
    const finalHashtags = Array.from(allHashtags).slice(0, count);
    
    return {
      hashtags: finalHashtags,
      trending: trendingHashtags,
      relevanceScores,
      insightSummary: openAIResult.insight || "Hashtags selected based on content analysis and trending topics"
    };
  } catch (error) {
    console.error('Smart hashtag generation error:', error);
    
    // Fallback hashtags
    return {
      hashtags: ['ajmanpolice', 'safety', 'security', 'community', 'uae'],
      trending: [],
      relevanceScores: {},
      insightSummary: "Default hashtags provided due to error in generation process"
    };
  }
}

export default {
  // Sentiment Analysis
  analyzeWithGoogleNLP,
  analyzeWithSpaCy,
  multiProviderSentimentAnalysis,
  getBestSentimentAnalysis,
  
  // Entity Extraction
  extractEntitiesWithGoogleNLP,
  extractEntitiesWithSpaCy,
  extractEntitiesWithRasa,
  multiProviderEntityExtraction,
  
  // Intent Classification
  analyzeWithRasa,
  multiProviderIntentAnalysis,
  
  // Combined Analysis
  combinedNLPAnalysis,
  
  // Utility Functions
  generateEmbeddings,
  groupPostsBySimilarity,
  
  // Content Generation
  extractThemesAndTopics,
  generateSocialMediaContent,
  generateSmartHashtags
};