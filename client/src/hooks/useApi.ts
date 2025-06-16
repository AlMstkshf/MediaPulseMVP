import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// -----------------------------
// Table Definitions
// -----------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("viewer"),
  avatarUrl: text("avatar_url"),
  language: text("language").default("ar"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorRecoveryCodes: text("two_factor_recovery_codes").array().notNull().default([]),
  notificationPrefs: jsonb("notification_prefs").default({
    email: { alerts: true, reports: true, system: true, marketing: false },
    inApp:  { alerts: true, mentions: true, system: true },
    mobileApp: { alerts: false, reports: false }
  }),
  sessionTimeout: integer("session_timeout").default(30),
});

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  status: text("status").notNull(),
  failureReason: text("failure_reason"),
});

export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: text("media_type").notNull(),
  contentUrl: text("content_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().notNull().default([]),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

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

export const mediaSources = pgTable("media_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  category: text("category").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  country: text("country").default("UAE"),
  city: text("city"),
  description: text("description"),
  relevance: integer("relevance").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name"),
  authorUsername: text("author_username"),
  authorAvatarUrl: text("author_avatar_url"),
  postUrl: text("post_url"),
  postedAt: timestamp("posted_at"),
  sentiment: integer("sentiment"),
  engagement: jsonb("engagement").notNull().default({}),
  keywords: text("keywords").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  alertThreshold: integer("alert_threshold"),
  changePercentage: integer("change_percentage"),
});

export const socialPostsToKeywords = pgTable("social_posts_to_keywords", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.keywordId] }),
}));

export const sentimentReports = pgTable("sentiment_reports", {
  id: serial("id").primaryKey(),
  reportDate: timestamp("date").notNull(),
  positive: integer("positive").default(0),
  neutral: integer("neutral").default(0),
  negative: integer("negative").default(0),
  keywords: jsonb("keywords"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  components: text("components").array().notNull().default([]),
  options: jsonb("options"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  level: text("level"),
  language: text("language").default("ar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywordAlerts = pgTable("keyword_alerts", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  alertDate: timestamp("alert_date").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  alertSent: boolean("alert_sent").notNull().default(false),
  priority: text("priority"),
});

export const govEntities = pgTable("gov_entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name"),
  entityType: text("entity_type").notNull(),
  region: text("region"),
  iconUrl: text("icon_url"),
  websiteUrl: text("website_url"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialPostsToGovEntities = pgTable("social_posts_to_gov_entities", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  entityId: integer("entity_id").notNull().references(() => govEntities.id),
  mentionType: text("mention_type"),
  sentimentScore: integer("sentiment_score"),
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.entityId] }),
}));

export const pressReleases = pgTable("press_releases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  content: text("content").notNull(),
  arabicContent: text("arabic_content"),
  summary: text("summary"),
  arabicSummary: text("arabic_summary"),
  status: text("status").notNull().default("draft"),
  publishDate: timestamp("publish_date"),
  category: text("category"),
  featuredImage: text("featured_image"),
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// -----------------------------
// Table Definitions
// -----------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("viewer"),
  avatarUrl: text("avatar_url"),
  language: text("language").default("ar"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorRecoveryCodes: text("two_factor_recovery_codes").array().notNull().default([]),
  notificationPrefs: jsonb("notification_prefs").default({
    email: { alerts: true, reports: true, system: true, marketing: false },
    inApp:  { alerts: true, mentions: true, system: true },
    mobileApp: { alerts: false, reports: false }
  }),
  sessionTimeout: integer("session_timeout").default(30),
});

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  status: text("status").notNull(),
  failureReason: text("failure_reason"),
});

export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: text("media_type").notNull(),
  contentUrl: text("content_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().notNull().default([]),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

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

export const mediaSources = pgTable("media_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  category: text("category").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  country: text("country").default("UAE"),
  city: text("city"),
  description: text("description"),
  relevance: integer("relevance").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name"),
  authorUsername: text("author_username"),
  authorAvatarUrl: text("author_avatar_url"),
  postUrl: text("post_url"),
  postedAt: timestamp("posted_at"),
  sentiment: integer("sentiment"),
  engagement: jsonb("engagement").notNull().default({}),
  keywords: text("keywords").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  alertThreshold: integer("alert_threshold"),
  changePercentage: integer("change_percentage"),
});

export const socialPostsToKeywords = pgTable("social_posts_to_keywords", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.keywordId] }),
}));

export const sentimentReports = pgTable("sentiment_reports", {
  id: serial("id").primaryKey(),
  reportDate: timestamp("date").notNull(),
  positive: integer("positive").default(0),
  neutral: integer("neutral").default(0),
  negative: integer("negative").default(0),
  keywords: jsonb("keywords"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  components: text("components").array().notNull().default([]),
  options: jsonb("options"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  level: text("level"),
  language: text("language").default("ar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywordAlerts = pgTable("keyword_alerts", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  alertDate: timestamp("alert_date").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  alertSent: boolean("alert_sent").notNull().default(false),
  priority: text("priority"),
});

export const govEntities = pgTable("gov_entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name"),
  entityType: text("entity_type").notNull(),
  region: text("region"),
  iconUrl: text("icon_url"),
  websiteUrl: text("website_url"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialPostsToGovEntities = pgTable("social_posts_to_gov_entities", {
  socialPostId: integer("social_post_id").notNull().references(() => socialPosts.id),
  entityId: integer("entity_id").notNull().references(() => govEntities.id),
  mentionType: text("mention_type"),
  sentimentScore: integer("sentiment_score"),
}, (t) => ({
  pk: primaryKey({ columns: [t.socialPostId, t.entityId] }),
}));

export const pressReleases = pgTable("press_releases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  content: text("content").notNull(),
  arabicContent: text("arabic_content"),
  summary: text("summary"),
  arabicSummary: text("arabic_summary"),
  status: text("status").notNull().default("draft"),
  publishDate: timestamp("publish_date"),
  category: text("category"),
  featuredImage: text("featured_image"),
