import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import useUserBehavior from '@/hooks/useUserBehavior';
import { Sparkles, ArrowRight, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type Recommendation = {
  path: string;
  reason: string;
  score: number;
};

const getRecommendationIcon = (reason: string) => {
  switch (reason) {
    case 'frequent_visit':
      return <Activity className="w-4 h-4" />;
    case 'recent_activity':
      return <TrendingUp className="w-4 h-4" />;
    case 'trending_topics':
      return <TrendingUp className="w-4 h-4" />;
    case 'new_feature':
      return <Sparkles className="w-4 h-4" />;
    case 'content_engagement':
      return <Activity className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const SmartRecommendations = () => {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const isRTL = i18n.language === 'ar';
  const { getRecommendations } = useUserBehavior();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Update recommendations when location changes
    const newRecommendations = getRecommendations();
    setRecommendations(newRecommendations);
  }, [location, getRecommendations]);

  // Don't show recommendations for pages that are already in the recommendations
  const filteredRecommendations = recommendations.filter(rec => rec.path !== location);

  // If there are no recommendations after filtering, don't show the component
  if (filteredRecommendations.length === 0) {
    return null;
  }

  const getRecommendationReason = (reason: string): string => {
    switch (reason) {
      case 'frequent_visit':
        return t('recommendations.frequentVisit');
      case 'recent_activity':
        return t('recommendations.recentActivity');
      case 'trending_topics':
        return t('recommendations.trendingTopics');
      case 'new_feature':
        return t('recommendations.newFeature');
      case 'content_engagement':
        return t('recommendations.contentEngagement');
      default:
        return t('recommendations.suggested');
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-t-md"
        >
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-[#cba344] mr-2" />
            <span className="font-medium">{t('recommendations.title')}</span>
          </div>
          <Badge variant="outline" className="bg-[#cba344] bg-opacity-10 text-[#8a6c14] border-[#cba344] border-opacity-20">
            {filteredRecommendations.length}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 space-y-2">
          {filteredRecommendations.map((recommendation, index) => (
            <Link 
              href={recommendation.path} 
              key={index}
              className={`
                flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900
                text-sm text-gray-700 dark:text-gray-300 transition-colors
              `}
            >
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-[#cba344] bg-opacity-10 p-1">
                  {getRecommendationIcon(recommendation.reason)}
                </div>
                <div>
                  <div className="font-medium">
                    {t(`navigation.${recommendation.path.slice(1).replace(/\//g, '.') || 'dashboard'}`)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getRecommendationReason(recommendation.reason)}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SmartRecommendations;