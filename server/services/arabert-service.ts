/**
 * AraBERT Service
 * 
 * This service handles Arabic language processing using AraBERT or similar Arabic-specialized NLP models.
 * It follows our architecture: React ChatUI → Backend API → Rasa Core+NLU → AraBERT → Platform DB/API
 */

import OpenAI from 'openai';

// In a production environment, this would communicate with a real AraBERT server
// For this implementation, we'll simulate AraBERT functionality using OpenAI

// Initialize OpenAI for Arabic language processing
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for AraBERT analysis response
interface AraBERTResponse {
  intent: string;
  entities: Array<{
    entity: string;
    value: string;
    confidence: number;
    start?: number;
    end?: number;
  }>;
  confidence: number;
}

/**
 * Analyzes Arabic text using AraBERT to extract intent and entities
 * 
 * @param text The Arabic text to analyze
 * @returns The detected intent, entities, and confidence score
 */
export async function analyzeWithAraBERT(text: string): Promise<AraBERTResponse> {
  try {
    // If we don't have an OpenAI API key, fall back to a simpler rule-based approach
    if (!process.env.OPENAI_API_KEY) {
      return simulateAraBERT(text);
    }

    // System prompt for Arabic intent and entity detection
    const systemPrompt = `أنت نظام NLU متقدم مع قدرة تحليل خاصة للنصوص العربية. مهمتك هي استخراج النوايا والكيانات من رسائل المستخدم.
النوايا المتاحة هي: get_reports, get_sentiment_analysis, get_social_stats, get_media_coverage, search_content, get_help, greet, thank, goodbye

الكيانات الشائعة التي يجب البحث عنها:
- report_type: مثل "وسائل التواصل الاجتماعي", "تغطية إعلامية", "تحليل المشاعر", "أداء", إلخ.
- date_range: مثل "الأسبوع الماضي", "أمس", "هذا الشهر", إلخ.
- platform: مثل "تويتر", "فيسبوك", "انستغرام", إلخ.
- keyword: أي مصطلح محدد يريدون البحث عنه أو تحليله
- source: مثل "أخبار", "مدونات", "وسائل التواصل الاجتماعي", إلخ.
- feature: ميزة محددة يحتاجون إلى مساعدة بشأنها
- topic: موضوع محدد يحتاجون إلى معلومات حوله

قم بتحليل الرسالة والرد بكائن JSON يحتوي على:
1. intent: النية الأكثر احتمالًا من القائمة المتاحة
2. confidence: رقم بين 0 و1 يمثل مدى ثقتك في هذه النية
3. entities: مصفوفة بالكيانات المكتشفة، كل منها مع entity (النوع)، value (القيمة)، وconfidence (الثقة)

تنسيق الاستجابة المتوقع:
{
  "intent": "get_reports",
  "confidence": 0.95,
  "entities": [
    {
      "entity": "report_type",
      "value": "وسائل التواصل الاجتماعي",
      "confidence": 0.9
    },
    {
      "entity": "date_range",
      "value": "الأسبوع الماضي",
      "confidence": 0.85
    }
  ]
}`;

    // Use OpenAI to analyze the Arabic text
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more deterministic responses
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const result = JSON.parse(content);
    
    // Validate the response has the expected structure
    if (!result.intent || !result.confidence || !Array.isArray(result.entities)) {
      console.error("Invalid response format from Arabic NLP processing:", result);
      return simulateAraBERT(text); // Fallback
    }

    return {
      intent: result.intent,
      entities: result.entities,
      confidence: result.confidence
    };
  } catch (error) {
    console.error("Error in AraBERT service:", error);
    // Fallback to simple intent detection
    return simulateAraBERT(text);
  }
}

/**
 * Simulates AraBERT analysis with a simple rule-based approach
 * Used as a fallback when OpenAI is not available
 */
function simulateAraBERT(text: string): AraBERTResponse {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based intent detection for Arabic
  let intent = 'get_help'; // Default intent
  let confidence = 0.6;
  
  if (lowerText.includes('مرحبا') || lowerText.includes('أهلا') || lowerText.includes('السلام عليكم')) {
    intent = 'greet';
    confidence = 0.9;
  } else if (lowerText.includes('شكرا') || lowerText.includes('جزاك الله')) {
    intent = 'thank';
    confidence = 0.9;
  } else if (lowerText.includes('مع السلامة') || lowerText.includes('وداعا')) {
    intent = 'goodbye';
    confidence = 0.9;
  } else if (lowerText.includes('تقرير') || lowerText.includes('تقارير')) {
    intent = 'get_reports';
    confidence = 0.8;
  } else if (lowerText.includes('مشاعر') || lowerText.includes('تحليل المشاعر')) {
    intent = 'get_sentiment_analysis';
    confidence = 0.8;
  } else if (lowerText.includes('إحصائيات') && (lowerText.includes('اجتماعي') || lowerText.includes('تواصل'))) {
    intent = 'get_social_stats';
    confidence = 0.8;
  } else if (lowerText.includes('تغطية') && lowerText.includes('إعلام')) {
    intent = 'get_media_coverage';
    confidence = 0.8;
  } else if (lowerText.includes('بحث') || lowerText.includes('ابحث')) {
    intent = 'search_content';
    confidence = 0.8;
  }
  
  // Simple entity extraction for Arabic
  const entities = [];
  
  // Extract report type
  if (lowerText.includes('اجتماعي') || lowerText.includes('تواصل')) {
    entities.push({ entity: 'report_type', value: 'وسائل التواصل الاجتماعي', confidence: 0.8 });
  } else if (lowerText.includes('مشاعر')) {
    entities.push({ entity: 'report_type', value: 'تحليل المشاعر', confidence: 0.8 });
  } else if (lowerText.includes('أداء')) {
    entities.push({ entity: 'report_type', value: 'أداء', confidence: 0.8 });
  }
  
  // Extract platform
  if (lowerText.includes('تويتر')) {
    entities.push({ entity: 'platform', value: 'twitter', confidence: 0.9 });
  } else if (lowerText.includes('فيسبوك')) {
    entities.push({ entity: 'platform', value: 'facebook', confidence: 0.9 });
  } else if (lowerText.includes('انستغرام') || lowerText.includes('انستجرام')) {
    entities.push({ entity: 'platform', value: 'instagram', confidence: 0.9 });
  }
  
  // Extract date range
  if (lowerText.includes('أمس')) {
    entities.push({ entity: 'date_range', value: 'yesterday', confidence: 0.9 });
  } else if (lowerText.includes('الأسبوع الماضي')) {
    entities.push({ entity: 'date_range', value: 'last week', confidence: 0.9 });
  } else if (lowerText.includes('هذا الشهر')) {
    entities.push({ entity: 'date_range', value: 'this month', confidence: 0.9 });
  } else if (lowerText.includes('اليوم')) {
    entities.push({ entity: 'date_range', value: 'today', confidence: 0.9 });
  }
  
  return { intent, entities, confidence };
}