import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AnimatedBarChartLoader,
  LoadingSpinner
} from "@/components/ui/loading-animations";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { VISUALIZATION_COLORS } from "@/lib/constants";

// Define types
interface EngagementByPlatformData {
  platform: string;
  engagement: number;
}

interface EngagementMetric {
  title: string;
  value: string;
  change: string;
}

interface EngagementDetailsData {
  data: Array<{
    name: string;
    facebook: number;
    twitter: number;
    instagram: number;
    linkedin: number;
  }>;
  metrics: EngagementMetric[];
}

interface EngagementTabProps {
  engagementByPlatformData?: EngagementByPlatformData[];
  engagementDetailsData?: EngagementDetailsData;
  isEngagementByPlatformLoading: boolean;
  isEngagementDetailsLoading: boolean;
  timeRange: string;
}

// Create a reusable metric card component
const MetricCard = memo(({ title, value, change }: EngagementMetric) => {
  const isPositive = change.startsWith('+');
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
      <CardFooter className="pt-0">
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </CardFooter>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";

// Memoized engagement tab to prevent unnecessary re-renders
const EngagementTab = memo(({ 
  engagementByPlatformData, 
  engagementDetailsData, 
  isEngagementByPlatformLoading, 
  isEngagementDetailsLoading,
  timeRange
}: EngagementTabProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-US').format(num);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t("engagement.analysisTitle")}</h3>
      <p className="text-muted-foreground max-w-4xl">
        {t("engagement.analysisDescription")}
      </p>
      
      {/* Metrics section */}
      {isEngagementDetailsLoading ? (
        <div className="w-full py-6 flex justify-center">
          <LoadingSpinner size="lg" text={t("engagement.loadingMetrics")} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementDetailsData?.metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
            />
          ))}
        </div>
      )}
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Engagement by Platform Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("engagement.byPlatformTitle")}</CardTitle>
            <CardDescription>
              {t("engagement.byPlatformDescription")} {timeRange === "1m" ? t("performance.oneMonth") : timeRange === "3m" ? t("performance.threeMonths") : timeRange === "6m" ? t("performance.sixMonths") : t("performance.oneYear")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEngagementByPlatformLoading ? (
              <AnimatedBarChartLoader className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RechartsBarChart
                  data={engagementByPlatformData || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatNumber(value as number), t("engagement.interactions")]}
                  />
                  <Legend />
                  <defs>
                    <linearGradient id="engagementTabGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VISUALIZATION_COLORS.ACCENT2} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={VISUALIZATION_COLORS.ACCENT6} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="engagement" 
                    name={t("engagement.totalEngagement")} 
                    fill="url(#engagementTabGradient)" 
                    radius={[4, 4, 0, 0]}
                    stroke={VISUALIZATION_COLORS.ACCENT2}
                    strokeWidth={1}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                {t("engagement.totalEngagement")}: {formatNumber(engagementByPlatformData?.reduce((sum, item) => sum + item.engagement, 0) || 0)}
              </div>
              <Badge variant="outline" className="text-xs">
                {t("performance.updatedEvery")} 6 {t("performance.hours")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
        
        {/* Engagement Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("engagement.detailedAnalysisTitle")}</CardTitle>
            <CardDescription>
              {t("engagement.detailedAnalysisDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEngagementDetailsLoading ? (
              <AnimatedBarChartLoader className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart
                  data={engagementDetailsData?.data || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatNumber(value as number), ""]} />
                  <Legend />
                  <defs>
                    <linearGradient id="facebookGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VISUALIZATION_COLORS.PRIMARY} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={VISUALIZATION_COLORS.PRIMARY} stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="twitterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VISUALIZATION_COLORS.ACCENT2} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={VISUALIZATION_COLORS.ACCENT2} stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VISUALIZATION_COLORS.ACCENT1} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={VISUALIZATION_COLORS.ACCENT1} stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="linkedinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VISUALIZATION_COLORS.ACCENT5} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={VISUALIZATION_COLORS.ACCENT5} stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="facebook" 
                    name="Facebook" 
                    fill="url(#facebookGradient)" 
                    radius={[4, 4, 0, 0]} 
                    stroke={VISUALIZATION_COLORS.PRIMARY}
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="twitter" 
                    name="Twitter" 
                    fill="url(#twitterGradient)" 
                    radius={[4, 4, 0, 0]} 
                    stroke={VISUALIZATION_COLORS.ACCENT2}
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="instagram" 
                    name="Instagram" 
                    fill="url(#instagramGradient)" 
                    radius={[4, 4, 0, 0]} 
                    stroke={VISUALIZATION_COLORS.ACCENT1}
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="linkedin" 
                    name="LinkedIn" 
                    fill="url(#linkedinGradient)" 
                    radius={[4, 4, 0, 0]} 
                    stroke={VISUALIZATION_COLORS.ACCENT5}
                    strokeWidth={1}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Engagement insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("engagement.insightsTitle")}</CardTitle>
          <CardDescription>
            {t("engagement.insightsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{t("engagement.platformPerformance")}</h4>
              <p className="text-sm text-muted-foreground">
                {engagementByPlatformData && engagementByPlatformData.length > 0 ? (
                  <>
                    {t("engagement.topPerformingPlatform")}: <strong>
                      {engagementByPlatformData.sort((a, b) => b.engagement - a.engagement)[0].platform}
                    </strong> {t("engagement.with")} {formatNumber(engagementByPlatformData.sort((a, b) => b.engagement - a.engagement)[0].engagement)} {t("engagement.interactions")}
                  </>
                ) : (
                  t("engagement.noData")
                )}
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{t("engagement.contentStrategy")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("engagement.contentStrategyDetails")}
              </p>
              <ul className="mt-2 text-sm list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("engagement.contentStrategyPoint1")}</li>
                <li>{t("engagement.contentStrategyPoint2")}</li>
                <li>{t("engagement.contentStrategyPoint3")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

EngagementTab.displayName = "EngagementTab";

export default EngagementTab;