declare module 'newsapi' {
  export interface NewsAPIOptions {
    q?: string;
    sources?: string;
    domains?: string;
    excludeDomains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
    country?: string;
    category?: string;
  }

  export interface NewsAPIResponse {
    status: string;
    totalResults?: number;
    articles?: Array<{
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
    }>;
  }

  export default class NewsAPI {
    constructor(apiKey: string);
    v2: {
      topHeadlines(options: NewsAPIOptions): Promise<NewsAPIResponse>;
      everything(options: NewsAPIOptions): Promise<NewsAPIResponse>;
      sources(options: NewsAPIOptions): Promise<NewsAPIResponse>;
    };
  }
}