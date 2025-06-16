import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface PageVisit {
  path: string;
  timestamp: number;
  duration: number;
}

interface UserPreferences {
  favoritePages: Record<string, number>; // path -> visit count
  recentSearches: string[];
  recentlyVisitedPages: PageVisit[];
  mostActiveHours: Record<number, number>; // hour -> activity count
  contentInteractions: Record<string, number>; // content type -> interaction count
}

const LOCAL_STORAGE_KEY = 'media-pulse-user-behavior';
const MAX_RECENT_SEARCHES = 10;
const MAX_RECENT_PAGES = 20;

/**
 * A hook that tracks user behavior to power smart recommendations
 */
export default function useUserBehavior() {
  const [location] = useLocation();
  const [currentPageStartTime, setCurrentPageStartTime] = useState<number>(Date.now());
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Initialize from localStorage or with default values
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse user behavior data', e);
      }
    }
    
    return {
      favoritePages: {},
      recentSearches: [],
      recentlyVisitedPages: [],
      mostActiveHours: {},
      contentInteractions: {}
    };
  });
  
  // Query for recent social media activity, which will help inform recommendations
  const { data: socialActivityData } = useQuery({
    queryKey: ['/api/social-posts/recent-activity'],
    enabled: true,
  });
  
  // Query for recent trending topics
  const { data: trendingTopics } = useQuery({
    queryKey: ['/api/trending-topics'],
    enabled: true,
  });
  
  // Track page visits and durations
  useEffect(() => {
    const now = Date.now();
    
    // Record the previous page visit duration
    if (currentPageStartTime) {
      const duration = now - currentPageStartTime;
      if (duration > 500) { // Ignore very short visits (likely navigational)
        setPreferences(prev => {
          // Update favorite pages count
          const favoritePages = { ...prev.favoritePages };
          favoritePages[location] = (favoritePages[location] || 0) + 1;
          
          // Add to recently visited
          const newVisit: PageVisit = {
            path: location,
            timestamp: currentPageStartTime,
            duration
          };
          
          // Keep only the most recent visits
          const recentlyVisitedPages = [newVisit, ...prev.recentlyVisitedPages]
            .slice(0, MAX_RECENT_PAGES);
          
          // Track active hours
          const hour = new Date(now).getHours();
          const mostActiveHours = { ...prev.mostActiveHours };
          mostActiveHours[hour] = (mostActiveHours[hour] || 0) + 1;
          
          return {
            ...prev,
            favoritePages,
            recentlyVisitedPages,
            mostActiveHours
          };
        });
      }
    }
    
    // Set the start time for the new page
    setCurrentPageStartTime(now);
    
    // Save to localStorage whenever the user navigates
    return () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    };
  }, [location]);
  
  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);
  
  // Method to track a user search
  const trackSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setPreferences(prev => {
      // Avoid duplicates by removing any existing instance of this search term
      const filteredSearches = prev.recentSearches.filter(s => s !== searchTerm);
      
      // Add the new search term at the beginning and limit to max size
      const recentSearches = [searchTerm, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
      
      return {
        ...prev,
        recentSearches
      };
    });
  };
  
  // Method to track content interactions (likes, comments, shares, etc.)
  const trackContentInteraction = (contentType: string) => {
    setPreferences(prev => {
      const contentInteractions = { ...prev.contentInteractions };
      contentInteractions[contentType] = (contentInteractions[contentType] || 0) + 1;
      
      return {
        ...prev,
        contentInteractions
      };
    });
  };
  
  // Generate smart recommendations based on user behavior
  const getRecommendations = () => {
    const recommendations: { path: string; reason: string; score: number; }[] = [];
    
    // Recommend based on most visited pages
    const favoriteEntries = Object.entries(preferences.favoritePages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    for (const [path, count] of favoriteEntries) {
      recommendations.push({
        path,
        reason: 'frequent_visit',
        score: count * 10
      });
    }
    
    // Recommend based on recent social media activity
    if (socialActivityData?.recentPlatformsWithActivity?.length > 0) {
      for (const platform of socialActivityData.recentPlatformsWithActivity) {
        recommendations.push({
          path: '/social-media',
          reason: 'recent_activity',
          score: 75 // High score for recent activity
        });
        break; // Just add one recommendation for social media
      }
    }
    
    // Recommend based on trending topics
    if (trendingTopics?.topics?.length > 0) {
      recommendations.push({
        path: '/entity-monitoring',
        reason: 'trending_topics',
        score: 80
      });
    }
    
    // Recommend reports if user has been active lately
    if (Object.values(preferences.contentInteractions).reduce((sum, count) => sum + count, 0) > 10) {
      recommendations.push({
        path: '/reports',
        reason: 'content_engagement',
        score: 65
      });
    }
    
    // Add personalized dashboard with high priority
    recommendations.push({
      path: '/dashboard/personalized',
      reason: 'new_feature',
      score: 90
    });
    
    // Sort by score and return top 3
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
  };
  
  return {
    preferences,
    trackSearch,
    trackContentInteraction,
    getRecommendations
  };
}