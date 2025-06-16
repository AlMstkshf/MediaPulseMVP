import { 
  User, InsertUser, 
  Tenant, InsertTenant,
  MediaItem, InsertMediaItem,
  SocialPost, InsertSocialPost,
  Keyword, InsertKeyword,
  SentimentReport, InsertSentimentReport,
  Tutorial, InsertTutorial,
  KeywordAlert, InsertKeywordAlert,
  GovEntity, InsertGovEntity,
  PressRelease, InsertPressRelease,
  LoginHistory, InsertLoginHistory,
  ApiKey, InsertApiKey,
  Webhook, InsertWebhook,
  FaqItem, InsertFaqItem,
  KnowledgeBaseArticle, InsertKnowledgeBaseArticle,
  SupportTicket, InsertSupportTicket,
  TicketResponse, InsertTicketResponse,
  ContactMessage, InsertContactMessage,
  Report, InsertReport,
  AchievementBadge, InsertAchievementBadge,
  UserAchievement, InsertUserAchievement,
  UserGamificationStats, InsertUserGamificationStats,
  ActivityFeed, InsertActivityFeed,
  users, tenants, mediaItems, socialPosts, keywords, sentimentReports, tutorials,
  keywordAlerts, govEntities, socialPostsToGovEntities, pressReleases, loginHistory,
  apiKeys, webhooks, faqItems, knowledgeBaseArticles, supportTickets, ticketResponses, contactMessages,
  reports, achievementBadges, userAchievements, userGamificationStats, activityFeed
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, desc, or, and, sql, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Initialize the session store with a fallback mechanism
let PostgresSessionStore;
try {
  PostgresSessionStore = connectPg(session);
} catch (error) {
  console.warn('Failed to initialize PostgreSQL session store');
  const MemoryStore = require('memorystore')(session);
  PostgresSessionStore = function() {
    return new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  };
}

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // Tenant management - new multi-tenant capability
  getTenant(tenantId: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(tenantId: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(tenantId?: string): Promise<User[]>;
  
  // User authentication and security
  recordLoginHistory(loginData: InsertLoginHistory): Promise<LoginHistory>;
  getUserLoginHistory(userId: number, limit?: number): Promise<LoginHistory[]>;
  setTwoFactorSecret(userId: number, secret: string): Promise<boolean>;
  setTwoFactorEnabled(userId: number, enabled: boolean): Promise<boolean>;
  generateTwoFactorRecoveryCodes(userId: number): Promise<string[]>;
  
  // Chat methods
  saveChatMessage(message: { userId: number, role: 'user' | 'bot', content: string, timestamp: Date }): Promise<void>;
  getChatHistory(userId: number): Promise<Array<{ id?: number, role: 'user' | 'bot', content: string, timestamp?: Date }>>;
  clearChatHistory(userId: number): Promise<void>;
  
  // Report management
  getReports(userId?: number, reportType?: string): Promise<Report[]>;
  getReportById(id: number, userId?: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, userId: number | undefined, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: number, userId?: number): Promise<boolean>;
  
  // Chat and Action Server interfaces
  getSentimentAnalysis(platform?: string): Promise<{
    positive: number,
    negative: number,
    neutral: number,
    byPlatform?: Record<string, { positive: number, negative: number, neutral: number }>
  }>;
  
  getSocialMediaStats(platform?: string, metricType?: string): Promise<{
    engagement: number,
    reach: number,
    followers: number,
    byPlatform?: Record<string, { engagement: number, reach: number, followers: number }>
  }>;
  
  getMediaCoverage(keyword?: string, source?: string): Promise<{
    articles: number,
    impressions: number,
    sentiment: { positive: number, neutral: number, negative: number },
    bySource?: Record<string, { articles: number, impressions: number }>
  }>;
  
  searchContent(keyword: string, contentType?: string): Promise<Array<{
    id: number,
    title: string,
    excerpt: string,
    type: string,
    source: string,
    date: Date
  }>>;

  // Media items
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  createMediaItem(item: InsertMediaItem): Promise<MediaItem>;
  updateMediaItem(id: number, item: Partial<InsertMediaItem>): Promise<MediaItem | undefined>;
  deleteMediaItem(id: number): Promise<boolean>;
  listMediaItems(filters?: {
    mediaType?: string;
    category?: string;
    tags?: string[];
  }): Promise<MediaItem[]>;

  // Social posts
  getSocialPost(id: number): Promise<SocialPost | undefined>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  listSocialPosts(filters?: {
    platform?: string;
    sentiment?: number;
    keywords?: string[];
    entityId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<SocialPost[]>;

  // Keywords
  getKeyword(id: number): Promise<Keyword | undefined>;
  getKeywordByWord(word: string): Promise<Keyword | undefined>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  updateKeyword(id: number, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined>;
  deleteKeyword(id: number): Promise<boolean>;
  listKeywords(onlyActive?: boolean): Promise<Keyword[]>;

  // Keyword Alerts
  getKeywordAlert(id: number): Promise<KeywordAlert | undefined>;
  createKeywordAlert(alert: InsertKeywordAlert): Promise<KeywordAlert>;
  updateKeywordAlert(id: number, alert: Partial<InsertKeywordAlert>): Promise<KeywordAlert | undefined>;
  listKeywordAlerts(filters?: {
    keywordId?: number;
    read?: boolean;
    alertSent?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<KeywordAlert[]>;
  markKeywordAlertAsRead(id: number): Promise<boolean>;
  getKeywordAlertWithDetails(id: number): Promise<(KeywordAlert & { keyword: Keyword, post: SocialPost }) | undefined>;

  // Sentiment reports
  getSentimentReport(id: number): Promise<SentimentReport | undefined>;
  createSentimentReport(report: InsertSentimentReport): Promise<SentimentReport>;
  listSentimentReports(filters?: {
    platform?: string;
    entityId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<SentimentReport[]>;
  


  // Tutorials
  getTutorial(id: number): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  listTutorials(level?: string): Promise<Tutorial[]>;
  
  // UAE Government Entities
  getGovEntity(id: number): Promise<GovEntity | undefined>;
  getGovEntityByName(name: string): Promise<GovEntity | undefined>;
  createGovEntity(entity: InsertGovEntity): Promise<GovEntity>;
  updateGovEntity(id: number, entity: Partial<InsertGovEntity>): Promise<GovEntity | undefined>;
  deleteGovEntity(id: number): Promise<boolean>;
  listGovEntities(filters?: {
    entityType?: string;
    region?: string;
    isActive?: boolean;
  }): Promise<GovEntity[]>;
  
  // Entity mentions in posts
  linkEntityToPost(socialPostId: number, entityId: number, mentionType?: string, sentimentScore?: number): Promise<boolean>;
  getPostEntities(socialPostId: number): Promise<GovEntity[]>;
  getEntityPosts(entityId: number): Promise<SocialPost[]>;
  
  // Press Releases
  getPressRelease(id: number): Promise<PressRelease | undefined>;
  createPressRelease(pressRelease: InsertPressRelease): Promise<PressRelease>;
  updatePressRelease(id: number, pressRelease: Partial<InsertPressRelease>): Promise<PressRelease | undefined>;
  deletePressRelease(id: number): Promise<boolean>;
  listPressReleases(filters?: {
    status?: string;
    authorId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  }): Promise<PressRelease[]>;
  publishPressRelease(id: number): Promise<PressRelease | undefined>;
  schedulePressRelease(id: number, scheduledFor: Date): Promise<PressRelease | undefined>;
  getScheduledPressReleases(): Promise<PressRelease[]>;
  
  // API Keys
  getApiKey(id: number): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  listApiKeys(userId: number): Promise<ApiKey[]>;
  updateApiKeyLastUsed(id: number): Promise<boolean>;
  
  // Webhooks
  getWebhook(id: number): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  listWebhooks(userId: number): Promise<Webhook[]>;
  updateWebhookLastTriggered(id: number, success: boolean): Promise<boolean>;
  
  // FAQ Items
  getFaqItem(id: number): Promise<FaqItem | undefined>;
  createFaqItem(faqData: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, faqData: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: number): Promise<boolean>;
  listFaqItems(filters?: { category?: string, isActive?: boolean }): Promise<FaqItem[]>;

  // Contact Messages
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: number, status: string): Promise<ContactMessage | undefined>;
  respondToContactMessage(id: number, response: { responseMessage: string, respondedBy: number }): Promise<ContactMessage | undefined>;
  listContactMessages(filters?: { status?: string, department?: string }): Promise<ContactMessage[]>;
  
  // Reports
  getReports(userId?: number): Promise<Report[]>;
  getReportById(id: number, userId?: number): Promise<Report | undefined>;
  createReport(reportData: InsertReport): Promise<Report>;
  updateReport(id: number, userId: number | undefined, reportData: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: number, userId?: number): Promise<boolean>;

  // Achievement Badges
  getAchievementBadge(id: number): Promise<AchievementBadge | undefined>;
  createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge>;
  updateAchievementBadge(id: number, badge: Partial<InsertAchievementBadge>): Promise<AchievementBadge | undefined>;
  deleteAchievementBadge(id: number): Promise<boolean>;
  listAchievementBadges(filters?: { category?: string, level?: number, isHidden?: boolean }): Promise<AchievementBadge[]>;

  // User Achievements
  getUserAchievement(id: number): Promise<UserAchievement | undefined>;
  getUserAchievementByBadge(userId: number, badgeId: number): Promise<UserAchievement | undefined>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined>;
  getUserAchievements(userId: number, onlyUnlocked?: boolean): Promise<(UserAchievement & { badge: AchievementBadge })[]>;
  checkAndUpdateAchievementProgress(userId: number, actionType: string, count?: number): Promise<UserAchievement[]>;
  unlockAchievement(userId: number, badgeId: number): Promise<UserAchievement | undefined>;

  // User Gamification Stats
  getUserGamificationStats(userId: number): Promise<UserGamificationStats | undefined>;
  createUserGamificationStats(stats: InsertUserGamificationStats): Promise<UserGamificationStats>;
  updateUserGamificationStats(userId: number, stats: Partial<InsertUserGamificationStats>): Promise<UserGamificationStats | undefined>;
  incrementUserStats(userId: number, metricName: string, value?: number): Promise<UserGamificationStats | undefined>;
  updateUserLevel(userId: number): Promise<UserGamificationStats | undefined>;
  updateUserStreak(userId: number): Promise<UserGamificationStats | undefined>;
  getUsersLeaderboard(limit?: number): Promise<UserGamificationStats[]>;

  // Activity Feed
  getActivityFeed(id: number): Promise<ActivityFeed | undefined>;
  createActivityFeed(activity: InsertActivityFeed): Promise<ActivityFeed>;
  getUserActivityFeed(userId: number, limit?: number): Promise<ActivityFeed[]>;
  markActivityAsRead(id: number): Promise<boolean>;
  markAllUserActivitiesAsRead(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mediaItems: Map<number, MediaItem>;
  private socialPosts: Map<number, SocialPost>;
  private keywords: Map<number, Keyword>;
  private keywordAlerts: Map<number, KeywordAlert>;
  private sentimentReports: Map<number, SentimentReport>;
  private tutorials: Map<number, Tutorial>;
  private govEntities: Map<number, GovEntity>;
  private pressReleases: Map<number, PressRelease>;
  private socialPostsToGovEntities: Map<string, { socialPostId: number, entityId: number, mentionType?: string, sentimentScore?: number }>;
  private apiKeys: Map<number, ApiKey>;
  private webhooks: Map<number, Webhook>;
  private faqItems: Map<number, FaqItem>;
  private contactMessages: Map<number, ContactMessage>;
  private reports: Map<number, Report>;
  private achievementBadges: Map<number, AchievementBadge>;
  private userAchievements: Map<number, UserAchievement>;
  private userGamificationStats: Map<number, UserGamificationStats>;
  private activityFeed: Map<number, ActivityFeed>;
  // Chat message storage
  private chatMessages: Map<number, Array<{ id: number, userId: number, role: 'user' | 'bot', content: string, timestamp: Date }>>;
  sessionStore: session.Store;
  
  private userId = 1;
  private mediaItemId = 1;
  private socialPostId = 1;
  private keywordId = 1;
  private keywordAlertId = 1;
  private sentimentReportId = 1;
  private tutorialId = 1;
  private govEntityId = 1;
  private pressReleaseId = 1;
  private apiKeyId = 1;
  private webhookId = 1;
  private faqItemId = 1;
  private contactMessageId = 1;
  private reportId = 1;
  private achievementBadgeId = 1;
  private chatMessageId = 1;
  private userAchievementId = 1;
  private activityFeedId = 1;

  constructor() {
    // Initialize memory-based session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    // Initialize storage maps
    this.users = new Map();
    this.mediaItems = new Map();
    this.socialPosts = new Map();
    this.keywords = new Map();
    this.keywordAlerts = new Map();
    this.sentimentReports = new Map();
    this.tutorials = new Map();
    this.govEntities = new Map();
    this.pressReleases = new Map();
    this.socialPostsToGovEntities = new Map();
    this.apiKeys = new Map();
    this.webhooks = new Map();
    this.faqItems = new Map();
    this.contactMessages = new Map();
    this.reports = new Map();
    this.achievementBadges = new Map();
    this.userAchievements = new Map();
    this.userGamificationStats = new Map();
    this.activityFeed = new Map();
    this.chatMessages = new Map();

    // Add initial admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real system, this would be hashed
      fullName: "أحمد المنصوري",
      email: "admin@example.com",
      role: "admin",
      avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg",
      language: "ar"
    });

    // Add some initial keywords
    const initialKeywords = [
      { word: "الابتكار", category: "general", isActive: true, alertThreshold: 100, changePercentage: 24 },
      { word: "التنمية المستدامة", category: "environment", isActive: true, alertThreshold: 50, changePercentage: 12 },
      { word: "المنصة الرقمية", category: "technology", isActive: true, alertThreshold: 80, changePercentage: 3 },
      { word: "الذكاء الاصطناعي", category: "technology", isActive: true, alertThreshold: 70, changePercentage: 31 },
      { word: "تجربة المستخدم", category: "design", isActive: true, alertThreshold: 40, changePercentage: -7 }
    ];

    initialKeywords.forEach(kw => this.createKeyword(kw));

    // Add some initial tutorials
    const initialTutorials = [
      {
        title: "كيفية إنشاء تقرير تحليلي",
        description: "تعلم كيفية إنشاء تقارير تحليلية مفصلة باستخدام المنصة",
        videoUrl: "https://example.com/tutorial1.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
        duration: "5:24",
        level: "beginner"
      },
      {
        title: "تحليل المشاعر والاتجاهات",
        description: "دليل متكامل لفهم وتحليل مشاعر الجمهور واتجاهات المحتوى",
        videoUrl: "https://example.com/tutorial2.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        duration: "8:12",
        level: "intermediate"
      },
      {
        title: "إدارة الأزمات الإعلامية",
        description: "استراتيجيات متقدمة للتعامل مع الأزمات الإعلامية وإدارتها بفعالية",
        videoUrl: "https://example.com/tutorial3.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
        duration: "12:45",
        level: "advanced"
      }
    ];

    initialTutorials.forEach(tutorial => this.createTutorial(tutorial));

    // Add initial sentiment report
    this.createSentimentReport({
      date: new Date(),
      positive: 42,
      neutral: 35,
      negative: 23,
      keywords: {
        positive: ["الابتكار", "التقدم", "التنمية"],
        neutral: ["المستقبل", "الاستدامة"],
        negative: ["التكنولوجيا", "المجتمع"]
      },
      platform: "all"
    });
    
    // Add initial FAQs
    const initialFaqs = [
      {
        question: "كيف يمكنني إنشاء تقرير تحليلي؟",
        answer: "يمكنك إنشاء تقرير تحليلي عن طريق الذهاب إلى لوحة التحكم والنقر على 'تقارير جديدة' ثم اختيار نوع التقرير والفترة الزمنية المطلوبة.",
        category: "التقارير",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "هل يمكنني تصدير البيانات إلى Excel؟",
        answer: "نعم، يمكنك تصدير جميع التقارير والبيانات التحليلية إلى صيغة Excel أو PDF من خلال النقر على أيقونة التصدير في أعلى التقرير.",
        category: "التقارير",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "ما هي آلية تحليل المشاعر؟",
        answer: "يعتمد نظام تحليل المشاعر على خوارزميات الذكاء الاصطناعي المتقدمة التي تحلل محتوى المنشورات والتعليقات وتصنفها إلى إيجابية وسلبية ومحايدة بناءً على تحليل النص واللغة المستخدمة.",
        category: "التحليل",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "كيف يمكنني إعداد التنبيهات للكلمات المفتاحية؟",
        answer: "يمكنك إعداد التنبيهات من خلال الانتقال إلى صفحة 'الكلمات المفتاحية'، ثم النقر على 'إضافة كلمة مفتاحية جديدة' وتحديد معايير التنبيه مثل عتبة التكرار ونوع المحتوى.",
        category: "الكلمات المفتاحية",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "هل يمكنني متابعة عدة جهات حكومية في نفس الوقت؟",
        answer: "نعم، المنصة تدعم متابعة وتحليل عدة جهات حكومية في وقت واحد. يمكنك اختيار الجهات التي تريد متابعتها من صفحة 'الجهات الحكومية' وإنشاء لوحة تحكم مخصصة.",
        category: "التحليل",
        isActive: true,
        sortOrder: 2
      }
    ];

    initialFaqs.forEach(faq => this.createFaqItem(faq));
    
    // Add initial UAE government entities
    const initialGovEntities = [
      {
        name: "Ministry of Interior",
        arabicName: "وزارة الداخلية",
        entityType: "federal",
        region: "UAE",
        iconUrl: "https://www.moi.gov.ae/images/logo.png",
        websiteUrl: "https://www.moi.gov.ae",
        isActive: true,
        priority: 10
      },
      {
        name: "Ministry of Finance",
        arabicName: "وزارة المالية",
        entityType: "federal",
        region: "UAE",
        iconUrl: "https://www.mof.gov.ae/assets/img/logo.png",
        websiteUrl: "https://www.mof.gov.ae",
        isActive: true,
        priority: 9
      },
      {
        name: "Dubai Government",
        arabicName: "حكومة دبي",
        entityType: "local",
        region: "Dubai",
        iconUrl: "https://www.dubai.gov.ae/PublishingImages/logo.png",
        websiteUrl: "https://www.dubai.gov.ae",
        isActive: true,
        priority: 8
      },
      {
        name: "Abu Dhabi Government",
        arabicName: "حكومة أبوظبي",
        entityType: "local",
        region: "Abu Dhabi",
        iconUrl: "https://www.abudhabi.gov.ae/Style%20Library/assets/img/logo.png",
        websiteUrl: "https://www.tamm.abudhabi",
        isActive: true,
        priority: 8
      },
      {
        name: "Ajman Government",
        arabicName: "حكومة عجمان",
        entityType: "local",
        region: "Ajman",
        iconUrl: "https://www.ajman.gov.ae/assets/img/logo.png",
        websiteUrl: "https://www.ajman.gov.ae",
        isActive: true,
        priority: 7
      }
    ];
    
    initialGovEntities.forEach(entity => this.createGovEntity(entity));

    // Add initial achievement badges
    const initialAchievementBadges = [
      {
        name: "First Login",
        description: "Welcome to the platform! You've logged in for the first time.",
        category: "system",
        level: 1,
        iconUrl: "/badges/first-login.svg",
        criteria: {
          type: "login_count",
          count: 1
        },
        points: 10,
        isHidden: false
      },
      {
        name: "Report Analyst",
        description: "You've generated your first sentiment analysis report.",
        category: "analysis",
        level: 1,
        iconUrl: "/badges/report-analyst.svg",
        criteria: {
          type: "reports_generated",
          count: 1
        },
        points: 20,
        isHidden: false
      },
      {
        name: "Social Media Monitor",
        description: "You've tracked 10 social media posts.",
        category: "social",
        level: 1,
        iconUrl: "/badges/social-monitor.svg",
        criteria: {
          type: "posts_tracked",
          count: 10
        },
        points: 15,
        isHidden: false
      },
      {
        name: "Consistent Analyst",
        description: "You've used the platform for 3 consecutive days.",
        category: "engagement",
        level: 1,
        iconUrl: "/badges/consistent-analyst.svg",
        criteria: {
          type: "login_streak",
          daysStreak: 3
        },
        points: 30,
        isHidden: false
      },
      {
        name: "Keywords Master",
        description: "You've created 5 keyword alerts.",
        category: "content",
        level: 1,
        iconUrl: "/badges/keywords-master.svg",
        criteria: {
          type: "alerts_created",
          count: 5
        },
        points: 25,
        isHidden: false
      },
      {
        name: "Dashboard Customizer",
        description: "You've customized your dashboard widgets.",
        category: "engagement",
        level: 1,
        iconUrl: "/badges/dashboard-customizer.svg",
        criteria: {
          type: "dashboard_customizations",
          count: 1
        },
        points: 15,
        isHidden: false
      },
      {
        name: "Rapid Responder",
        description: "You've responded to a high-priority alert within 5 minutes.",
        category: "analysis",
        level: 2,
        iconUrl: "/badges/rapid-responder.svg",
        criteria: {
          type: "alert_response_time",
          count: 1
        },
        points: 50,
        isHidden: false
      },
      {
        name: "Content Creator",
        description: "You've created your first media item.",
        category: "content",
        level: 1,
        iconUrl: "/badges/content-creator.svg",
        criteria: {
          type: "media_items_created",
          count: 1
        },
        points: 20,
        isHidden: false
      }
    ];

    initialAchievementBadges.forEach(badge => this.createAchievementBadge(badge));

    // Initialize gamification stats for admin user
    this.createUserGamificationStats({
      userId: 1,
      totalPoints: 0,
      level: 1,
      streak: 0,
      lastActivityDate: new Date(),
      metrics: {
        logins: 1,
        reportsGenerated: 0,
        postsCreated: 0,
        alertsReviewed: 0,
        dashboardCustomizations: 0,
        analysisRun: 0,
        daysSinceJoined: 0
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryCodes: null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) return false;
    return this.users.delete(id);
  }
  
  // User authentication and security methods
  private loginHistories: Map<number, LoginHistory[]> = new Map();
  private loginHistoryId = 1;
  
  async recordLoginHistory(loginData: InsertLoginHistory): Promise<LoginHistory> {
    const id = this.loginHistoryId++;
    const record: LoginHistory = { 
      ...loginData, 
      id,
      loginTime: new Date()
    };
    
    const userHistory = this.loginHistories.get(loginData.userId) || [];
    userHistory.push(record);
    this.loginHistories.set(loginData.userId, userHistory);
    
    return record;
  }
  
  async getUserLoginHistory(userId: number, limit: number = 10): Promise<LoginHistory[]> {
    const userHistory = this.loginHistories.get(userId) || [];
    return userHistory
      .sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime())
      .slice(0, limit);
  }
  
  async setTwoFactorSecret(userId: number, secret: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    user.twoFactorSecret = secret;
    this.users.set(userId, user);
    return true;
  }
  
  async setTwoFactorEnabled(userId: number, enabled: boolean): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    user.twoFactorEnabled = enabled;
    this.users.set(userId, user);
    return true;
  }
  
  async generateTwoFactorRecoveryCodes(userId: number): Promise<string[]> {
    const user = this.users.get(userId);
    if (!user) return [];
    
    // Generate 10 random recovery codes
    const recoveryCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 12).toUpperCase()
    );
    
    user.twoFactorRecoveryCodes = recoveryCodes;
    this.users.set(userId, user);
    
    return recoveryCodes;
  }

  // Chat methods
  async saveChatMessage(message: { userId: number, role: 'user' | 'bot', content: string, timestamp: Date }): Promise<void> {
    // Get or create user chat history
    if (!this.chatMessages.has(message.userId)) {
      this.chatMessages.set(message.userId, []);
    }
    
    // Add message to user's chat history
    const chatHistory = this.chatMessages.get(message.userId);
    if (chatHistory) {
      chatHistory.push({
        id: this.chatMessageId++,
        userId: message.userId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp
      });
    }
  }
  
  async getChatHistory(userId: number): Promise<Array<{ id?: number, role: 'user' | 'bot', content: string, timestamp?: Date }>> {
    // Return user's chat history or empty array if none exists
    const chatHistory = this.chatMessages.get(userId) || [];
    
    // Convert internal format to the expected return format
    return chatHistory.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }
  
  async clearChatHistory(userId: number): Promise<void> {
    // Clear user's chat history
    this.chatMessages.set(userId, []);
  }

  // Media item methods
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    return this.mediaItems.get(id);
  }

  async createMediaItem(item: InsertMediaItem): Promise<MediaItem> {
    const id = this.mediaItemId++;
    const now = new Date();
    const newItem: MediaItem = { 
      ...item, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.mediaItems.set(id, newItem);
    return newItem;
  }

  async updateMediaItem(id: number, item: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const existingItem = this.mediaItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem: MediaItem = { 
      ...existingItem, 
      ...item, 
      updatedAt: new Date() 
    };
    this.mediaItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    return this.mediaItems.delete(id);
  }

  async listMediaItems(filters?: {
    mediaType?: string;
    category?: string;
    tags?: string[];
  }): Promise<MediaItem[]> {
    let items = Array.from(this.mediaItems.values());
    
    if (filters) {
      if (filters.mediaType) {
        items = items.filter(item => item.mediaType === filters.mediaType);
      }
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        items = items.filter(item => 
          item.tags && filters.tags!.some(tag => item.tags!.includes(tag))
        );
      }
    }
    
    return items;
  }

  // Social post methods
  async getSocialPost(id: number): Promise<SocialPost | undefined> {
    return this.socialPosts.get(id);
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const id = this.socialPostId++;
    const now = new Date();
    const newPost: SocialPost = { 
      ...post, 
      id, 
      createdAt: now
    };
    this.socialPosts.set(id, newPost);
    return newPost;
  }

  async listSocialPosts(filters?: {
    platform?: string;
    sentiment?: number;
    keywords?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<SocialPost[]> {
    let posts = Array.from(this.socialPosts.values());
    
    if (filters) {
      if (filters.platform) {
        posts = posts.filter(post => post.platform === filters.platform);
      }
      if (filters.sentiment !== undefined) {
        posts = posts.filter(post => post.sentiment === filters.sentiment);
      }
      if (filters.keywords && filters.keywords.length > 0) {
        posts = posts.filter(post => 
          post.keywords && filters.keywords!.some(keyword => 
            post.keywords!.includes(keyword)
          )
        );
      }
      if (filters.dateFrom) {
        posts = posts.filter(post => 
          post.postedAt && new Date(post.postedAt) >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        posts = posts.filter(post => 
          post.postedAt && new Date(post.postedAt) <= filters.dateTo!
        );
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        posts = posts.filter(post => 
          // Search in content
          (post.content && post.content.toLowerCase().includes(searchTerm)) ||
          // Search in author name
          (post.authorName && post.authorName.toLowerCase().includes(searchTerm)) ||
          // Search in author username
          (post.authorUsername && post.authorUsername.toLowerCase().includes(searchTerm)) ||
          // Search in keywords
          (post.keywords && post.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          ))
        );
      }
    }
    
    return posts;
  }

  // Keyword methods
  async getKeyword(id: number): Promise<Keyword | undefined> {
    return this.keywords.get(id);
  }

  async getKeywordByWord(word: string): Promise<Keyword | undefined> {
    return Array.from(this.keywords.values()).find(
      (keyword) => keyword.word === word
    );
  }

  async createKeyword(keyword: InsertKeyword): Promise<Keyword> {
    const id = this.keywordId++;
    const now = new Date();
    const newKeyword: Keyword = { 
      ...keyword, 
      id, 
      createdAt: now
    };
    this.keywords.set(id, newKeyword);
    return newKeyword;
  }

  async updateKeyword(id: number, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined> {
    const existingKeyword = this.keywords.get(id);
    if (!existingKeyword) return undefined;

    const updatedKeyword: Keyword = { 
      ...existingKeyword, 
      ...keyword
    };
    this.keywords.set(id, updatedKeyword);
    return updatedKeyword;
  }

  async deleteKeyword(id: number): Promise<boolean> {
    return this.keywords.delete(id);
  }

  async listKeywords(onlyActive: boolean = false): Promise<Keyword[]> {
    let keywords = Array.from(this.keywords.values());
    
    if (onlyActive) {
      keywords = keywords.filter(keyword => keyword.isActive);
    }
    
    return keywords;
  }

  // Keyword Alert methods
  async getKeywordAlert(id: number): Promise<KeywordAlert | undefined> {
    return this.keywordAlerts.get(id);
  }

  async createKeywordAlert(alert: InsertKeywordAlert): Promise<KeywordAlert> {
    const id = this.keywordAlertId++;
    const now = new Date();
    const newAlert: KeywordAlert = {
      ...alert,
      id,
      detected: now
    };
    this.keywordAlerts.set(id, newAlert);
    return newAlert;
  }

  async updateKeywordAlert(id: number, alert: Partial<InsertKeywordAlert>): Promise<KeywordAlert | undefined> {
    const existingAlert = this.keywordAlerts.get(id);
    if (!existingAlert) return undefined;

    const updatedAlert: KeywordAlert = {
      ...existingAlert,
      ...alert
    };
    this.keywordAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async listKeywordAlerts(filters?: {
    keywordId?: number;
    read?: boolean;
    alertSent?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<KeywordAlert[]> {
    let alerts = Array.from(this.keywordAlerts.values());
    
    if (filters) {
      if (filters.keywordId !== undefined) {
        alerts = alerts.filter(alert => alert.keywordId === filters.keywordId);
      }
      if (filters.read !== undefined) {
        alerts = alerts.filter(alert => alert.read === filters.read);
      }
      if (filters.alertSent !== undefined) {
        alerts = alerts.filter(alert => alert.alertSent === filters.alertSent);
      }
      if (filters.dateFrom) {
        alerts = alerts.filter(alert => 
          alert.detected && new Date(alert.detected) >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        alerts = alerts.filter(alert => 
          alert.detected && new Date(alert.detected) <= filters.dateTo!
        );
      }
    }
    
    // Sort by detected time (newest first)
    alerts.sort((a, b) => 
      new Date(b.detected).getTime() - new Date(a.detected).getTime()
    );
    
    return alerts;
  }

  async markKeywordAlertAsRead(id: number): Promise<boolean> {
    const alert = this.keywordAlerts.get(id);
    if (!alert) return false;

    alert.read = true;
    this.keywordAlerts.set(id, alert);
    return true;
  }

  async getKeywordAlertWithDetails(id: number): Promise<(KeywordAlert & { keyword: Keyword, post: SocialPost }) | undefined> {
    const alert = this.keywordAlerts.get(id);
    if (!alert) return undefined;

    const keyword = this.keywords.get(alert.keywordId);
    const post = this.socialPosts.get(alert.postId);

    if (!keyword || !post) return undefined;

    return {
      ...alert,
      keyword,
      post
    };
  }

  // Sentiment report methods
  async getSentimentReport(id: number): Promise<SentimentReport | undefined> {
    return this.sentimentReports.get(id);
  }

  async createSentimentReport(report: InsertSentimentReport): Promise<SentimentReport> {
    const id = this.sentimentReportId++;
    const now = new Date();
    const newReport: SentimentReport = { 
      ...report, 
      id, 
      createdAt: now
    };
    this.sentimentReports.set(id, newReport);
    return newReport;
  }

  async listSentimentReports(filters?: {
    platform?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<SentimentReport[]> {
    let reports = Array.from(this.sentimentReports.values());
    
    if (filters) {
      if (filters.platform) {
        reports = reports.filter(report => 
          report.platform === filters.platform || report.platform === "all"
        );
      }
      if (filters.dateFrom) {
        reports = reports.filter(report => 
          new Date(report.date) >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        reports = reports.filter(report => 
          new Date(report.date) <= filters.dateTo!
        );
      }
    }
    
    // Sort by date (newest first)
    reports.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return reports;
  }

  // Tutorial methods
  async getTutorial(id: number): Promise<Tutorial | undefined> {
    return this.tutorials.get(id);
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const id = this.tutorialId++;
    const now = new Date();
    const newTutorial: Tutorial = { 
      ...tutorial, 
      id, 
      createdAt: now
    };
    this.tutorials.set(id, newTutorial);
    return newTutorial;
  }

  async listTutorials(level?: string, language?: string): Promise<Tutorial[]> {
    let tutorials = Array.from(this.tutorials.values());
    
    // Filter by level if specified
    if (level) {
      tutorials = tutorials.filter(tutorial => tutorial.level === level);
    }
    
    // Filter by language if specified
    if (language) {
      // Determine if we're filtering by title (for Arabic/English distinction)
      // This is a temporary workaround for tutorials created before we added the language field
      if (!tutorials[0]?.language) {
        // If tutorials don't have a language field, try to detect language from title
        tutorials = tutorials.filter(tutorial => {
          // Check if the title contains Arabic characters (rough heuristic)
          const hasArabicChars = /[\u0600-\u06FF]/.test(tutorial.title);
          return language === 'ar' ? hasArabicChars : !hasArabicChars;
        });
      } else {
        // Filter by the language field 
        tutorials = tutorials.filter(tutorial => tutorial.language === language);
      }
    }
    
    return tutorials;
  }
  
  // UAE Government Entity methods
  async getGovEntity(id: number): Promise<GovEntity | undefined> {
    return this.govEntities.get(id);
  }
  
  async getGovEntityByName(name: string): Promise<GovEntity | undefined> {
    return Array.from(this.govEntities.values()).find(
      (entity) => entity.name === name || entity.arabicName === name
    );
  }
  
  async createGovEntity(entity: InsertGovEntity): Promise<GovEntity> {
    const id = this.govEntityId++;
    const now = new Date();
    const newEntity: GovEntity = { 
      ...entity, 
      id, 
      createdAt: now
    };
    this.govEntities.set(id, newEntity);
    return newEntity;
  }
  
  async updateGovEntity(id: number, entity: Partial<InsertGovEntity>): Promise<GovEntity | undefined> {
    const existingEntity = this.govEntities.get(id);
    if (!existingEntity) return undefined;
    
    const updatedEntity: GovEntity = { 
      ...existingEntity, 
      ...entity
    };
    this.govEntities.set(id, updatedEntity);
    return updatedEntity;
  }
  
  async deleteGovEntity(id: number): Promise<boolean> {
    // Remove entity from posts first
    const relationships = Array.from(this.socialPostsToGovEntities.entries())
      .filter(([_, rel]) => rel.entityId === id);
      
    for (const [key, _] of relationships) {
      this.socialPostsToGovEntities.delete(key);
    }
    
    return this.govEntities.delete(id);
  }
  
  async listGovEntities(filters?: {
    entityType?: string;
    region?: string;
    isActive?: boolean;
  }): Promise<GovEntity[]> {
    let entities = Array.from(this.govEntities.values());
    
    if (filters) {
      if (filters.entityType) {
        entities = entities.filter(entity => entity.entityType === filters.entityType);
      }
      if (filters.region) {
        entities = entities.filter(entity => entity.region === filters.region);
      }
      if (filters.isActive !== undefined) {
        entities = entities.filter(entity => entity.isActive === filters.isActive);
      }
    }
    
    // Sort by priority (highest first), then by name
    entities.sort((a, b) => {
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.name.localeCompare(b.name);
    });
    
    return entities;
  }
  
  async linkEntityToPost(socialPostId: number, entityId: number, mentionType?: string, sentimentScore?: number): Promise<boolean> {
    const post = this.socialPosts.get(socialPostId);
    const entity = this.govEntities.get(entityId);
    
    if (!post || !entity) return false;
    
    const key = `${socialPostId}-${entityId}`;
    this.socialPostsToGovEntities.set(key, {
      socialPostId,
      entityId,
      mentionType,
      sentimentScore
    });
    
    return true;
  }
  
  async getPostEntities(socialPostId: number): Promise<GovEntity[]> {
    const relationships = Array.from(this.socialPostsToGovEntities.values())
      .filter(rel => rel.socialPostId === socialPostId);
      
    const entityIds = relationships.map(rel => rel.entityId);
    const entities = entityIds.map(id => this.govEntities.get(id)).filter(Boolean) as GovEntity[];
    
    return entities;
  }
  
  async getEntityPosts(entityId: number): Promise<SocialPost[]> {
    const relationships = Array.from(this.socialPostsToGovEntities.values())
      .filter(rel => rel.entityId === entityId);
      
    const postIds = relationships.map(rel => rel.socialPostId);
    const posts = postIds.map(id => this.socialPosts.get(id)).filter(Boolean) as SocialPost[];
    
    return posts;
  }
  
  // Press Release methods
  async getPressRelease(id: number): Promise<PressRelease | undefined> {
    return this.pressReleases.get(id);
  }

  async createPressRelease(pressRelease: InsertPressRelease): Promise<PressRelease> {
    const id = this.pressReleaseId++;
    const now = new Date();
    const newPressRelease: PressRelease = {
      ...pressRelease,
      id,
      createdAt: now
    };
    this.pressReleases.set(id, newPressRelease);
    return newPressRelease;
  }

  async updatePressRelease(id: number, pressRelease: Partial<InsertPressRelease>): Promise<PressRelease | undefined> {
    const existingPressRelease = this.pressReleases.get(id);
    if (!existingPressRelease) return undefined;

    const updatedPressRelease: PressRelease = {
      ...existingPressRelease,
      ...pressRelease
    };
    this.pressReleases.set(id, updatedPressRelease);
    return updatedPressRelease;
  }

  async deletePressRelease(id: number): Promise<boolean> {
    return this.pressReleases.delete(id);
  }

  async listPressReleases(filters?: {
    status?: string;
    authorId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  }): Promise<PressRelease[]> {
    let pressReleases = Array.from(this.pressReleases.values());
    
    if (filters) {
      if (filters.status) {
        pressReleases = pressReleases.filter(pr => pr.status === filters.status);
      }
      if (filters.authorId !== undefined) {
        pressReleases = pressReleases.filter(pr => pr.authorId === filters.authorId);
      }
      if (filters.tags && filters.tags.length > 0) {
        pressReleases = pressReleases.filter(pr => 
          pr.tags && filters.tags!.some(tag => pr.tags!.includes(tag))
        );
      }
      if (filters.dateFrom) {
        pressReleases = pressReleases.filter(pr => {
          const date = pr.publishedAt || pr.createdAt;
          return date && new Date(date) >= filters.dateFrom!;
        });
      }
      if (filters.dateTo) {
        pressReleases = pressReleases.filter(pr => {
          const date = pr.publishedAt || pr.createdAt;
          return date && new Date(date) <= filters.dateTo!;
        });
      }
    }
    
    return pressReleases;
  }

  async publishPressRelease(id: number): Promise<PressRelease | undefined> {
    const pressRelease = this.pressReleases.get(id);
    if (!pressRelease) return undefined;

    const updatedPressRelease: PressRelease = {
      ...pressRelease,
      status: 'published',
      publishedAt: new Date()
    };
    this.pressReleases.set(id, updatedPressRelease);
    return updatedPressRelease;
  }

  async schedulePressRelease(id: number, scheduledFor: Date): Promise<PressRelease | undefined> {
    const pressRelease = this.pressReleases.get(id);
    if (!pressRelease) return undefined;

    const updatedPressRelease: PressRelease = {
      ...pressRelease,
      status: 'scheduled',
      scheduledFor
    };
    this.pressReleases.set(id, updatedPressRelease);
    return updatedPressRelease;
  }

  async getScheduledPressReleases(): Promise<PressRelease[]> {
    return Array.from(this.pressReleases.values()).filter(pr => 
      pr.status === 'scheduled' && pr.scheduledFor !== null
    );
  }
  
  // API Key methods
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyId++;
    const now = new Date();
    
    // Fix type issues by explicitly setting required properties
    const newApiKey: ApiKey = {
      id,
      userId: apiKey.userId,
      keyName: apiKey.keyName,
      keyValue: apiKey.keyValue,
      createdAt: now,
      isActive: apiKey.isActive ?? true,
      expiresAt: apiKey.expiresAt ?? null,
      lastUsedAt: null,
      allowedIps: apiKey.allowedIps ?? null,
      rateLimitPerMinute: apiKey.rateLimitPerMinute ?? null
    };
    
    this.apiKeys.set(id, newApiKey);
    return newApiKey;
  }
  
  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const existingKey = this.apiKeys.get(id);
    if (!existingKey) return undefined;
    
    const updatedKey: ApiKey = { ...existingKey, ...updates };
    this.apiKeys.set(id, updatedKey);
    return updatedKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  }
  
  async listApiKeys(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(key => key.userId === userId);
  }
  
  async updateApiKeyLastUsed(id: number): Promise<boolean> {
    const key = this.apiKeys.get(id);
    if (!key) return false;
    
    key.lastUsedAt = new Date();
    this.apiKeys.set(id, key);
    return true;
  }
  
  // Webhook methods
  async getWebhook(id: number): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }
  
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const id = this.webhookId++;
    const now = new Date();
    
    // Fix type issues by explicitly setting required properties
    const newWebhook: Webhook = {
      id,
      userId: webhook.userId,
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events,
      isActive: webhook.isActive ?? true,
      createdAt: now,
      lastTriggeredAt: null,
      failureCount: 0
    };
    
    this.webhooks.set(id, newWebhook);
    return newWebhook;
  }
  
  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook | undefined> {
    const existingWebhook = this.webhooks.get(id);
    if (!existingWebhook) return undefined;
    
    const updatedWebhook: Webhook = { ...existingWebhook, ...updates };
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }
  
  async deleteWebhook(id: number): Promise<boolean> {
    return this.webhooks.delete(id);
  }
  
  async listWebhooks(userId: number): Promise<Webhook[]> {
    return Array.from(this.webhooks.values())
      .filter(webhook => webhook.userId === userId);
  }
  
  async updateWebhookLastTriggered(id: number, success: boolean): Promise<boolean> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;
    
    webhook.lastTriggeredAt = new Date();
    if (!success) {
      webhook.failureCount = (webhook.failureCount || 0) + 1;
    }
    
    this.webhooks.set(id, webhook);
    return true;
  }
  
  // FAQ Item methods
  async getFaqItem(id: number): Promise<FaqItem | undefined> {
    return this.faqItems.get(id);
  }
  
  async createFaqItem(faqData: InsertFaqItem): Promise<FaqItem> {
    const id = this.faqItemId++;
    const now = new Date();
    const newFaqItem: FaqItem = {
      ...faqData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.faqItems.set(id, newFaqItem);
    return newFaqItem;
  }
  
  async updateFaqItem(id: number, faqData: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const existingFaqItem = this.faqItems.get(id);
    if (!existingFaqItem) return undefined;
    
    const updatedFaqItem: FaqItem = {
      ...existingFaqItem,
      ...faqData,
      updatedAt: new Date()
    };
    this.faqItems.set(id, updatedFaqItem);
    return updatedFaqItem;
  }
  
  async deleteFaqItem(id: number): Promise<boolean> {
    return this.faqItems.delete(id);
  }
  
  async listFaqItems(filters?: { category?: string, isActive?: boolean }): Promise<FaqItem[]> {
    let faqItems = Array.from(this.faqItems.values());
    
    if (filters) {
      if (filters.category) {
        faqItems = faqItems.filter(item => item.category === filters.category);
      }
      
      if (filters.isActive !== undefined) {
        faqItems = faqItems.filter(item => item.isActive === filters.isActive);
      }
    }
    
    // Sort by category and then by sortOrder
    return faqItems.sort((a, b) => {
      if (a.category === b.category) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      return a.category.localeCompare(b.category);
    });
  }
  
  // Report methods
  async getReports(userId?: number): Promise<Report[]> {
    let reports = Array.from(this.reports.values());
    
    if (userId !== undefined) {
      reports = reports.filter(report => report.userId === userId);
    }
    
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getReportById(id: number, userId?: number): Promise<Report | undefined> {
    const report = this.reports.get(id);
    
    if (!report) return undefined;
    if (userId !== undefined && report.userId !== userId) return undefined;
    
    return report;
  }
  
  async createReport(reportData: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const now = new Date();
    
    const newReport: Report = {
      ...reportData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.reports.set(id, newReport);
    return newReport;
  }
  
  async updateReport(id: number, userId: number | undefined, reportData: Partial<InsertReport>): Promise<Report | undefined> {
    const existingReport = this.reports.get(id);
    
    if (!existingReport) return undefined;
    if (userId !== undefined && existingReport.userId !== userId) return undefined;
    
    const updatedReport: Report = {
      ...existingReport,
      ...reportData,
      updatedAt: new Date()
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }
  
  async deleteReport(id: number, userId?: number): Promise<boolean> {
    const report = this.reports.get(id);
    
    if (!report) return false;
    if (userId !== undefined && report.userId !== userId) return false;
    
    return this.reports.delete(id);
  }
  
  // Achievement Badge methods
  async getAchievementBadge(id: number): Promise<AchievementBadge | undefined> {
    return this.achievementBadges.get(id);
  }

  async createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge> {
    const id = this.achievementBadgeId++;
    const newBadge: AchievementBadge = { 
      ...badge, 
      id, 
      createdAt: new Date() 
    };
    this.achievementBadges.set(id, newBadge);
    return newBadge;
  }

  async updateAchievementBadge(id: number, badge: Partial<InsertAchievementBadge>): Promise<AchievementBadge | undefined> {
    const existingBadge = this.achievementBadges.get(id);
    if (!existingBadge) return undefined;

    const updatedBadge: AchievementBadge = { 
      ...existingBadge, 
      ...badge
    };
    this.achievementBadges.set(id, updatedBadge);
    return updatedBadge;
  }

  async deleteAchievementBadge(id: number): Promise<boolean> {
    return this.achievementBadges.delete(id);
  }

  async listAchievementBadges(filters?: { 
    category?: string, 
    level?: number,
    isHidden?: boolean 
  }): Promise<AchievementBadge[]> {
    let badges = Array.from(this.achievementBadges.values());
    
    if (filters) {
      if (filters.category) {
        badges = badges.filter(badge => badge.category === filters.category);
      }
      if (filters.level !== undefined) {
        badges = badges.filter(badge => badge.level === filters.level);
      }
      if (filters.isHidden !== undefined) {
        badges = badges.filter(badge => badge.isHidden === filters.isHidden);
      }
    }
    
    return badges;
  }

  // User Achievement methods
  async getUserAchievement(id: number): Promise<UserAchievement | undefined> {
    return this.userAchievements.get(id);
  }

  async getUserAchievementByBadge(userId: number, badgeId: number): Promise<UserAchievement | undefined> {
    return Array.from(this.userAchievements.values()).find(
      achievement => achievement.userId === userId && achievement.badgeId === badgeId
    );
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementId++;
    const now = new Date();
    const newAchievement: UserAchievement = { 
      ...achievement, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.userAchievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined> {
    const existingAchievement = this.userAchievements.get(id);
    if (!existingAchievement) return undefined;

    const updatedAchievement: UserAchievement = { 
      ...existingAchievement, 
      ...achievement,
      updatedAt: new Date()
    };
    this.userAchievements.set(id, updatedAchievement);
    return updatedAchievement;
  }

  async getUserAchievements(userId: number, onlyUnlocked?: boolean): Promise<(UserAchievement & { badge: AchievementBadge })[]> {
    let achievements = Array.from(this.userAchievements.values())
      .filter(achievement => achievement.userId === userId);
    
    if (onlyUnlocked) {
      achievements = achievements.filter(achievement => achievement.isUnlocked);
    }
    
    return achievements.map(achievement => {
      const badge = this.achievementBadges.get(achievement.badgeId);
      if (!badge) {
        throw new Error(`Badge with ID ${achievement.badgeId} not found`);
      }
      return {
        ...achievement,
        badge
      };
    });
  }

  async checkAndUpdateAchievementProgress(userId: number, actionType: string, count: number = 1): Promise<UserAchievement[]> {
    // Find all badges that match this action type
    const relevantBadges = Array.from(this.achievementBadges.values())
      .filter(badge => {
        if (badge.criteria && typeof badge.criteria === 'object') {
          return badge.criteria.type === actionType;
        }
        return false;
      });
    
    if (relevantBadges.length === 0) {
      return [];
    }
    
    const updatedAchievements: UserAchievement[] = [];
    
    for (const badge of relevantBadges) {
      // Check if user already has an achievement record for this badge
      let userAchievement = await this.getUserAchievementByBadge(userId, badge.id);
      
      if (!userAchievement) {
        // Create a new achievement record if one doesn't exist
        userAchievement = await this.createUserAchievement({
          userId,
          badgeId: badge.id,
          isUnlocked: false,
          progress: 0
        });
      }
      
      if (userAchievement.isUnlocked) {
        continue; // Skip if already unlocked
      }
      
      // Update progress
      const newProgress = userAchievement.progress + count;
      let targetCount = Infinity;
      if (badge.criteria && typeof badge.criteria === 'object' && 'count' in badge.criteria) {
        targetCount = badge.criteria.count as number;
      }
      
      // Check if achievement is unlocked
      const isUnlocked = newProgress >= targetCount;
      
      // Update the achievement
      const updatedAchievement = await this.updateUserAchievement(userAchievement.id, {
        progress: newProgress,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date() : undefined
      });
      
      if (updatedAchievement && isUnlocked) {
        // If newly unlocked, add points to user's stats and create activity feed
        await this.incrementUserStats(userId, 'totalPoints', badge.points);
        await this.createActivityFeed({
          userId,
          type: 'achievement_unlocked',
          content: `You've unlocked the "${badge.name}" badge!`,
          points: badge.points,
          metadata: { badgeId: badge.id }
        });
        
        // Update user level based on total points
        await this.updateUserLevel(userId);
        
        updatedAchievements.push(updatedAchievement);
      }
    }
    
    return updatedAchievements;
  }

  async unlockAchievement(userId: number, badgeId: number): Promise<UserAchievement | undefined> {
    const badge = await this.getAchievementBadge(badgeId);
    if (!badge) return undefined;
    
    let userAchievement = await this.getUserAchievementByBadge(userId, badgeId);
    
    if (!userAchievement) {
      let targetCount = 1;
      if (badge.criteria && typeof badge.criteria === 'object' && 'count' in badge.criteria) {
        targetCount = badge.criteria.count as number;
      }
      
      userAchievement = await this.createUserAchievement({
        userId,
        badgeId,
        isUnlocked: true,
        progress: targetCount,
        unlockedAt: new Date()
      });
    } else if (!userAchievement.isUnlocked) {
      userAchievement = await this.updateUserAchievement(userAchievement.id, {
        isUnlocked: true,
        unlockedAt: new Date()
      });
    } else {
      return userAchievement; // Already unlocked
    }
    
    // Add points to user's stats
    await this.incrementUserStats(userId, 'totalPoints', badge.points);
    
    // Create activity feed entry
    await this.createActivityFeed({
      userId,
      type: 'achievement_unlocked',
      content: `You've unlocked the "${badge.name}" badge!`,
      points: badge.points,
      metadata: { badgeId: badge.id }
    });
    
    // Update user level based on total points
    await this.updateUserLevel(userId);
    
    return userAchievement;
  }

  // User Gamification Stats methods
  async getUserGamificationStats(userId: number): Promise<UserGamificationStats | undefined> {
    return Array.from(this.userGamificationStats.values())
      .find(stats => stats.userId === userId);
  }

  async createUserGamificationStats(stats: InsertUserGamificationStats): Promise<UserGamificationStats> {
    const now = new Date();
    const newStats: UserGamificationStats = { 
      ...stats, 
      id: this.userId++, 
      createdAt: now,
      updatedAt: now
    };
    this.userGamificationStats.set(newStats.id, newStats);
    return newStats;
  }

  async updateUserGamificationStats(userId: number, stats: Partial<InsertUserGamificationStats>): Promise<UserGamificationStats | undefined> {
    const existingStats = Array.from(this.userGamificationStats.values())
      .find(s => s.userId === userId);
    
    if (!existingStats) return undefined;

    const updatedStats: UserGamificationStats = { 
      ...existingStats, 
      ...stats,
      updatedAt: new Date()
    };
    this.userGamificationStats.set(existingStats.id, updatedStats);
    return updatedStats;
  }

  async incrementUserStats(userId: number, metricName: string, value: number = 1): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    if (metricName === 'totalPoints') {
      const updatedStats = await this.updateUserGamificationStats(userId, {
        totalPoints: stats.totalPoints + value
      });
      return updatedStats;
    } else if (stats.metrics && typeof stats.metrics === 'object' && metricName in stats.metrics) {
      const updatedMetrics = { ...stats.metrics };
      updatedMetrics[metricName] = (updatedMetrics[metricName] || 0) + value;
      
      const updatedStats = await this.updateUserGamificationStats(userId, {
        metrics: updatedMetrics
      });
      return updatedStats;
    }
    
    return stats;
  }

  async updateUserLevel(userId: number): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    // Simple level calculation based on points
    // Each level requires more points than the previous one
    const pointsRequired = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
    
    let newLevel = 1;
    while (stats.totalPoints >= pointsRequired(newLevel + 1)) {
      newLevel++;
    }
    
    if (newLevel > stats.level) {
      // Level up!
      const updatedStats = await this.updateUserGamificationStats(userId, {
        level: newLevel
      });
      
      // Create activity feed entry for level up
      await this.createActivityFeed({
        userId,
        type: 'level_up',
        content: `Congratulations! You've reached level ${newLevel}!`,
        points: 0,
        metadata: { level: newLevel }
      });
      
      return updatedStats;
    }
    
    return stats;
  }

  async updateUserStreak(userId: number): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    const now = new Date();
    const lastActivityDate = new Date(stats.lastActivityDate);
    
    // Check if last activity was yesterday
    const isYesterday = 
      now.getDate() - lastActivityDate.getDate() === 1 ||
      (now.getDate() === 1 && 
       (lastActivityDate.getDate() === new Date(now.getFullYear(), now.getMonth(), 0).getDate()) &&
       (now.getMonth() === (lastActivityDate.getMonth() + 1) % 12));
    
    // Check if last activity was today
    const isToday = 
      now.getDate() === lastActivityDate.getDate() &&
      now.getMonth() === lastActivityDate.getMonth() &&
      now.getFullYear() === lastActivityDate.getFullYear();
    
    if (isYesterday) {
      // If last activity was yesterday, increment streak
      const newStreak = stats.streak + 1;
      const updatedStats = await this.updateUserGamificationStats(userId, {
        streak: newStreak,
        lastActivityDate: now
      });
      
      // Check if this streak is a milestone (3, 7, 14, 30, 60, 90, etc.)
      const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
      if (milestones.includes(newStreak)) {
        // Create activity feed entry for streak milestone
        await this.createActivityFeed({
          userId,
          type: 'streak_milestone',
          content: `You've maintained a ${newStreak}-day streak!`,
          points: newStreak * 2, // Bonus points for milestone
          metadata: { streak: newStreak }
        });
        
        // Add bonus points
        await this.incrementUserStats(userId, 'totalPoints', newStreak * 2);
        
        // Check for streak-based achievements
        await this.checkAndUpdateAchievementProgress(userId, 'login_streak', newStreak);
      }
      
      return updatedStats;
    } else if (!isToday) {
      // If last activity was neither yesterday nor today, reset streak
      return await this.updateUserGamificationStats(userId, {
        streak: 1,
        lastActivityDate: now
      });
    } else {
      // If last activity was today, just update the timestamp
      return await this.updateUserGamificationStats(userId, {
        lastActivityDate: now
      });
    }
  }

  async getUsersLeaderboard(limit: number = 10): Promise<UserGamificationStats[]> {
    return Array.from(this.userGamificationStats.values())
      .sort((a, b) => b.totalPoints - a.totalPoints || b.level - a.level)
      .slice(0, limit);
  }

  // Activity Feed methods
  async getActivityFeed(id: number): Promise<ActivityFeed | undefined> {
    return this.activityFeed.get(id);
  }

  async createActivityFeed(activity: InsertActivityFeed): Promise<ActivityFeed> {
    const id = this.activityFeedId++;
    const newActivity: ActivityFeed = { 
      ...activity, 
      id, 
      createdAt: new Date(),
      isRead: false
    };
    this.activityFeed.set(id, newActivity);
    return newActivity;
  }

  async getUserActivityFeed(userId: number, limit: number = 20): Promise<ActivityFeed[]> {
    return Array.from(this.activityFeed.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async markActivityAsRead(id: number): Promise<boolean> {
    const activity = this.activityFeed.get(id);
    if (!activity) return false;
    
    activity.isRead = true;
    this.activityFeed.set(id, activity);
    return true;
  }

  async markAllUserActivitiesAsRead(userId: number): Promise<boolean> {
    const userActivities = Array.from(this.activityFeed.values())
      .filter(activity => activity.userId === userId && !activity.isRead);
    
    if (userActivities.length === 0) return false;
    
    userActivities.forEach(activity => {
      activity.isRead = true;
      this.activityFeed.set(activity.id, activity);
    });
    
    return true;
  }
  
  // Contact Message methods
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }
  
  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageId++;
    const now = new Date();
    const newContactMessage: ContactMessage = {
      ...messageData,
      id,
      status: "new",
      createdAt: now,
      updatedAt: now,
      responseAt: null,
      respondedBy: null,
      responseMessage: null
    };
    this.contactMessages.set(id, newContactMessage);
    return newContactMessage;
  }
  
  async updateContactMessageStatus(id: number, status: string): Promise<ContactMessage | undefined> {
    const existingMessage = this.contactMessages.get(id);
    if (!existingMessage) return undefined;
    
    const updatedMessage: ContactMessage = {
      ...existingMessage,
      status,
      updatedAt: new Date()
    };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async respondToContactMessage(id: number, response: { responseMessage: string; respondedBy: number }): Promise<ContactMessage | undefined> {
    const existingMessage = this.contactMessages.get(id);
    if (!existingMessage) return undefined;
    
    const now = new Date();
    const updatedMessage: ContactMessage = {
      ...existingMessage,
      status: "responded",
      updatedAt: now,
      responseAt: now,
      respondedBy: response.respondedBy,
      responseMessage: response.responseMessage
    };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async listContactMessages(filters?: { status?: string; department?: string }): Promise<ContactMessage[]> {
    let messages = Array.from(this.contactMessages.values());
    
    if (filters) {
      if (filters.status) {
        messages = messages.filter(message => message.status === filters.status);
      }
      
      if (filters.department) {
        messages = messages.filter(message => message.department === filters.department);
      }
    }
    
    // Sort by creation date (newest first)
    return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private defaultTenantId = 'default';
  
  constructor() {
    try {
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true,
        tableName: 'sessions'
      });
    } catch (error) {
      console.error('Failed to initialize PostgreSQL session store, falling back to memory store', error);
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }
  
  /**
   * Get the current tenant ID from the request or context
   * This method can be extended to support more complex tenant resolution
   */
  private getTenantId(tenantId?: string): string {
    return tenantId || this.defaultTenantId;
  }
  
  /**
   * Apply tenant filtering to database queries
   * @param tenantId Optional tenant ID, defaults to the default tenant
   */
   
  // Tenant management methods
  async getTenant(tenantId: string): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.tenantId, tenantId));
      return tenant;
    } catch (error) {
      console.error("Error getting tenant:", error);
      return undefined;
    }
  }
  
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    try {
      const [newTenant] = await db
        .insert(tenants)
        .values({
          ...tenant,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newTenant;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  }
  
  async updateTenant(tenantId: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    try {
      const [updatedTenant] = await db
        .update(tenants)
        .set({
          ...tenant,
          updatedAt: new Date()
        })
        .where(eq(tenants.tenantId, tenantId))
        .returning();
      return updatedTenant;
    } catch (error) {
      console.error("Error updating tenant:", error);
      return undefined;
    }
  }
  private withTenant(tenantId?: string) {
    const tenant = this.getTenantId(tenantId);
    
    // This filtering mechanism can be applied to any query
    // For now it's simple, but can be expanded for more complex filtering
    return {
      tenantId: tenant
    };
  }
  
  /**
   * Get information about a tenant by ID
   * @param tenantId Tenant ID to look up
   */
  async getTenant(tenantId: string): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.tenantId, tenantId));
      return tenant;
    } catch (error) {
      console.error("Error fetching tenant:", error);
      return undefined;
    }
  }
  
  /**
   * Create a new tenant
   * @param tenantData Tenant data to insert
   */
  async createTenant(tenantData: InsertTenant): Promise<Tenant> {
    try {
      const [tenant] = await db.insert(tenants).values(tenantData).returning();
      return tenant;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing tenant
   * @param tenantId Tenant ID to update
   * @param tenantData Updated tenant data
   */
  async updateTenant(tenantId: string, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db
        .update(tenants)
        .set({
          ...tenantData,
          updatedAt: new Date()
        })
        .where(eq(tenants.tenantId, tenantId))
        .returning();
      return tenant;
    } catch (error) {
      console.error("Error updating tenant:", error);
      return undefined;
    }
  }
  
  // User authentication and security methods
  async recordLoginHistory(loginData: InsertLoginHistory): Promise<LoginHistory> {
    const [record] = await db.insert(loginHistory).values(loginData).returning();
    return record;
  }
  
  async getUserLoginHistory(userId: number, limit: number = 10): Promise<LoginHistory[]> {
    return await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.loginTime))
      .limit(limit);
  }
  
  async setTwoFactorSecret(userId: number, secret: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId));
    
    return result.rowCount > 0;
  }
  
  // Chat methods
  async saveChatMessage(message: { userId: number, role: 'user' | 'bot', content: string, timestamp: Date }): Promise<void> {
    await db.insert(chatMessages).values({
      userId: message.userId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      metadata: {} // Empty metadata object for now
    });
  }
  
  async getChatHistory(userId: number): Promise<Array<{ id?: number, role: 'user' | 'bot', content: string, timestamp?: Date }>> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.timestamp));
    
    return messages;
  }
  
  async clearChatHistory(userId: number): Promise<void> {
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.userId, userId));
  }
  
  async setTwoFactorEnabled(userId: number, enabled: boolean): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ twoFactorEnabled: enabled })
      .where(eq(users.id, userId));
    
    return result.rowCount > 0;
  }
  
  async generateTwoFactorRecoveryCodes(userId: number): Promise<string[]> {
    // Generate 10 random recovery codes
    const recoveryCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 12).toUpperCase()
    );
    
    const result = await db
      .update(users)
      .set({ twoFactorRecoveryCodes: recoveryCodes })
      .where(eq(users.id, userId));
    
    if (result.rowCount > 0) {
      return recoveryCodes;
    }
    
    return [];
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Failed to update user:", error);
      return undefined;
    }
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(users)
        .where(eq(users.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Failed to delete user:", error);
      return false;
    }
  }

  // Media item methods
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [item] = await db.select().from(mediaItems).where(eq(mediaItems.id, id));
    return item || undefined;
  }

  async createMediaItem(item: InsertMediaItem): Promise<MediaItem> {
    const [newItem] = await db.insert(mediaItems).values(item).returning();
    return newItem;
  }

  async updateMediaItem(id: number, item: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const [updatedItem] = await db
      .update(mediaItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(mediaItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db.delete(mediaItems).where(eq(mediaItems.id, id));
    return result.rowCount > 0;
  }

  async listMediaItems(filters?: {
    mediaType?: string;
    category?: string;
    tags?: string[];
  }): Promise<MediaItem[]> {
    let query = db.select().from(mediaItems);
    
    if (filters) {
      if (filters.mediaType) {
        query = query.where(eq(mediaItems.mediaType, filters.mediaType));
      }
      
      if (filters.category) {
        query = query.where(eq(mediaItems.category, filters.category));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        // Using array containment operator
        query = query.where(sql`${mediaItems.tags} && ${sql.array(filters.tags, 'text')}`);
      }
    }
    
    return await query;
  }

  // Social post methods
  async getSocialPost(id: number): Promise<SocialPost | undefined> {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id));
    return post || undefined;
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db.insert(socialPosts).values(post).returning();
    return newPost;
  }

  async listSocialPosts(filters?: {
    platform?: string;
    sentiment?: number;
    keywords?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<SocialPost[]> {
    let query = db.select().from(socialPosts);
    
    if (filters) {
      if (filters.platform) {
        query = query.where(eq(socialPosts.platform, filters.platform));
      }
      
      if (filters.sentiment !== undefined) {
        query = query.where(eq(socialPosts.sentiment, filters.sentiment));
      }
      
      if (filters.keywords && filters.keywords.length > 0) {
        // Using array overlap operator
        query = query.where(sql`${socialPosts.keywords} && ${sql.array(filters.keywords, 'text')}`);
      }
      
      if (filters.dateFrom) {
        query = query.where(gte(socialPosts.postedAt, filters.dateFrom));
      }
      
      if (filters.dateTo) {
        query = query.where(lte(socialPosts.postedAt, filters.dateTo));
      }
      
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        // Search in content, author name, author username, or keywords
        query = query.where(
          or(
            sql`${socialPosts.content} ILIKE ${searchTerm}`,
            sql`${socialPosts.authorName} ILIKE ${searchTerm}`,
            sql`${socialPosts.authorUsername} ILIKE ${searchTerm}`,
            // Search in keywords array
            sql`EXISTS (
              SELECT 1 FROM unnest(${socialPosts.keywords}) AS k
              WHERE k ILIKE ${searchTerm}
            )`
          )
        );
      }
    }
    
    return await query;
  }

  // Keyword methods
  async getKeyword(id: number): Promise<Keyword | undefined> {
    const [keyword] = await db.select().from(keywords).where(eq(keywords.id, id));
    return keyword || undefined;
  }

  async getKeywordByWord(word: string): Promise<Keyword | undefined> {
    const [keyword] = await db.select().from(keywords).where(eq(keywords.word, word));
    return keyword || undefined;
  }

  async createKeyword(keyword: InsertKeyword): Promise<Keyword> {
    const [newKeyword] = await db.insert(keywords).values(keyword).returning();
    return newKeyword;
  }

  async updateKeyword(id: number, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined> {
    const [updatedKeyword] = await db
      .update(keywords)
      .set(keyword)
      .where(eq(keywords.id, id))
      .returning();
    return updatedKeyword || undefined;
  }

  async deleteKeyword(id: number): Promise<boolean> {
    const result = await db.delete(keywords).where(eq(keywords.id, id));
    return result.rowCount > 0;
  }

  async listKeywords(onlyActive: boolean = false): Promise<Keyword[]> {
    let query = db.select().from(keywords);
    
    if (onlyActive) {
      query = query.where(eq(keywords.isActive, true));
    }
    
    return await query;
  }

  // Keyword Alert methods
  async getKeywordAlert(id: number): Promise<KeywordAlert | undefined> {
    const [alert] = await db.select().from(keywordAlerts).where(eq(keywordAlerts.id, id));
    return alert || undefined;
  }

  async createKeywordAlert(alert: InsertKeywordAlert): Promise<KeywordAlert> {
    const [newAlert] = await db.insert(keywordAlerts).values(alert).returning();
    return newAlert;
  }

  async updateKeywordAlert(id: number, alert: Partial<InsertKeywordAlert>): Promise<KeywordAlert | undefined> {
    const [updatedAlert] = await db
      .update(keywordAlerts)
      .set(alert)
      .where(eq(keywordAlerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async listKeywordAlerts(filters?: {
    keywordId?: number;
    read?: boolean;
    alertSent?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<KeywordAlert[]> {
    let query = db.select().from(keywordAlerts);
    
    if (filters) {
      if (filters.keywordId !== undefined) {
        query = query.where(eq(keywordAlerts.keywordId, filters.keywordId));
      }
      if (filters.read !== undefined) {
        query = query.where(eq(keywordAlerts.isRead, filters.read));
      }
      if (filters.alertSent !== undefined) {
        query = query.where(eq(keywordAlerts.alertSent, filters.alertSent));
      }
      if (filters.dateFrom) {
        query = query.where(gte(keywordAlerts.alertDate, filters.dateFrom));
      }
      if (filters.dateTo) {
        query = query.where(lte(keywordAlerts.alertDate, filters.dateTo));
      }
    }
    
    // Sort by alert date (newest first)
    query = query.orderBy(desc(keywordAlerts.alertDate));
    
    return await query;
  }

  async markKeywordAlertAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(keywordAlerts)
      .set({ isRead: true })
      .where(eq(keywordAlerts.id, id));
    return result.rowCount > 0;
  }

  async getKeywordAlertWithDetails(id: number): Promise<(KeywordAlert & { keyword: Keyword, post: SocialPost }) | undefined> {
    const [alert] = await db
      .select({
        ...keywordAlerts,
        keyword: keywords,
        post: socialPosts
      })
      .from(keywordAlerts)
      .where(eq(keywordAlerts.id, id))
      .innerJoin(keywords, eq(keywordAlerts.keywordId, keywords.id))
      .innerJoin(socialPosts, eq(keywordAlerts.socialPostId, socialPosts.id));
    
    return alert || undefined;
  }

  // Sentiment report methods
  async getSentimentReport(id: number): Promise<SentimentReport | undefined> {
    const [report] = await db.select().from(sentimentReports).where(eq(sentimentReports.id, id));
    return report || undefined;
  }

  async createSentimentReport(report: InsertSentimentReport): Promise<SentimentReport> {
    const [newReport] = await db.insert(sentimentReports).values(report).returning();
    return newReport;
  }

  async listSentimentReports(filters?: {
    platform?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<SentimentReport[]> {
    let query = db.select().from(sentimentReports);
    
    if (filters) {
      if (filters.platform) {
        query = query.where(
          or(
            eq(sentimentReports.platform, filters.platform), 
            eq(sentimentReports.platform, 'all')
          )
        );
      }
      
      if (filters.dateFrom) {
        query = query.where(gte(sentimentReports.date, filters.dateFrom));
      }
      
      if (filters.dateTo) {
        query = query.where(lte(sentimentReports.date, filters.dateTo));
      }
    }
    
    // Sort by date (newest first)
    query = query.orderBy(desc(sentimentReports.date));
    
    return await query;
  }

  // Tutorial methods
  async getTutorial(id: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial || undefined;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [newTutorial] = await db.insert(tutorials).values(tutorial).returning();
    return newTutorial;
  }

  async listTutorials(level?: string, language?: string): Promise<Tutorial[]> {
    let query = db.select().from(tutorials);
    
    if (level) {
      query = query.where(eq(tutorials.level, level));
    }
    
    if (language) {
      query = query.where(eq(tutorials.language, language));
    }
    
    return await query;
  }
  
  // UAE Government Entity methods
  async getGovEntity(id: number): Promise<GovEntity | undefined> {
    const [entity] = await db.select().from(govEntities).where(eq(govEntities.id, id));
    return entity || undefined;
  }
  
  async getGovEntityByName(name: string): Promise<GovEntity | undefined> {
    const [entity] = await db
      .select()
      .from(govEntities)
      .where(
        or(
          eq(govEntities.name, name),
          eq(govEntities.arabicName, name)
        )
      );
    return entity || undefined;
  }
  
  async createGovEntity(entity: InsertGovEntity): Promise<GovEntity> {
    const [newEntity] = await db.insert(govEntities).values(entity).returning();
    return newEntity;
  }
  
  async updateGovEntity(id: number, entity: Partial<InsertGovEntity>): Promise<GovEntity | undefined> {
    const [updatedEntity] = await db
      .update(govEntities)
      .set(entity)
      .where(eq(govEntities.id, id))
      .returning();
    return updatedEntity || undefined;
  }
  
  async deleteGovEntity(id: number): Promise<boolean> {
    // First remove all relations to this entity
    await db
      .delete(socialPostsToGovEntities)
      .where(eq(socialPostsToGovEntities.entityId, id));
    
    // Then delete the entity itself
    const result = await db
      .delete(govEntities)
      .where(eq(govEntities.id, id));
    
    return result.rowCount > 0;
  }
  
  async listGovEntities(filters?: {
    entityType?: string;
    region?: string;
    isActive?: boolean;
  }): Promise<GovEntity[]> {
    let query = db.select().from(govEntities);
    
    if (filters) {
      if (filters.entityType) {
        query = query.where(eq(govEntities.entityType, filters.entityType));
      }
      if (filters.region) {
        query = query.where(eq(govEntities.region, filters.region));
      }
      if (filters.isActive !== undefined) {
        query = query.where(eq(govEntities.isActive, filters.isActive));
      }
    }
    
    // Sort by priority (highest first), then by name
    query = query
      .orderBy(desc(govEntities.priority))
      .orderBy(asc(govEntities.name));
    
    return await query;
  }
  
  async linkEntityToPost(socialPostId: number, entityId: number, mentionType?: string, sentimentScore?: number): Promise<boolean> {
    // Check if post and entity exist
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, socialPostId));
    const [entity] = await db.select().from(govEntities).where(eq(govEntities.id, entityId));
    
    if (!post || !entity) return false;
    
    // Create the relation
    await db.insert(socialPostsToGovEntities).values({
      socialPostId,
      entityId,
      mentionType,
      sentimentScore
    });
    
    return true;
  }
  
  async getPostEntities(socialPostId: number): Promise<GovEntity[]> {
    const entities = await db
      .select({
        entity: govEntities
      })
      .from(socialPostsToGovEntities)
      .where(eq(socialPostsToGovEntities.socialPostId, socialPostId))
      .innerJoin(govEntities, eq(socialPostsToGovEntities.entityId, govEntities.id));
    
    return entities.map(row => row.entity);
  }
  
  async getEntityPosts(entityId: number): Promise<SocialPost[]> {
    const posts = await db
      .select({
        post: socialPosts
      })
      .from(socialPostsToGovEntities)
      .where(eq(socialPostsToGovEntities.entityId, entityId))
      .innerJoin(socialPosts, eq(socialPostsToGovEntities.socialPostId, socialPosts.id));
    
    return posts.map(row => row.post);
  }

  // Press Release methods
  async getPressRelease(id: number): Promise<PressRelease | undefined> {
    const [pressRelease] = await db.select().from(pressReleases).where(eq(pressReleases.id, id));
    return pressRelease || undefined;
  }

  async createPressRelease(pressRelease: InsertPressRelease): Promise<PressRelease> {
    const [newPressRelease] = await db.insert(pressReleases).values(pressRelease).returning();
    return newPressRelease;
  }

  async updatePressRelease(id: number, pressRelease: Partial<InsertPressRelease>): Promise<PressRelease | undefined> {
    const [updatedPressRelease] = await db
      .update(pressReleases)
      .set(pressRelease)
      .where(eq(pressReleases.id, id))
      .returning();
    return updatedPressRelease || undefined;
  }

  async deletePressRelease(id: number): Promise<boolean> {
    const result = await db.delete(pressReleases).where(eq(pressReleases.id, id));
    return result.rowCount > 0;
  }

  async listPressReleases(filters?: {
    status?: string;
    authorId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  }): Promise<PressRelease[]> {
    let query = db.select().from(pressReleases);
    
    if (filters) {
      if (filters.status) {
        query = query.where(eq(pressReleases.status, filters.status));
      }
      if (filters.authorId !== undefined) {
        query = query.where(eq(pressReleases.authorId, filters.authorId));
      }
      if (filters.tags && filters.tags.length > 0) {
        // Using array containment operator
        query = query.where(sql`${pressReleases.tags} && ${sql.array(filters.tags, 'text')}`);
      }
      if (filters.dateFrom) {
        const dateField = sql`COALESCE(${pressReleases.publishedAt}, ${pressReleases.createdAt})`;
        query = query.where(sql`${dateField} >= ${filters.dateFrom}`);
      }
      if (filters.dateTo) {
        const dateField = sql`COALESCE(${pressReleases.publishedAt}, ${pressReleases.createdAt})`;
        query = query.where(sql`${dateField} <= ${filters.dateTo}`);
      }
    }
    
    // Order by published date (or creation date if not published) - newest first
    query = query.orderBy(desc(sql`COALESCE(${pressReleases.publishedAt}, ${pressReleases.createdAt})`));
    
    return await query;
  }

  async publishPressRelease(id: number): Promise<PressRelease | undefined> {
    const now = new Date();
    const [pressRelease] = await db
      .update(pressReleases)
      .set({ status: 'published', publishedAt: now })
      .where(eq(pressReleases.id, id))
      .returning();
    return pressRelease || undefined;
  }

  async schedulePressRelease(id: number, scheduledFor: Date): Promise<PressRelease | undefined> {
    const [pressRelease] = await db
      .update(pressReleases)
      .set({ status: 'scheduled', scheduledFor })
      .where(eq(pressReleases.id, id))
      .returning();
    return pressRelease || undefined;
  }

  async getScheduledPressReleases(): Promise<PressRelease[]> {
    return await db
      .select()
      .from(pressReleases)
      .where(eq(pressReleases.status, 'scheduled'))
      .where(sql`${pressReleases.scheduledFor} IS NOT NULL`)
      .orderBy(asc(pressReleases.scheduledFor));
  }
  
  // API Key methods
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey || undefined;
  }
  
  async getApiKeyByValue(keyValue: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyValue, keyValue));
    return apiKey || undefined;
  }
  
  async listApiKeys(userId: number): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
  }
  
  async createApiKey(apiKeyData: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(apiKeyData).returning();
    return apiKey;
  }
  
  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set(updates)
      .where(eq(apiKeys.id, id))
      .returning();
    return updatedApiKey || undefined;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return result.rowCount > 0;
  }
  
  async updateApiKeyLastUsed(id: number): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }
  
  // Webhook methods
  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook || undefined;
  }
  
  async listWebhooks(userId: number): Promise<Webhook[]> {
    return await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId));
  }
  
  async createWebhook(webhookData: InsertWebhook): Promise<Webhook> {
    const [webhook] = await db.insert(webhooks).values(webhookData).returning();
    return webhook;
  }
  
  async updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook | undefined> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set(updates)
      .where(eq(webhooks.id, id))
      .returning();
    return updatedWebhook || undefined;
  }
  
  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id));
    return result.rowCount > 0;
  }
  
  async updateWebhookLastTriggered(id: number, success: boolean): Promise<void> {
    const updates: Partial<Webhook> = { lastTriggeredAt: new Date() };
    
    if (!success) {
      // Increment failure count on error
      const webhook = await this.getWebhook(id);
      if (webhook) {
        updates.failureCount = (webhook.failureCount || 0) + 1;
      }
    } else {
      // Reset failure count on success
      updates.failureCount = 0;
    }
    
    await db
      .update(webhooks)
      .set(updates)
      .where(eq(webhooks.id, id));
  }
  
  // Support Tickets methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }
  
  async listSupportTickets(userId: number, filters?: { status?: string }): Promise<SupportTicket[]> {
    let query = db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
    
    if (filters?.status) {
      query = query.where(eq(supportTickets.status, filters.status));
    }
    
    return await query.orderBy(desc(supportTickets.createdAt));
  }
  
  async listAllSupportTickets(filters?: { status?: string }): Promise<SupportTicket[]> {
    let query = db.select().from(supportTickets);
    
    if (filters?.status) {
      query = query.where(eq(supportTickets.status, filters.status));
    }
    
    return await query.orderBy(desc(supportTickets.createdAt));
  }
  
  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(ticketData).returning();
    return ticket;
  }
  
  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }
  
  async getTicketResponses(ticketId: number): Promise<TicketResponse[]> {
    return await db
      .select()
      .from(ticketResponses)
      .where(eq(ticketResponses.ticketId, ticketId))
      .orderBy(asc(ticketResponses.createdAt));
  }
  
  async addTicketResponse(responseData: InsertTicketResponse): Promise<TicketResponse> {
    const [response] = await db.insert(ticketResponses).values(responseData).returning();
    
    // Update the ticket's updatedAt timestamp
    await db
      .update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, responseData.ticketId));
    
    return response;
  }
  
  // Knowledge Base methods
  async getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticle | undefined> {
    const [article] = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id));
    
    if (article && article.isPublished) {
      // Increment view count
      await db
        .update(knowledgeBaseArticles)
        .set({ viewCount: (article.viewCount || 0) + 1 })
        .where(eq(knowledgeBaseArticles.id, id));
    }
    
    return article || undefined;
  }
  
  async listKnowledgeBaseArticles(filters?: { 
    category?: string, 
    isPublished?: boolean,
    search?: string,
    tags?: string[]
  }): Promise<KnowledgeBaseArticle[]> {
    let query = db.select().from(knowledgeBaseArticles);
    
    if (filters?.category) {
      query = query.where(eq(knowledgeBaseArticles.category, filters.category));
    }
    
    if (filters?.isPublished !== undefined) {
      query = query.where(eq(knowledgeBaseArticles.isPublished, filters.isPublished));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          sql`${knowledgeBaseArticles.title} ILIKE ${'%' + filters.search + '%'}`,
          sql`${knowledgeBaseArticles.content} ILIKE ${'%' + filters.search + '%'}`
        )
      );
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      // This checks if any of the article's tags match any of the filter tags
      query = query.where(
        sql`${knowledgeBaseArticles.tags} && ${filters.tags}`
      );
    }
    
    return await query.orderBy(desc(knowledgeBaseArticles.updatedAt));
  }
  
  async createKnowledgeBaseArticle(articleData: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle> {
    const [article] = await db.insert(knowledgeBaseArticles).values(articleData).returning();
    return article;
  }
  
  async updateKnowledgeBaseArticle(id: number, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle | undefined> {
    const [updatedArticle] = await db
      .update(knowledgeBaseArticles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeBaseArticles.id, id))
      .returning();
    return updatedArticle || undefined;
  }
  
  async deleteKnowledgeBaseArticle(id: number): Promise<boolean> {
    const result = await db.delete(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id));
    return result.rowCount > 0;
  }
  
  async updateArticleHelpfulCount(id: number, isHelpful: boolean): Promise<KnowledgeBaseArticle | undefined> {
    const article = await this.getKnowledgeBaseArticle(id);
    if (!article) return undefined;
    
    const [updatedArticle] = await db
      .update(knowledgeBaseArticles)
      .set({
        helpfulCount: isHelpful ? (article.helpfulCount || 0) + 1 : article.helpfulCount,
        notHelpfulCount: !isHelpful ? (article.notHelpfulCount || 0) + 1 : article.notHelpfulCount,
      })
      .where(eq(knowledgeBaseArticles.id, id))
      .returning();
    
    return updatedArticle || undefined;
  }
  
  // FAQ methods
  async getFaqItem(id: number): Promise<FaqItem | undefined> {
    const [faqItem] = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return faqItem || undefined;
  }
  
  async listFaqItems(filters?: { category?: string, isActive?: boolean }): Promise<FaqItem[]> {
    let query = db.select().from(faqItems);
    
    if (filters) {
      if (filters.category) {
        query = query.where(eq(faqItems.category, filters.category));
      }
      
      if (filters.isActive !== undefined) {
        query = query.where(eq(faqItems.isActive, filters.isActive));
      }
    }
    
    // Sort by category and then by sortOrder
    query = query.orderBy(asc(faqItems.category), asc(faqItems.sortOrder));
    
    return await query;
  }
  
  async createFaqItem(faqData: InsertFaqItem): Promise<FaqItem> {
    const [faqItem] = await db.insert(faqItems).values(faqData).returning();
    return faqItem;
  }
  
  async updateFaqItem(id: number, updates: Partial<FaqItem>): Promise<FaqItem | undefined> {
    const [updatedFaqItem] = await db
      .update(faqItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(faqItems.id, id))
      .returning();
    return updatedFaqItem || undefined;
  }
  
  async deleteFaqItem(id: number): Promise<boolean> {
    const result = await db.delete(faqItems).where(eq(faqItems.id, id));
    return result.rowCount > 0;
  }
  
  // Contact Message methods
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || undefined;
  }
  
  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values({
      ...messageData,
      status: "new"
    }).returning();
    return newMessage;
  }
  
  async updateContactMessageStatus(id: number, status: string): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage || undefined;
  }
  
  async respondToContactMessage(id: number, response: { responseMessage: string, respondedBy: number }): Promise<ContactMessage | undefined> {
    const now = new Date();
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ 
        status: "responded", 
        updatedAt: now,
        responseAt: now,
        respondedBy: response.respondedBy,
        responseMessage: response.responseMessage
      })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage || undefined;
  }
  
  async listContactMessages(filters?: { status?: string, department?: string }): Promise<ContactMessage[]> {
    let query = db.select().from(contactMessages);
    
    if (filters?.status) {
      query = query.where(eq(contactMessages.status, filters.status));
    }
    
    if (filters?.department) {
      query = query.where(eq(contactMessages.department, filters.department));
    }
    
    return await query.orderBy(desc(contactMessages.createdAt));
  }

  // Report methods
  async getReports(userId?: number): Promise<Report[]> {
    let query = db.select().from(reports);
    
    if (userId !== undefined) {
      query = query.where(eq(reports.userId, userId));
    }
    
    return await query.orderBy(desc(reports.createdAt));
  }
  
  async getReportById(id: number, userId?: number): Promise<Report | undefined> {
    let query = db.select().from(reports).where(eq(reports.id, id));
    
    if (userId !== undefined) {
      query = query.where(eq(reports.userId, userId));
    }
    
    const [report] = await query;
    return report || undefined;
  }
  
  async createReport(reportData: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(reportData).returning();
    return newReport;
  }
  
  async updateReport(id: number, userId: number | undefined, reportData: Partial<InsertReport>): Promise<Report | undefined> {
    let query = db.update(reports)
      .set({ ...reportData, updatedAt: new Date() })
      .where(eq(reports.id, id));
    
    if (userId !== undefined) {
      query = query.where(eq(reports.userId, userId));
    }
    
    const [updatedReport] = await query.returning();
    return updatedReport || undefined;
  }
  
  async deleteReport(id: number, userId?: number): Promise<boolean> {
    let query = db.delete(reports).where(eq(reports.id, id));
    
    if (userId !== undefined) {
      query = query.where(eq(reports.userId, userId));
    }
    
    const result = await query;
    return result.rowCount > 0;
  }

  // Achievement Badge methods
  async getAchievementBadge(id: number): Promise<AchievementBadge | undefined> {
    const [badge] = await db.select().from(achievementBadges).where(eq(achievementBadges.id, id));
    return badge;
  }

  async createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge> {
    const [newBadge] = await db.insert(achievementBadges).values(badge).returning();
    return newBadge;
  }

  async updateAchievementBadge(id: number, badge: Partial<InsertAchievementBadge>): Promise<AchievementBadge | undefined> {
    const [updatedBadge] = await db.update(achievementBadges)
      .set(badge)
      .where(eq(achievementBadges.id, id))
      .returning();
    return updatedBadge;
  }

  async deleteAchievementBadge(id: number): Promise<boolean> {
    const result = await db.delete(achievementBadges).where(eq(achievementBadges.id, id));
    return result.rowCount > 0;
  }

  async listAchievementBadges(filters?: { 
    category?: string, 
    level?: number,
    isHidden?: boolean 
  }): Promise<AchievementBadge[]> {
    let query = db.select().from(achievementBadges);
    
    if (filters?.category) {
      query = query.where(eq(achievementBadges.category, filters.category));
    }
    
    if (filters?.level !== undefined) {
      query = query.where(eq(achievementBadges.level, filters.level));
    }
    
    if (filters?.isHidden !== undefined) {
      query = query.where(eq(achievementBadges.isHidden, filters.isHidden));
    }
    
    return await query;
  }

  // User Achievement methods
  async getUserAchievement(id: number): Promise<UserAchievement | undefined> {
    const [achievement] = await db.select().from(userAchievements).where(eq(userAchievements.id, id));
    return achievement;
  }

  async getUserAchievementByBadge(userId: number, badgeId: number): Promise<UserAchievement | undefined> {
    const [achievement] = await db.select().from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.badgeId, badgeId)
      ));
    return achievement;
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements).values(achievement).returning();
    return newAchievement;
  }

  async updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined> {
    const [updatedAchievement] = await db.update(userAchievements)
      .set({ ...achievement, updatedAt: new Date() })
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedAchievement;
  }

  async getUserAchievements(userId: number, onlyUnlocked?: boolean): Promise<(UserAchievement & { badge: AchievementBadge })[]> {
    let query = db.select({
      achievement: userAchievements,
      badge: achievementBadges
    })
    .from(userAchievements)
    .innerJoin(achievementBadges, eq(userAchievements.badgeId, achievementBadges.id))
    .where(eq(userAchievements.userId, userId));
    
    if (onlyUnlocked) {
      query = query.where(eq(userAchievements.isUnlocked, true));
    }
    
    const results = await query;
    return results.map(({ achievement, badge }) => ({ ...achievement, badge }));
  }

  async checkAndUpdateAchievementProgress(userId: number, actionType: string, count: number = 1): Promise<UserAchievement[]> {
    // Find all badges that match this action type
    const badges = await db.select().from(achievementBadges)
      .where(sql`${achievementBadges.criteria}->>'type' = ${actionType}`);
    
    if (badges.length === 0) {
      return [];
    }
    
    const updatedAchievements: UserAchievement[] = [];
    
    for (const badge of badges) {
      // Check if user already has an achievement record for this badge
      let userAchievement = await this.getUserAchievementByBadge(userId, badge.id);
      
      if (!userAchievement) {
        // Create a new achievement record if one doesn't exist
        userAchievement = await this.createUserAchievement({
          userId,
          badgeId: badge.id,
          isUnlocked: false,
          progress: 0
        });
      }
      
      if (userAchievement.isUnlocked) {
        continue; // Skip if already unlocked
      }
      
      // Update progress
      const newProgress = userAchievement.progress + count;
      const targetCount = badge.criteria.count || Infinity;
      
      // Check if achievement is unlocked
      const isUnlocked = newProgress >= targetCount;
      
      // Update the achievement
      const updatedAchievement = await this.updateUserAchievement(userAchievement.id, {
        progress: newProgress,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date() : undefined
      });
      
      if (updatedAchievement && isUnlocked) {
        // If newly unlocked, add points to user's stats and create activity feed
        await this.incrementUserStats(userId, 'totalPoints', badge.points);
        await this.createActivityFeed({
          userId,
          type: 'achievement_unlocked',
          content: `You've unlocked the "${badge.name}" badge!`,
          points: badge.points,
          metadata: { badgeId: badge.id }
        });
        
        // Update user level based on total points
        await this.updateUserLevel(userId);
        
        updatedAchievements.push(updatedAchievement);
      }
    }
    
    return updatedAchievements;
  }

  async unlockAchievement(userId: number, badgeId: number): Promise<UserAchievement | undefined> {
    const badge = await this.getAchievementBadge(badgeId);
    if (!badge) return undefined;
    
    let userAchievement = await this.getUserAchievementByBadge(userId, badgeId);
    
    if (!userAchievement) {
      userAchievement = await this.createUserAchievement({
        userId,
        badgeId,
        isUnlocked: true,
        progress: badge.criteria.count || 1,
        unlockedAt: new Date()
      });
    } else if (!userAchievement.isUnlocked) {
      userAchievement = await this.updateUserAchievement(userAchievement.id, {
        isUnlocked: true,
        unlockedAt: new Date()
      });
    } else {
      return userAchievement; // Already unlocked
    }
    
    // Add points to user's stats
    await this.incrementUserStats(userId, 'totalPoints', badge.points);
    
    // Create activity feed entry
    await this.createActivityFeed({
      userId,
      type: 'achievement_unlocked',
      content: `You've unlocked the "${badge.name}" badge!`,
      points: badge.points,
      metadata: { badgeId: badge.id }
    });
    
    // Update user level based on total points
    await this.updateUserLevel(userId);
    
    return userAchievement;
  }

  // User Gamification Stats methods
  async getUserGamificationStats(userId: number): Promise<UserGamificationStats | undefined> {
    const [stats] = await db.select().from(userGamificationStats).where(eq(userGamificationStats.userId, userId));
    return stats;
  }

  async createUserGamificationStats(stats: InsertUserGamificationStats): Promise<UserGamificationStats> {
    const [newStats] = await db.insert(userGamificationStats).values(stats).returning();
    return newStats;
  }

  async updateUserGamificationStats(userId: number, stats: Partial<InsertUserGamificationStats>): Promise<UserGamificationStats | undefined> {
    const [updatedStats] = await db.update(userGamificationStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(userGamificationStats.userId, userId))
      .returning();
    return updatedStats;
  }

  async incrementUserStats(userId: number, metricName: string, value: number = 1): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    if (metricName === 'totalPoints') {
      const updatedStats = await this.updateUserGamificationStats(userId, {
        totalPoints: stats.totalPoints + value
      });
      return updatedStats;
    } else if (metricName in stats.metrics) {
      const updatedMetrics = { ...stats.metrics };
      updatedMetrics[metricName] = (updatedMetrics[metricName] || 0) + value;
      
      const updatedStats = await this.updateUserGamificationStats(userId, {
        metrics: updatedMetrics
      });
      return updatedStats;
    }
    
    return stats;
  }

  async updateUserLevel(userId: number): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    // Simple level calculation based on points
    // Each level requires more points than the previous one
    const pointsRequired = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
    
    let newLevel = 1;
    while (stats.totalPoints >= pointsRequired(newLevel + 1)) {
      newLevel++;
    }
    
    if (newLevel > stats.level) {
      // Level up!
      const updatedStats = await this.updateUserGamificationStats(userId, {
        level: newLevel
      });
      
      // Create activity feed entry for level up
      await this.createActivityFeed({
        userId,
        type: 'level_up',
        content: `Congratulations! You've reached level ${newLevel}!`,
        points: 0,
        metadata: { level: newLevel }
      });
      
      return updatedStats;
    }
    
    return stats;
  }

  async updateUserStreak(userId: number): Promise<UserGamificationStats | undefined> {
    const stats = await this.getUserGamificationStats(userId);
    if (!stats) return undefined;
    
    const now = new Date();
    const lastActivityDate = new Date(stats.lastActivityDate);
    
    // Check if last activity was yesterday
    const isYesterday = 
      now.getDate() - lastActivityDate.getDate() === 1 ||
      (now.getDate() === 1 && 
       (lastActivityDate.getDate() === new Date(now.getFullYear(), now.getMonth(), 0).getDate()) &&
       (now.getMonth() === (lastActivityDate.getMonth() + 1) % 12));
    
    // Check if last activity was today
    const isToday = 
      now.getDate() === lastActivityDate.getDate() &&
      now.getMonth() === lastActivityDate.getMonth() &&
      now.getFullYear() === lastActivityDate.getFullYear();
    
    if (isYesterday) {
      // If last activity was yesterday, increment streak
      const newStreak = stats.streak + 1;
      const updatedStats = await this.updateUserGamificationStats(userId, {
        streak: newStreak,
        lastActivityDate: now
      });
      
      // Check if this streak is a milestone (3, 7, 14, 30, 60, 90, etc.)
      const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
      if (milestones.includes(newStreak)) {
        // Create activity feed entry for streak milestone
        await this.createActivityFeed({
          userId,
          type: 'streak_milestone',
          content: `You've maintained a ${newStreak}-day streak!`,
          points: newStreak * 2, // Bonus points for milestone
          metadata: { streak: newStreak }
        });
        
        // Add bonus points
        await this.incrementUserStats(userId, 'totalPoints', newStreak * 2);
        
        // Check for streak-based achievements
        await this.checkAndUpdateAchievementProgress(userId, 'login_streak', newStreak);
      }
      
      return updatedStats;
    } else if (!isToday) {
      // If last activity was neither yesterday nor today, reset streak
      return await this.updateUserGamificationStats(userId, {
        streak: 1,
        lastActivityDate: now
      });
    } else {
      // If last activity was today, just update the timestamp
      return await this.updateUserGamificationStats(userId, {
        lastActivityDate: now
      });
    }
  }

  async getUsersLeaderboard(limit: number = 10): Promise<UserGamificationStats[]> {
    return await db.select().from(userGamificationStats)
      .orderBy(desc(userGamificationStats.totalPoints), desc(userGamificationStats.level))
      .limit(limit);
  }

  // Activity Feed methods
  async getActivityFeed(id: number): Promise<ActivityFeed | undefined> {
    const [activity] = await db.select().from(activityFeed).where(eq(activityFeed.id, id));
    return activity;
  }

  async createActivityFeed(activity: InsertActivityFeed): Promise<ActivityFeed> {
    const [newActivity] = await db.insert(activityFeed).values(activity).returning();
    return newActivity;
  }

  async getUserActivityFeed(userId: number, limit: number = 20): Promise<ActivityFeed[]> {
    return await db.select().from(activityFeed)
      .where(eq(activityFeed.userId, userId))
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);
  }

  async markActivityAsRead(id: number): Promise<boolean> {
    const result = await db.update(activityFeed)
      .set({ isRead: true })
      .where(eq(activityFeed.id, id));
    return result.rowCount > 0;
  }

  async markAllUserActivitiesAsRead(userId: number): Promise<boolean> {
    const result = await db.update(activityFeed)
      .set({ isRead: true })
      .where(and(
        eq(activityFeed.userId, userId),
        eq(activityFeed.isRead, false)
      ));
    return result.rowCount > 0;
  }
}

// Initialize storage with the appropriate implementation
export const storage = new DatabaseStorage();
