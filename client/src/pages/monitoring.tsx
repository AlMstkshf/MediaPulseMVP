import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import PageLayout from "@/components/layout/PageLayout";
import { useSocialPosts } from "@/hooks/use-sentiment";
import { useKeywords } from "@/hooks/use-keywords";
import { KeywordAlerts } from "@/components/keyword/KeywordAlerts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TrendVisualization from "@/components/dashboard/TrendVisualization";
import TrendingKeywordsCard from "@/components/dashboard/TrendingKeywordsCard";
import EntityTrendsCard from "@/components/dashboard/EntityTrendsCard";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Plus, 
  X, 
  Filter, 
  Download, 
  Bell, 
  Heart, 
  MessageSquare, 
  Repeat,
  Search,
  BarChart,
  PieChart,
  TrendingUp
} from "lucide-react";

const Monitoring = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [testEmailAddress, setTestEmailAddress] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  
  const { data: posts, isLoading: isLoadingPosts } = useSocialPosts({
    platform: activeTab !== "all" ? activeTab : undefined
  });
  
  const { 
    data: keywords, 
    isLoading: isLoadingKeywords,
    createKeyword,
    deleteKeyword
  } = useKeywords();
  
  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      createKeyword.mutate({
        word: newKeyword.trim(),
        category: "user-added",
        isActive: true,
        alertThreshold: 50,
        changePercentage: 0
      });
      setNewKeyword("");
    }
  };
  
  const handleDeleteKeyword = (id: number) => {
    deleteKeyword.mutate(id);
  };
  
  const getSentimentClass = (sentiment?: number | null) => {
    if (sentiment === undefined || sentiment === null) return "";
    if (sentiment >= 4) return "bg-green-500 bg-opacity-10 text-green-500";
    if (sentiment >= 3) return "bg-yellow-500 bg-opacity-10 text-yellow-500";
    return "bg-red-500 bg-opacity-10 text-red-500";
  };
  
  const getSentimentText = (sentiment?: number | null) => {
    if (sentiment === undefined || sentiment === null) return "";
    if (sentiment >= 4) return t('analysis.positive');
    if (sentiment >= 3) return t('analysis.neutral');
    return t('analysis.negative');
  };

  // Function to send test email
  const sendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      toast({
        title: t('common.error'),
        description: t('monitoring.emailRequired'),
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await apiRequest('POST', '/api/test-email', {
        email: testEmailAddress,
        language: 'en' // Default to English for test emails
      });

      if (response.ok) {
        toast({
          title: t('monitoring.testEmailSent'),
          description: t('monitoring.testEmailSentDesc'),
          variant: "default"
        });
        setTestEmailAddress('');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send test email');
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('monitoring.testEmailFailed'),
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => 
    searchQuery ? post.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('monitoring.title')}</h2>
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-[#cba344] hover:bg-[#b8943e] text-white"
            onClick={() => {
              const alertsSection = document.getElementById('keyword-alerts-section');
              if (alertsSection) {
                alertsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <Bell className="h-4 w-4 mr-2" />
            <span>{t('monitoring.viewAlerts')}</span>
          </Button>
        </div>
      </div>
      
      {/* Trend Analysis Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-[#cba344]" />
            {t('monitoring.trendAnalysis', 'Trend Analysis')}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-3">
            <TrendVisualization />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TrendingKeywordsCard />
          </div>
          <div className="lg:col-span-1">
            <EntityTrendsCard />
          </div>
          <div className="lg:col-span-1">
            <AIInsightsCard />
          </div>
        </div>
      </div>
      
      {/* Media Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-bold">{t('monitoring.mediaMonitoring')}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('monitoring.searchMentions')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Filter className="h-4 w-4 mr-2" />
                      {t('monitoring.clearAll')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      {t('monitoring.downloadReport')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="h-4 w-4 mr-2" />
                      {t('monitoring.alertSettings')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="flex mb-4 border-b w-full rounded-none bg-transparent h-auto">
                  <TabsTrigger 
                    value="all" 
                    className={`px-4 py-2 font-medium ${activeTab === "all" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                  >
                    {t('monitoring.all')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="twitter" 
                    className={`px-4 py-2 font-medium ${activeTab === "twitter" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                  >
                    {t('monitoring.twitter')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="facebook" 
                    className={`px-4 py-2 font-medium ${activeTab === "facebook" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                  >
                    {t('monitoring.facebook')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instagram" 
                    className={`px-4 py-2 font-medium ${activeTab === "instagram" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                  >
                    {t('monitoring.instagram')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="news" 
                    className={`px-4 py-2 font-medium ${activeTab === "news" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
                  >
                    {t('monitoring.news')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  {isLoadingPosts ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  ) : filteredPosts && filteredPosts.length > 0 ? (
                    <div className="overflow-y-auto max-h-[600px] space-y-4">
                      {filteredPosts.map((post) => (
                        <div key={post.id} className="border-b py-3 last:border-b-0">
                          <div className="flex items-start">
                            <img 
                              src={post.authorAvatarUrl || t('monitoring.defaultAvatar')} 
                              alt={post.authorName || ""} 
                              className="w-10 h-10 rounded-full object-cover mr-3" 
                            />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-bold text-sm">{post.authorName || t('monitoring.defaultUser')}</span>
                                  <span className="text-gray-500 text-sm ml-2">@{post.authorUsername || t('monitoring.defaultUsername')}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">
                                    {post.postedAt 
                                      ? new Date(post.postedAt).toLocaleString(i18n.language, { 
                                          hour: 'numeric', 
                                          minute: 'numeric', 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })
                                      : t('monitoring.hoursAgo', { hours: 2 })}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentClass(post.sentiment)}`}>
                                    {getSentimentText(post.sentiment)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm mt-1">{post.content}</p>
                              {post.engagement ? (
                                <div className="flex mt-2 text-xs text-gray-500">
                                  <span className="mr-4 flex items-center">
                                    <Heart className="h-4 w-4 mr-1" />
                                    <>{(post.engagement as any)?.likes || 0}</>
                                  </span>
                                  <span className="mr-4 flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    <>{(post.engagement as any)?.comments || 0}</>
                                  </span>
                                  <span className="flex items-center">
                                    <Repeat className="h-4 w-4 mr-1" />
                                    <>{(post.engagement as any)?.shares || 0}</>
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? t('monitoring.noResults') : t('monitoring.noMentions')}
                    </div>
                  )}
                </TabsContent>
                
                {/* Other platform tabs would have similar content */}
                <TabsContent value="twitter" className="mt-0">
                  <div className="text-center py-8 text-gray-500">
                    {t('monitoring.twitterContent')}
                  </div>
                </TabsContent>
                
                <TabsContent value="facebook" className="mt-0">
                  <div className="text-center py-8 text-gray-500">
                    {t('monitoring.facebookContent')}
                  </div>
                </TabsContent>
                
                <TabsContent value="instagram" className="mt-0">
                  <div className="text-center py-8 text-gray-500">
                    {t('monitoring.instagramContent')}
                  </div>
                </TabsContent>
                
                <TabsContent value="news" className="mt-0">
                  <div className="text-center py-8 text-gray-500">
                    {t('monitoring.newsContent')}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('monitoring.keywords')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder={t('monitoring.addKeyword')} 
                    className="w-full pr-10"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddKeyword();
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#cba344]"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoadingKeywords ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-10 h-10 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {keywords && keywords.map((keyword) => (
                    <div key={keyword.id} className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                      <span className="font-medium">{keyword.word}</span>
                      <div className="flex items-center">
                        <Badge className={`${(keyword.changePercentage ?? 0) >= 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}>
                          {(keyword.changePercentage ?? 0) >= 0 ? '+' : ''}{keyword.changePercentage ?? 0}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteKeyword(keyword.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-md font-bold mb-3">{t('monitoring.activeAlerts')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-red-500 bg-opacity-10 rounded-md">
                    <span className="text-sm">{t('monitoring.negativeRise')}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-red-500">{t('monitoring.threshold')}: &gt;15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-500 bg-opacity-10 rounded-md">
                    <span className="text-sm">{t('monitoring.keywordTrends')}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-yellow-500">{t('monitoring.threshold')}: &gt;500 {t('monitoring.mentions')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6" id="keyword-alerts-section">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('monitoring.keywordAlerts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <KeywordAlerts />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('monitoring.testEmailNotifications')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  {t('monitoring.testEmailDesc', 'Send a test email to verify notification delivery')}
                </p>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder={t('monitoring.enterEmail', 'Enter your email address')}
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendTestEmail}
                    disabled={isSendingEmail || !testEmailAddress.trim()}
                    className="bg-[#cba344] hover:bg-[#b8943e] text-white"
                  >
                    {isSendingEmail ? t('common.sending', 'Sending...') : t('monitoring.sendTest', 'Send Test')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('monitoring.sources')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                  <span className="font-medium">Twitter</span>
                  <Badge className="bg-blue-500">42%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                  <span className="font-medium">Facebook</span>
                  <Badge className="bg-indigo-500">28%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                  <span className="font-medium">Instagram</span>
                  <Badge className="bg-pink-500">15%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                  <span className="font-medium">{t('monitoring.newsWebsites')}</span>
                  <Badge className="bg-green-500">10%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#f9f4e9] bg-opacity-50 rounded-md">
                  <span className="font-medium">{t('monitoring.blogs')}</span>
                  <Badge className="bg-yellow-500">5%</Badge>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                {t('monitoring.manageSourcesButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Monitoring;
