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
  AnimatedLineChartLoader, 
  AnimatedDonutChartLoader 
} from "@/components/ui/loading-animations";
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { SENTIMENT_COLORS } from "@/lib/constants";

// Define types for component props
interface SentimentDistributionData {
  name: string;
  value: number;
  color: string;
}

interface SentimentTrendData {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentTabProps {
  sentimentDistributionData?: SentimentDistributionData[];
  sentimentTrendsData?: SentimentTrendData[];
  isSentimentDistributionLoading: boolean;
  isSentimentTrendsLoading: boolean;
  timeRange: string;
}

// Memoized sentiment tab to prevent unnecessary re-renders
const SentimentTab = memo(({ 
  sentimentDistributionData, 
  sentimentTrendsData, 
  isSentimentDistributionLoading, 
  isSentimentTrendsLoading,
  timeRange
}: SentimentTabProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t("sentiment.analysisTitle")}</h3>
      <p className="text-muted-foreground max-w-4xl">
        {t("sentiment.analysisDescription")}
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sentiment.distributionTitle")}</CardTitle>
            <CardDescription>
              {t("sentiment.distributionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSentimentDistributionLoading ? (
              <AnimatedDonutChartLoader size={320} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPieChart>
                  <Pie
                    data={sentimentDistributionData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {sentimentDistributionData?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        strokeWidth={2}
                        stroke="#ffffff"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-3 justify-center w-full">
              {sentimentDistributionData?.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
        
        {/* Sentiment Trends Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sentiment.trendsTitle")}</CardTitle>
            <CardDescription>
              {t("sentiment.trendsDescription")} {timeRange === "1m" ? t("performance.oneMonth") : timeRange === "3m" ? t("performance.threeMonths") : timeRange === "6m" ? t("performance.sixMonths") : t("performance.oneYear")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSentimentTrendsLoading ? (
              <AnimatedLineChartLoader className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RechartsLineChart
                  data={sentimentTrendsData || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, ""]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <defs>
                    <linearGradient id="positiveAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.POSITIVE} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.POSITIVE} stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="neutralAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.NEUTRAL} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.NEUTRAL} stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="negativeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.NEGATIVE} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.NEGATIVE} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="positive"
                    name={t("sentiment.positive")}
                    stroke={SENTIMENT_COLORS.POSITIVE}
                    strokeWidth={3}
                    fill="url(#positiveAreaGradient)"
                    dot={{ strokeWidth: 2, r: 4, fill: "white" }}
                    activeDot={{ r: 7, fill: SENTIMENT_COLORS.POSITIVE }}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutral"
                    name={t("sentiment.neutral")}
                    stroke={SENTIMENT_COLORS.NEUTRAL}
                    strokeWidth={3}
                    fill="url(#neutralAreaGradient)"
                    dot={{ strokeWidth: 2, r: 4, fill: "white" }}
                    activeDot={{ r: 7, fill: SENTIMENT_COLORS.NEUTRAL }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    name={t("sentiment.negative")}
                    stroke={SENTIMENT_COLORS.NEGATIVE}
                    strokeWidth={3}
                    fill="url(#negativeAreaGradient)"
                    dot={{ strokeWidth: 2, r: 4, fill: "white" }}
                    activeDot={{ r: 7, fill: SENTIMENT_COLORS.NEGATIVE }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-green-500 font-semibold">
                {sentimentTrendsData && sentimentTrendsData.length > 1 && 
                  (sentimentTrendsData[0].positive > sentimentTrendsData[sentimentTrendsData.length - 1].positive ? 
                    "+" + Math.round((sentimentTrendsData[0].positive - sentimentTrendsData[sentimentTrendsData.length - 1].positive)) + "% " : 
                    Math.round((sentimentTrendsData[sentimentTrendsData.length - 1].positive - sentimentTrendsData[0].positive)) + "% ")
                }
                {sentimentTrendsData && sentimentTrendsData.length > 1 && t("sentiment.positiveChange")}
              </div>
              <Badge variant="outline" className="text-xs">
                {t("performance.updatedEvery")} 6 {t("performance.hours")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Additional sentiment metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
            <CardTitle className="text-base">{t("sentiment.averageScore")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center space-x-2 text-primary">
              <span>
                {sentimentDistributionData 
                  ? Math.round(sentimentDistributionData.reduce(
                      (sum, item) => sum + (item.name === "Positive" ? item.value * 1 : item.name === "Neutral" ? item.value * 0.5 : 0), 
                      0
                    ))
                  : 0}%
              </span>
              <span className="text-lg text-primary/70">
                {" "}Score
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 border-l-2 border-primary/30 pl-2">
              {t("sentiment.averageScoreDescription")}
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
            <CardTitle className="text-base">{t("sentiment.volatility")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center space-x-2 text-accent-foreground">
              <span>
                {sentimentTrendsData 
                  ? Math.round(
                      sentimentTrendsData.reduce(
                        (max, item) => Math.max(max, Math.abs(item.positive - item.negative)), 
                        0
                      )
                    )
                  : 0}%
              </span>
              <span className="text-lg text-accent-foreground/70">
                {" "}Range
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 border-l-2 border-accent-foreground/30 pl-2">
              {t("sentiment.volatilityDescription")}
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
            <CardTitle className="text-base">{t("sentiment.trendDirection")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold flex items-center space-x-2">
              <span className={sentimentTrendsData && sentimentTrendsData.length > 1 && 
                sentimentTrendsData[sentimentTrendsData.length - 1].positive > 
                sentimentTrendsData[sentimentTrendsData.length - 2].positive ? 
                "text-green-500" : "text-red-500"}>
                {sentimentTrendsData && sentimentTrendsData.length > 1 
                  ? sentimentTrendsData[sentimentTrendsData.length - 1].positive > 
                    sentimentTrendsData[sentimentTrendsData.length - 2].positive
                    ? t("sentiment.improving")
                    : t("sentiment.declining")
                  : t("sentiment.stable")
                }
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 border-l-2 border-green-500/30 pl-2">
              {t("sentiment.trendDirectionDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SentimentTab.displayName = "SentimentTab";

export default SentimentTab;