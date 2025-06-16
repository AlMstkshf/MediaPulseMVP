import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useContext } from 'react';
import { GlobalDataContext } from '@/lib/context/GlobalDataContext';

/**
 * Component that provides navigation functions with context preservation
 * Allows passing data and state between different sections of the application
 */
export const useSectionNavigation = () => {
  const [, setLocation] = useLocation();
  
  // Safely access context without throwing errors
  const globalDataContext = useContext(GlobalDataContext);
  
  // Default values when context is not available
  const navigateToSection = globalDataContext?.navigateToSection || (() => {});
  const sectionParams = globalDataContext?.sectionParams || null;
  const timeFilter = globalDataContext?.timeFilter || 'last30Days';
  
  // Navigate to dashboard with context
  const goToDashboard = useCallback(() => {
    navigateToSection('dashboard');
    setLocation('/');
  }, [navigateToSection, setLocation]);
  
  // Navigate to classic dashboard with context
  const goToClassicDashboard = useCallback(() => {
    navigateToSection('dashboard-classic');
    setLocation('/dashboard/classic');
  }, [navigateToSection, setLocation]);
  
  // Navigate to media center with context
  const goToMediaCenter = useCallback((params?: Record<string, any>) => {
    navigateToSection('media-center', params);
    setLocation('/media-center');
  }, [navigateToSection, setLocation]);
  
  // Navigate to social media with context
  const goToSocialMedia = useCallback((params?: Record<string, any>) => {
    navigateToSection('social-media', params);
    setLocation('/social-media');
  }, [navigateToSection, setLocation]);
  
  // Navigate to monitoring with context
  const goToMonitoring = useCallback((params?: Record<string, any>) => {
    const defaultParams = { timeFilter };
    navigateToSection('monitoring', { ...defaultParams, ...params });
    setLocation('/monitoring');
  }, [navigateToSection, setLocation, timeFilter]);
  
  // Navigate to social publishing with context
  const goToSocialPublishing = useCallback((params?: Record<string, any>) => {
    navigateToSection('social-publishing', params);
    setLocation('/social-publishing');
  }, [navigateToSection, setLocation]);
  
  // Navigate to reports with context
  const goToReports = useCallback((params?: Record<string, any>) => {
    const defaultParams = { timeFilter };
    navigateToSection('reports', { ...defaultParams, ...params });
    setLocation('/reports');
  }, [navigateToSection, setLocation, timeFilter]);
  
  // Navigate to excellence indicators with context
  const goToExcellenceIndicators = useCallback((params?: Record<string, any>) => {
    navigateToSection('excellence-indicators', params);
    setLocation('/excellence-indicators');
  }, [navigateToSection, setLocation]);
  
  // Navigate to sentiment analysis with context
  const goToSentimentAnalysis = useCallback((params?: Record<string, any>) => {
    const defaultParams = { timeFilter };
    navigateToSection('sentiment-analysis', { ...defaultParams, ...params });
    setLocation('/test-sentiment');
  }, [navigateToSection, setLocation, timeFilter]);
  
  // Navigate to entity monitoring with context
  const goToEntityMonitoring = useCallback((entityId?: number | string, params?: Record<string, any>) => {
    const path = entityId ? `/entity-monitoring/${entityId}` : '/entity-monitoring';
    navigateToSection('entity-monitoring', { entityId, ...params });
    setLocation(path);
  }, [navigateToSection, setLocation]);
  
  return {
    goToDashboard,
    goToClassicDashboard,
    goToMediaCenter,
    goToSocialMedia,
    goToMonitoring,
    goToSocialPublishing,
    goToReports,
    goToExcellenceIndicators,
    goToSentimentAnalysis,
    goToEntityMonitoring,
    sectionParams
  };
};