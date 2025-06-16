import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock as ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface ClockProps {
  /** Additional CSS classes */
  className?: string;
  /** Show clock icon */
  showIcon?: boolean;
  /** Show full date string */
  showDate?: boolean;
  /** Include seconds in display */
  showSeconds?: boolean;
  /** Display style variant */
  variant?: 'default' | 'card' | 'minimal';
}

/**
 * Clock component displaying current time and optional date.
 * Updates every second.
 */
export const Clock: React.FC<ClockProps> = ({
  className,
  showIcon = true,
  showDate = true,
  showSeconds = true,
  variant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' } : {}),
      hour12: false,
    };
    return now.toLocaleTimeString(i18n.language, options);
  }, [now, i18n.language, showSeconds]);

  const dateString = useMemo(() => {
    if (!showDate) return null;
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return now.toLocaleDateString(i18n.language, options);
  }, [now, i18n.language, showDate]);

  // CARD VARIANT
  if (variant === 'card') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4 text-center">
          {showIcon && <ClockIcon className="h-6 w-6 text-primary mb-2" aria-hidden />}
          <div className="text-2xl font-bold" aria-label={timeString}>
            {timeString}
          </div>
          {dateString && <div className="text-sm text-muted-foreground">{dateString}</div>}
        </CardContent>
      </Card>
    );
  }

  // MINIMAL VARIANT
  if (variant === 'minimal') {
    return (
      <div
        className={cn('flex items-center', className, isRTL && 'space-x-reverse')}
        aria-label={timeString}
      >
        {showIcon && <ClockIcon className="h-4 w-4 text-muted-foreground" aria-hidden />}
        <span className="text-sm font-medium">{timeString}</span>
      </div>
    );
  }

  // DEFAULT VARIANT
  return (
    <div className={cn('flex flex-col', className)} aria-label={timeString}>
      <div className={cn('flex items-center', isRTL && 'space-x-reverse')}>
        {showIcon && <ClockIcon className="h-5 w-5 text-primary" aria-hidden />}
        <span className="text-lg font-semibold ml-2">{timeString}</span>
      </div>
      {dateString && <span className="text-sm text-muted-foreground mt-1">{dateString}</span>}
    </div>
  );
};

Clock.displayName = 'Clock';
