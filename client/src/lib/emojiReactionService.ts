import { useTranslation } from 'react-i18next';

export interface KpiEmojiReaction {
  emoji: string;
  message: string;
  intensity: 'positive' | 'neutral' | 'negative';
}

/**
 * Generate an emoji reaction based on KPI performance
 * @param category KPI category name
 * @param current Current KPI value
 * @param target Target KPI value
 * @returns An emoji reaction object
 */
export function generateKpiEmojiReaction(
  category: string,
  current: number,
  target: number
): KpiEmojiReaction {
  // Calculate the performance ratio
  const ratio = target > 0 ? current / target : 0;

  // Get category-specific emoji
  const emoji = getCategorySpecificEmoji(category, ratio);

  // Determine the reaction intensity and message key
  let intensity: 'positive' | 'neutral' | 'negative';
  let messageKey: string;

  if (ratio >= 1) {
    intensity = 'positive';
    messageKey = 'exceptional';
  } else if (ratio >= 0.9) {
    intensity = 'positive';
    messageKey = 'excellent';
  } else if (ratio >= 0.8) {
    intensity = 'positive';
    messageKey = 'onTrack';
  } else if (ratio >= 0.7) {
    intensity = 'neutral';
    messageKey = 'progressing';
  } else if (ratio >= 0.6) {
    intensity = 'neutral';
    messageKey = 'needsAttention';
  } else if (ratio >= 0.5) {
    intensity = 'negative';
    messageKey = 'belowTarget';
  } else if (ratio >= 0.3) {
    intensity = 'negative';
    messageKey = 'significantGap';
  } else {
    intensity = 'negative';
    messageKey = 'critical';
  }

  // Build reaction object
  return {
    emoji,
    message: messageKey, // This will be translated in the hook
    intensity
  };
}

/**
 * Generate category-specific emoji based on KPI domain
 * @param category KPI category name
 * @param ratio Performance ratio
 * @returns A category-specific emoji
 */
export function getCategorySpecificEmoji(category: string, ratio: number): string {
  // Normalize the category name
  const normalizedCategory = category.toLowerCase().trim();

  // First, check for specific high-priority categories with custom emojis
  if (normalizedCategory.includes('communication') || normalizedCategory.includes('التواصل')) {
    return ratio >= 0.8 ? '📣' : ratio >= 0.5 ? '🗣️' : '📞';
  }
  
  if (normalizedCategory.includes('innovation') || normalizedCategory.includes('ابتكار')) {
    return ratio >= 0.8 ? '💡' : ratio >= 0.5 ? '🔍' : '🧩';
  }
  
  if (normalizedCategory.includes('data') || normalizedCategory.includes('البيانات') || normalizedCategory.includes('knowledge') || normalizedCategory.includes('المعرفة')) {
    return ratio >= 0.8 ? '📊' : ratio >= 0.5 ? '📈' : '📉';
  }
  
  if (normalizedCategory.includes('digital') || normalizedCategory.includes('الرقمي')) {
    return ratio >= 0.8 ? '💻' : ratio >= 0.5 ? '🖥️' : '📱';
  }
  
  if (normalizedCategory.includes('sentiment') || normalizedCategory.includes('المشاعر')) {
    return ratio >= 0.8 ? '😃' : ratio >= 0.5 ? '😐' : '😔';
  }
  
  if (normalizedCategory.includes('engagement') || normalizedCategory.includes('التفاعل')) {
    return ratio >= 0.8 ? '👏' : ratio >= 0.5 ? '👋' : '✋';
  }
  
  if (normalizedCategory.includes('media') || normalizedCategory.includes('وسائل الإعلام')) {
    return ratio >= 0.8 ? '📰' : ratio >= 0.5 ? '📺' : '📻';
  }
  
  if (normalizedCategory.includes('smart') || normalizedCategory.includes('ذكي')) {
    return ratio >= 0.8 ? '🤖' : ratio >= 0.5 ? '⚙️' : '🔧';
  }
  
  // Default emojis based on performance level
  if (ratio >= 0.9) return '🌟';
  if (ratio >= 0.8) return '⭐';
  if (ratio >= 0.7) return '👍';
  if (ratio >= 0.6) return '👌';
  if (ratio >= 0.5) return '🔍';
  if (ratio >= 0.4) return '⚠️';
  if (ratio >= 0.3) return '❗';
  
  return '🚨';
}

export function useKpiEmojiReaction() {
  const { t } = useTranslation();
  
  const generateReaction = (category: string, current: number, target: number): KpiEmojiReaction => {
    const reaction = generateKpiEmojiReaction(category, current, target);
    
    // Translate the message
    return {
      ...reaction,
      message: t(`emojiReactions.${reaction.message}`)
    };
  };
  
  return { generateReaction };
}