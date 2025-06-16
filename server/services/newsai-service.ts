import fetch from 'node-fetch';
import { db } from '../db';
import { socialPosts } from '@shared/schema';
import { WebSocketServer, WebSocket } from 'ws';
import { eq } from 'drizzle-orm';

// API key for NewsAPI.ai
const NEWSAPI_AI_KEY = process.env.NEWSAPI_AI_KEY || '';

if (!NEWSAPI_AI_KEY) {
  console.warn('NEWSAPI_AI_KEY environment variable not set. NewsAPI.ai functionality will be limited.');
}

export interface NewsAIArticle {
  uri: string;
  url: string;
  title: string;
  body: string;
  source: {
    title: string;
    uri: string;
  };
  time: string;
  lang: string;
  concepts: {
    uri: string;
    type: string;
    score: number;
    label: {
      eng: string;
    };
  }[];
  categories: {
    uri: string;
    label: {
      eng: string;
    };
    score: number;
  }[];
  dataType: string;
}

export interface NewsAIResponse {
  articles: {
    results: NewsAIArticle[];
    totalResults: number;
    page: number;
    count: number;
    pages: number;
  };
}

export interface FilteredNewsAIArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  matchedKeywords: string[];
  content: string;
}

/**
 * Fetch news articles from NewsAPI.ai based on the provided keywords
 * @param keywords Array of keywords to filter articles by
 * @param fromDate Optional date to fetch articles from (default: 1 day ago)
 * @returns Array of filtered articles that match the keywords
 */
export async function fetchNewsAIByKeywords(
  keywords: string[],
  fromDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000) // Default: 1 day ago
): Promise<FilteredNewsAIArticle[]> {
  try {
    // Format date as YYYY-MM-DD for NewsAPI.ai
    const formattedDate = fromDate.toISOString().split('T')[0];
    
    // Create a query with all keywords as OR conditions
    const keywordQuery = keywords.join(' OR ');
    
    // Construct the request URL for NewsAPI.ai
    const url = new URL('https://eventregistry.org/api/v1/article/getArticles');
    
    // Set up the request body parameters
    const requestBody = {
      action: 'getArticles',
      keyword: keywordQuery,
      articlesPage: 1,
      articlesCount: 100,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      articlesArticleBodyLen: -1,
      resultType: 'articles',
      dataType: ['news', 'blog'],
      apiKey: NEWSAPI_AI_KEY,
      lang: 'eng',
      dateStart: formattedDate
    };

    // Make the API request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`NewsAPI.ai error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as NewsAIResponse;
    
    // Process and filter articles
    const filteredArticles = data.articles.results
      .map((article: NewsAIArticle) => {
        // Determine which keywords are present in the article
        const matchedKeywords = keywords.filter(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          const lowerTitle = article.title.toLowerCase();
          const lowerContent = article.body ? article.body.toLowerCase() : '';
          
          return (
            lowerTitle.includes(lowerKeyword) || 
            lowerContent.includes(lowerKeyword)
          );
        });
        
        // Only include articles that match at least one keyword
        if (matchedKeywords.length > 0) {
          return {
            title: article.title,
            source: article.source.title,
            url: article.url,
            publishedAt: article.time,
            matchedKeywords,
            content: article.body || article.title
          };
        }
        
        return null;
      })
      .filter(article => article !== null) as FilteredNewsAIArticle[];
    
    return filteredArticles;
  } catch (error) {
    console.error('Error fetching news articles from NewsAPI.ai:', error);
    return [];
  }
}

/**
 * Fetch news articles from NewsAPI.ai and store them in the database
 * @param keywords Array of keywords to filter articles by
 * @param fromDate Optional date to fetch articles from (default: 1 day ago)
 * @param wss Optional WebSocket server to broadcast updates
 * @returns Number of new articles stored in the database
 */
export async function fetchAndStoreNewsAIByKeywords(
  keywords: string[],
  fromDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
  wss?: WebSocketServer
): Promise<number> {
  try {
    const articles = await fetchNewsAIByKeywords(keywords, fromDate);
    let newArticlesCount = 0;
    
    for (const article of articles) {
      // Check if article already exists in the database by URL
      const existingArticle = await db.select()
        .from(socialPosts)
        .where(eq(socialPosts.postUrl, article.url))
        .limit(1)
        .execute();
      
      // Skip if article already exists
      if (existingArticle.length > 0) {
        continue;
      }
      
      // Insert the article as a social post
      const newPost = await db.insert(socialPosts).values({
        platform: 'newsai',
        content: article.content,
        authorName: article.source,
        postUrl: article.url,
        postedAt: new Date(article.publishedAt),
        keywords: article.matchedKeywords,
        createdAt: new Date()
      }).returning();
      
      if (newPost.length > 0) {
        newArticlesCount++;
        
        // Broadcast update if WebSocket server is provided
        if (wss) {
          const message = {
            type: 'new_article',
            article: {
              id: newPost[0].id,
              title: article.title,
              source: article.source,
              platform: 'newsai',
              url: article.url,
              publishedAt: article.publishedAt,
              keywords: article.matchedKeywords
            }
          };
          
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
        }
      }
    }
    
    return newArticlesCount;
  } catch (error) {
    console.error('Error storing news articles from NewsAPI.ai:', error);
    return 0;
  }
}

// WebSocket is already imported at the top of the file