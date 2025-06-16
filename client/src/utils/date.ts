/**
 * Date formatting and utility functions
 */

/**
 * Format a date to a localized date string
 * 
 * @param date Date string or Date object to format
 * @param options Intl.DateTimeFormatOptions for customizing the format
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago", "5 days ago")
 * 
 * @param date Date string or Date object to format
 * @returns Relative time string
 */
export function formatRelative(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Less than a month
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Less than a year
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a date to a time string (e.g., "14:30")
 * 
 * @param date Date string or Date object to format
 * @returns Formatted time string
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Check if a date is today
 * 
 * @param date Date string or Date object to check
 * @returns Boolean indicating if the date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Format a date range to a string (e.g., "Jan 1 - Jan 5, 2025")
 * 
 * @param startDate Start date string or Date object
 * @param endDate End date string or Date object
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // If same year
  if (start.getFullYear() === end.getFullYear()) {
    // If same month
    if (start.getMonth() === end.getMonth()) {
      return `${formatDate(start, { month: 'short', day: 'numeric' })} - ${formatDate(end, {
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    // Different months, same year
    return `${formatDate(start, { month: 'short', day: 'numeric' })} - ${formatDate(end, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }
  
  // Different years
  return `${formatDate(start, { month: 'short', day: 'numeric', year: 'numeric' })} - ${formatDate(
    end,
    { month: 'short', day: 'numeric', year: 'numeric' }
  )}`;
}