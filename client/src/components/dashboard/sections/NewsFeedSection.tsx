import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { withRtl } from "@/lib/withRtl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSentimentColorClasses } from "@/lib/icon-utils";

interface NewsFeedSectionProps {
  className?: string;
}

interface NewsItem {
  id: number;
  title: string;
  source: string;
  sourceUrl: string;
  sourceIconUrl?: string;
  content: string;
  url: string;
  publishedAt: string;
  sentiment: number; // 0-100 scale
  category: string;
  relevanceScore: number; // 0-100 scale
}

const NewsFeedSection: React.FC<NewsFeedSectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch news feed data
  const { data: newsItems, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["/api/news", { category: activeTab === "all" ? undefined : activeTab }],
    refetchInterval: 600000, // Refetch every 10 minutes
  });
  
  // Get categories from news items
  const categories = useMemo(() => {
    if (!newsItems) return [];
    
    const uniqueCategories = new Set<string>();
    newsItems.forEach(item => {
      if (item.category) uniqueCategories.add(item.category);
    });
    
    return Array.from(uniqueCategories);
  }, [newsItems]);
  
  // Filter news items by selected category
  const filteredNews = useMemo(() => {
    if (!newsItems) return [];
    
    if (activeTab === "all") return newsItems;
    
    return newsItems.filter(item => item.category === activeTab);
  }, [newsItems, activeTab]);
  
  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t("dashboard.news_feed.title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("common.error_loading_data")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("common.please_try_again")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className={isRtl ? "text-right" : ""}>
          {t("dashboard.news_feed.title")}
        </CardTitle>
        <CardDescription className={isRtl ? "text-right" : ""}>
          {t("dashboard.news_feed.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 w-full flex overflow-auto">
            <TabsTrigger value="all">
              {t("dashboard.news_feed.all_news")}
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {t(`dashboard.news_feed.categories.${category.toLowerCase()}`, category)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t("dashboard.news_feed.no_news")}
              </div>
            ) : (
              filteredNews.map(item => {
                const { textColor, bgColor } = getSentimentColorClasses(item.sentiment);
                
                return (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 space-y-3 ${isRtl ? "text-right" : ""}`}
                  >
                    <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8">
                        {item.sourceIconUrl && (
                          <AvatarImage src={item.sourceIconUrl} alt={item.source} />
                        )}
                        <AvatarFallback>{item.source.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{item.source}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        <span>{item.publishedAt}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.content}
                    </p>
                    
                    <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${bgColor} ${textColor}`}>
                          {item.sentiment >= 70 ? (
                            <ThumbsUp className="h-3 w-3 mr-1" />
                          ) : item.sentiment <= 30 ? (
                            <ThumbsDown className="h-3 w-3 mr-1" />
                          ) : null}
                          {t(`dashboard.news_feed.sentiment.${getSentimentLabel(item.sentiment)}`)}
                        </Badge>
                        
                        <Badge variant="outline">
                          {t("dashboard.news_feed.relevance")}: {item.relevanceScore}%
                        </Badge>
                      </div>
                      
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <span>{t("dashboard.news_feed.read_more")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Helper function to get sentiment label based on score
function getSentimentLabel(sentiment: number): string {
  if (sentiment >= 70) return "positive";
  if (sentiment <= 30) return "negative";
  return "neutral";
}

export default withRtl(NewsFeedSection);