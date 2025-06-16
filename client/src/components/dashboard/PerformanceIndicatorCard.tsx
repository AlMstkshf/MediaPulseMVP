import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { getChangeIndicator } from '@/lib/icon-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceIndicatorCardProps {
  title: string;
  value: number;
  max?: number;
  target?: number;
  change?: number;
  isInverted?: boolean;
  unit?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * A compact card for displaying a single performance indicator with progress, value, and change trend
 */
const PerformanceIndicatorCard: React.FC<PerformanceIndicatorCardProps> = ({
  title,
  value,
  max = 100,
  target,
  change = 0,
  isInverted = false,
  unit = '%',
  isLoading = false,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  // Calculate the progress percentage for the progress bar
  const progressPercentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Get the appropriate icon and color based on the change value
  const { icon: changeIcon, className: changeClass } = getChangeIndicator(change, isInverted);
  
  if (isLoading) {
    return (
      <Card className={`overflow-hidden h-full ${className}`}>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-5 w-28" />
        </CardContent>
      </Card>
    );
  }
  
  // Determine progress color based on value relative to target
  const getProgressColor = () => {
    if (!target) return 'bg-primary';
    
    if (isInverted) {
      // For metrics where lower is better (e.g., response time)
      return value <= target * 0.8 ? 'bg-success' : 
             value <= target ? 'bg-warning' : 
             'bg-destructive';
    } else {
      // For metrics where higher is better (e.g., engagement)
      return value >= target * 1.2 ? 'bg-success' : 
             value >= target ? 'bg-warning' : 
             'bg-destructive';
    }
  };
  
  return (
    <Card className={`overflow-hidden h-full ${className}`}>
      <CardContent className={`p-4 space-y-3 ${isRtl ? 'text-right' : ''}`}>
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2"
          // Apply color based on performance compared to target
          style={{ 
            '--progress-foreground': `var(--${getProgressColor()})`,
          } as React.CSSProperties}
        />
        
        <div className="flex items-center justify-between text-sm">
          {target && (
            <span className="text-muted-foreground">
              {t('common.target')}: {target}{unit}
            </span>
          )}
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${changeClass}`}>
              {changeIcon}
              <span>{change > 0 ? '+' : ''}{change}{unit}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceIndicatorCard;