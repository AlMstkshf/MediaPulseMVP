// Sentiment analysis color constants
export const SENTIMENT_COLORS = {
  POSITIVE: "#4CAF50", // Green
  NEUTRAL: "#FFC107",  // Yellow
  NEGATIVE: "#F44336", // Red
};

// Vibrant color palette for visualizations
export const VISUALIZATION_COLORS = {
  PRIMARY: "#4361ee",    // Bright blue
  SECONDARY: "#7209b7",  // Purple
  ACCENT1: "#f72585",    // Pink
  ACCENT2: "#4cc9f0",    // Cyan
  ACCENT3: "#4f7942",    // Green
  ACCENT4: "#ff9e00",    // Orange
  ACCENT5: "#8338ec",    // Violet
  ACCENT6: "#fb8500",    // Dark orange
  ACCENT7: "#06d6a0",    // Teal
  BACKGROUND1: "#f0f7ff", // Light blue background
  BACKGROUND2: "#fff0f6", // Light pink background
  GRADIENT_START: "#4361ee", // Gradient start color
  GRADIENT_END: "#7209b7",   // Gradient end color
};

// Default sentiment data structure with consistent colors
export const DEFAULT_SENTIMENT_DISTRIBUTION = [
  { name: "Positive", value: 60, color: SENTIMENT_COLORS.POSITIVE },
  { name: "Neutral", value: 30, color: SENTIMENT_COLORS.NEUTRAL },
  { name: "Negative", value: 10, color: SENTIMENT_COLORS.NEGATIVE },
];

// Useful for non-western language equivalents
export const SENTIMENT_TRANSLATIONS = {
  en: {
    POSITIVE: "Positive",
    NEUTRAL: "Neutral",
    NEGATIVE: "Negative",
  },
  ar: {
    POSITIVE: "إيجابي",
    NEUTRAL: "محايد",
    NEGATIVE: "سلبي",
  },
};

// Media platform types
export const MEDIA_PLATFORMS = ["twitter", "facebook", "instagram", "news"];

// Chart date ranges
export const DATE_RANGES = ["1w", "1m", "3m", "6m", "1y"];

// API endpoints
export const API_ENDPOINTS = {
  SENTIMENT_REPORTS: "/api/sentiment-reports",
  SOCIAL_POSTS: "/api/social-posts",
  SOCIAL_POSTS_COUNT: "/api/social-posts/count-by-platform",
  MEDIA_ITEMS: "/api/media",
  KEYWORDS: "/api/keywords",
  TUTORIALS: "/api/tutorials",
  ENTITIES: "/api/entities",
  AI_ASSISTANT: "/api/ai-assistant",
};

// Application routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PERSONALIZED_DASHBOARD: "/dashboard/personalized",
  MEDIA_CENTER: "/media-center",
  SOCIAL_MEDIA: "/social-media",
  ENTITY_MONITORING: "/entity-monitoring",
  REPORTS: "/reports",
  EXCELLENCE_INDICATORS: "/excellence-indicators",
  REPORTS_PERFORMANCE: "/reports/performance-visualization", // Updated to be a sub-route of reports
  TUTORIALS: "/tutorials",
  USERS: "/users",
  SETTINGS: "/settings",
  SUPPORT: "/support",
  AUTH: "/auth",
  PROFILE: "/profile"
};