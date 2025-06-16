import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube,
  AlertCircle 
} from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { IconType } from 'react-icons';
import { LucideIcon } from 'lucide-react';

// Define platform type
type Platform = {
  id: string;
  name: string;
  icon: LucideIcon | IconType;
  color: string;
  bgColor: string;
};

// Define social icon props
interface SocialIconProps {
  platform: string;
  icon: LucideIcon | IconType;
  count: number;
  color: string;
  bgColor: string;
}

// Define platforms directly
const PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: 'text-black dark:text-white',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  }
];

// Component for individual social media icon with activity indicator
const SocialIcon: React.FC<SocialIconProps> = ({ 
  platform, 
  icon: Icon, 
  count,
  color,
  bgColor 
}) => {
  return (
    <div className="flex flex-col items-center mx-2">
      <div className="relative p-2 rounded-full">
        <div className={`absolute inset-0 rounded-full ${bgColor}`}></div>
        <div className="relative">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <span className="mt-1 text-xs font-medium">{platform}</span>
      <span className="text-[10px] text-gray-500">{count} posts</span>
    </div>
  );
};

// Define platform stats type
interface PlatformStat {
  platform: string;
  count: number; 
}

/**
 * A simplified Social Media Icons component
 * Uses the SafeWebSocketProvider to avoid WebSocketProvider context errors
 */
const SocialMediaIcons: React.FC = () => {
  // Using static data for now
  const platformStats: PlatformStat[] = [
    { platform: 'twitter', count: 12 },
    { platform: 'facebook', count: 8 },
    { platform: 'instagram', count: 15 },
    { platform: 'youtube', count: 5 },
    { platform: 'tiktok', count: 9 }
  ];

  return (
    <div className="social-icons-container bg-gray-50 dark:bg-gray-900 rounded-md p-2">
      <div className="flex justify-center items-center flex-wrap gap-x-2 gap-y-3">
        {PLATFORMS.map((platform) => {
          // Find the matching stat for this platform
          const stat = platformStats.find(
            (s) => s.platform.toLowerCase() === platform.id.toLowerCase()
          );
          
          const count = stat ? stat.count : 0;
          
          return (
            <SocialIcon 
              key={platform.id}
              platform={platform.name} 
              icon={platform.icon} 
              count={count}
              color={platform.color}
              bgColor={platform.bgColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaIcons;