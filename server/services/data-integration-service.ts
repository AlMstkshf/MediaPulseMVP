import { InsertSocialPost } from "@shared/schema";
import { storage } from "../storage";
import * as nlpService from "./nlp-service";
import { json } from "drizzle-orm/pg-core";

/**
 * Service for integrating with external data sources like social media APIs
 * and news services for sentiment analysis
 */
export class DataIntegrationService {
  /**
   * Configure the available data sources
   */
  private dataSources = {
    twitter: {
      name: "Twitter",
      icon: "twitter",
      enabled: true,
      description: "Fetch tweets from Twitter using snscrape",
      maxResults: 100,
      languages: ["en", "ar"],
      requiresAuth: false
    },
    facebook: {
      name: "Facebook",
      icon: "facebook",
      enabled: true,
      description: "Fetch posts from Facebook using CrowdTangle API",
      maxResults: 100,
      languages: ["en", "ar"],
      requiresAuth: true
    },
    instagram: {
      name: "Instagram",
      icon: "instagram",
      enabled: true,
      description: "Fetch posts from Instagram using CrowdTangle API",
      maxResults: 50,
      languages: ["en", "ar"],
      requiresAuth: true
    },
    news: {
      name: "News API",
      icon: "newspaper",
      enabled: true,
      description: "Fetch news articles from various sources",
      maxResults: 50,
      languages: ["en", "ar"],
      requiresAuth: true
    }
  };
  
  /**
   * Get the list of configured data sources
   */
  getDataSources() {
    return this.dataSources;
  }
  
  /**
   * Fetch data from Twitter using snscrape (simulated)
   * @param keywords Keywords to search for
   * @param limit Maximum number of tweets to fetch
   * @param language Language filter (e.g., "en", "ar")
   */
  async fetchTwitterData(keywords: string[], limit: number = 10, language?: string): Promise<InsertSocialPost[]> {
    console.log(`[Twitter Integration] Fetching tweets with keywords: ${keywords.join(", ")}, limit: ${limit}, language: ${language || "any"}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate simulated twitter posts
    const posts: InsertSocialPost[] = [];
    
    for (const keyword of keywords) {
      const count = Math.floor(Math.random() * 5) + 1; // 1-5 posts per keyword
      const newPosts = this.generateSimulatedPosts(keyword, "Twitter", count, language);
      posts.push(...newPosts);
    }
    
    return posts.slice(0, limit);
  }
  
  /**
   * Fetch data from Meta platforms using CrowdTangle (simulated)
   * @param keywords Keywords to search for
   * @param limit Maximum number of posts to fetch
   * @param language Language filter
   */
  async fetchMetaData(keywords: string[], limit: number = 10, language?: string): Promise<InsertSocialPost[]> {
    console.log(`[Meta Integration] Fetching posts with keywords: ${keywords.join(", ")}, limit: ${limit}, language: ${language || "any"}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Generate simulated Facebook and Instagram posts
    const posts: InsertSocialPost[] = [];
    
    // Facebook posts
    for (const keyword of keywords) {
      const count = Math.floor(Math.random() * 3) + 1; // 1-3 posts per keyword
      const newPosts = this.generateSimulatedPosts(keyword, "Facebook", count, language);
      posts.push(...newPosts);
    }
    
    // Instagram posts
    for (const keyword of keywords) {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 posts per keyword
      const newPosts = this.generateSimulatedPosts(keyword, "Instagram", count, language);
      posts.push(...newPosts);
    }
    
    return posts.slice(0, limit);
  }
  
  /**
   * Fetch data from News API (simulated)
   * @param keywords Keywords to search for
   * @param limit Maximum number of articles to fetch
   * @param language Language filter
   */
  async fetchNewsData(keywords: string[], limit: number = 10, language?: string): Promise<InsertSocialPost[]> {
    console.log(`[News API Integration] Fetching articles with keywords: ${keywords.join(", ")}, limit: ${limit}, language: ${language || "any"}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Generate simulated news articles
    const posts: InsertSocialPost[] = [];
    
    for (const keyword of keywords) {
      const count = Math.floor(Math.random() * 4) + 1; // 1-4 articles per keyword
      const newPosts = this.generateSimulatedPosts(keyword, "News", count, language);
      posts.push(...newPosts);
    }
    
    return posts.slice(0, limit);
  }
  
  /**
   * Process data from all enabled sources
   * @param keywords Keywords to search for
   * @param limit Maximum posts per source
   * @param language Language filter
   */
  async fetchAllSourcesData(keywords: string[], limit: number = 10, language?: string): Promise<InsertSocialPost[]> {
    console.log(`[Data Integration] Fetching data from all sources for keywords: ${keywords.join(", ")}`);
    
    const allPosts: InsertSocialPost[] = [];
    
    // Fetch from all enabled sources in parallel
    const [twitterPosts, metaPosts, newsPosts] = await Promise.all([
      this.dataSources.twitter.enabled ? this.fetchTwitterData(keywords, limit, language) : Promise.resolve([]),
      this.dataSources.facebook.enabled || this.dataSources.instagram.enabled ? this.fetchMetaData(keywords, limit, language) : Promise.resolve([]),
      this.dataSources.news.enabled ? this.fetchNewsData(keywords, limit, language) : Promise.resolve([])
    ]);
    
    // Combine all posts
    allPosts.push(...twitterPosts, ...metaPosts, ...newsPosts);
    
    return allPosts;
  }
  
  /**
   * Process and save social media data
   * @param posts List of social media posts to process
   * @returns The saved posts with sentiment analysis
   */
  async processAndSavePosts(posts: InsertSocialPost[]): Promise<number> {
    if (!posts || posts.length === 0) {
      return 0;
    }
    
    console.log(`[Data Integration] Processing ${posts.length} posts for sentiment analysis and storage`);
    
    let savedCount = 0;
    
    // Process each post
    for (const post of posts) {
      try {
        // Validate post has minimum required fields
        if (!post.content || !post.platform) {
          console.warn("Skipping post without required fields:", post);
          continue;
        }
        
        // Run sentiment analysis if not already present
        if (post.sentiment === undefined || post.sentiment === null) {
          try {
            // Use NLP service for sentiment analysis
            const sentimentResult = await nlpService.getBestSentimentAnalysis(post.content);
            
            if (sentimentResult) {
              // Convert from 1-5 scale to 0-100 scale for storage
              post.sentiment = Math.round(((sentimentResult.score - 1) / 4) * 100);
              
              // Extract themes and topics for the content
              const themeResult = await nlpService.extractThemesAndTopics(post.content);
              
              // Add extracted themes if any
              if (themeResult && themeResult.themes && themeResult.themes.length > 0) {
                if (!post.keywords) {
                  post.keywords = [];
                }
                
                // Add themes to keywords if not already present
                for (const theme of themeResult.themes) {
                  if (!post.keywords.includes(theme)) {
                    post.keywords.push(theme);
                  }
                }
              }
            }
            
            console.log(`Sentiment analysis for ${post.platform} post: ${post.sentiment}/100`);
          } catch (error) {
            console.error("Error in sentiment analysis during data integration:", error);
            // Continue with the post even if sentiment analysis fails
          }
        }
        
        // Ensure required fields are present
        post.createdAt = post.createdAt || new Date();
        post.postedAt = post.postedAt || post.createdAt;
        
        // Save to database
        const savedPost = await storage.createSocialPost(post);
        
        if (savedPost) {
          savedCount++;
          
          // Broadcast the new post if WebSocket is available
          if ((global as any).broadcastSocialUpdate) {
            (global as any).broadcastSocialUpdate(savedPost);
          }
          
          // Check for keyword matches
          const keywords = await storage.listKeywords(true); // Active keywords only
          const postContent = post.content.toLowerCase();
          
          for (const keyword of keywords) {
            if (postContent.includes(keyword.word.toLowerCase())) {
              try {
                // Create keyword alert
                const alert = await storage.createKeywordAlert({
                  keywordId: keyword.id,
                  socialPostId: savedPost.id,
                  alertDate: new Date(),
                  isRead: false,
                  alertSent: false
                });
                
                console.log(`Created keyword alert for "${keyword.word}" in post ID ${savedPost.id}`);
                
                // Broadcast alert
                if ((global as any).broadcastKeywordAlert) {
                  (global as any).broadcastKeywordAlert(keyword.word, savedPost, alert);
                }
              } catch (alertError) {
                console.error(`Error creating keyword alert for "${keyword.word}":`, alertError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error saving post during data integration:", error);
      }
    }
    
    console.log(`[Data Integration] Successfully saved ${savedCount} out of ${posts.length} posts`);
    return savedCount;
  }
  
  /**
   * Generate simulated social media posts for testing
   * @param keyword Keyword to include in the post
   * @param platform Platform name
   * @param count Number of posts to generate
   * @param language Language filter
   */
  private generateSimulatedPosts(keyword: string, platform: string, count: number, language?: string): InsertSocialPost[] {
    const posts: InsertSocialPost[] = [];
    const isArabic = language === 'ar';
    
    // Templates for social media content
    const templates = isArabic ? [
      `${keyword} يعتبر اتجاهًا مهمًا في الأخبار اليوم. هناك تطورات جديدة في هذا المجال تستحق المتابعة.`,
      `هل سمعت عن ${keyword}؟ إنه موضوع مثير للاهتمام يناقشه الكثيرون.`,
      `الجديد عن ${keyword} يبدو واعدًا. علينا متابعة التطورات.`,
      `رأيي حول ${keyword} هو أنه يحتاج إلى مزيد من الاهتمام من صناع القرار.`,
      `لا أعتقد أن ${keyword} يستحق كل هذا الضجيج. هناك قضايا أكثر أهمية.`
    ] : [
      `${keyword} is trending in the news today. There are new developments worth following.`,
      `Have you heard about ${keyword}? It's an exciting topic being discussed by many.`,
      `The latest on ${keyword} looks promising. We should follow the developments.`,
      `My opinion on ${keyword} is that it needs more attention from decision makers.`,
      `I don't think ${keyword} deserves all this hype. There are more important issues.`
    ];
    
    // Author names
    const authorNames = isArabic ? [
      'أحمد محمد', 'سارة خالد', 'محمد العلي', 'نورا سعيد', 'عمر الأحمد',
      'لينا العبدالله', 'خالد النعيمي', 'مريم السعيد', 'فهد الزيد', 'رنا القاسم'
    ] : [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
      'Lisa Lee', 'Robert Miller', 'Jessica Moore', 'James Anderson', 'Jennifer Taylor'
    ];
    
    // Generate posts
    for (let i = 0; i < count; i++) {
      // Select random content template
      const contentTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      // Random author
      const authorName = authorNames[Math.floor(Math.random() * authorNames.length)];
      const authorUsername = authorName.toLowerCase().replace(/\s+/g, '_');
      
      // Random date in the last 7 days
      const days = Math.floor(Math.random() * 7);
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - days);
      postedDate.setHours(postedDate.getHours() - hours);
      postedDate.setMinutes(postedDate.getMinutes() - minutes);
      
      // Random engagement stats
      const likesCount = Math.floor(Math.random() * 1000);
      const sharesCount = Math.floor(Math.random() * 100);
      const commentsCount = Math.floor(Math.random() * 50);
      const engagement = {
        likes: likesCount,
        shares: sharesCount,
        comments: commentsCount,
        total: likesCount + sharesCount + commentsCount
      };
      
      // Create the post
      const post: InsertSocialPost = {
        platform,
        content: contentTemplate,
        authorName,
        authorUsername,
        authorAvatarUrl: null,
        postUrl: `https://example.com/${platform.toLowerCase()}/${authorUsername}/status/${Date.now()}`,
        postedAt: postedDate,
        createdAt: new Date(),
        keywords: [keyword],
        engagement: engagement as unknown as Json
      };
      
      posts.push(post);
    }
    
    return posts;
  }
}

export const dataIntegrationService = new DataIntegrationService();
export default dataIntegrationService;