import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowUpRight, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SmartHashtagRecommendationsProps {
  onHashtagsSelected?: (hashtags: string[]) => void;
  initialContent?: string;
  platform?: string;
}

interface TrendingTopic {
  topic: string;
  count: number;
  change: number;
}

interface SmartHashtagResult {
  recommendedHashtags: string[];
  trendingHashtags: string[];
  relevanceScores: Record<string, number>;
  insightSummary: string;
  trendingTopics: TrendingTopic[];
}

export default function SmartHashtagRecommendations({ onHashtagsSelected, initialContent = "", platform: initialPlatform = "twitter" }: SmartHashtagRecommendationsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Form state
  const [content, setContent] = useState(initialContent);
  const [platform, setPlatform] = useState(initialPlatform);
  const [count, setCount] = useState("8");
  const [includeGenericHashtags, setIncludeGenericHashtags] = useState(true);
  
  // Result state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashtagResult, setHashtagResult] = useState<SmartHashtagResult | null>(null);
  const [selectedTab, setSelectedTab] = useState("recommended");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  
  // Auto-generate hashtags if content is provided
  useEffect(() => {
    // If we have initial content, generate hashtags automatically
    if (initialContent && initialContent.length > 10) {
      const timer = setTimeout(() => {
        handleGenerateHashtags();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, platform]);

  // Generate smart hashtags
  const handleGenerateHashtags = async () => {
    if (!content) {
      setError(t("Please enter content for analysis"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest("POST", "/api/social/smart-hashtags", {
        content,
        platform,
        count: parseInt(count),
        includeGenericHashtags
      });

      if (!res.ok) {
        throw new Error("Failed to generate hashtags");
      }

      const data = await res.json();
      setHashtagResult(data);
      setSelectedHashtags([]); // Reset selected hashtags
      
      toast({
        title: t("Hashtags Generated"),
        description: t("Smart hashtag recommendations are ready"),
      });
    } catch (err) {
      console.error("Error generating hashtags:", err);
      setError(t("Failed to generate hashtags. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle hashtag selection
  const toggleHashtagSelection = (hashtag: string) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter(tag => tag !== hashtag));
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  // Apply selected hashtags
  const applySelectedHashtags = () => {
    if (onHashtagsSelected && selectedHashtags.length > 0) {
      onHashtagsSelected(selectedHashtags);
      
      toast({
        title: t("Hashtags Applied"),
        description: t("Selected hashtags have been applied to your post"),
      });
    }
  };

  // Get relevance badge color based on score
  const getRelevanceBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-700 border-green-300";
    if (score >= 60) return "bg-blue-500/20 text-blue-700 border-blue-300";
    if (score >= 40) return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    return "bg-gray-500/20 text-gray-700 border-gray-300";
  };

  // Get trend badge color based on change percentage
  const getTrendBadgeColor = (change: number) => {
    if (change >= 50) return "bg-green-500/20 text-green-700 border-green-300";
    if (change >= 20) return "bg-blue-500/20 text-blue-700 border-blue-300";
    if (change >= 0) return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    return "bg-red-500/20 text-red-700 border-red-300";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {t("Smart Hashtag Recommendations")} 
          <Sparkles className="h-5 w-5 text-primary" />
        </h2>
        <p className="text-muted-foreground">
          {t("Generate intelligent hashtag recommendations based on content analysis and trending topics")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Generate Smart Hashtags")}</CardTitle>
          <CardDescription>
            {t("Our AI will analyze your content and suggest trending, relevant hashtags for maximum reach")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="flex items-center gap-1">
                  {t("Post Content")}
                  <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("Enter your post content for hashtag analysis...")}
                  className="h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">{t("Platform")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder={t("Select platform")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">{t("Twitter")}</SelectItem>
                    <SelectItem value="facebook">{t("Facebook")}</SelectItem>
                    <SelectItem value="instagram">{t("Instagram")}</SelectItem>
                    <SelectItem value="linkedin">{t("LinkedIn")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">{t("Number of Hashtags")}</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger id="count">
                    <SelectValue placeholder={t("How many hashtags?")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">{t("Few (3)")}</SelectItem>
                    <SelectItem value="5">{t("Moderate (5)")}</SelectItem>
                    <SelectItem value="8">{t("Many (8)")}</SelectItem>
                    <SelectItem value="12">{t("Maximum (12)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-generic"
                    checked={includeGenericHashtags}
                    onChange={(e) => setIncludeGenericHashtags(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-generic">
                    {t("Include generic police/safety hashtags if needed")}
                  </Label>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-300/20 mt-4">
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>{t("Trend Analysis")}</AlertTitle>
                <AlertDescription>
                  {t("Smart hashtags incorporate trending topic analysis to maximize content visibility")}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleGenerateHashtags}
            disabled={isLoading || !content}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Analyzing...")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("Generate Smart Hashtags")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("Error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hashtagResult && (
        <Card>
          <CardHeader>
            <CardTitle>{t("Smart Hashtag Results")}</CardTitle>
            <CardDescription>
              {hashtagResult.insightSummary}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recommended">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("Recommended Hashtags")}
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("Trending Topics")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {hashtagResult.recommendedHashtags.map((hashtag) => {
                      const tagWithoutHash = hashtag.replace(/^#/, '');
                      const relevance = hashtagResult.relevanceScores[tagWithoutHash] || 0;
                      const isTrending = hashtagResult.trendingHashtags.includes(hashtag);
                      
                      return (
                        <div 
                          key={hashtag}
                          className={`flex items-center justify-between p-2 rounded-md border hover:bg-accent/50 cursor-pointer ${
                            selectedHashtags.includes(hashtag) ? "bg-accent" : ""
                          }`}
                          onClick={() => toggleHashtagSelection(hashtag)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedHashtags.includes(hashtag)}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium">{hashtag}</span>
                            {isTrending && (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-700 border-blue-300">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {t("Trending")}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getRelevanceBadgeColor(relevance)}>
                              {t("Relevance")}: {relevance}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trending" className="space-y-6 mt-4">
                <div className="space-y-1">
                  {hashtagResult.trendingTopics.map((topic) => (
                    <div key={topic.topic} className="flex items-center justify-between p-3 rounded-md border mb-2">
                      <div>
                        <div className="font-medium">#{topic.topic}</div>
                        <div className="text-sm text-muted-foreground">{t("Mentions")}: {topic.count}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTrendBadgeColor(topic.change)}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {topic.change > 0 ? "+" : ""}{topic.change}%
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const hashtag = `#${topic.topic}`;
                            if (!selectedHashtags.includes(hashtag)) {
                              setSelectedHashtags([...selectedHashtags, hashtag]);
                            }
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {selectedHashtags.length > 0 && (
                <div className="text-sm">
                  {t("Selected")}: {selectedHashtags.length} {t("hashtags")}
                </div>
              )}
            </div>
            <Button
              onClick={applySelectedHashtags}
              disabled={selectedHashtags.length === 0}
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              {t("Apply Selected Hashtags")}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}