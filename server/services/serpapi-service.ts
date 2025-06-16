import { getJson } from 'serpapi';
import { db } from '../db';
import { socialPosts } from '@shared/schema';
import { WebSocketServer, WebSocket } from 'ws';
import { eq } from 'drizzle-orm';

// API key for SerpAPI
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

if (!SERPAPI_KEY) {
  console.warn('SERPAPI_KEY environment variable not set. SerpAPI functionality will be limited.');
}

// Define types for SerpAPI responses
export interface SerpApiNewsResult {
  position: number;
  title: string;
  link: string;
  source_name?: string;
  source?: string;
  date?: string;
  snippet?: string;
  summary?: string;
  thumbnail?: string;
  displayed_link?: string;
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    google_domain?: string;
    device?: string;
    tbm?: string;
    gl?: string;
  };
  search_information?: {
    organic_results_state?: string;
    query_displayed?: string;
    total_results?: number;
    time_taken_displayed?: number;
  };
  news_results?: SerpApiNewsResult[];
  organic_results?: SerpApiNewsResult[];
}

export interface FilteredSerpApiResult {
  title: string;
  source: string;
  url: string;
  publishedAt: string | null;
  matchedKeywords: string[];
  content: string;
  thumbnail?: string | null;
}

/**
 * Search for content using SerpAPI and keyword
 * @param keywords Array of keywords to search for
 * @param numResults Number of results to return (default: 10)
 * @returns Array of filtered search results
 */
export async function searchWithSerpApi(
  keywords: string[],
  numResults: number = 10
): Promise<FilteredSerpApiResult[]> {
  try {
    // Create a query with all keywords
    const query = keywords.join(' ');
    
    // Set up the search parameters
    const params = {
      q: query,
      num: numResults,
      tbm: 'nws', // News search
      gl: 'ae', // United Arab Emirates
    };
    
    // Add API key to params
    const searchParams = {
      ...params,
      api_key: SERPAPI_KEY
    };
    
    // Perform the search using SerpAPI
    const results = await getJson(searchParams) as SerpApiResponse;
    
    // Process and filter the results from news_results instead of organic_results
    // Log response for debugging
    console.log('SerpAPI response structure:', Object.keys(results));
    
    // Check if news_results exists before mapping
    const newsResults = results.news_results || [];
    if (!newsResults || !Array.isArray(newsResults) || newsResults.length === 0) {
      console.log('No news results found in SerpAPI response');
      return [];
    }
    
    console.log(`Found ${newsResults.length} news results from SerpAPI`);
    
    const filteredResults = newsResults.map(result => {
      // Determine which keywords are present in the result
      const matchedKeywords = keywords.filter(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        const lowerTitle = result.title?.toLowerCase() || '';
        const lowerSnippet = result.snippet?.toLowerCase() || '';
        
        return (
          lowerTitle.includes(lowerKeyword) || 
          lowerSnippet.includes(lowerKeyword)
        );
      });
      
      // Extract date if available, otherwise use current date
      let publishedDate = null;
      try {
        if (result.date) {
          const dateObj = new Date(result.date);
          if (!isNaN(dateObj.getTime())) {
            publishedDate = dateObj.toISOString();
          }
        }
      } catch (e) {
        console.log(`Error parsing date '${result.date}':`, e);
      }
      
      // Create a filtered result object
      return {
        title: result.title || 'Untitled',
        source: result.source || result.source_name || 'Unknown Source',
        url: result.link,
        publishedAt: publishedDate,
        matchedKeywords,
        content: result.snippet || result.summary || 'No content available',
        thumbnail: result.thumbnail || null
      };
    });
    
    return filteredResults;
  } catch (error) {
    console.error('Error searching with SerpAPI:', error);
    return [];
  }
}

/**
 * Search and store content from SerpAPI
 * @param keywords Array of keywords to search for
 * @param numResults Number of results to return (default: 10)
 * @param wss Optional WebSocket server to broadcast updates
 * @returns Number of new items stored in the database
 */
export async function searchAndStoreSerpApiResults(
  keywords: string[],
  numResults: number = 10,
  wss?: WebSocketServer
): Promise<number> {
  try {
    const results = await searchWithSerpApi(keywords, numResults);
    let newItemsCount = 0;
    
    for (const result of results) {
      // Check if the URL already exists in the database
      const existingPost = await db.select()
        .from(socialPosts)
        .where(eq(socialPosts.postUrl, result.url))
        .limit(1)
        .execute();
      
      // Skip if already exists
      if (existingPost.length > 0) {
        continue;
      }
      
      // Insert the result as a social post
      const newPost = await db.insert(socialPosts).values({
        platform: 'news',
        content: result.content,
        authorName: result.source,
        postUrl: result.url,
        postedAt: result.publishedAt ? new Date(result.publishedAt) : new Date(),
        keywords: result.matchedKeywords,
        createdAt: new Date()
      }).returning();
      
      if (newPost.length > 0) {
        newItemsCount++;
        
        // Broadcast update if WebSocket server is provided
        if (wss) {
          const message = {
            type: 'new_search_result',
            result: {
              id: newPost[0].id,
              title: result.title,
              source: result.source,
              platform: 'news',
              url: result.url,
              publishedAt: result.publishedAt,
              keywords: result.matchedKeywords
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
    
    return newItemsCount;
  } catch (error) {
    console.error('Error storing SerpAPI results:', error);
    return 0;
  }
}