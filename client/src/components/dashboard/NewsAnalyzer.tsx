import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  matchedKeywords: string[];
  content: string;
}

export default function NewsAnalyzer() {
  const [keywords, setKeywords] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  
  // Query to fetch news
  const { data: newsItems, isLoading: isNewsLoading, refetch, isError, error } = useQuery<NewsItem[]>({
    queryKey: ['/api/news/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const response = await fetch(`/api/news/search?keywords=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`Error fetching news: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!searchTerm, // Only run the query if searchTerm is not empty
  });
  
  // Mutation to fetch and store news
  const { mutate: fetchAndStoreNews, isPending: isStoring } = useMutation({
    mutationFn: async (keywords: string[]) => {
      const response = await apiRequest('POST', '/api/news/fetch-and-store', { keywords });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "News articles stored",
        description: `Successfully stored ${data.count} new articles in the database.`,
      });
      refetch(); // Refetch the news data
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to store news",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSearch = () => {
    if (keywords.trim()) {
      setSearchTerm(keywords.trim());
    } else {
      toast({
        title: "Please enter keywords",
        description: "Enter one or more keywords separated by commas to search for news.",
        variant: "destructive",
      });
    }
  };

  const handleFetchAndStore = () => {
    if (keywords.trim()) {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      fetchAndStoreNews(keywordArray);
    } else {
      toast({
        title: "Please enter keywords",
        description: "Enter one or more keywords separated by commas to fetch and store news.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News Analyzer
        </CardTitle>
        <CardDescription>
          Search for news articles by keywords and analyze their content
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter keywords (comma separated)..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isNewsLoading || !keywords.trim()}>
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>
        
        {isNewsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-6 text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-bold">Error fetching news</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : newsItems && newsItems.length > 0 ? (
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div key={index} className="border rounded-md p-3 hover:bg-accent/40 transition-colors">
                <h3 className="font-bold text-lg line-clamp-2">
                  {item.title}
                </h3>
                <div className="text-sm text-muted-foreground flex items-center justify-between mt-1">
                  <span>{item.source}</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm line-clamp-2">{item.content}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.matchedKeywords.map((keyword, kidx) => (
                    <Badge key={kidx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary ml-auto hover:underline"
                  >
                    Read more
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No news articles found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Enter keywords and click Search to find news articles</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {newsItems ? `${newsItems.length} articles found` : 'Search for news'}
        </div>
        <Button 
          variant="outline" 
          onClick={handleFetchAndStore} 
          disabled={isStoring || !keywords.trim() || !newsItems?.length}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isStoring ? 'animate-spin' : ''}`} />
          {isStoring ? 'Storing...' : 'Store Articles'}
        </Button>
      </CardFooter>
    </Card>
  );
}