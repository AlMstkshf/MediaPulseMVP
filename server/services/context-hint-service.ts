import Anthropic from '@anthropic-ai/sdk';
import { Request } from 'express';
import OpenAI from 'openai';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const ANTHROPIC_MODEL = 'claude-3-7-sonnet-20250219';
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = 'gpt-4o';

/**
 * Helper function to detect the language of a text
 * @param text The text to analyze
 * @returns Language code (en or ar) and confidence
 */
export async function detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
  try {
    // Default to OpenAI for language detection
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a language detection expert. Analyze the text and determine if it is primarily English (en) or Arabic (ar). Respond with JSON in this format: { "language": "en|ar", "confidence": number between 0 and 1 }'
        },
        {
          role: 'user',
          content: text || ''
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      language: result.language,
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error('Error detecting language:', error);
    // Default to English if detection fails
    return { language: 'en', confidence: 0.5 };
  }
}

export interface ContextHint {
  id: string;
  type: 'grammar' | 'clarity' | 'tone' | 'cultural' | 'formality' | 'suggestion';
  text: string;
  originalText?: string;
  replacementText?: string;
  explanation: string;
  source: 'anthropic' | 'openai';
  confidence: number;
}

/**
 * Generate language context hints for the provided text
 * @param text The text to analyze
 * @param targetLanguage Optional target language (en or ar)
 * @param requestContext Optional request context for more tailored hints
 * @returns Array of context hints
 */
export async function generateContextHints(
  text: string,
  targetLanguage?: string,
  requestContext?: Request
): Promise<ContextHint[]> {
  if (!text || text.trim().length < 5) {
    return [];
  }

  try {
    const detectedLanguage = !targetLanguage ? await detectLanguage(text) : { language: targetLanguage, confidence: 1 };
    const language = detectedLanguage.language;
    
    // Try Anthropic first
    try {
      const anthropicResponse = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1000,
        system: getAnthropicPrompt(language),
        messages: [{ role: 'user', content: text }]
      });
      
      // Parse the response to extract hints
      let parsedHints: ContextHint[] = [];
      try {
        // Extract JSON from the response if present
        const content = anthropicResponse.content[0].text;
        // Find JSON in the content (it might be wrapped in text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[0]);
          if (jsonContent.hints && Array.isArray(jsonContent.hints)) {
            parsedHints = jsonContent.hints.map((hint: any, index: number) => ({
              id: `anthropic-hint-${index}`,
              type: hint.type || 'suggestion',
              text: hint.text || '',
              originalText: hint.originalText,
              replacementText: hint.replacementText,
              explanation: hint.explanation || '',
              source: 'anthropic',
              confidence: hint.confidence || 0.8,
            }));
          }
        }
      } catch (parseError) {
        console.error('Error parsing Anthropic response:', parseError);
      }
      
      // Return Anthropic results if we got them
      if (parsedHints.length > 0) {
        return parsedHints;
      }
    } catch (anthropicError) {
      console.error('Anthropic API error:', anthropicError);
      // Fall back to OpenAI if Anthropic fails
    }
    
    // Fallback to OpenAI
    const openaiResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: getOpenAIPrompt(language)
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const parsedResponse = JSON.parse(openaiResponse.choices[0].message.content);
    
    if (parsedResponse.hints && Array.isArray(parsedResponse.hints)) {
      return parsedResponse.hints.map((hint: any, index: number) => ({
        id: `openai-hint-${index}`,
        type: hint.type || 'suggestion',
        text: hint.text || '',
        originalText: hint.originalText,
        replacementText: hint.replacementText,
        explanation: hint.explanation || '',
        source: 'openai',
        confidence: hint.confidence || 0.8,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error generating context hints:', error);
    return [];
  }
}

/**
 * Get the system prompt for Anthropic in the specified language
 */
function getAnthropicPrompt(language: string): string {
  if (language === 'ar') {
    return `أنت مساعد لتحليل النصوص وتقديم اقتراحات لغوية وسياقية تساعد على تحسين المحتوى باللغة العربية. 
    قم بتحليل النص المقدم وتقديم اقتراحات مفيدة ودقيقة.
    
    حلل النص من النواحي التالية:
    1. القواعد اللغوية والنحوية
    2. الوضوح والبلاغة
    3. نبرة الكلام ومدى ملاءمتها للسياق
    4. الملاءمة الثقافية
    5. مستوى الرسمية المناسب
    
    قدم إجابتك بتنسيق JSON فقط، مع الحقول التالية:
    {
      "hints": [
        {
          "type": "grammar|clarity|tone|cultural|formality|suggestion",
          "text": "نص الاقتراح",
          "originalText": "النص الأصلي الذي تقترح تغييره (إن وجد)",
          "replacementText": "النص البديل المقترح (إن وجد)",
          "explanation": "شرح لسبب الاقتراح",
          "confidence": قيمة بين 0 و 1 تمثل مستوى الثقة
        }
        // اقتراحات إضافية...
      ]
    }
    
    قدم من 1 إلى 5 اقتراحات كحد أقصى، وركز على الاقتراحات الأكثر أهمية.`;
  }
  
  return `You are an expert language context assistant that provides helpful linguistic and contextual suggestions to improve content in English. 
  Analyze the provided text and offer useful, accurate suggestions.
  
  Analyze the text in terms of:
  1. Grammar and syntax
  2. Clarity and eloquence
  3. Tone and appropriateness
  4. Cultural context
  5. Formality level
  
  Provide your response in JSON format only, with these fields:
  {
    "hints": [
      {
        "type": "grammar|clarity|tone|cultural|formality|suggestion",
        "text": "The suggestion text",
        "originalText": "The original text you suggest changing (if applicable)",
        "replacementText": "The suggested replacement text (if applicable)",
        "explanation": "Explanation of why this suggestion is made",
        "confidence": a value between 0 and 1 representing confidence level
      }
      // additional suggestions...
    ]
  }
  
  Provide between 1 and 5 suggestions at most, focusing on the most important ones.`;
}

/**
 * Get the system prompt for OpenAI in the specified language
 */
function getOpenAIPrompt(language: string): string {
  if (language === 'ar') {
    return `أنت مساعد لتحليل النصوص وتقديم اقتراحات لغوية وسياقية تساعد على تحسين المحتوى باللغة العربية. 
    قم بتحليل النص المقدم وتقديم اقتراحات مفيدة ودقيقة.
    
    حلل النص من النواحي التالية:
    1. القواعد اللغوية والنحوية
    2. الوضوح والبلاغة
    3. نبرة الكلام ومدى ملاءمتها للسياق
    4. الملاءمة الثقافية
    5. مستوى الرسمية المناسب
    
    قدم إجابتك بتنسيق JSON فقط، مع الحقول التالية:
    {
      "hints": [
        {
          "type": "grammar|clarity|tone|cultural|formality|suggestion",
          "text": "نص الاقتراح",
          "originalText": "النص الأصلي الذي تقترح تغييره (إن وجد)",
          "replacementText": "النص البديل المقترح (إن وجد)",
          "explanation": "شرح لسبب الاقتراح",
          "confidence": قيمة بين 0 و 1 تمثل مستوى الثقة
        }
        // اقتراحات إضافية...
      ]
    }
    
    قدم من 1 إلى 5 اقتراحات كحد أقصى، وركز على الاقتراحات الأكثر أهمية.`;
  }
  
  return `You are an expert language context assistant that provides helpful linguistic and contextual suggestions to improve content in English. 
  Analyze the provided text and offer useful, accurate suggestions.
  
  Analyze the text in terms of:
  1. Grammar and syntax
  2. Clarity and eloquence
  3. Tone and appropriateness
  4. Cultural context
  5. Formality level
  
  Provide your response in JSON format only, with these fields:
  {
    "hints": [
      {
        "type": "grammar|clarity|tone|cultural|formality|suggestion",
        "text": "The suggestion text",
        "originalText": "The original text you suggest changing (if applicable)",
        "replacementText": "The suggested replacement text (if applicable)",
        "explanation": "Explanation of why this suggestion is made",
        "confidence": a value between 0 and 1 representing confidence level
      }
      // additional suggestions...
    ]
  }
  
  Provide between 1 and 5 suggestions at most, focusing on the most important ones.`;
}