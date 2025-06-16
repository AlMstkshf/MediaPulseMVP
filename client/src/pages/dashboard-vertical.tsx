import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Calendar, BarChart2, Sparkles, TrendingUp, Newspaper, BarChart4, ChevronRight, Search } from "lucide-react";
import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import SentimentAnalysis from "@/components/dashboard/SentimentAnalysis";
import MediaMonitoring from "@/components/dashboard/MediaMonitoring";
import MediaCenter from "@/components/dashboard/MediaCenter";
import TutorialSection from "@/components/dashboard/TutorialSection";
import ThemeExplorer from "@/components/dashboard/ThemeExplorer";
import TrendVisualization from "@/components/dashboard/TrendVisualization";
import SocialMediaStats from "@/components/dashboard/SocialMediaStats";
import NewsAnalyzer from "@/components/dashboard/NewsAnalyzer";
import KpiOverview from "@/components/dashboard/KpiOverview";
import ContentSearch from "@/components/dashboard/ContentSearch";
import { GlobalDataProvider } from "@/lib/context/GlobalDataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRtlDirection } from "@/lib/rtl-helper";

const DashboardContent = () => {
  const { t, i18n } = useTranslation();
  const [timeFilter, setTimeFilter] = useState(t('dashboard.last30Days'));
  const [activeTab, setActiveTab] = useState('sentiment');
  const { isRtl } = useRtlDirection();

  // Section header component with icon and title
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className={`flex items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
      <Icon className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'} text-primary`} />
      <h2 className={`text-xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{title}</h2>
    </div>
  );

  return (
    <PageLayout>
      {/* Page Header */}
      <div className={`flex justify-between items-center mb-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <h2 className={`text-2xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('dashboard.mainTitle')}</h2>
        <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Calendar className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                <span>{timeFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setTimeFilter(t('dashboard.today'))}>
                {t('dashboard.today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter(t('dashboard.last7Days'))}>
                {t('dashboard.last7Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter(t('dashboard.last30Days'))}>
                {t('dashboard.last30Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter(t('dashboard.last90Days'))}>
                {t('dashboard.last90Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter(t('dashboard.custom'))}>
                {t('dashboard.custom')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            className={`bg-blue-500 hover:bg-blue-600 text-white flex items-center ${isRtl ? 'ml-3' : 'mr-3'}`}
            asChild
          >
            <Link href="/test-sentiment" className="flex items-center">
              <BarChart2 className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
              <span>{t('dashboard.testSentimentAnalysis')}</span>
            </Link>
          </Button>

          <Button className={`bg-[#cba344] hover:bg-[#b8943e] text-white flex items-center`}>
            <Download className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            <span>{t('dashboard.downloadReport')}</span>
          </Button>
        </div>
      </div>
      
      {/* Content Search Section - Made more prominent with Card wrapper */}
      <div className="mb-6">
        <div className={`flex items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Search className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'} text-primary`} />
          <h2 className={`text-xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('search.title', 'Search Content')}</h2>
        </div>
        <Card className="shadow-md border-t-2 border-t-primary/20">
          <CardContent className="pt-6">
            <ContentSearch />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (KPIs and Social) */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Overview Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                <SectionHeader 
                  icon={BarChart4} 
                  title={t('performance.kpiOverview')} 
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KpiOverview compact={true} maxItems={3} showViewAllLink={true} rtl={isRtl} />
            </CardContent>
          </Card>
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard
              title={t('dashboard.mentionsTotal')}
              value="14,392"
              change={12}
              info={`${t('dashboard.comparedTo')} 12,839 ${t('dashboard.inPreviousPeriod')}`}
              borderColor="border-[#cba344]"
              rtl={isRtl}
            />
            
            <KpiCard
              title={t('dashboard.sentimentAverage')}
              value="3.8/5"
              change={3}
              info={t('dashboard.relativelyStable')}
              progressValue={76}
              progressColor="bg-blue-500"
              borderColor="border-blue-500"
              rtl={isRtl}
            />
            
            <KpiCard
              title={t('dashboard.responseTime')}
              value={isRtl ? "47 دقيقة" : "47 min"}
              change={-5}
              info={t('dashboard.averageResponseTime')}
              borderColor="border-yellow-500"
              rtl={isRtl}
            />
            
            <KpiCard
              title={t('dashboard.innovationIndex')}
              value="72/100"
              change={8}
              info={t('dashboard.notableImprovement')}
              progressValue={72}
              progressColor="bg-green-500"
              borderColor="border-green-500"
              rtl={isRtl}
            />
          </div>
        
          {/* Social Media Activity */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                <SectionHeader 
                  icon={TrendingUp} 
                  title={t('dashboard.socialMediaActivity')} 
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SocialMediaStats rtl={isRtl} />
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column (Sentiment, Media, Tutorials) */}
        <div className="space-y-6">
          {/* Advanced Analytics Tabs */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                <SectionHeader 
                  icon={BarChart2} 
                  title={t('dashboard.advancedAnalytics')} 
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sentiment" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <TabsTrigger value="sentiment" className="flex items-center">
                    <BarChart2 className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.sentimentAnalysis')}
                  </TabsTrigger>
                  <TabsTrigger value="themes" className="flex items-center">
                    <Sparkles className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.themeExplorer')}
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex items-center">
                    <TrendingUp className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.realTimeTrends')}
                  </TabsTrigger>
                  <TabsTrigger value="news" className="flex items-center">
                    <Newspaper className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.newsAnalyzer')}
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-4">
                  {activeTab === 'sentiment' && <SentimentAnalysis rtl={isRtl} />}
                  {activeTab === 'themes' && <ThemeExplorer rtl={isRtl} />}
                  {activeTab === 'trends' && <TrendVisualization rtl={isRtl} />}
                  {activeTab === 'news' && <NewsAnalyzer rtl={isRtl} />}
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Media Monitoring */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                <SectionHeader 
                  icon={Newspaper} 
                  title={t('dashboard.mediaMonitoring')} 
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <MediaMonitoring rtl={isRtl} compact={true} />
              <div className="flex justify-end mt-2">
                <Link href="/media" className="text-sm text-primary flex items-center hover:underline">
                  {t("dashboard.viewAllMedia")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tutorials */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                <SectionHeader 
                  icon={Sparkles} 
                  title={t('dashboard.tutorials')} 
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TutorialSection rtl={isRtl} compact={true} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Full-width Media Center */}
      <div className="mt-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>
              <SectionHeader 
                icon={Newspaper} 
                title={t('dashboard.mediaCenter')} 
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MediaCenter rtl={isRtl} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

// Export the dashboard content directly since GlobalDataProvider is in App.tsx
export default DashboardContent;