import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/**
 * Calendar component wrapping react-day-picker with custom styling and navigation icons.
 */
export interface CalendarProps extends DayPickerProps {
  /** Tailwind classes to apply to the root container */
  className?: string;
  /** Override or extend default class names for DayPicker elements */
  classNames?: Partial<Record<keyof DayPickerProps['classNames'], string>>;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => {
    // Default Tailwind classes for various DayPicker parts
    const defaultClassNames: NonNullable<CalendarProps['classNames']> = {
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
      month: 'space-y-4',
      caption: 'relative flex items-center justify-center pt-1',
      caption_label: 'text-sm font-medium',
      nav: 'flex items-center space-x-1',
      nav_button: cn(
        buttonVariants({ variant: 'outline', size: 'icon' }),
        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
      ),
      nav_button_previous: 'absolute left-1',
      nav_button_next: 'absolute right-1',
      table: 'w-full border-collapse space-y-1',
      head_row: 'flex',
      head_cell: 'text-muted-foreground w-9 text-[0.8rem] font-normal rounded-md',
      row: 'flex w-full mt-2',
      cell: cn(
        'relative flex h-9 w-9 items-center justify-center',
        'focus-within:z-20 focus-within:relative'
      ),
      day: cn(
        buttonVariants({ variant: 'ghost' }),
        'h-full w-full p-0 font-normal aria-selected:opacity-100'
      ),
      day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
      day_today: 'bg-accent text-accent-foreground',
      day_outside: 'text-muted-foreground',
      day_disabled: 'text-muted-foreground opacity-50',
      day_range_middle: 'bg-accent text-accent-foreground',
      day_range_end: 'day-range-end',
      day_hidden: 'invisible',
    };

    return (
      <DayPicker
        ref={ref}
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={{ ...defaultClassNames, ...classNames }}
        components={{
          IconLeft: ({ className: iconCls, ...p }) => (
            <ChevronLeft className={cn('h-4 w-4', iconCls)} {...p} aria-label="Previous month" />
          ),
          IconRight: ({ className: iconCls, ...p }) => (
            <ChevronRight className={cn('h-4 w-4', iconCls)} {...p} aria-label="Next month" />
          ),
        }}
        {...props}
      />
    );
  }
);

Calendar.displayName = 'Calendar';
