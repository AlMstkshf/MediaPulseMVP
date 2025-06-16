import OpenAI from "openai";
import { logger } from "../logger";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Flag to determine if we should use OpenAI or the simulated fallback
const USE_OPENAI = true; // Always use OpenAI

interface SentimentResult {
  score: number; // -1 to 1 where -1 is very negative, 0 is neutral, and 1 is very positive
  confidence: number; // 0 to 1
  topics: string[]; // Array of main topics detected in the text
  recommendations?: string[]; // Optional recommendations based on the sentiment
  language: string; // Detected language (e.g., 'en', 'ar')
}

/**
 * Local fallback function that does basic sentiment analysis
 * This is used when OpenAI API is unavailable or for development/testing
 */
function simulateSentimentAnalysis(text: string): SentimentResult {
  // Very basic detection of Arabic text (presence of Arabic Unicode characters)
  const hasArabicChars = /[\u0600-\u06FF]/.test(text);
  const language = hasArabicChars ? "ar" : "en";
  
  // Very simple keyword-based sentiment analysis
  const positiveWords = [
    "good", "great", "excellent", "amazing", "happy", "like", "love", "best", 
    "impressive", "wonderful", "fantastic", "perfect", "beautiful", "easy",
    // Arabic positive words
    "جيد", "رائع", "ممتاز", "مدهش", "سعيد", "أحب", "أفضل", "مثير للإعجاب", "جميل", "سهل"
  ];
  
  const negativeWords = [
    "bad", "poor", "terrible", "horrible", "hate", "dislike", "worst", 
    "difficult", "awful", "disappointing", "failure", "problem", "issue",
    // Arabic negative words
    "سيئ", "ضعيف", "فظيع", "مروع", "أكره", "لا أحب", "أسوأ", "صعب", "مخيب للآمال", "فشل", "مشكلة"
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  const totalWords = words.length;
  
  // Calculate sentiment score between -1 and 1
  let score = 0;
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
  }
  
  // Calculate confidence based on proportion of sentiment words
  const confidence = Math.min(1, (totalSentimentWords / totalWords) * 2);
  
  // Extract potential topics using frequency analysis
  const stopWords = new Set([
    "the", "a", "an", "in", "on", "at", "and", "or", "but", "is", "are", "was", "were",
    "be", "to", "of", "for", "with", "by", "about", "like", "through", "over", "before",
    "after", "since", "during", "this", "that", "these", "those", "my", "your", "our", 
    "their", "its", "his", "her", "i", "you", "he", "she", "we", "they", "it"
  ]);
  
  // Count word frequency for topic extraction
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and get top words as topics
  const topics = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Generate simple recommendations based on sentiment
  let recommendations: string[] = [];
  if (score > 0.5) {
    recommendations = ["Continue with current strategy as sentiment is very positive."];
  } else if (score > 0) {
    recommendations = ["Look for opportunities to improve positive sentiment further."];
  } else if (score > -0.5) {
    recommendations = ["Address the negative aspects mentioned to improve overall sentiment."];
  } else {
    recommendations = ["Urgent review needed as sentiment is very negative."];
  }
  
  return {
    score,
    confidence,
    topics,
    recommendations,
    language
  };
}

/**
 * Analyzes the sentiment of a social media post using OpenAI's advanced models.
 * Handles both Arabic and English content with cultural context awareness.
 */
export async function analyzeSentiment(text: string, context?: string): Promise<SentimentResult> {
  // If USE_OPENAI is false, use the local fallback
  if (!USE_OPENAI) {
    console.log("Using fallback sentiment analysis (OpenAI API unavailable)");
    return simulateSentimentAnalysis(text);
  }
  
  try {
    const contextPrompt = context ? `Consider this context: ${context}. ` : '';
    
    const systemPrompt = `You are a sentiment analysis expert specializing in UAE social media content in both Arabic and English. 
    ${contextPrompt}Your task is to analyze the sentiment, extract key topics, provide a confidence score, and detect the language.
    Format your response as a JSON object with these keys:
    - score: a number between -1 (very negative) and 1 (very positive)
    - confidence: a number between 0 and 1 indicating your confidence in this analysis
    - topics: an array of strings representing the main topics detected (max 5 topics)
    - recommendations: an array of strings with actionable insights based on the sentiment (optional)
    - language: the detected language code ("en" for English, "ar" for Arabic, etc.)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: systemPrompt
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
      score: Number(result.score),
      confidence: Number(result.confidence),
      topics: result.topics || [],
      recommendations: result.recommendations || undefined,
      language: result.language
    };
  } catch (error) {
    logger.error("Error analyzing sentiment with OpenAI", { error, textLength: text.length });
    
    // Fall back to local analysis if OpenAI fails
    logger.info("Falling back to local sentiment analysis");
    return simulateSentimentAnalysis(text);
  }
}

/**
 * Local fallback for entity extraction
 */
function simulateEntityExtraction(text: string): {
  people: string[],
  organizations: string[],
  locations: string[]
} {
  // Common UAE organizations for fallback
  const commonOrganizations = [
    "UAE Government", "Dubai Municipality", "ADNOC", "Etisalat", "Emirates", 
    "RTA", "DEWA", "Du", "Emaar", "Mubadala"
  ];
  
  // Common UAE locations for fallback
  const commonLocations = [
    "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah", 
    "Ras Al Khaimah", "Umm Al Quwain", "UAE", "Emirates"
  ];
  
  const people: string[] = [];
  const organizations: string[] = [];
  const locations: string[] = [];
  
  // Very basic extraction based on common patterns and known entities
  const words = text.split(/\s+/);
  
  // Look for capitalized words that might be names
  let i = 0;
  while (i < words.length) {
    const word = words[i];
    
    // Check for potential person names (two capitalized words in sequence)
    if (/^[A-Z][a-z]+$/.test(word) && i < words.length - 1 && /^[A-Z][a-z]+$/.test(words[i+1])) {
      people.push(`${word} ${words[i+1]}`);
      i += 2;
      continue;
    }
    
    // Check known organizations
    if (commonOrganizations.some(org => text.includes(org))) {
      commonOrganizations.forEach(org => {
        if (text.includes(org) && !organizations.includes(org)) {
          organizations.push(org);
        }
      });
    }
    
    // Check known locations
    if (commonLocations.some(loc => text.includes(loc))) {
      commonLocations.forEach(loc => {
        if (text.includes(loc) && !locations.includes(loc)) {
          locations.push(loc);
        }
      });
    }
    
    i++;
  }
  
  return {
    people,
    organizations,
    locations
  };
}

/**
 * Extracts key entities (people, organizations, locations) from text.
 */
export async function extractEntities(text: string): Promise<{
  people: string[],
  organizations: string[],
  locations: string[]
}> {
  // If USE_OPENAI is false, use the local fallback
  if (!USE_OPENAI) {
    console.log("Using fallback entity extraction (OpenAI API unavailable)");
    return simulateEntityExtraction(text);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extract key named entities from the text and categorize them. 
          Return a JSON object with these keys:
          - people: array of person names
          - organizations: array of organization names
          - locations: array of location names`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      people: result.people || [],
      organizations: result.organizations || [],
      locations: result.locations || []
    };
  } catch (error) {
    console.error("Error extracting entities with OpenAI:", error);
    
    // Fall back to local analysis if OpenAI fails
    console.log("Falling back to local entity extraction");
    return simulateEntityExtraction(text);
  }
}

/**
 * Local fallback for trend analysis
 */
function simulateTrendAnalysis(posts: string[], timeframe: string): {
  trendingTopics: string[],
  sentimentShift: number,
  recommendations: string[]
} {
  // Analyze sentiment of all posts
  const sentiments = posts.map(post => simulateSentimentAnalysis(post));
  
  // Calculate average sentiment score
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  
  // Collect all topics
  const allTopics: Record<string, number> = {};
  sentiments.forEach(s => {
    s.topics.forEach(topic => {
      allTopics[topic] = (allTopics[topic] || 0) + 1;
    });
  });
  
  // Get trending topics by frequency
  const trendingTopics = Object.entries(allTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
  
  // Simulate a sentiment shift based on timeframe
  // For demonstration, we'll use a random shift between -0.3 and 0.3
  const sentimentShift = (Math.random() * 0.6) - 0.3;
  
  // Generate recommendations
  let recommendations: string[] = [];
  if (avgSentiment > 0.3) {
    recommendations = [
      "Continue with current engagement strategy as overall sentiment is positive",
      `Focus more on trending topics: ${trendingTopics.slice(0, 2).join(', ')}`
    ];
  } else if (avgSentiment > -0.3) {
    recommendations = [
      "Monitor sentiment closely as it is currently neutral",
      `Increase engagement on topics: ${trendingTopics.slice(0, 2).join(', ')}`,
      "Consider addressing any negative feedback promptly"
    ];
  } else {
    recommendations = [
      "Take immediate action to address negative sentiment",
      "Develop a targeted communication plan to address concerns",
      `Focus on positive messaging around: ${trendingTopics.slice(0, 1).join(', ')}`
    ];
  }
  
  return {
    trendingTopics,
    sentimentShift,
    recommendations
  };
}

/**
 * Analyzes a collection of posts to identify trends and patterns.
 */
export async function analyzeTrends(posts: string[], timeframe: string): Promise<{
  trendingTopics: string[],
  sentimentShift: number,
  recommendations: string[]
}> {
  // If USE_OPENAI is false, use the local fallback
  if (!USE_OPENAI) {
    console.log("Using fallback trend analysis (OpenAI API unavailable)");
    return simulateTrendAnalysis(posts, timeframe);
  }
  
  try {
    // Combine posts into a single text for analysis, limiting the total size
    const combinedPosts = posts.join('\n\n').slice(0, 8000); // Limit to avoid token issues
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a social media trend analyst. Analyze the following collection of posts from the ${timeframe} timeframe.
          Identify trending topics, sentiment shifts, and provide strategic recommendations.
          Return your analysis as a JSON object with these keys:
          - trendingTopics: array of trending topics in order of importance
          - sentimentShift: a number between -1 and 1 representing the overall sentiment direction (-1 for negative shift, 1 for positive shift)
          - recommendations: array of strategic recommendations based on these trends`
        },
        {
          role: "user",
          content: combinedPosts
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      trendingTopics: result.trendingTopics || [],
      sentimentShift: Number(result.sentimentShift) || 0,
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("Error analyzing trends with OpenAI:", error);
    
    // Fall back to local analysis if OpenAI fails
    console.log("Falling back to local trend analysis");
    return simulateTrendAnalysis(posts, timeframe);
  }
}

/**
 * Local fallback for report summary generation
 */
function simulateReportSummary(data: any): string {
  const englishSummary = `
# Media Intelligence Report Summary

## Key Findings
- Overall sentiment across platforms is ${data.sentiment > 0 ? 'positive' : 'negative'} with a score of ${data.sentiment || 0}
- Top trending topics include ${data.topics?.join(', ') || 'various government services'}
- ${data.postCount || 10} posts analyzed across ${data.platforms?.join(', ') || 'multiple platforms'}

## Recommendations
- ${data.sentiment > 0 ? 'Continue current engagement strategy' : 'Implement targeted communication plan'}
- Monitor conversations around ${data.topics?.[0] || 'key services'}
- Engage with audience through ${data.platforms?.[0] || 'social media'} for maximum reach
`;

  const arabicSummary = `
# ملخص تقرير ذكاء وسائل الإعلام

## النتائج الرئيسية
- المشاعر العامة عبر المنصات ${data.sentiment > 0 ? 'إيجابية' : 'سلبية'} بدرجة ${data.sentiment || 0}
- تشمل الموضوعات الرائجة ${data.topics?.join('، ') || 'خدمات حكومية متنوعة'}
- تم تحليل ${data.postCount || 10} منشور عبر ${data.platforms?.join('، ') || 'منصات متعددة'}

## توصيات
- ${data.sentiment > 0 ? 'الاستمرار في استراتيجية المشاركة الحالية' : 'تنفيذ خطة اتصال مستهدفة'}
- مراقبة المحادثات حول ${data.topics?.[0] || 'الخدمات الرئيسية'}
- التفاعل مع الجمهور من خلال ${data.platforms?.[0] || 'وسائل التواصل الاجتماعي'} للوصول إلى أقصى قدر
`;

  return englishSummary + '\n\n' + arabicSummary;
}

export async function generateReportSummary(data: any): Promise<string> {
  // If USE_OPENAI is false, use the local fallback
  if (!USE_OPENAI) {
    console.log("Using fallback report generation (OpenAI API unavailable)");
    return simulateReportSummary(data);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional media intelligence analyst working for a UAE government agency. 
          Generate a concise, professional report summary based on the provided data.
          The summary should highlight key findings, trends, and actionable insights in a formal tone.
          Use professional language appropriate for government officials.
          Include both Arabic and English versions of the summary.`
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.4,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating report summary with OpenAI:", error);
    
    // Fall back to local generation if OpenAI fails
    console.log("Falling back to local report generation");
    return simulateReportSummary(data);
  }
}