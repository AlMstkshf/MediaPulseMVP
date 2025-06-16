import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SocialEngagementWidgetProps {
  data?: any;
  settings?: {
    timeRange?: string;
    platforms?: string[];
  };
}

const SocialEngagementWidget: React.FC<SocialEngagementWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(settings.timeRange || '30');
  
  const { data: socialMediaData, isLoading } = useQuery({
    queryKey: ['/api/social-posts/engagement', timeRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Data transformation for chart
  const transformData = (data: any) => {
    if (!data) return [];
    
    return data.map((item: any) => ({
      name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      twitter: item.twitter || 0,
      facebook: item.facebook || 0,
      instagram: item.instagram || 0,
    }));
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-base">{t('dashboard.socialMediaEngagement')}</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] h-8">
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
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : (
          <div className="h-[240px]">
            <Tabs defaultValue="engagement">
              <TabsList className="mb-2">
                <TabsTrigger value="engagement">{t('socialMedia.engagement')}</TabsTrigger>
                <TabsTrigger value="reach">{t('socialMedia.reach')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="engagement" className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transformData(socialMediaData)}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="facebook" stroke="#4267B2" name="Facebook" />
                    <Line type="monotone" dataKey="instagram" stroke="#C13584" name="Instagram" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="reach" className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transformData(socialMediaData)}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="facebook" stroke="#4267B2" name="Facebook" />
                    <Line type="monotone" dataKey="instagram" stroke="#C13584" name="Instagram" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialEngagementWidget;