import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { withRtl } from '@/lib/withRtl';
import { getChangeIndicator } from '@/lib/icon-utils';

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  isInverted?: boolean;
}

interface StatsGridProps {
  stats: StatItem[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * A responsive grid of statistic cards with icons, values, and change indicators
 */
const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  isLoading = false,
  columns = 4,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  // Determine grid columns based on props
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];
  
  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-4 ${className}`}>
        {Array(columns).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {stats.map((stat) => {
        // Get the change indicator icon and class if change is provided
        const changeIndicator = stat.change !== undefined 
          ? getChangeIndicator(stat.change, stat.isInverted)
          : null;
        
        return (
          <Card key={stat.id} className="overflow-hidden">
            <CardContent className={`p-6 space-y-4 ${isRtl ? 'text-right' : ''}`}>
              <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                
                {changeIndicator && (
                  <div className={`flex items-center gap-1 ${changeIndicator.className}`}>
                    {changeIndicator.icon}
                    <span className="text-sm">
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  {stat.title}
                </p>
              </div>
              
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default withRtl(StatsGrid);