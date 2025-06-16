import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Youtube,
  Share2,
  Globe,
  TrendingUp
} from 'lucide-react';
import { SiTiktok, SiReddit } from 'react-icons/si';

/**
 * Interface for platform configuration
 */
export interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  hoverColor: string;
  apiEndpoint?: string;
  textColor?: string;
  description?: string;
}

/**
 * Platform configuration array
 */
const PLATFORMS: PlatformConfig[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    hoverColor: 'hover:bg-blue-200',
    apiEndpoint: '/api/twitter',
    description: 'Twitter activity monitoring'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    hoverColor: 'hover:bg-pink-200',
    apiEndpoint: '/api/instagram',
    description: 'Instagram activity monitoring'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    apiEndpoint: '/api/facebook',
    description: 'Facebook activity monitoring'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    apiEndpoint: '/api/linkedin',
    description: 'LinkedIn activity monitoring'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: 'text-black dark:text-white',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    hoverColor: 'hover:bg-gray-200 dark:hover:bg-gray-700',
    apiEndpoint: '/api/tiktok',
    description: 'TikTok activity monitoring'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: SiReddit,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    apiEndpoint: '/api/reddit',
    description: 'Reddit activity monitoring'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
    apiEndpoint: '/api/youtube',
    description: 'YouTube activity monitoring'
  },
  {
    id: 'forum',
    name: 'Forums',
    icon: MessageCircle,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    apiEndpoint: '/api/forums',
    description: 'Online forum monitoring'
  },
  {
    id: 'news',
    name: 'News',
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
    apiEndpoint: '/api/news',
    description: 'News source monitoring'
  },
  {
    id: 'trending',
    name: 'Trending',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    apiEndpoint: '/api/trending',
    description: 'Trending topics monitoring'
  }
];

/**
 * Get platform config by ID
 * @param id Platform ID
 * @returns Platform config or undefined if not found
 */
export function getPlatformById(id: string): PlatformConfig | undefined {
  return PLATFORMS.find(platform => platform.id.toLowerCase() === id.toLowerCase());
}

/**
 * Get platform icon component by ID
 * @param id Platform ID
 * @returns React component or default icon
 */
export function getPlatformIcon(id: string): React.ComponentType<any> {
  const platform = getPlatformById(id);
  return platform?.icon || Share2; // Default icon
}

/**
 * Get platform color by ID
 * @param id Platform ID
 * @returns Color class or default color
 */
export function getPlatformColor(id: string): string {
  const platform = getPlatformById(id);
  return platform?.color || 'text-gray-500'; // Default color
}

/**
 * Get platform background color by ID
 * @param id Platform ID
 * @returns Background color class or default
 */
export function getPlatformBgColor(id: string): string {
  const platform = getPlatformById(id);
  return platform?.bgColor || 'bg-gray-100'; // Default bg color
}

/**
 * Initialize activity data map from platform configurations
 * @returns ActivityDataMap with all platforms initialized
 */
export function initializeActivityData() {
  const activityData: Record<string, { count: number; active: boolean; lastUpdate: Date }> = {};
  
  PLATFORMS.forEach(platform => {
    activityData[platform.id] = {
      count: 0,
      active: false,
      lastUpdate: new Date()
    };
  });
  
  return activityData;
}

/**
 * Get platform display name by ID
 * @param id Platform ID
 * @returns Display name or ID if not found
 */
export function getPlatformDisplayName(id: string): string {
  const platform = getPlatformById(id);
  return platform?.name || id;
}

/**
 * Map of platform icons for quick lookup
 */
export const PLATFORM_ICONS: Record<string, React.ComponentType<any>> = {};

/**
 * Map of platform names for quick lookup
 */
export const PLATFORM_NAMES: Record<string, string> = {};

/**
 * Map of platform colors for quick lookup
 */
export const PLATFORM_COLORS: Record<string, string> = {};

// Initialize the lookup maps
PLATFORMS.forEach(platform => {
  PLATFORM_ICONS[platform.id] = platform.icon;
  PLATFORM_NAMES[platform.id] = platform.name;
  PLATFORM_COLORS[platform.id] = platform.color;
});

export default PLATFORMS;