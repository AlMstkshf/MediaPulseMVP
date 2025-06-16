import { TFunction } from "i18next";

/**
 * Get a translated label for a media type
 * @param type The media type
 * @param t Translation function
 * @returns Translated media type label
 */
export const getMediaTypeLabel = (type: string, t: TFunction) => {
  switch (type) {
    case "image": return t('mediaCenter.image');
    case "video": return t('mediaCenter.video');
    case "document": return t('mediaCenter.document');
    default: return type;
  }
};

/**
 * Get a translated label for a category
 * @param category The category
 * @param t Translation function
 * @returns Translated category label
 */
export const getCategoryLabel = (category: string, t: TFunction) => {
  switch (category) {
    case "projects": return t('mediaCenter.projects');
    case "events": return t('mediaCenter.events');
    case "reports": return t('mediaCenter.reports');
    case "news": return t('mediaCenter.news');
    default: return category;
  }
};

/**
 * Get a human-readable time since a date
 * @param date The date
 * @param t Translation function
 * @returns Formatted time string
 */
export const getTimeSince = (date: Date, t: TFunction) => {
  const days = Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 7) {
    return `${Math.floor(days / 7)} ${t('mediaCenter.weeks')}`;
  }
  return `${days} ${t('mediaCenter.days')}`;
};