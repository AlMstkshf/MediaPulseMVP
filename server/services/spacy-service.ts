/**
 * spaCy NLP Service
 * 
 * This service provides NLP functionality using the spaCy library
 * as a replacement for external services like AWS Comprehend.
 */

import { execSync } from 'child_process';
import { logger } from '../logger';

// Interfaces
export interface SpacySentimentResult {
  score: number;         // Normalized score from 1-5 for consistency
  sentiment: string;     // Sentiment label (positive, negative, neutral)
  confidence: number;    // Confidence score (0-1)
  source: string;        // Source of the analysis
  language?: string;     // Detected language
}

export interface SpacyEntityResult {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  keyPhrases: string[];
  source: string;
}

// Class to handle spaCy interactions via Python subprocess
class SpacyService {
  private initialized: boolean = false;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize the spaCy service
   */
  private initialize(): void {
    try {
      // Check if spaCy is available by running a simple Python command
      const output = execSync('python -c "import spacy; print(\'spaCy available\')"', { encoding: 'utf8' });
      
      if (output.includes('spaCy available')) {
        this.initialized = true;
        logger.info('spaCy service initialized successfully');
      } else {
        throw new Error('spaCy response invalid');
      }
    } catch (error) {
      logger.error('Failed to initialize spaCy service:', error);
      this.initialized = false;
    }
  }
  
  /**
   * Check if the spaCy service is available
   */
  public isAvailable(): boolean {
    return this.initialized;
  }
  
  /**
   * Analyze sentiment using spaCy and a simple rule-based approach
   * 
   * @param text Text to analyze
   * @returns Sentiment analysis result
   */
  public analyzeSentiment(text: string): SpacySentimentResult {
    if (!this.isAvailable()) {
      logger.warn('spaCy service not available, using default sentiment');
      return {
        score: 3,
        sentiment: 'neutral',
        confidence: 0.5,
        source: 'spaCy (fallback)',
        language: 'en'
      };
    }
    
    try {
      // Execute Python script to analyze sentiment using spaCy
      // This is a simplified approach - in a production environment,
      // we would use a proper sentiment model or a more sophisticated approach
      const script = `
import spacy
import sys
import json

def analyze_sentiment(text):
    # Load spaCy model
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        # If model isn't available, use a basic pipeline
        nlp = spacy.blank("en")
    
    # Process the text
    doc = nlp(text)
    
    # Simple lexicon-based sentiment analysis
    # This is a very basic approach - production would use a real sentiment model
    positive_words = ["good", "great", "excellent", "amazing", "wonderful", "love", "like", "happy", "positive", "success"]
    negative_words = ["bad", "terrible", "awful", "hate", "dislike", "sad", "negative", "failure", "poor", "worst"]
    
    pos_count = 0
    neg_count = 0
    
    # Count positive and negative words
    for token in doc:
        if token.text.lower() in positive_words:
            pos_count += 1
        elif token.text.lower() in negative_words:
            neg_count += 1
    
    # Calculate sentiment score
    total = pos_count + neg_count
    if total == 0:
        sentiment = "neutral"
        score = 3
        confidence = 0.5
    elif pos_count > neg_count:
        sentiment = "positive"
        score = 4
        confidence = min(0.95, pos_count / (pos_count + neg_count))
    else:
        sentiment = "negative"
        score = 2
        confidence = min(0.95, neg_count / (pos_count + neg_count))
    
    return {
        "sentiment": sentiment,
        "score": score,
        "confidence": confidence,
        "language": "en",
        "source": "spaCy"
    }

# Get input text from arguments
text = sys.argv[1]
result = analyze_sentiment(text)
print(json.dumps(result))
      `;
      
      // Execute the Python script
      const pythonResult = execSync(`python -c "${script}" "${text.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
      const result = JSON.parse(pythonResult.trim());
      
      return {
        score: result.score,
        sentiment: result.sentiment,
        confidence: result.confidence,
        source: result.source,
        language: result.language
      };
    } catch (error) {
      logger.error('Error analyzing sentiment with spaCy:', error);
      return {
        score: 3,
        sentiment: 'neutral',
        confidence: 0.5,
        source: 'spaCy (error)',
        language: 'en'
      };
    }
  }
  
  /**
   * Extract entities using spaCy
   * 
   * @param text Text to analyze
   * @returns Entity extraction result
   */
  public extractEntities(text: string): SpacyEntityResult {
    if (!this.isAvailable()) {
      logger.warn('spaCy service not available, using empty entity list');
      return {
        entities: [],
        keyPhrases: [],
        source: 'spaCy (fallback)'
      };
    }
    
    try {
      // Execute Python script to extract entities using spaCy
      const script = `
import spacy
import sys
import json

def extract_entities(text):
    # Load spaCy model
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        # If model isn't available, use a basic pipeline
        nlp = spacy.blank("en")
        nlp.add_pipe("ner")
    
    # Process the text
    doc = nlp(text)
    
    # Extract entities
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "type": ent.label_,
            "confidence": 0.8  # spaCy doesn't provide confidence scores by default
        })
    
    # Extract key phrases (noun chunks as a simple approach)
    key_phrases = [chunk.text for chunk in doc.noun_chunks]
    
    return {
        "entities": entities,
        "keyPhrases": key_phrases,
        "source": "spaCy"
    }

# Get input text from arguments
text = sys.argv[1]
result = extract_entities(text)
print(json.dumps(result))
      `;
      
      // Execute the Python script
      const pythonResult = execSync(`python -c "${script}" "${text.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
      return JSON.parse(pythonResult.trim());
    } catch (error) {
      logger.error('Error extracting entities with spaCy:', error);
      return {
        entities: [],
        keyPhrases: [],
        source: 'spaCy (error)'
      };
    }
  }
  
  /**
   * Detect language using spaCy
   * @param text Text to analyze
   * @returns Detected language code and confidence
   */
  public detectLanguage(text: string): { language: string, confidence: number } {
    if (!this.isAvailable()) {
      logger.warn('spaCy service not available, using default language detection');
      return {
        language: 'en',
        confidence: 0.5
      };
    }
    
    try {
      // Execute Python script to detect language
      const script = `
import spacy
import sys
import json

def detect_language(text):
    # Basic language detection using spaCy
    # This is simplified - in production we would use a dedicated language detection model
    
    # Common language markers
    language_markers = {
        "en": ["the", "a", "is", "are", "and", "in", "to", "that"],
        "ar": ["من", "إلى", "عن", "على", "في", "هذا", "هذه", "ذلك"],
        "fr": ["le", "la", "un", "une", "et", "en", "à", "de", "que"],
        "es": ["el", "la", "un", "una", "y", "en", "a", "que"]
    }
    
    text_lower = text.lower()
    scores = {}
    
    # Count matches for each language
    for lang, markers in language_markers.items():
        count = 0
        for marker in markers:
            if f" {marker} " in f" {text_lower} ":
                count += 1
        scores[lang] = count / len(markers) if count > 0 else 0
    
    # Find language with highest score
    if not scores or max(scores.values()) == 0:
        # Default to English if no matches
        detected = "en"
        confidence = 0.5
    else:
        detected = max(scores, key=scores.get)
        confidence = min(0.95, scores[detected] + 0.3)  # Add base confidence
    
    return {
        "language": detected,
        "confidence": confidence
    }

# Get input text from arguments
text = sys.argv[1]
result = detect_language(text)
print(json.dumps(result))
      `;
      
      // Execute the Python script
      const pythonResult = execSync(`python -c "${script}" "${text.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
      return JSON.parse(pythonResult.trim());
    } catch (error) {
      logger.error('Error detecting language with spaCy:', error);
      return {
        language: 'en',
        confidence: 0.5
      };
    }
  }
}

// Create and export the service instance
export const spacyService = new SpacyService();