import {
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  // TikTok is not available in lucide-react, using custom icon or alternative
  Music2, // Using Music2 as a replacement for TikTok
  Globe,
  MessageSquare
} from 'lucide-react';

/**
 * Social media platform configurations
 */

// Platform colors for UI elements
export const PLATFORM_COLORS = {
  twitter: 'text-sky-500',
  x: 'text-sky-500', // For Twitter/X migration
  instagram: 'text-pink-500',
  facebook: 'text-blue-600',
  linkedin: 'text-blue-700',
  reddit: 'text-orange-500',
  youtube: 'text-red-600',
  tiktok: 'text-slate-800',
  news: 'text-emerald-600',
  default: 'text-gray-500',
};

// Platform icons for UI elements
export const PLATFORM_ICONS = {
  twitter: Twitter,
  x: Twitter, // For Twitter/X migration
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2, // Using Music2 as TikTok replacement
  news: Globe,
  default: MessageSquare,
};

/**
 * Get platform color based on platform name
 * 
 * @param platform Platform name (lowercase)
 * @returns CSS class for text color
 */
export function getPlatformColor(platform?: string): string {
  if (!platform) return PLATFORM_COLORS.default;
  
  const key = platform.toLowerCase();
  return PLATFORM_COLORS[key as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.default;
}

/**
 * Get platform icon component based on platform name
 * 
 * @param platform Platform name (lowercase)
 * @returns Icon component
 */
export function getPlatformIcon(platform?: string): React.ElementType {
  if (!platform) return PLATFORM_ICONS.default;
  
  const key = platform.toLowerCase();
  return PLATFORM_ICONS[key as keyof typeof PLATFORM_ICONS] || PLATFORM_ICONS.default;
}

/**
 * Platform display names
 */
export const PLATFORM_NAMES = {
  twitter: 'Twitter',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  news: 'News Media',
};

/**
 * Get platform display name
 * 
 * @param platform Platform name (lowercase)
 * @returns Display name with proper capitalization
 */
export function getPlatformDisplayName(platform?: string): string {
  if (!platform) return 'Unknown';
  
  const key = platform.toLowerCase();
  return PLATFORM_NAMES[key as keyof typeof PLATFORM_NAMES] || 
    // Capitalize first letter if not found in mapping
    platform.charAt(0).toUpperCase() + platform.slice(1);
}