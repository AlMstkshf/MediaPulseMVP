/**
 * Centralized API endpoints configuration
 */

export const API_ENDPOINTS = {
  // User and authentication
  USER: '/api/user',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  REGISTER: '/api/register',
  
  // Social media
  SOCIAL_POSTS: '/api/social-posts',
  SOCIAL_POSTS_BY_PLATFORM: '/api/social-posts/count-by-platform',
  
  // Sentiment analysis
  SENTIMENT_REPORTS: '/api/sentiment-reports',
  
  // Mentions and keywords
  MENTIONS: '/api/mentions',
  KEYWORDS: '/api/keywords',
  TRENDING_TOPICS: '/api/keywords/trending',
  
  // Media items
  MEDIA_ITEMS: '/api/media-items',
  
  // Reports
  REPORTS: '/api/reports',
  EXPORT_REPORT: '/api/reports/export',
  
  // NLP Analysis
  ANALYZE_SENTIMENT: '/api/analyze/sentiment',
  ANALYZE_NLP: '/api/nlp/analyze',
  
  // KPIs and analytics
  KPI_DATA: '/api/kpi-data',
  ANALYTICS: '/api/analytics',
  
  // Support and knowledge base
  SUPPORT_TICKETS: '/api/support-tickets',
  KNOWLEDGE_BASE: '/api/knowledge-base',
};

/**
 * Default API request parameters
 */
export const DEFAULT_API_PARAMS = {
  LIMIT: 10,
  OFFSET: 0,
  DAYS: 30,
};