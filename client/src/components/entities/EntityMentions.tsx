import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGovEntity, useGovEntityPosts } from "@/hooks/use-gov-entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Building2, TrendingUp, BarChart3, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { SocialPost } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register required ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EntityMentionsProps {
  entityId: number;
  onBackClick?: () => void;
}

export default function EntityMentions({ entityId, onBackClick }: EntityMentionsProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("posts");
  
  // Fetch entity details
  const { 
    data: entity, 
    isLoading: isLoadingEntity, 
    error: entityError 
  } = useGovEntity(entityId);
  
  // Fetch entity posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useGovEntityPosts(entityId);
  
  // Debug: Log posts data when it changes
  console.log("Entity ID:", entityId);
  console.log("Posts data:", posts);
  
  // Handle loading state
  if (isLoadingEntity || isLoadingPosts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle error state
  if (entityError || postsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">
          {t('entity.error.loading')}: {entityError?.message || postsError?.message}
        </p>
      </div>
    );
  }
  
  // If entity doesn't exist
  if (!entity) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">{t('entity.error.notFound')}</p>
      </div>
    );
  }
  
  // Process data for charts
  const sentimentData = processSentimentData(posts || []);
  const timelineData = processTimelineData(posts || []);
  const platformData = processPlatformData(posts || []);
  
  // Ensure posts is an array and has valid data
  const postsArray = Array.isArray(posts) ? posts : [];
  
  // Calculate summary metrics
  const totalMentions = postsArray.length;
  const positiveMentions = postsArray.filter((post) => (post?.sentiment || 0) > 66).length;
  const neutralMentions = postsArray.filter((post) => {
    const sentiment = post?.sentiment || 0;
    return sentiment >= 33 && sentiment <= 66;
  }).length;
  const negativeMentions = postsArray.filter((post) => (post?.sentiment || 0) < 33).length;
  
  // Calculate average sentiment
  let avgSentiment = 0;
  if (totalMentions > 0) {
    const sum = postsArray.reduce((acc, post) => acc + (post?.sentiment || 50), 0);
    avgSentiment = sum / totalMentions;
  }
  
  // Get current language direction
  const isRTL = document.dir === 'rtl';
  
  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        {onBackClick && (
          <Button variant="ghost" size="sm" onClick={onBackClick}>
            {isRTL ? (
              <>
                {t('common.back')}
                <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180" />
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.back')}
              </>
            )}
          </Button>
        )}
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          {entity.iconUrl ? (
            <img 
              src={entity.iconUrl} 
              alt={entity.name} 
              className={isRTL ? "h-8 w-8 ml-2" : "h-8 w-8 mr-2"} 
            />
          ) : (
            <Building2 className={isRTL ? "h-8 w-8 ml-2 text-primary" : "h-8 w-8 mr-2 text-primary"} />
          )}
          {isRTL ? entity.arabicName || entity.name : entity.name}
        </h2>
      </div>
      
      {entity.arabicName && !isRTL && (
        <p className="text-xl text-right text-muted-foreground -mt-2">
          {entity.arabicName}
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('entity.metrics.totalMentions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground">
              {t('entity.metrics.acrossPlatforms')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('entity.metrics.avgSentiment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{Math.round(avgSentiment)}</div>
              <SentimentIndicator score={avgSentiment} />
            </div>
            <Progress 
              value={avgSentiment} 
              max={100}
              className="h-2 mt-1"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('entity.metrics.sentimentBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {isRTL ? (
                // RTL order: negative -> neutral -> positive
                <>
                  <div className="text-center">
                    <div className="text-red-500 text-sm font-semibold">
                      {Math.round((negativeMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.negative')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-amber-500 text-sm font-semibold">
                      {Math.round((neutralMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.neutral')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-500 text-sm font-semibold">
                      {Math.round((positiveMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.positive')}</div>
                  </div>
                </>
              ) : (
                // LTR order: positive -> neutral -> negative
                <>
                  <div className="text-center">
                    <div className="text-green-500 text-sm font-semibold">
                      {Math.round((positiveMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.positive')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-amber-500 text-sm font-semibold">
                      {Math.round((neutralMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.neutral')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-500 text-sm font-semibold">
                      {Math.round((negativeMentions / totalMentions) * 100) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">{t('entity.sentiment.negative')}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('entity.metrics.activePlatform')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {getMostActivePlatform(posts || [])}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPlatformPercentage(posts || [])}% {t('entity.metrics.ofAllMentions')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center">
            {isRTL ? (
              <>
                {t('entity.tabs.posts')}
                <MessageCircle className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('entity.tabs.posts')}
              </>
            )}
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            {isRTL ? (
              <>
                {t('entity.tabs.trends')}
                <TrendingUp className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('entity.tabs.trends')}
              </>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            {isRTL ? (
              <>
                {t('entity.tabs.analytics')}
                <BarChart3 className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('entity.tabs.analytics')}
              </>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {totalMentions === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  {t('entity.posts.noMentions')}
                </p>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(posts) ? posts : []).map((post: SocialPost) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('entity.trends.sentimentTrend')}</CardTitle>
                <CardDescription>{t('entity.trends.sentimentOverTime')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {timelineData.datasets[0].data.length > 1 ? (
                  <div className="h-[300px]">
                    <Line 
                      data={timelineData} 
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: t('entity.trends.sentimentScore')
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: t('entity.trends.date')
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      {t('entity.trends.notEnoughData')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('entity.trends.mentionsByPlatform')}</CardTitle>
                <CardDescription>{t('entity.trends.distributionAcrossPlatforms')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {platformData.labels.length > 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="w-64">
                      <Pie 
                        data={platformData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      {t('entity.trends.noPlatformData')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('entity.analytics.sentimentAnalysis')}</CardTitle>
              <CardDescription>
                {t('entity.analytics.breakdownDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentimentData.labels.length > 0 ? (
                <div className="h-[400px]">
                  <Bar 
                    data={sentimentData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: t('entity.analytics.numberOfMentions')
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    {t('entity.analytics.noSentimentData')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const { t } = useTranslation();
  // Get current language direction
  const isRTL = document.dir === 'rtl';
  
  // Safety check for required fields
  if (!post) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground">{t('entity.error.invalidPost')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Avatar className="h-10 w-10 flex-shrink-0">
            {post.authorAvatarUrl ? (
              <AvatarImage src={post.authorAvatarUrl} alt={post.authorName || t('entity.post.author')} />
            ) : (
              <AvatarFallback>
                {post.authorName ? post.authorName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className={`flex-grow ${isRTL ? 'text-right' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {post.authorName || t('entity.post.unknownAuthor')}
                  {post.authorUsername && (
                    <span className={`text-muted-foreground font-normal ${isRTL ? 'mr-1' : 'ml-1'}`}>
                      @{post.authorUsername}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  {post.postedAt ? (
                    formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })
                  ) : post.createdAt ? (
                    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                  ) : (
                    t('entity.post.unknownDate')
                  )}
                  {" · "}
                  <span className="capitalize">{post.platform || t('entity.post.unknownPlatform')}</span>
                </p>
              </div>
              
              <SentimentIndicator score={post.sentiment || 50} showValue />
            </div>
            
            <div className="mt-2">{post.content || t('entity.post.noContent')}</div>
            
            {post.keywords && Array.isArray(post.keywords) && post.keywords.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-2 ${isRTL ? 'justify-end' : ''}`}>
                {post.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            {post.postUrl && (
              <div className={`mt-2 ${isRTL ? 'text-right' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => post.postUrl ? window.open(post.postUrl, "_blank") : null}
                >
                  {t('entity.post.viewOriginal')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentIndicator({ score, showValue = false }: { score: number, showValue?: boolean }) {
  const { t } = useTranslation();
  // Get current language direction
  const isRTL = document.dir === 'rtl';
  
  let color = "bg-red-500";
  let text = t('entity.sentiment.negative');
  
  if (score >= 66) {
    color = "bg-green-500";
    text = t('entity.sentiment.positive');
  } else if (score >= 33) {
    color = "bg-amber-500";
    text = t('entity.sentiment.neutral');
  }
  
  return (
    <div className="flex items-center">
      <div className={`h-3 w-3 rounded-full ${color} ${isRTL ? 'ml-1' : 'mr-1'}`}></div>
      <span className="text-xs">
        {showValue ? `${text} (${Math.round(score)})` : text}
      </span>
    </div>
  );
}

// Helper functions for data processing
function processSentimentData(posts: SocialPost[]) {
  const { t } = useTranslation();
  // Ensure posts is an array
  const safePostsArray = Array.isArray(posts) ? posts : [];
  
  const sentimentRanges = [
    { label: t('entity.sentiment.veryNegative', { range: '0-20' }), min: 0, max: 20, color: "rgba(239, 68, 68, 0.7)" },
    { label: t('entity.sentiment.negative', { range: '21-40' }), min: 21, max: 40, color: "rgba(249, 115, 22, 0.7)" },
    { label: t('entity.sentiment.neutral', { range: '41-60' }), min: 41, max: 60, color: "rgba(245, 158, 11, 0.7)" },
    { label: t('entity.sentiment.positive', { range: '61-80' }), min: 61, max: 80, color: "rgba(132, 204, 22, 0.7)" },
    { label: t('entity.sentiment.veryPositive', { range: '81-100' }), min: 81, max: 100, color: "rgba(34, 197, 94, 0.7)" },
  ];
  
  const counts = sentimentRanges.map(range => {
    return safePostsArray.filter(post => {
      const sentiment = post?.sentiment ?? 50;
      return sentiment >= range.min && sentiment <= range.max;
    }).length;
  });
  
  return {
    labels: sentimentRanges.map(r => r.label),
    datasets: [
      {
        label: t('entity.analytics.numberOfMentions'),
        data: counts,
        backgroundColor: sentimentRanges.map(r => r.color),
        borderColor: sentimentRanges.map(r => r.color.replace("0.7", "1")),
        borderWidth: 1,
      },
    ],
  };
}

function processTimelineData(posts: SocialPost[]) {
  const { t } = useTranslation();
  // Ensure posts is an array
  const safePostsArray = Array.isArray(posts) ? posts : [];
  
  if (safePostsArray.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: t('entity.trends.sentimentScore'),
          data: [],
          fill: false,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
        },
      ],
    };
  }
  
  // Sort posts by date, handling null dates safely
  const sortedPosts = [...safePostsArray].sort((a, b) => {
    // Safely create Date objects with fallbacks
    const getPostDate = (post: SocialPost) => {
      if (post.postedAt) {
        return new Date(post.postedAt);
      }
      if (post.createdAt) {
        return new Date(post.createdAt);
      }
      return new Date(); // Fallback to current date if both are missing
    };
    
    const dateA = getPostDate(a);
    const dateB = getPostDate(b);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Limit to last 10 posts for readability
  const recentPosts = sortedPosts.slice(-10);
  
  // Format dates for labels
  const labels = recentPosts.map(post => {
    const date = post.postedAt ? new Date(post.postedAt) : 
                 post.createdAt ? new Date(post.createdAt) : new Date();
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const sentiments = recentPosts.map(post => post?.sentiment ?? 50);
  
  return {
    labels,
    datasets: [
      {
        label: t('entity.trends.sentimentScore'),
        data: sentiments,
        fill: false,
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
    ],
  };
}

function processPlatformData(posts: SocialPost[]) {
  const { t } = useTranslation();
  // Ensure posts is an array
  const safePostsArray = Array.isArray(posts) ? posts : [];
  
  const platforms: Record<string, number> = {};
  
  safePostsArray.forEach(post => {
    if (!post || !post.platform) return;
    
    if (!platforms[post.platform]) {
      platforms[post.platform] = 0;
    }
    platforms[post.platform]++;
  });
  
  const backgroundColors = [
    "rgba(37, 99, 235, 0.7)",  // Twitter/X blue
    "rgba(219, 39, 119, 0.7)", // Instagram pink
    "rgba(59, 130, 246, 0.7)", // Facebook blue
    "rgba(234, 88, 12, 0.7)",  // Reddit orange
    "rgba(168, 85, 247, 0.7)", // Other purple
  ];
  
  const borderColors = backgroundColors.map(color => color.replace("0.7", "1"));
  
  return {
    labels: Object.keys(platforms).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    datasets: [
      {
        data: Object.values(platforms),
        backgroundColor: backgroundColors.slice(0, Object.keys(platforms).length),
        borderColor: borderColors.slice(0, Object.keys(platforms).length),
        borderWidth: 1,
      },
    ],
  };
}

function getMostActivePlatform(posts: SocialPost[]): string {
  const { t } = useTranslation();
  // Ensure posts is an array
  const safePostsArray = Array.isArray(posts) ? posts : [];
  if (safePostsArray.length === 0) return t('entity.metrics.none');
  
  const platforms: Record<string, number> = {};
  
  safePostsArray.forEach(post => {
    if (!post || !post.platform) return;
    
    if (!platforms[post.platform]) {
      platforms[post.platform] = 0;
    }
    platforms[post.platform]++;
  });
  
  if (Object.keys(platforms).length === 0) return t('entity.metrics.none');
  
  let mostActive = "";
  let maxCount = 0;
  
  Object.entries(platforms).forEach(([platform, count]) => {
    if (count > maxCount) {
      mostActive = platform;
      maxCount = count;
    }
  });
  
  return mostActive || t('entity.metrics.none');
}

function getPlatformPercentage(posts: SocialPost[]): number {
  // Ensure posts is an array
  const safePostsArray = Array.isArray(posts) ? posts : [];
  if (safePostsArray.length === 0) return 0;
  
  const platforms: Record<string, number> = {};
  
  safePostsArray.forEach(post => {
    if (!post || !post.platform) return;
    
    if (!platforms[post.platform]) {
      platforms[post.platform] = 0;
    }
    platforms[post.platform]++;
  });
  
  if (Object.keys(platforms).length === 0) return 0;
  
  let maxCount = 0;
  
  Object.values(platforms).forEach(count => {
    if (count > maxCount) {
      maxCount = count;
    }
  });
  
  return Math.round((maxCount / safePostsArray.length) * 100);
}