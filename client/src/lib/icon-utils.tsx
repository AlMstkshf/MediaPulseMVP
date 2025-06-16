import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Minus,
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Returns the appropriate trend icon based on the change value
 * @param change - The change value (positive for increase, negative for decrease)
 * @param additionalClasses - Additional CSS classes to apply to the icon
 * @returns JSX element with the appropriate trend icon
 */
export const getTrendIcon = (change: number, additionalClasses: string = '') => {
  if (change > 0) {
    return <TrendingUp className={cn("w-4 h-4 text-green-500", additionalClasses)} />;
  } else if (change < 0) {
    return <TrendingDown className={cn("w-4 h-4 text-red-500", additionalClasses)} />;
  } else {
    return <Minus className={cn("w-4 h-4 text-gray-500", additionalClasses)} />;
  }
};

/**
 * Returns the appropriate change indicator icon and style based on the change value
 * @param change - The change value (positive for increase, negative for decrease)
 * @param isInverted - Whether to invert the color logic (e.g., for metrics where decrease is good)
 * @returns Object containing the icon component and CSS class
 */
export const getChangeIndicator = (change: number, isInverted: boolean = false) => {
  // For metrics where decrease is good (e.g., response time), we invert the color logic
  const isPositive = isInverted ? change < 0 : change > 0;
  const isNegative = isInverted ? change > 0 : change < 0;
  
  if (isPositive) {
    return {
      icon: <ChevronUp className="w-4 h-4" />,
      className: "text-green-500"
    };
  } else if (isNegative) {
    return {
      icon: <ChevronDown className="w-4 h-4" />,
      className: "text-red-500"
    };
  } else {
    return {
      icon: <Minus className="w-4 h-4" />,
      className: "text-gray-500"
    };
  }
};

/**
 * Returns the appropriate status icon based on the status value
 * @param status - The status string
 * @param additionalClasses - Additional CSS classes to apply to the icon
 * @returns JSX element with the appropriate status icon
 */
export const getStatusIcon = (status: string, additionalClasses: string = '') => {
  switch (status.toLowerCase()) {
    case 'error':
    case 'critical':
    case 'failed':
      return <AlertCircle className={cn("w-4 h-4 text-red-500", additionalClasses)} />;
    case 'warning':
      return <AlertCircle className={cn("w-4 h-4 text-yellow-500", additionalClasses)} />;
    case 'success':
    case 'completed':
      return <CheckCircle2 className={cn("w-4 h-4 text-green-500", additionalClasses)} />;
    default:
      return null;
  }
};

/**
 * Returns the appropriate social media icon based on the platform name
 * @param platform - The social media platform name
 * @param additionalClasses - Additional CSS classes to apply to the icon
 * @returns JSX element with the appropriate social media icon
 */
export const getSocialMediaIcon = (platform: string, additionalClasses: string = '') => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return <Twitter className={cn("w-4 h-4", additionalClasses)} />;
    case 'facebook':
      return <Facebook className={cn("w-4 h-4", additionalClasses)} />;
    case 'instagram':
      return <Instagram className={cn("w-4 h-4", additionalClasses)} />;
    case 'linkedin':
      return <Linkedin className={cn("w-4 h-4", additionalClasses)} />;
    case 'youtube':
      return <Youtube className={cn("w-4 h-4", additionalClasses)} />;
    case 'news':
      return <Globe className={cn("w-4 h-4", additionalClasses)} />;
    default:
      return <Globe className={cn("w-4 h-4", additionalClasses)} />;
  }
};

/**
 * Get color classes for sentiment visualization
 * @param sentiment - Sentiment score (0-100)
 * @returns Object with text and background color classes
 */
export const getSentimentColorClasses = (sentiment: number) => {
  if (sentiment >= 75) {
    return { text: 'text-green-600', bg: 'bg-green-100' };
  } else if (sentiment >= 50) {
    return { text: 'text-green-500', bg: 'bg-green-50' };
  } else if (sentiment >= 40) {
    return { text: 'text-yellow-500', bg: 'bg-yellow-50' };
  } else if (sentiment >= 25) {
    return { text: 'text-orange-500', bg: 'bg-orange-50' };
  } else {
    return { text: 'text-red-500', bg: 'bg-red-50' };
  }
};