/**
 * Action Service
 * 
 * This service functions as the Action Server in the RASA architecture.
 * It's responsible for executing actions based on detected intents and entities.
 * 
 * Architecture: React ChatUI → Backend API → Rasa Core+NLU → Action Server → Platform DB/API
 */

import { storage } from "../storage";

// Entity type definition
export interface Entity {
  entity: string;
  value: string;
  confidence: number;
  start?: number;
  end?: number;
}

// Action result type definition
export interface ActionResult {
  message: string;
  data?: any;
  followupAction?: string;
}

// User language definition
type Language = 'en' | 'ar';

/**
 * Main function to execute an action based on intent
 * This is the entry point that routes to specific action handlers
 */
export async function executeAction(
  intent: string,
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    console.log(`Executing action for intent: ${intent}`);
    
    // Map intents to their corresponding handler functions
    const intentHandlers: Record<string, (entities: Entity[], userId?: number, language?: Language) => Promise<ActionResult>> = {
      'get_reports': handleGetReportsAction,
      'get_sentiment_analysis': handleGetSentimentAction,
      'get_social_stats': handleGetSocialStatsAction,
      'get_media_coverage': handleGetMediaCoverageAction,
      'search_content': handleSearchContentAction,
      'get_help': handleGetHelpAction,
      'greet': handleGreetAction,
      'thank': handleThankAction,
      'goodbye': handleGoodbyeAction
    };
    
    // Check if we have a handler for this intent
    if (intentHandlers[intent]) {
      return await intentHandlers[intent](entities, userId, language);
    }
    
    // Fallback for unknown intents
    return {
      message: language === 'ar' 
        ? 'آسف، لا أستطيع فهم طلبك. هل يمكنك إعادة صياغته؟'
        : 'I\'m sorry, I couldn\'t understand your request. Could you rephrase it?',
      data: { fallback: true }
    };
  } catch (error) {
    console.error('Error executing action:', error);
    
    // Fallback response in case of error
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
        : 'Sorry, an error occurred while processing your request. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle get reports intent
 * Fetches the latest reports based on entities (report type, date range)
 */
async function handleGetReportsAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const reportType = entities.find(e => e.entity === 'report_type')?.value;
    
    // Fetch reports from storage
    const reports = await storage.getReports(userId, reportType);
    
    // Prepare response message
    let message = '';
    if (reports.length === 0) {
      message = language === 'ar'
        ? 'لم أجد أي تقارير تطابق معاييرك.'
        : 'I couldn\'t find any reports matching your criteria.';
    } else {
      if (language === 'ar') {
        message = `وجدت ${reports.length} تقارير`;
        if (reportType) {
          message += ` عن "${reportType}"`;
        }
        message += '. إليك أحدث التقارير:';
      } else {
        message = `I found ${reports.length} reports`;
        if (reportType) {
          message += ` about "${reportType}"`;
        }
        message += '. Here are the latest reports:';
      }
    }
    
    // Return results
    return {
      message,
      data: { reports: reports.slice(0, 5) } // Limit to 5 reports for display
    };
  } catch (error) {
    console.error('Error in handleGetReportsAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء استرجاع التقارير. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error retrieving reports. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle get sentiment analysis intent
 * Gets sentiment analysis for specified entities (platform, date range)
 */
async function handleGetSentimentAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const platform = entities.find(e => e.entity === 'platform')?.value;
    
    // Fetch sentiment analysis from storage
    const sentimentData = await storage.getSentimentAnalysis(platform);
    
    // Calculate total mentions
    const totalMentions = sentimentData.positive + sentimentData.negative + sentimentData.neutral;
    
    // Calculate percentages
    const positivePercent = totalMentions ? Math.round((sentimentData.positive / totalMentions) * 100) : 0;
    const negativePercent = totalMentions ? Math.round((sentimentData.negative / totalMentions) * 100) : 0;
    const neutralPercent = totalMentions ? Math.round((sentimentData.neutral / totalMentions) * 100) : 0;
    
    // Prepare response message
    let message = '';
    if (language === 'ar') {
      message = platform 
        ? `إليك تحليل المشاعر لمنصة ${platform}:`
        : 'إليك تحليل المشاعر العام:';
      
      message += `\n• إيجابي: ${positivePercent}% (${sentimentData.positive} ذكر)`;
      message += `\n• محايد: ${neutralPercent}% (${sentimentData.neutral} ذكر)`;
      message += `\n• سلبي: ${negativePercent}% (${sentimentData.negative} ذكر)`;
    } else {
      message = platform 
        ? `Here's the sentiment analysis for ${platform}:`
        : 'Here\'s the overall sentiment analysis:';
      
      message += `\n• Positive: ${positivePercent}% (${sentimentData.positive} mentions)`;
      message += `\n• Neutral: ${neutralPercent}% (${sentimentData.neutral} mentions)`;
      message += `\n• Negative: ${negativePercent}% (${sentimentData.negative} mentions)`;
    }
    
    // Return results
    return {
      message,
      data: { 
        sentiment: sentimentData,
        percentages: { positive: positivePercent, neutral: neutralPercent, negative: negativePercent }
      }
    };
  } catch (error) {
    console.error('Error in handleGetSentimentAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء استرجاع تحليل المشاعر. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error retrieving sentiment analysis. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle get social media statistics intent
 * Gets social media statistics for specified entities (platform, date range)
 */
async function handleGetSocialStatsAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const platform = entities.find(e => e.entity === 'platform')?.value;
    const metricType = entities.find(e => e.entity === 'metric_type')?.value;
    
    // Fetch social media stats from storage
    const statsData = await storage.getSocialMediaStats(platform, metricType);
    
    // Prepare response message
    let message = '';
    if (language === 'ar') {
      message = platform 
        ? `إليك إحصائيات وسائل التواصل الاجتماعي لمنصة ${platform}:`
        : 'إليك إحصائيات وسائل التواصل الاجتماعي العامة:';
      
      message += `\n• التفاعل: ${statsData.engagement.toLocaleString()}`;
      message += `\n• الوصول: ${statsData.reach.toLocaleString()}`;
      message += `\n• المتابعين: ${statsData.followers.toLocaleString()}`;
    } else {
      message = platform 
        ? `Here are the social media statistics for ${platform}:`
        : 'Here are the overall social media statistics:';
      
      message += `\n• Engagement: ${statsData.engagement.toLocaleString()}`;
      message += `\n• Reach: ${statsData.reach.toLocaleString()}`;
      message += `\n• Followers: ${statsData.followers.toLocaleString()}`;
    }
    
    // Return results
    return {
      message,
      data: { stats: statsData }
    };
  } catch (error) {
    console.error('Error in handleGetSocialStatsAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء استرجاع إحصائيات وسائل التواصل الاجتماعي. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error retrieving social media statistics. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle get media coverage intent
 * Gets media coverage for specified entities (keyword, source, date range)
 */
async function handleGetMediaCoverageAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const keyword = entities.find(e => e.entity === 'keyword')?.value;
    const source = entities.find(e => e.entity === 'source')?.value;
    
    // Fetch media coverage from storage
    const coverageData = await storage.getMediaCoverage(keyword, source);
    
    // Prepare response message
    let message = '';
    if (language === 'ar') {
      message = 'إليك تحليل التغطية الإعلامية';
      if (keyword) {
        message += ` للكلمة الرئيسية "${keyword}"`;
      }
      if (source) {
        message += ` من المصدر "${source}"`;
      }
      message += ':';
      
      message += `\n• المقالات: ${coverageData.articles.toLocaleString()}`;
      message += `\n• الانطباعات: ${coverageData.impressions.toLocaleString()}`;
      message += `\n• المشاعر: إيجابية ${coverageData.sentiment.positive}%، محايدة ${coverageData.sentiment.neutral}%، سلبية ${coverageData.sentiment.negative}%`;
    } else {
      message = 'Here\'s the media coverage analysis';
      if (keyword) {
        message += ` for keyword "${keyword}"`;
      }
      if (source) {
        message += ` from "${source}"`;
      }
      message += ':';
      
      message += `\n• Articles: ${coverageData.articles.toLocaleString()}`;
      message += `\n• Impressions: ${coverageData.impressions.toLocaleString()}`;
      message += `\n• Sentiment: ${coverageData.sentiment.positive}% positive, ${coverageData.sentiment.neutral}% neutral, ${coverageData.sentiment.negative}% negative`;
    }
    
    // Return results
    return {
      message,
      data: { coverage: coverageData }
    };
  } catch (error) {
    console.error('Error in handleGetMediaCoverageAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء استرجاع تحليل التغطية الإعلامية. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error retrieving media coverage analysis. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle search content intent
 * Searches for content based on entities (keyword, content type, date range)
 */
async function handleSearchContentAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const keyword = entities.find(e => e.entity === 'keyword')?.value;
    const contentType = entities.find(e => e.entity === 'content_type')?.value;
    
    if (!keyword) {
      return {
        message: language === 'ar'
          ? 'يرجى تحديد الكلمة الرئيسية التي ترغب في البحث عنها.'
          : 'Please specify a keyword to search for.',
        data: { error: 'missing_keyword' }
      };
    }
    
    // Search content in storage
    const searchResults = await storage.searchContent(keyword, contentType);
    
    // Prepare response message
    let message = '';
    if (searchResults.length === 0) {
      message = language === 'ar'
        ? `لم أجد أي محتوى يطابق الكلمة الرئيسية "${keyword}".`
        : `I couldn't find any content matching the keyword "${keyword}".`;
    } else {
      if (language === 'ar') {
        message = `وجدت ${searchResults.length} نتائج للكلمة الرئيسية "${keyword}"`;
        if (contentType) {
          message += ` من نوع المحتوى "${contentType}"`;
        }
        message += '. إليك بعض النتائج:';
      } else {
        message = `I found ${searchResults.length} results for keyword "${keyword}"`;
        if (contentType) {
          message += ` with content type "${contentType}"`;
        }
        message += '. Here are some results:';
      }
    }
    
    // Return results
    return {
      message,
      data: { results: searchResults.slice(0, 5) } // Limit to 5 results for display
    };
  } catch (error) {
    console.error('Error in handleSearchContentAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء البحث عن المحتوى. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error searching for content. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Action: Handle get help intent
 * Provides help information based on entities (feature, topic)
 */
async function handleGetHelpAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  try {
    // Extract relevant entities
    const feature = entities.find(e => e.entity === 'feature')?.value;
    const topic = entities.find(e => e.entity === 'topic')?.value;
    
    // If a specific feature was requested, provide feature-specific help
    if (feature) {
      return {
        message: getFeatureHelpMessage(feature, language),
        data: { feature }
      };
    }
    
    // If a specific topic was requested, provide topic-specific help
    if (topic) {
      // In a real system, this would be much more comprehensive
      const topicMessage = language === 'ar'
        ? `يمكنني مساعدتك في موضوع "${topic}". يرجى طرح سؤال محدد حول هذا الموضوع.`
        : `I can help you with the topic "${topic}". Please ask a specific question about this topic.`;
      
      return {
        message: topicMessage,
        data: { topic }
      };
    }
    
    // Generic help message
    const helpMessage = language === 'ar'
      ? 'أنا مساعد ذكاء اصطناعي مدرب لمساعدتك في منصتنا. يمكنني مساعدتك في:\n' +
        '• الحصول على التقارير\n' +
        '• تحليل المشاعر\n' +
        '• إحصائيات وسائل التواصل الاجتماعي\n' +
        '• تحليل التغطية الإعلامية\n' +
        '• البحث عن المحتوى\n\n' +
        'ماذا تحتاج المساعدة فيه اليوم؟'
      : 'I\'m an AI assistant trained to help you with our platform. I can help you with:\n' +
        '• Getting reports\n' +
        '• Sentiment analysis\n' +
        '• Social media statistics\n' +
        '• Media coverage analysis\n' +
        '• Searching for content\n\n' +
        'What do you need help with today?';
    
    return {
      message: helpMessage,
      data: { general_help: true }
    };
  } catch (error) {
    console.error('Error in handleGetHelpAction:', error);
    return {
      message: language === 'ar'
        ? 'عذرًا، حدث خطأ أثناء تقديم المساعدة. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error providing help. Please try again.',
      data: { error: true }
    };
  }
}

/**
 * Helper function to get feature-specific help messages
 */
function getFeatureHelpMessage(feature: string, language: 'en' | 'ar'): string {
  const lowerFeature = feature.toLowerCase();
  
  // Map of features to help messages
  const helpMessages: Record<string, { en: string, ar: string }> = {
    'reports': {
      en: 'Our reporting system allows you to generate custom reports on social media activity, media coverage, and sentiment analysis. You can say "Show me recent reports" or "Get social media reports from last week".',
      ar: 'يتيح لك نظام التقارير لدينا إنشاء تقارير مخصصة حول نشاط وسائل التواصل الاجتماعي والتغطية الإعلامية وتحليل المشاعر. يمكنك قول "أظهر لي التقارير الأخيرة" أو "احصل على تقارير وسائل التواصل الاجتماعي من الأسبوع الماضي".'
    },
    'sentiment': {
      en: 'Our sentiment analysis feature analyzes the sentiment of social media posts and media coverage. You can say "What\'s the sentiment analysis for Twitter?" or "Get sentiment analysis for our brand".',
      ar: 'تحلل ميزة تحليل المشاعر لدينا مشاعر منشورات وسائل التواصل الاجتماعي والتغطية الإعلامية. يمكنك قول "ما هو تحليل المشاعر لتويتر؟" أو "احصل على تحليل المشاعر لعلامتنا التجارية".'
    },
    'social': {
      en: 'Our social media tracking features monitor engagement, reach, and follower metrics across platforms. You can say "Get social media stats for Facebook" or "What\'s our social media performance?"',
      ar: 'تراقب ميزات تتبع وسائل التواصل الاجتماعي لدينا مقاييس المشاركة والوصول والمتابعين عبر المنصات. يمكنك قول "احصل على إحصائيات وسائل التواصل الاجتماعي لفيسبوك" أو "ما هو أداء وسائل التواصل الاجتماعي لدينا؟"'
    },
    'media': {
      en: 'Our media coverage analysis tracks mentions across news sites, blogs, and social media. You can say "Show me media coverage for our brand" or "Get media coverage for the keyword \'new product\'".',
      ar: 'يتتبع تحليل التغطية الإعلامية لدينا الإشارات عبر مواقع الأخبار والمدونات ووسائل التواصل الاجتماعي. يمكنك قول "أظهر لي التغطية الإعلامية لعلامتنا التجارية" أو "احصل على التغطية الإعلامية للكلمة الرئيسية \'منتج جديد\'".'
    },
    'search': {
      en: 'Our search feature allows you to find content across all monitored sources. You can say "Search for content with keyword \'sustainability\'" or "Find posts about \'new initiative\'".',
      ar: 'تتيح لك ميزة البحث لدينا العثور على المحتوى عبر جميع المصادر التي تتم مراقبتها. يمكنك قول "ابحث عن محتوى بالكلمة الرئيسية \'الاستدامة\'" أو "ابحث عن منشورات حول \'مبادرة جديدة\'".'
    }
  };
  
  // Try to match the feature to one of our predefined features
  for (const [key, messages] of Object.entries(helpMessages)) {
    if (lowerFeature.includes(key)) {
      return language === 'ar' ? messages.ar : messages.en;
    }
  }
  
  // Default help message if no specific feature match
  return language === 'ar'
    ? `يمكنني مساعدتك بخصوص "${feature}". يرجى طرح سؤال محدد حول هذه الميزة.`
    : `I can help you with "${feature}". Please ask a specific question about this feature.`;
}

/**
 * Action: Handle greet intent
 * Responds to greetings
 */
async function handleGreetAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  // Get time of day for personalized greeting
  const hour = new Date().getHours();
  let timeBasedGreeting = '';
  
  if (language === 'ar') {
    if (hour < 12) {
      timeBasedGreeting = 'صباح الخير';
    } else if (hour < 18) {
      timeBasedGreeting = 'مساء الخير';
    } else {
      timeBasedGreeting = 'مساء الخير';
    }
    
    return {
      message: `${timeBasedGreeting}! أنا مساعد منصة Media Pulse الذكي. كيف يمكنني مساعدتك اليوم؟`,
      data: { greeting: true }
    };
  } else {
    if (hour < 12) {
      timeBasedGreeting = 'Good morning';
    } else if (hour < 18) {
      timeBasedGreeting = 'Good afternoon';
    } else {
      timeBasedGreeting = 'Good evening';
    }
    
    return {
      message: `${timeBasedGreeting}! I'm the Media Pulse intelligent assistant. How can I help you today?`,
      data: { greeting: true }
    };
  }
}

/**
 * Action: Handle thank intent
 * Responds to expressions of gratitude
 */
async function handleThankAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  return {
    message: language === 'ar'
      ? 'على الرحب والسعة! هل هناك شيء آخر يمكنني مساعدتك به؟'
      : 'You\'re welcome! Is there anything else I can help you with?',
    data: { acknowledgment: true }
  };
}

/**
 * Action: Handle goodbye intent
 * Responds to farewells
 */
async function handleGoodbyeAction(
  entities: Entity[],
  userId?: number,
  language: Language = 'en'
): Promise<ActionResult> {
  return {
    message: language === 'ar'
      ? 'شكرًا لك على التحدث معي اليوم! أتمنى لك يومًا رائعًا.'
      : 'Thank you for chatting with me today! Have a great day.',
    data: { farewell: true }
  };
}