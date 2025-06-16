import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SocialMediaTrendsWidgetProps {
  data?: any;
  settings?: {
    timeRange?: string;
    defaultView?: string;
  };
}

// Sample data for preview
const sampleDistributionData = [
  { platform: 'twitter', count: 45 },
  { platform: 'facebook', count: 28 },
  { platform: 'instagram', count: 32 },
  { platform: 'linkedin', count: 15 }
];

const sampleEngagementData = [
  { platform: 'twitter', average: 24 },
  { platform: 'facebook', average: 18 },
  { platform: 'instagram', average: 42 },
  { platform: 'linkedin', average: 12 }
];

const samplePostingTimeData = [
  { hour: 9, count: 12 },
  { hour: 12, count: 18 },
  { hour: 15, count: 24 },
  { hour: 18, count: 32 },
  { hour: 21, count: 15 }
];

const SocialMediaTrendsWidget: React.FC<SocialMediaTrendsWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(settings.timeRange || '30');
  const [view, setView] = useState(settings.defaultView || 'distribution');
  const [chartData, setChartData] = useState({
    distribution: [],
    engagement: [],
    timing: []
  });
  
  const { data: socialStats, isLoading } = useQuery({
    queryKey: ['/api/social-posts/stats', timeRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable real API call for now
  });

  // Platform colors
  const PLATFORM_COLORS = {
    twitter: '#1DA1F2',
    facebook: '#4267B2',
    instagram: '#C13584',
    linkedin: '#0077B5',
    news: '#FF6B00',
    other: '#718096'
  };

  // Use sample data for the demo
  useEffect(() => {
    // Transform distribution data for pie chart
    const distributionData = sampleDistributionData.map(item => ({
      name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      value: item.count,
      color: PLATFORM_COLORS[item.platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.other
    }));

    // Transform engagement data for bar chart
    const engagementData = sampleEngagementData.map(item => ({
      name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      value: item.average,
      color: PLATFORM_COLORS[item.platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.other
    }));

    // Transform posting time data for bar chart
    const postingTimeData = samplePostingTimeData.map(item => ({
      name: `${item.hour}:00`,
      value: item.count,
      color: '#3182CE'
    }));

    setChartData({
      distribution: distributionData,
      engagement: engagementData,
      timing: postingTimeData
    });
  }, [timeRange]);

  // Custom label function for pie chart that limits text length
  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    const shortName = name.length > 8 ? `${name.substring(0, 5)}...` : name;
    return `${shortName} ${(percent * 100).toFixed(0)}%`;
  };
  
  // Custom styling for Recharts components
  const getTextStyle = () => ({
    fill: getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#333',
    fontSize: '10px'
  });

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-base truncate">{t('socialMedia.socialMediaTrends')}</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('dashboard.last7Days')}</SelectItem>
              <SelectItem value="30">{t('dashboard.last30Days')}</SelectItem>
              <SelectItem value="90">{t('dashboard.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[220px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : (
          <div className="h-[220px]">
            <Tabs value={view} onValueChange={setView} className="h-full">
              <TabsList className="mb-2 w-full justify-between">
                <TabsTrigger value="distribution" className="text-xs">
                  {t('socialMedia.platforms')}
                </TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs">
                  {t('socialMedia.engagement')}
                </TabsTrigger>
                <TabsTrigger value="timing" className="text-xs">
                  {t('socialMedia.postTimes')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="distribution" className="h-[180px]">
                {chartData.distribution.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t('dashboard.noDataAvailable')}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderPieLabel}
                      >
                        {chartData.distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [value, t('dashboard.posts')]} />
                      <Legend iconSize={8} fontSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="engagement" className="h-[180px]">
                {chartData.engagement.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t('dashboard.noDataAvailable')}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.engagement} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => value.toString()} 
                        tick={getTextStyle()}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={60}
                        tick={getTextStyle()}
                        tickFormatter={(value) => value.length > 6 ? `${value.substring(0, 5)}...` : value}
                      />
                      <Tooltip formatter={(value: any) => [value, t('dashboard.averageEngagement')]} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.engagement.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="timing" className="h-[180px]">
                {chartData.timing.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t('dashboard.noDataAvailable')}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.timing} margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={getTextStyle()} />
                      <YAxis width={25} tick={getTextStyle()} />
                      <Tooltip formatter={(value: any) => [value, t('dashboard.posts')]} />
                      <Bar dataKey="value" fill="#3182CE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaTrendsWidget;