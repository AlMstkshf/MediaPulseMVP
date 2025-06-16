import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSocialPosts } from "@/hooks/use-sentiment";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { MoreVertical, Plus, X, AlertTriangle, RefreshCw } from "lucide-react";
import { withRtl } from "@/lib/withRtl";
import { useToast } from "@/hooks/use-toast";
import { getSentimentClass, getSentimentText } from "@/utils/sentimentHelpers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define types for type safety
interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
}

interface SocialPost {
  id: number | string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  content: string;
  postedAt: Date | string | null;
  postUrl?: string | null;
  platform: string;
  sentiment: number | string | null;
  engagement: PostEngagement | null;
  keywords?: string[] | null;
  createdAt?: Date | string | null;
}

interface Keyword {
  id: number;
  word: string;
  category: string;
  isActive: boolean;
  alertThreshold: number;
  changePercentage: number;
}

interface MediaMonitoringProps {
  rtl?: boolean;
  compact?: boolean;
}

const MediaMonitoring = ({ rtl = false, compact = false }: MediaMonitoringProps) => {
  const { t, i18n } = useTranslation();
  const [activePlatform, setActivePlatform] = useState("all");
  const [newKeyword, setNewKeyword] = useState("");
  
  const isRtl = rtl || i18n.language === 'ar';
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const marginClass = isRtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  
  const socialPostsResult = useSocialPosts({
    platform: activePlatform !== "all" ? activePlatform : undefined
  });
  
  // Process the data to ensure engagement has the right format - memoized for performance
  const posts = useMemo<SocialPost[]>(() => {
    return (socialPostsResult.data ? (Array.isArray(socialPostsResult.data) ? socialPostsResult.data : []) : []).map((post: any) => {
      // Create a new typed object conforming to SocialPost interface
      return {
        id: post.id,
        content: post.content,
        platform: post.platform,
        authorName: post.authorName,
        authorUsername: post.authorUsername,
        authorAvatarUrl: post.authorAvatarUrl,
        postUrl: post.postUrl,
        postedAt: post.postedAt,
        sentiment: post.sentiment,
        keywords: post.keywords,
        createdAt: post.createdAt,
        // Create a properly typed engagement object from the raw data
        engagement: post.engagement 
          ? {
              likes: (post.engagement as any).likes || 0,
              comments: (post.engagement as any).comments || 0,
              shares: (post.engagement as any).shares || 0
            } 
          : null
      } as SocialPost;
    });
  }, [socialPostsResult.data, activePlatform]);
  
  const isLoadingPosts = socialPostsResult.isLoading;
  
  const { data: keywords = [], isLoading: isLoadingKeywords, isError: isKeywordsError, refetch: refetchKeywords } = useQuery<Keyword[]>({ 
    queryKey: ["/api/keywords"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/keywords");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch keywords: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('API response is not an array of keywords');
      }
      
      return data;
    },
  });
  
  const { toast } = useToast();
  
  const createKeywordMutation = useMutation({
    mutationFn: async (word: string) => {
      const response = await apiRequest("POST", "/api/keywords", {
        word,
        category: "user-added",
        isActive: true,
        alertThreshold: 50,
        changePercentage: 0
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create keyword: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      setNewKeyword("");
      toast({
        title: t('monitoring.keywordAdded'),
        description: t('monitoring.keywordAddedDesc'),
      });
    },
    onError: (error) => {
      console.error("Error creating keyword:", error);
      toast({
        title: t('monitoring.keywordAddFailed'),
        description: error instanceof Error ? error.message : t('monitoring.unknownError'),
        variant: "destructive",
      });
    }
  });
  
  const deleteKeywordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/keywords/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to delete keyword: ${response.statusText}`);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      toast({
        title: t('monitoring.keywordRemoved'),
        description: t('monitoring.keywordRemovedDesc'),
      });
    },
    onError: (error) => {
      console.error("Error deleting keyword:", error);
      toast({
        title: t('monitoring.keywordDeleteFailed'),
        description: error instanceof Error ? error.message : t('monitoring.unknownError'),
        variant: "destructive",
      });
    }
  });
  
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !createKeywordMutation.isPending) {
      createKeywordMutation.mutate(newKeyword.trim());
    }
  };
  
  const handleDeleteKeyword = (id: number) => {
    if (!deleteKeywordMutation.isPending) {
      deleteKeywordMutation.mutate(id);
    }
  };
  
  if (isLoadingPosts || isLoadingKeywords) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6 flex justify-center items-center flex-grow min-h-[200px] max-h-[50vh]">
              <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6 flex justify-center items-center flex-grow min-h-[200px] max-h-[50vh]">
              <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Error state handling
  if (socialPostsResult.isError || isKeywordsError) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {t('common.error')}
              </CardTitle>
              <CardDescription className="text-red-500">
                {t('monitoring.loadError')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {socialPostsResult.isError 
                  ? (socialPostsResult.error instanceof Error 
                      ? socialPostsResult.error.message 
                      : t('monitoring.unknownError'))
                  : t('monitoring.keywordsLoadError')}
              </p>
              <Button 
                onClick={() => {
                  if (socialPostsResult.isError) socialPostsResult.refetch();
                  if (isKeywordsError) refetchKeywords();
                }}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className={`flex items-center justify-between pb-2 space-y-0 ${flexDirectionClass}`}>
            <CardTitle className={`text-lg font-bold ${textAlignClass}`}>{t('monitoring.title')}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "start" : "end"}>
                <DropdownMenuItem>{t('monitoring.clearAll')}</DropdownMenuItem>
                <DropdownMenuItem>{t('monitoring.downloadReport')}</DropdownMenuItem>
                <DropdownMenuItem>{t('monitoring.alertSettings')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActivePlatform}>
              <TabsList className="flex mb-4 border-b w-full rounded-none bg-transparent h-auto">
                <TabsTrigger 
                  value="all" 
                  className={`px-4 py-2 font-medium ${activePlatform === "all" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.all')}
                </TabsTrigger>
                <TabsTrigger 
                  value="twitter" 
                  className={`px-4 py-2 font-medium ${activePlatform === "twitter" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.twitter')}
                </TabsTrigger>
                <TabsTrigger 
                  value="facebook" 
                  className={`px-4 py-2 font-medium ${activePlatform === "facebook" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.facebook')}
                </TabsTrigger>
                <TabsTrigger 
                  value="instagram" 
                  className={`px-4 py-2 font-medium ${activePlatform === "instagram" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.instagram')}
                </TabsTrigger>
                <TabsTrigger 
                  value="telegram" 
                  className={`px-4 py-2 font-medium ${activePlatform === "telegram" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.telegram')}
                </TabsTrigger>
                <TabsTrigger 
                  value="tiktok" 
                  className={`px-4 py-2 font-medium ${activePlatform === "tiktok" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.tiktok')}
                </TabsTrigger>
                <TabsTrigger 
                  value="news" 
                  className={`px-4 py-2 font-medium ${activePlatform === "news" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                >
                  {t('monitoring.news')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="overflow-y-auto max-h-96 space-y-4">
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.id} className="border-b py-3 last:border-b-0">
                        <div className={`flex items-start ${flexDirectionClass}`}>
                          <img 
                            src={post.authorAvatarUrl || "https://randomuser.me/api/portraits/women/68.jpg"} 
                            alt={post.authorName || ""} 
                            className={`w-10 h-10 rounded-full object-cover ${isRtl ? 'ml-3' : 'mr-3'}`} 
                          />
                          <div className="flex-1">
                            <div className={`flex justify-between ${flexDirectionClass}`}>
                              <div className={textAlignClass}>
                                <span className="font-bold text-sm">{post.authorName || t('monitoring.defaultUser', 'User')}</span>
                                <span className={`text-gray-500 text-sm ${isRtl ? 'mr-2' : 'ml-2'}`}>@{post.authorUsername || t('monitoring.defaultUsername', 'username')}</span>
                              </div>
                              <div className={`flex items-center ${flexDirectionClass}`}>
                                <span className="text-xs text-gray-500">
                                  {post.postedAt 
                                    ? new Date(post.postedAt).toLocaleDateString(isRtl ? 'ar' : 'en')
                                    : post.createdAt 
                                      ? new Date(post.createdAt).toLocaleDateString(isRtl ? 'ar' : 'en')
                                      : t('monitoring.timeUnknown', 'Unknown time')}
                                </span>
                                <span className={`${isRtl ? 'ml-0 mr-2' : 'ml-2 mr-0'} text-xs px-2 py-0.5 rounded-full ${getSentimentClass(post.sentiment)}`}>
                                  {getSentimentText(post.sentiment, t)}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm mt-1 ${textAlignClass}`}>{post.content}</p>
                            {post.engagement && (
                              <div className={`flex mt-2 text-xs text-gray-500 ${flexDirectionClass}`}>
                                <span className={isRtl ? 'mr-4' : 'ml-4'}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline ${isRtl ? 'mr-1' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {t('monitoring.engagement.likes', { count: post.engagement.likes || 0 })}
                                </span>
                                <span className={isRtl ? 'mr-4' : 'ml-4'}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline ${isRtl ? 'mr-1' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  {t('monitoring.engagement.comments', { count: post.engagement.comments || 0 })}
                                </span>
                                <span className={isRtl ? 'mr-4' : 'ml-4'}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline ${isRtl ? 'mr-1' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  {t('monitoring.engagement.shares', { count: post.engagement.shares || 0 })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t('monitoring.noPosts', 'No posts found')}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Other platform tabs would have similar content */}
              <TabsContent value="twitter" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.twitterContent', 'Twitter content')}
                </div>
              </TabsContent>
              
              <TabsContent value="facebook" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.facebookContent', 'Facebook content')}
                </div>
              </TabsContent>
              
              <TabsContent value="instagram" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.instagramContent', 'Instagram content')}
                </div>
              </TabsContent>
              
              <TabsContent value="telegram" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.telegramContent', 'Telegram content')}
                </div>
              </TabsContent>
              
              <TabsContent value="tiktok" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.tiktokContent', 'TikTok content')}
                </div>
              </TabsContent>
              
              <TabsContent value="news" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  {t('monitoring.newsContent', 'News content')}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className={textAlignClass}>
            <CardTitle className="text-lg font-bold">{t('monitoring.keywords')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder={t('monitoring.addKeyword')} 
                  className={`w-full ${isRtl ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                  }}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 text-[#cba344]`}
                  onClick={handleAddKeyword}
                  disabled={createKeywordMutation.isPending}
                >
                  {createKeywordMutation.isPending ? (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-[#cba344] rounded-full animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {keywords.map((keyword: Keyword) => (
                <div key={keyword.id} className={`flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md ${flexDirectionClass}`}>
                  <span className={`font-medium ${textAlignClass}`}>{keyword.word}</span>
                  <div className={`flex items-center ${flexDirectionClass}`}>
                    <Badge className={`${isRtl ? 'ml-0 mr-2' : 'ml-2 mr-0'} ${keyword.changePercentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                      {keyword.changePercentage >= 0 ? '+' : ''}{keyword.changePercentage}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${isRtl ? 'ml-0 mr-2' : 'ml-2 mr-0'} h-8 w-8`}
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      disabled={deleteKeywordMutation.isPending}
                    >
                      {deleteKeywordMutation.isPending && deleteKeywordMutation.variables === keyword.id ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-[#cba344] rounded-full animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className={`text-md font-bold mb-3 ${textAlignClass}`}>{t('monitoring.activeAlerts')}</h4>
              <div className="space-y-2">
                <div className={`flex justify-between items-center p-2 bg-red-500 bg-opacity-10 rounded-md ${flexDirectionClass}`}>
                  <span className={`text-sm ${textAlignClass}`}>{t('monitoring.negativeRise')}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-red-500">{t('monitoring.threshold')}: &gt;15%</span>
                  </div>
                </div>
                <div className={`flex justify-between items-center p-2 bg-yellow-500 bg-opacity-10 rounded-md ${flexDirectionClass}`}>
                  <span className={`text-sm ${textAlignClass}`}>{t('monitoring.keywordTrends')}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-yellow-500">{t('monitoring.threshold')}: &gt;500 {t('monitoring.mentions')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Export the component with RTL support
export default withRtl(MediaMonitoring);
