import { db } from '../db';
import { eq, and, gte, lte, desc, asc, sql, count, sum, avg } from "drizzle-orm";
import { socialPosts, sentimentReports, govEntities as entities, keywords } from '../../shared/schema';
import { logger } from '../logger';

/**
 * TrendAnalysisService provides functionality for analyzing social media and content trends
 * It aggregates data across platforms and provides insights on keywords, entities, and sentiment
 */
export class TrendAnalysisService {
  /**
   * Gets trending keywords for a specific time period and platform
   * 
   * @param days Number of days to analyze (default: 7)
   * @param platform Optional platform filter (twitter, facebook, etc.)
   * @param limit Maximum number of keywords to return (default: 10)
   * @returns Array of trending keywords with metrics
   */
  async getTrendingKeywords(days: number = 7, platform?: string, limit: number = 10) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      
      // Build base query with time filter
      let query = db.select({
        keyword: keywords.word,
        mentionCount: count(social_posts.id).as('mention_count'),
        averageSentiment: avg(social_posts.sentiment).as('avg_sentiment'),
      })
      .from(keywords)
      .leftJoin(
        social_posts,
        sql`${social_posts.keywords} @> array[${keywords.word}]::text[]`
      )
      .where(
        and(
          gte(social_posts.createdAt, date),
          keywords.isActive.equals(true)
        )
      );
      
      // Add platform filter if specified
      if (platform) {
        query = query.where(eq(social_posts.platform, platform));
      }
      
      // Group by keyword and order by mention count
      const keywordStats = await query
        .groupBy(keywords.word)
        .orderBy(desc(sql`mention_count`))
        .limit(limit);
      
      // Get previous period stats for comparison
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - (days * 2));
      
      // Query for previous period
      let prevQuery = db.select({
        keyword: keywords.word,
        prevMentionCount: count(social_posts.id).as('prev_mention_count'),
      })
      .from(keywords)
      .leftJoin(
        social_posts,
        sql`${social_posts.keywords} @> array[${keywords.word}]::text[]`
      )
      .where(
        and(
          gte(social_posts.createdAt, previousDate),
          lte(social_posts.createdAt, date),
          keywords.isActive.equals(true)
        )
      );
      
      // Add platform filter to previous period query
      if (platform) {
        prevQuery = prevQuery.where(eq(social_posts.platform, platform));
      }
      
      const prevKeywordStats = await prevQuery
        .groupBy(keywords.word)
        .orderBy(desc(sql`prev_mention_count`));
      
      // Map previous period data for lookup
      const prevStatsMap = new Map();
      prevKeywordStats.forEach(item => {
        prevStatsMap.set(item.keyword, item.prevMentionCount);
      });
      
      // Calculate source distribution for each keyword
      const trends = await Promise.all(keywordStats.map(async (stat) => {
        // Get source distribution
        const sourceDistribution = await db.select({
          platform: social_posts.platform,
          count: count().as('count'),
        })
        .from(social_posts)
        .where(
          and(
            gte(social_posts.createdAt, date),
            sql`${social_posts.keywords} @> array[${stat.keyword}]::text[]`
          )
        )
        .groupBy(social_posts.platform);
        
        // Calculate percent change
        const prevCount = prevStatsMap.get(stat.keyword) || 0;
        const currentCount = stat.mentionCount || 0;
        const changePercent = prevCount > 0 
          ? Math.round(((currentCount - prevCount) / prevCount) * 100) 
          : 100;
        
        // Determine momentum based on change percentage
        let momentum: 'rising' | 'falling' | 'stable' = 'stable';
        if (changePercent >= 15) momentum = 'rising';
        else if (changePercent <= -15) momentum = 'falling';
        
        // Format source distribution as object
        const sources: Record<string, number> = {};
        sourceDistribution.forEach(src => {
          sources[src.platform] = src.count;
        });
        
        // Create trending keyword object
        return {
          keyword: stat.keyword,
          mentionCount: currentCount,
          sentimentScore: parseFloat((stat.averageSentiment || 0).toFixed(2)),
          sources,
          changePercent,
          momentum,
          peakTimes: ['08:00', '12:00', '18:00'], // This would ideally be calculated from data
        };
      }));
      
      return trends;
    } catch (error) {
      logger.error('Error getting trending keywords', error);
      throw error;
    }
  }
  
  /**
   * Gets entity mention trends
   * 
   * @param days Number of days to analyze
   * @param limit Maximum number of entities to return
   * @returns Array of entity trends with metrics
   */
  async getEntityTrends(days: number = 7, limit: number = 5) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      
      // Get entities with most mentions
      const entityStats = await db.select({
        entityId: entities.id,
        entityName: entities.name,
        totalMentions: count(social_posts.id).as('mention_count'),
        averageSentiment: avg(social_posts.sentiment).as('avg_sentiment'),
      })
      .from(entities)
      .leftJoin(
        social_posts,
        sql`${social_posts.content} ILIKE '%' || ${entities.name} || '%'`
      )
      .where(
        and(
          gte(social_posts.createdAt, date),
          entities.isActive.equals(true)
        )
      )
      .groupBy(entities.id, entities.name)
      .orderBy(desc(sql`mention_count`))
      .limit(limit);
      
      // Get previous period stats for comparison
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - (days * 2));
      
      // Enhance entity data with recent mentions and keywords
      const enhancedEntities = await Promise.all(entityStats.map(async (entity) => {
        // Get recent mentions count (last 2 days)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 2);
        
        const recentMentions = await db.select({
          count: count().as('count'),
        })
        .from(social_posts)
        .where(
          and(
            gte(social_posts.createdAt, recentDate),
            sql`${social_posts.content} ILIKE '%' || ${entity.entityName} || '%'`
          )
        );
        
        // Get previous period mentions for comparison
        const prevMentions = await db.select({
          count: count().as('count'),
        })
        .from(social_posts)
        .where(
          and(
            gte(social_posts.createdAt, previousDate),
            lte(social_posts.createdAt, date),
            sql`${social_posts.content} ILIKE '%' || ${entity.entityName} || '%'`
          )
        );
        
        // Calculate percent change
        const prevCount = prevMentions[0]?.count || 0;
        const currentCount = entity.totalMentions || 0;
        const changePercent = prevCount > 0 
          ? Math.round(((currentCount - prevCount) / prevCount) * 100) 
          : 100;
        
        // Get related keywords
        const relatedKeywords = await db.select({
          keyword: keywords.word,
          count: count().as('count'),
        })
        .from(keywords)
        .leftJoin(
          social_posts,
          sql`${social_posts.keywords} @> array[${keywords.word}]::text[] AND ${social_posts.content} ILIKE '%' || ${entity.entityName} || '%'`
        )
        .where(
          and(
            gte(social_posts.createdAt, date),
            keywords.isActive.equals(true)
          )
        )
        .groupBy(keywords.word)
        .orderBy(desc(sql`count`))
        .limit(5);
        
        // Create enhanced entity object
        return {
          entityId: entity.entityId,
          entityName: entity.entityName,
          totalMentions: currentCount,
          sentimentScore: parseFloat((entity.averageSentiment || 0).toFixed(2)),
          recentMentions: recentMentions[0]?.count || 0,
          changePercent,
          relatedKeywords: relatedKeywords.map(k => k.keyword),
        };
      }));
      
      return enhancedEntities;
    } catch (error) {
      logger.error('Error getting entity trends', error);
      throw error;
    }
  }
  
  /**
   * Gets AI-powered insights based on sentiment trends and entity mentions
   * 
   * @param days Number of days to analyze
   * @param platform Optional platform filter
   * @returns AI insights object with recommendations
   */
  async getAIInsights(days: number = 7, platform?: string) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      
      // Get trending topics
      let trendingQuery = this.getTrendingKeywords(days, platform, 5);
      
      // Get sentiment shift
      let sentimentQuery = db.select({
        currentAvg: avg(sentiment_reports.positive).minus(avg(sentiment_reports.negative)).as('current_avg'),
      })
      .from(sentiment_reports)
      .where(gte(sentiment_reports.date, date));
      
      // Add platform filter if specified
      if (platform) {
        sentimentQuery = sentimentQuery.where(eq(sentiment_reports.platform, platform));
      }
      
      // Execute sentiment query
      const currentSentiment = await sentimentQuery;
      
      // Get previous period sentiment
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - (days * 2));
      
      let prevSentimentQuery = db.select({
        prevAvg: avg(sentiment_reports.positive).minus(avg(sentiment_reports.negative)).as('prev_avg'),
      })
      .from(sentiment_reports)
      .where(
        and(
          gte(sentiment_reports.date, previousDate),
          lte(sentiment_reports.date, date)
        )
      );
      
      // Add platform filter to previous period query
      if (platform) {
        prevSentimentQuery = prevSentimentQuery.where(eq(sentiment_reports.platform, platform));
      }
      
      // Execute previous sentiment query
      const prevSentiment = await prevSentimentQuery;
      
      // Get trending keywords
      const trendingKeywords = await trendingQuery;
      
      // Calculate sentiment shift
      const currentAvg = currentSentiment[0]?.currentAvg || 0;
      const prevAvg = prevSentiment[0]?.prevAvg || 0;
      const sentimentShift = currentAvg - prevAvg;
      
      // Generate AI recommendations based on trends and sentiment
      const recommendations = [];
      
      if (sentimentShift < -0.1) {
        recommendations.push("Focus on addressing negative sentiment by responding to critical mentions promptly.");
      }
      
      if (sentimentShift > 0.1) {
        recommendations.push("Capitalize on positive sentiment by amplifying successful messaging across channels.");
      }
      
      // Add recommendations based on trending keywords
      if (trendingKeywords.length > 0) {
        const risingTopics = trendingKeywords.filter(k => k.momentum === 'rising');
        if (risingTopics.length > 0) {
          recommendations.push(`Leverage rising topics like "${risingTopics[0].keyword}" to increase engagement.`);
        }
        
        const negativeTopics = trendingKeywords.filter(k => k.sentimentScore < 0);
        if (negativeTopics.length > 0) {
          recommendations.push(`Address concerns around "${negativeTopics[0].keyword}" which has negative sentiment.`);
        }
      }
      
      // Always provide some general recommendations
      recommendations.push("Maintain consistent monitoring of emerging topics for timely responses.");
      
      if (recommendations.length < 3) {
        recommendations.push("Diversify content across platforms to maximize audience reach.");
      }
      
      return {
        trendingTopics: trendingKeywords.map(k => k.keyword),
        sentimentShift,
        recommendations,
      };
    } catch (error) {
      logger.error('Error getting AI insights', error);
      throw error;
    }
  }
  
  /**
   * Gets sentiment analysis over time
   * 
   * @param days Number of days to analyze
   * @param platform Optional platform filter
   * @returns Array of sentiment data points by date
   */
  async getSentimentTrend(days: number = 30, platform?: string) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      
      // Build base query
      let query = db.select({
        date: sentiment_reports.date,
        positive: sum(sentiment_reports.positive).as('positive'),
        neutral: sum(sentiment_reports.neutral).as('neutral'),
        negative: sum(sentiment_reports.negative).as('negative'),
      })
      .from(sentiment_reports)
      .where(gte(sentiment_reports.date, date));
      
      // Add platform filter if specified
      if (platform) {
        query = query.where(eq(sentiment_reports.platform, platform));
      }
      
      // Execute query
      const sentimentData = await query
        .groupBy(sentiment_reports.date)
        .orderBy(asc(sentiment_reports.date));
      
      // Format data
      return sentimentData.map(item => ({
        date: item.date.toISOString().split('T')[0],
        positive: Number(item.positive) || 0,
        neutral: Number(item.neutral) || 0,
        negative: Number(item.negative) || 0,
        total: (Number(item.positive) || 0) + (Number(item.neutral) || 0) + (Number(item.negative) || 0),
        rawDate: item.date,
      }));
    } catch (error) {
      logger.error('Error getting sentiment trend', error);
      throw error;
    }
  }
}

// Export singleton instance
export const trendAnalysisService = new TrendAnalysisService();