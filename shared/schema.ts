import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Tenant schema to support multi-tenant architecture
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  plan: text("plan").default("basic"), // basic, premium, enterprise
  status: text("status").default("active"), // active, suspended, pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  settings: jsonb("settings").default({}),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  logo: text("logo"),
  maxUsers: integer("max_users").default(5),
  maxStorage: integer("max_storage").default(5), // In GB
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

// Users and Roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("default"), // Link to tenant for multi-tenant support
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("viewer"), // admin, analyst, editor, viewer
  avatarUrl: text("avatar_url"),
  language: text("language").default("ar"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorRecoveryCodes: text("two_factor_recovery_codes").array(),
  notificationPrefs: jsonb("notification_prefs").default({
    email: {
      alerts: true,
      reports: true,
      system: true,
      marketing: false
    },
    inApp: {
      alerts: true,
      mentions: true,
      system: true
    },
    mobileApp: {
      alerts: false,
      reports: false
    }
  }),
  sessionTimeout: integer("session_timeout").default(30), // Session timeout in minutes
});

export const usersRelations = relations(users, ({ many }) => ({
  mediaItems: many(mediaItems),
  loginHistory: many(loginHistory),
}));

// Login History
export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  status: text("status").notNull(), // success, failed
  failureReason: text("failure_reason"),
});

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id]
  })
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  twoFactorRecoveryCodes: true,
});

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({
  id: true,
  loginTime: true,
});

// Media Content
export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: text("media_type").notNull(), // image, video, document
  contentUrl: text("content_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

// Journalists Directory
export const journalists = pgTable("journalists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  organization: text("organization").notNull(),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar"),
  bio: text("bio"),
  specialization: text("specialization"),
  socialLinks: jsonb("social_links"),
  isVerified: boolean("is_verified").default(false),
  lastContacted: timestamp("last_contacted"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media Sources
export const mediaSources = pgTable("media_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  category: text("category").notNull(), // newspaper, tv, radio, online
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  country: text("country").default("UAE"),
  city: text("city"),
  description: text("description"),
  relevance: integer("relevance").default(5), // 1-10 scale of importance to Ajman Police
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media Sources Relations

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  creator: one(users, {
    fields: [mediaItems.createdBy],
    references: [users.id]
  })
}));

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Social Media Posts
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // twitter, facebook, instagram, telegram, tiktok, news
  content: text("content").notNull(),
  authorName: text("author_name"),
  authorUsername: text("author_username"),
  authorAvatarUrl: text("author_avatar_url"),
  postUrl: text("post_url"),
  postedAt: timestamp("posted_at"),
  sentiment: integer("sentiment"), // 1-5 scale
  engagement: jsonb("engagement"), // likes, shares, comments
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
});

// Keywords for Monitoring
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  alertThreshold: integer("alert_threshold"),
  changePercentage: integer("change_percentage"),
});

export const insertKeywordSchema = createInsertSchema(keywords).omit({
  id: true,
  createdAt: true,
});

// Social Posts and Keywords relation table
export const socialPostsToKeywords = pgTable("social_posts_to_keywords", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.keywordId] })
}));

export const socialPostsRelations = relations(socialPosts, ({ many }) => ({
  keywords: many(socialPostsToKeywords)
}));

export const keywordsRelations = relations(keywords, ({ many }) => ({
  socialPosts: many(socialPostsToKeywords)
}));

export const socialPostsToKeywordsRelations = relations(socialPostsToKeywords, ({ one }) => ({
  socialPost: one(socialPosts, {
    fields: [socialPostsToKeywords.socialPostId],
    references: [socialPosts.id]
  }),
  keyword: one(keywords, {
    fields: [socialPostsToKeywords.keywordId],
    references: [keywords.id]
  })
}));

// Sentiment Reports
export const sentimentReports = pgTable("sentiment_reports", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  positive: integer("positive").default(0),
  neutral: integer("neutral").default(0),
  negative: integer("negative").default(0),
  keywords: jsonb("keywords"), // most influential keywords
  platform: text("platform"), // specific platform or "all"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSentimentReportSchema = createInsertSchema(sentimentReports).omit({
  id: true,
  createdAt: true,
});

// Custom Reports Schema
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  components: text("components").array().notNull(),
  options: jsonb("options"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Tutorials
export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  level: text("level"), // beginner, intermediate, advanced
  language: text("language").default("ar"), // ar, en
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTutorialSchema = createInsertSchema(tutorials).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;

export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;

export type SentimentReport = typeof sentimentReports.$inferSelect;
export type InsertSentimentReport = z.infer<typeof insertSentimentReportSchema>;

export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;

// Relations and Schemas for Journalists and Media Sources
export const journalistsRelations = relations(journalists, ({ many }) => ({
  // Additional relations can be added here if needed
}));

export const mediaSourcesRelations = relations(mediaSources, ({ many }) => ({
  // Additional relations can be added here if needed
}));

export const insertJournalistSchema = createInsertSchema(journalists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaSourceSchema = createInsertSchema(mediaSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Journalist = typeof journalists.$inferSelect;
export type InsertJournalist = z.infer<typeof insertJournalistSchema>;

export type MediaSource = typeof mediaSources.$inferSelect;
export type InsertMediaSource = z.infer<typeof insertMediaSourceSchema>;

// Keyword Alerts Schema
export const keywordAlerts = pgTable("keyword_alerts", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  alertDate: timestamp("alert_date").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  alertSent: boolean("alert_sent").notNull().default(false),
  priority: text("priority"),
});

export const keywordAlertsRelations = relations(keywordAlerts, ({ one }) => ({
  keyword: one(keywords, {
    fields: [keywordAlerts.keywordId],
    references: [keywords.id],
  }),
  post: one(socialPosts, {
    fields: [keywordAlerts.socialPostId],
    references: [socialPosts.id],
  }),
}));

export const insertKeywordAlertSchema = createInsertSchema(keywordAlerts).omit({
  id: true,
});

export type KeywordAlert = typeof keywordAlerts.$inferSelect;
export type InsertKeywordAlert = z.infer<typeof insertKeywordAlertSchema>;

// UAE Government Entities for specific tracking
export const govEntities = pgTable("gov_entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name"),
  entityType: text("entity_type").notNull(), // federal, local, ministry, etc.
  region: text("region"), // Abu Dhabi, Dubai, Sharjah, etc.
  iconUrl: text("icon_url"),
  websiteUrl: text("website_url"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // For sorting/importance
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGovEntitySchema = createInsertSchema(govEntities).omit({
  id: true,
  createdAt: true,
});

// Relation between Social Posts and Government Entities
export const socialPostsToGovEntities = pgTable("social_posts_to_gov_entities", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  entityId: integer("entity_id").notNull().references(() => govEntities.id),
  mentionType: text("mention_type"), // direct, indirect
  sentimentScore: integer("sentiment_score"), // Entity-specific sentiment
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.entityId] })
}));

export const govEntitiesRelations = relations(govEntities, ({ many }) => ({
  socialPosts: many(socialPostsToGovEntities)
}));

export const socialPostsToGovEntitiesRelations = relations(socialPostsToGovEntities, ({ one }) => ({
  socialPost: one(socialPosts, {
    fields: [socialPostsToGovEntities.socialPostId],
    references: [socialPosts.id]
  }),
  govEntity: one(govEntities, {
    fields: [socialPostsToGovEntities.entityId],
    references: [govEntities.id]
  })
}));

// Add relation to socialPostsRelations
export const extendedSocialPostsRelations = relations(socialPosts, ({ many }) => ({
  keywords: many(socialPostsToKeywords),
  govEntities: many(socialPostsToGovEntities)
}));

export type GovEntity = typeof govEntities.$inferSelect;
export type InsertGovEntity = z.infer<typeof insertGovEntitySchema>;

// Press Releases
export const pressReleases = pgTable("press_releases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  content: text("content").notNull(),
  arabicContent: text("arabic_content"),
  summary: text("summary"),
  arabicSummary: text("arabic_summary"),
  status: text("status").notNull().default("draft"), // draft, review, published
  publishDate: timestamp("publish_date"),
  category: text("category"),
  featuredImage: text("featured_image"),
  attachments: jsonb("attachments"),
  distributionList: jsonb("distribution_list"), // IDs of journalists/media sources to distribute to
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pressReleasesRelations = relations(pressReleases, ({ one }) => ({
  creator: one(users, {
    fields: [pressReleases.createdBy],
    references: [users.id]
  })
}));

export const insertPressReleaseSchema = createInsertSchema(pressReleases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PressRelease = typeof pressReleases.$inferSelect;
export type InsertPressRelease = z.infer<typeof insertPressReleaseSchema>;

// API Keys schema

// API Keys schema
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  keyName: text("key_name").notNull(),
  keyValue: text("key_value").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  allowedIps: text("allowed_ips").array(),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Webhooks schema
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  events: text("events").array().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at", { mode: "date" }),
  failureCount: integer("failure_count").default(0),
});

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
}));

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  failureCount: true,
  lastTriggeredAt: true,
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

// Support Tickets schema
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
  attachments: jsonb("attachments").default([]),
});

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  responses: many(ticketResponses),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

// Ticket Responses schema
export const ticketResponses = pgTable("ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  attachments: jsonb("attachments").default([]),
});

export const ticketResponsesRelations = relations(ticketResponses, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketResponses.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [ticketResponses.userId],
    references: [users.id],
  }),
}));

export const insertTicketResponseSchema = createInsertSchema(ticketResponses).omit({
  id: true,
  createdAt: true,
});

export type TicketResponse = typeof ticketResponses.$inferSelect;
export type InsertTicketResponse = z.infer<typeof insertTicketResponseSchema>;

// Knowledge Base Articles schema
export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  isPublished: boolean("is_published").notNull().default(false),
  authorId: integer("author_id").notNull().references(() => users.id),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  viewCount: integer("view_count").default(0),
  relatedArticleIds: integer("related_article_ids").array(),
});

export const knowledgeBaseArticlesRelations = relations(knowledgeBaseArticles, ({ one }) => ({
  author: one(users, {
    fields: [knowledgeBaseArticles.authorId],
    references: [users.id],
  }),
}));

export const insertKnowledgeBaseArticleSchema = createInsertSchema(knowledgeBaseArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
  notHelpfulCount: true,
  viewCount: true,
});

export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseArticleSchema>;

// FAQ Items schema
export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;

// Contact Messages schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  department: text("department").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, read, responded, closed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  responseAt: timestamp("response_at"),
  respondedBy: integer("responded_by").references(() => users.id),
  responseMessage: text("response_message"),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  status: true, 
  createdAt: true,
  updatedAt: true,
  responseAt: true,
  respondedBy: true,
  responseMessage: true,
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Scheduled Social Media Posts
export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  platform: text("platform").notNull(),
  scheduledTime: timestamp("scheduled_time", { mode: "date" }).notNull(),
  hashtags: text("hashtags").array(),
  mediaUrls: text("media_urls").array(),
  status: text("status").notNull().default("pending"), // pending, published, failed, cancelled
  authorName: text("author_name"),
  authorUsername: text("author_username"),
  authorAvatarUrl: text("author_avatar_url"),
  engagement: jsonb("engagement").$type<{
    likes?: number;
    comments?: number;
    shares?: number;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  publishedPostId: integer("published_post_id").references(() => socialPosts.id),
  aiGenerated: boolean("ai_generated").default(false),
  metadata: jsonb("metadata").$type<{
    bestTimeToPost?: string;
    sentimentPrediction?: number;
    topics?: string[];
    audienceReaction?: string;
    estimatedEngagement?: {
      likes: number;
      comments: number;
      shares: number;
    };
  }>()
});

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  publishedPost: one(socialPosts, {
    fields: [scheduledPosts.publishedPostId],
    references: [socialPosts.id]
  })
}));

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;

// Achievement Badges Schema
export const achievementBadges = pgTable("achievement_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // content, analysis, social, engagement, system
  level: integer("level").notNull().default(1), // 1, 2, 3 for bronze, silver, gold, etc.
  iconUrl: text("icon_url").notNull(),
  criteria: jsonb("criteria").notNull().$type<{
    type: string; // login_count, posts_created, reports_generated, etc.
    count?: number; // threshold count for achievement
    daysStreak?: number; // consecutive days for time-based achievements
    specificActions?: string[]; // specific actions that must be completed
  }>(),
  points: integer("points").notNull().default(10), // points awarded for the achievement
  isHidden: boolean("is_hidden").default(false), // achievement is a surprise until unlocked
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievement Progress Schema
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => achievementBadges.id),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  progress: integer("progress").notNull().default(0), // progress towards the achievement
  unlockedAt: timestamp("unlocked_at"), // When the user unlocked the achievement
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Gamification Stats Schema
export const userGamificationStats = pgTable("user_gamification_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0), // consecutive days of activity
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  metrics: jsonb("metrics").notNull().$type<{
    logins: number;
    reportsGenerated: number;
    postsCreated: number;
    alertsReviewed: number;
    dashboardCustomizations: number;
    analysisRun: number;
    daysSinceJoined: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Feed Schema
export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // achievement_unlocked, level_up, streak_milestone, etc.
  content: text("content").notNull(),
  points: integer("points").default(0),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const achievementBadgesRelations = relations(achievementBadges, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  badge: one(achievementBadges, {
    fields: [userAchievements.badgeId],
    references: [achievementBadges.id]
  })
}));

export const userGamificationStatsRelations = relations(userGamificationStats, ({ one }) => ({
  user: one(users, {
    fields: [userGamificationStats.userId],
    references: [users.id]
  })
}));

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id]
  })
}));

// Extended user relations
export const extendedUserRelations = relations(users, ({ many, one }) => ({
  mediaItems: many(mediaItems),
  loginHistory: many(loginHistory),
  achievements: many(userAchievements),
  activityFeed: many(activityFeed),
  gamificationStats: one(userGamificationStats, {
    fields: [users.id],
    references: [userGamificationStats.userId]
  })
}));

// Insert Schemas
export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGamificationStatsSchema = createInsertSchema(userGamificationStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

// Types
export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type UserGamificationStats = typeof userGamificationStats.$inferSelect;
export type InsertUserGamificationStats = z.infer<typeof insertUserGamificationStatsSchema>;

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;

// Chat Messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  role: varchar("role", { length: 10 }).notNull(), // 'user' or 'bot'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // For additional info like intent, entities, etc.
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
