import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ChevronRight, Building2, BarChart3, Loader2 } from 'lucide-react';

interface EntityMentionsWidgetProps {
  data?: any;
  settings?: {
    timeRange?: string;
    limit?: number;
    view?: 'chart' | 'list';
  };
}

// Sample data for preview
const sampleEntities = [
  { id: 1, name: 'Ajman Police Department', mentions: 145, sentiment: 0.78 },
  { id: 2, name: 'Ajman Municipality', mentions: 120, sentiment: 0.62 },
  { id: 3, name: 'Department of Economic Development', mentions: 95, sentiment: 0.45 },
  { id: 4, name: 'Ajman Tourism', mentions: 82, sentiment: 0.37 },
  { id: 5, name: 'Transport Authority', mentions: 67, sentiment: 0.29 }
];

const EntityMentionsWidget: React.FC<EntityMentionsWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(settings.timeRange || '30');
  const [view, setView] = useState(settings.view || 'list'); // Changed default to list to minimize text conflicts
  const limit = settings.limit || 5;
  const [chartData, setChartData] = useState<any[]>([]);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['/api/gov-entities/mentions', timeRange],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: false // Disable real API call for now
  });

  // Use sample data for the demo
  useEffect(() => {
    // In a real app, this would use the API data
    setChartData(sampleEntities);
  }, [timeRange]);

  // Helper to get sentiment color class
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return '#22C55E'; // green
    if (sentiment >= 0.4) return '#84CC16'; // lime
    if (sentiment >= 0.3) return '#EAB308'; // yellow
    if (sentiment >= 0.2) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  // Get the initials from a name
  const getInitials = (name: string) => {
    if (!name) return 'EN';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format long entity names for chart
  const formatEntityName = (name: string) => {
    return name.length > 12 ? `${name.substring(0, 12)}...` : name;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base truncate">{t('entity.monitoring')}</CardTitle>
          <div className="flex gap-2">
            <Select value={view} onValueChange={setView as any}>
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">{t('common.chart')}</SelectItem>
                <SelectItem value="list">{t('common.list')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('dashboard.last7Days')}</SelectItem>
                <SelectItem value="30">{t('dashboard.last30Days')}</SelectItem>
                <SelectItem value="90">{t('dashboard.last90Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[220px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
            <Building2 className="h-12 w-12 mb-2 opacity-20" />
            <p>{t('entity.noMentionsData')}</p>
          </div>
        ) : view === 'chart' ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(0, limit).map(entity => ({
                  ...entity,
                  formattedName: formatEntityName(entity.name)
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickCount={5} />
                <YAxis 
                  type="category" 
                  dataKey="formattedName" 
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any) => [value, t('entity.metrics.totalMentions')]} 
                  labelFormatter={(label: any) => {
                    const entity = chartData.find(e => formatEntityName(e.name) === label);
                    return entity ? entity.name : label;
                  }}
                />
                <Bar dataKey="mentions" name={t('entity.metrics.totalMentions')} radius={[0, 4, 4, 0]}>
                  {chartData.slice(0, limit).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment || 0)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ul className="space-y-3">
            {chartData.slice(0, limit).map((entity: any) => (
              <li key={entity.id} className="flex items-center gap-2">
                <Avatar className="h-9 w-9 border">
                  {entity.iconUrl ? (
                    <AvatarImage src={entity.iconUrl} alt={entity.name} />
                  ) : (
                    <AvatarFallback>{getInitials(entity.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/entity-monitoring/${entity.id}`}>
                    <div className="font-medium hover:text-primary cursor-pointer truncate text-sm">
                      {entity.name}
                    </div>
                  </Link>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {entity.mentions} {t('dashboard.mentions')}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="bg-opacity-10 text-xs whitespace-nowrap"
                  style={{ 
                    backgroundColor: `${getSentimentColor(entity.sentiment || 0)}20`,
                    color: getSentimentColor(entity.sentiment || 0),
                    borderColor: `${getSentimentColor(entity.sentiment || 0)}40`
                  }}
                >
                  {(entity.sentiment >= 0.6) ? t('entity.sentiment.positive') :
                   (entity.sentiment >= 0.4) ? t('common.neutral') : 
                   t('entity.sentiment.negative')}
                </Badge>
              </li>
            ))}
            
            <div className="pt-1 text-center">
              <Link href="/entity-monitoring">
                <Button variant="ghost" size="sm">
                  {t('common.viewAll')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityMentionsWidget;