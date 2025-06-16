import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CirclePlus, TrendingDown, TrendingUp } from 'lucide-react';
import { getTrendIcon } from '@/lib/icon-utils';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { withRtl } from '@/lib/withRtl';

interface KpiProps {
  kpiData?: any[];
  isLoading?: boolean;
}

const KpiOverviewSection: React.FC<KpiProps> = ({ kpiData, isLoading }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Use memoization for the KPI data to prevent unnecessary re-renders
  const memorizedKpiData = useMemo(() => {
    return kpiData || [];
  }, [kpiData]);

  if (isLoading) {
    return (
      <Card className="col-span-full xl:col-span-8 shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full xl:col-span-8 shadow-md">
      <CardHeader>
        <CardTitle>{t('dashboard.kpi_overview.title')}</CardTitle>
        <CardDescription>
          {t('dashboard.kpi_overview.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {memorizedKpiData.map((kpi, index) => {
          const trendIcon = getTrendIcon(kpi.change);
          return (
            <Card key={index} className="shadow-sm">
              <CardHeader className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                <CardDescription>{kpi.name}</CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{kpi.value}%</CardTitle>
                  {trendIcon}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Progress 
                  value={kpi.value} 
                  className="h-2 mb-2" 
                  indicatorClassName={
                    kpi.value >= 70 ? "bg-success" : 
                    kpi.value >= 50 ? "bg-warning" : 
                    "bg-destructive"
                  } 
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t('dashboard.kpi_overview.target')}: {kpi.target}%
                  </span>
                  <span className={`flex items-center gap-1 text-sm ${kpi.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {kpi.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default withRtl(KpiOverviewSection);