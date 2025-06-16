import { TFunction } from "i18next";

/**
 * Get the CSS class for a sentiment score
 * @param sentiment - Sentiment score or label
 * @returns CSS class string for styling
 */
export const getSentimentClass = (sentiment: number | string | null | undefined) => {
  // Handle both string and number sentiment values
  let score: number;
  if (typeof sentiment === 'string') {
    // If it's a string like "positive", "neutral", "negative"
    if (sentiment === "positive") return "bg-green-500 bg-opacity-10 text-green-500";
    if (sentiment === "neutral") return "bg-yellow-500 bg-opacity-10 text-yellow-500";
    if (sentiment === "negative") return "bg-red-500 bg-opacity-10 text-red-500";
    // Try to convert numeric string to number
    score = parseFloat(sentiment) || 0;
  } else {
    score = sentiment ?? 0;
  }
  
  if (score >= 4) return "bg-green-500 bg-opacity-10 text-green-500";
  if (score >= 3) return "bg-yellow-500 bg-opacity-10 text-yellow-500";
  return "bg-red-500 bg-opacity-10 text-red-500";
};

/**
 * Get a translated sentiment label for a sentiment score
 * @param sentiment - Sentiment score or label
 * @param t - Translation function
 * @returns Translated sentiment label
 */
export const getSentimentText = (sentiment: number | string | null | undefined, t: TFunction) => {
  // Handle both string and number sentiment values
  if (typeof sentiment === 'string') {
    // If it's already a text sentiment
    if (sentiment === "positive") return t('analysis.positive');
    if (sentiment === "neutral") return t('analysis.neutral');
    if (sentiment === "negative") return t('analysis.negative');
    // Try to convert numeric string to number
    const score = parseFloat(sentiment) || 0;
    if (score >= 4) return t('analysis.positive');
    if (score >= 3) return t('analysis.neutral');
    return t('analysis.negative');
  }
  
  const score = sentiment ?? 0;
  if (score >= 4) return t('analysis.positive');
  if (score >= 3) return t('analysis.neutral');
  return t('analysis.negative');
};

/**
 * Format a date relative to now
 * @param date - Date to format
 * @param t - Translation function
 * @param locale - Locale for date formatting
 * @returns Formatted date string
 */
export const formatRelativeDate = (
  date: Date | string | null | undefined, 
  t: TFunction,
  locale: string = 'en'
) => {
  if (!date) {
    return t('monitoring.timeUnknown', 'Unknown time');
  }
  
  const dateObj = new Date(date);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return t('monitoring.timeUnknown', 'Unknown time');
  }
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return t('monitoring.justNow', 'Just now');
  } else if (diffMins < 60) {
    return t('monitoring.minutesAgo', { count: diffMins });
  } else if (diffHours < 24) {
    return t('monitoring.hoursAgo', { hours: diffHours });
  } else if (diffDays < 7) {
    return t('monitoring.daysAgo', { count: diffDays });
  } else {
    return dateObj.toLocaleDateString(locale);
  }
};