import NewsAPI from 'newsapi';
import { db } from '../db';
import { socialPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { WebSocketServer, WebSocket } from 'ws';

// Initialize NewsAPI with API key
if (!process.env.NEWS_API_KEY) {
  throw new Error('NEWS_API_KEY environment variable must be set');
}
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

// Interface for news articles
interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Interface for filtered articles
interface FilteredArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  matchedKeywords: string[];
  content: string;
}

/**
 * Fetch news articles based on the provided keywords
 * @param keywords Array of keywords to filter articles by
 * @param fromDate Optional date to fetch articles from (default: 1 day ago)
 * @returns Array of filtered articles that match the keywords
 */
export async function fetchNewsByKeywords(
  keywords: string[],
  fromDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000) // Default: 1 day ago
): Promise<FilteredArticle[]> {
  try {
    // Format date as YYYY-MM-DD for NewsAPI
    const formattedDate = fromDate.toISOString().split('T')[0];
    
    // Create a query with all keywords as OR conditions
    const keywordQuery = keywords.join(' OR ');
    
    // Fetch articles from NewsAPI
    const response = await newsapi.v2.everything({
      q: keywordQuery,
      from: formattedDate,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 100 // Maximum allowed by free tier
    });
    
    if (response.status !== 'ok') {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    // Filter and process articles that match keywords
    const articles = response.articles || [];
    const filteredArticles = articles.map((article: NewsArticle) => {
      // Determine which keywords are present in the article
      const matchedKeywords = keywords.filter(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        const lowerTitle = article.title.toLowerCase();
        const lowerContent = article.content ? article.content.toLowerCase() : '';
        const lowerDescription = article.description ? article.description.toLowerCase() : '';
        
        return (
          lowerTitle.includes(lowerKeyword) || 
          lowerContent.includes(lowerKeyword) || 
          lowerDescription.includes(lowerKeyword)
        );
      });
      
      // Only include articles that match at least one keyword
      if (matchedKeywords.length > 0) {
        return {
          title: article.title,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt,
          matchedKeywords,
          content: article.description || article.content || article.title
        };
      }
      
      return null;
    }).filter(article => article !== null) as FilteredArticle[];
    
    return filteredArticles;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
}

/**
 * Store news articles in the database as social posts
 * @param articles Array of filtered articles to store
 * @param wss WebSocket server to broadcast updates
 * @returns Array of created social post IDs
 */
export async function storeNewsArticles(
  articles: FilteredArticle[],
  wss?: WebSocketServer
): Promise<number[]> {
  try {
    const createdPostIds: number[] = [];
    
    for (const article of articles) {
      // Check if article already exists in the database (by URL)
      const existingPosts = await db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.postUrl, article.url));
      
      if (existingPosts.length > 0) {
        // Skip if already exists
        continue;
      }
      
      // Store article as a social post
      const [newPost] = await db
        .insert(socialPosts)
        .values({
          platform: 'News',
          content: `${article.title}\n\n${article.content}`,
          authorName: article.source,
          postUrl: article.url,
          keywords: article.matchedKeywords,
        })
        .returning();
      
      if (newPost) {
        createdPostIds.push(newPost.id);
        
        // Broadcast to WebSocket clients if provided
        if (wss) {
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'social_media_activity',
                platform: 'News',
                item: {
                  id: newPost.id,
                  title: article.title,
                  source: article.source,
                  keywords: article.matchedKeywords,
                  publishedAt: article.publishedAt
                }
              }));
            }
          });
        }
      }
    }
    
    return createdPostIds;
  } catch (error) {
    console.error('Error storing news articles:', error);
    return [];
  }
}

/**
 * Fetch, filter, and store news articles in a single operation
 * @param keywords Array of keywords to filter articles by
 * @param fromDate Optional date to fetch articles from (default: 1 day ago)
 * @param wss WebSocket server to broadcast updates
 * @returns Number of new articles stored
 */
export async function fetchAndStoreNewsByKeywords(
  keywords: string[],
  fromDate?: Date,
  wss?: WebSocketServer
): Promise<number> {
  const articles = await fetchNewsByKeywords(keywords, fromDate);
  const createdPostIds = await storeNewsArticles(articles, wss);
  return createdPostIds.length;
}