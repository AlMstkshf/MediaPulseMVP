import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSentimentReports } from '@/hooks/use-sentiment';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { withRtl } from '@/lib/withRtl';
import { getSentimentColorClasses } from '@/lib/icon-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface SentimentAnalysisSectionProps {
  className?: string;
}

const SentimentAnalysisSection: React.FC<SentimentAnalysisSectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: sentimentReports, isLoading, error } = useSentimentReports();

  // Format data for chart using memoization to improve performance
  const chartData = useMemo(() => {
    if (!sentimentReports) return [];
    
    return sentimentReports.map(report => ({
      date: new Date(report.date).toLocaleDateString(),
      positive: report.positivePercentage,
      neutral: report.neutralPercentage,
      negative: report.negativePercentage,
      overall: report.overallSentiment,
    }));
  }, [sentimentReports]);

  // Calculate averages for the sentiment metrics
  const sentimentAverages = useMemo(() => {
    if (!chartData.length) return { positive: 0, neutral: 0, negative: 0, overall: 0 };
    
    const totals = chartData.reduce((acc, item) => {
      return {
        positive: acc.positive + item.positive,
        neutral: acc.neutral + item.neutral,
        negative: acc.negative + item.negative,
        overall: acc.overall + item.overall
      };
    }, { positive: 0, neutral: 0, negative: 0, overall: 0 });
    
    return {
      positive: Math.round(totals.positive / chartData.length),
      neutral: Math.round(totals.neutral / chartData.length),
      negative: Math.round(totals.negative / chartData.length),
      overall: Math.round(totals.overall / chartData.length)
    };
  }, [chartData]);

  // Get color classes for the overall sentiment
  const { textColor, bgColor } = getSentimentColorClasses(sentimentAverages.overall);

  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t('dashboard.sentiment_analysis.title')}</CardTitle>
          <CardDescription className="text-destructive">
            {t('common.error_loading_data')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t('common.please_try_again')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className={isRtl ? 'text-right' : ''}>
          {t('dashboard.sentiment_analysis.title')}
        </CardTitle>
        <CardDescription className={isRtl ? 'text-right' : ''}>
          {t('dashboard.sentiment_analysis.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-4 justify-around">
          <div className="text-center px-4 py-2 rounded-md bg-primary/10">
            <p className="font-medium">{t('dashboard.sentiment_analysis.positive')}</p>
            <p className="text-xl text-success">{sentimentAverages.positive}%</p>
          </div>
          <div className="text-center px-4 py-2 rounded-md bg-primary/10">
            <p className="font-medium">{t('dashboard.sentiment_analysis.neutral')}</p>
            <p className="text-xl text-muted-foreground">{sentimentAverages.neutral}%</p>
          </div>
          <div className="text-center px-4 py-2 rounded-md bg-primary/10">
            <p className="font-medium">{t('dashboard.sentiment_analysis.negative')}</p>
            <p className="text-xl text-destructive">{sentimentAverages.negative}%</p>
          </div>
          <div className={`text-center px-4 py-2 rounded-md ${bgColor}`}>
            <p className="font-medium">{t('dashboard.sentiment_analysis.overall')}</p>
            <p className={`text-xl ${textColor}`}>{sentimentAverages.overall}%</p>
          </div>
        </div>

        <Tabs defaultValue="line" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="line">{t('dashboard.sentiment_analysis.line_chart')}</TabsTrigger>
            <TabsTrigger value="area">{t('dashboard.sentiment_analysis.area_chart')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  reversed={isRtl}
                  tick={{ fontSize: 12 }} 
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '']}
                  labelFormatter={(label) => t('common.date', { date: label })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="positive" 
                  name={t('dashboard.sentiment_analysis.positive')} 
                  stroke="#10b981" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  name={t('dashboard.sentiment_analysis.neutral')} 
                  stroke="#6b7280" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="negative" 
                  name={t('dashboard.sentiment_analysis.negative')} 
                  stroke="#ef4444" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  name={t('dashboard.sentiment_analysis.overall')} 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="area" className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  reversed={isRtl}
                  tick={{ fontSize: 12 }} 
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '']}
                  labelFormatter={(label) => t('common.date', { date: label })}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  name={t('dashboard.sentiment_analysis.positive')} 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorPositive)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  name={t('dashboard.sentiment_analysis.neutral')} 
                  stroke="#6b7280" 
                  fillOpacity={1} 
                  fill="url(#colorNeutral)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  name={t('dashboard.sentiment_analysis.negative')} 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorNegative)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="overall" 
                  name={t('dashboard.sentiment_analysis.overall')} 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOverall)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default withRtl(SentimentAnalysisSection);