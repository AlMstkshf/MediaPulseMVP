import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addDays, format, isSameDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date;
  type?: 'default' | 'important' | 'reminder';
}

export interface CalendarWidgetProps {
  className?: string;
  variant?: 'default' | 'card' | 'inline';
  showCurrentMonth?: boolean;
  showEvents?: boolean;
  events?: CalendarEvent[];
  onSelectDate?: (date: Date | undefined) => void;
}

/**
 * CalendarWidget component: date picker with optional event listing.
 */
export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  className,
  variant = 'default',
  showCurrentMonth = true,
  showEvents = false,
  events = [],
  onSelectDate,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);

  const locale = useMemo(
    () => (i18n.language.startsWith('ar') ? ar : enUS),
    [i18n.language]
  );

  const formattedDate = useCallback(
    (date?: Date) => (date ? format(date, 'PPP', { locale }) : ''),
    [locale]
  );

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      setPopoverOpen(false);
      onSelectDate?.(date);
    },
    [onSelectDate]
  );

  const todayEvents = useMemo(() => {
    if (!selectedDate || !showEvents) return [];
    return events.filter((evt) => isSameDay(evt.date, selectedDate));
  }, [events, selectedDate, showEvents]);

  const badgeVariantFor = useCallback((type?: string) => {
    switch (type) {
      case 'important':
        return 'destructive';
      case 'reminder':
        return 'secondary';
      default:
        return 'outline';
    }
  }, []);

  const renderCalendar = () => (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        locale={locale}
        className="rounded-md border"
      />
      {showEvents && todayEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {t('calendar.eventsForDate', { date: formattedDate(selectedDate) })}
          </h3>
          <ul className="space-y-1">
            {todayEvents.map((evt) => (
              <li
                key={evt.id}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{evt.title}</span>
                <Badge variant={badgeVariantFor(evt.type)}>
                  {format(evt.date, 'HH:mm')}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Card variant
  if (variant === 'card') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {t('calendar.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderCalendar()}</CardContent>
      </Card>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return <div className={cn('w-full', className)}>{renderCalendar()}</div>;
  }

  // Default with popover
  return (
    <div className={cn('flex flex-col', className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? formattedDate(selectedDate)
              : t('calendar.pickDate')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {renderCalendar()}
        </PopoverContent>
      </Popover>

      {showCurrentMonth && (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const base = selectedDate || new Date();
            const day = addDays(
              new Date(base.getFullYear(), base.getMonth(), 1),
              i
            );
            return (
              <div
                key={i}
                className="h-9 w-9 flex items-center justify-center text-xs rounded-md"
              >
                {format(day, 'E', { locale })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
