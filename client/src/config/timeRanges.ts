/**
 * Time range configurations for filtering data
 */

export interface TimeRange {
  id: string;
  label: string;
  days: number;
  description?: string;
}

/**
 * Standard time ranges for filtering data
 */
export const TIME_RANGES: TimeRange[] = [
  {
    id: 'today',
    label: 'Today',
    days: 1,
    description: 'Data from today only'
  },
  {
    id: 'week',
    label: 'This Week',
    days: 7,
    description: 'Data from the last 7 days'
  },
  {
    id: 'month',
    label: 'This Month',
    days: 30,
    description: 'Data from the last 30 days'
  },
  {
    id: 'quarter',
    label: 'This Quarter',
    days: 90,
    description: 'Data from the last 90 days'
  },
  {
    id: 'halfYear',
    label: 'Last 6 Months',
    days: 180,
    description: 'Data from the last 180 days'
  },
  {
    id: 'year',
    label: 'This Year',
    days: 365,
    description: 'Data from the last 365 days'
  }
];

/**
 * Default time range to use
 */
export const DEFAULT_TIME_RANGE = TIME_RANGES[2]; // This Month (30 days)

/**
 * Find a time range by its ID
 * 
 * @param id The ID of the time range to find
 * @returns The time range or the default time range if not found
 */
export function getTimeRangeById(id: string): TimeRange {
  return TIME_RANGES.find(range => range.id === id) || DEFAULT_TIME_RANGE;
}

/**
 * Get date range (startDate, endDate) from a time range
 * 
 * @param timeRange The time range or time range ID 
 * @returns Object with startDate and endDate as ISO strings
 */
export function getDateRangeFromTimeRange(timeRange: TimeRange | string): { startDate: string, endDate: string } {
  const range = typeof timeRange === 'string' ? getTimeRangeById(timeRange) : timeRange;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - range.days);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}