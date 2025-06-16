import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronRight, Globe, Newspaper, Loader2 } from 'lucide-react';

interface MediaSourcesWidgetProps {
  data?: any;
  settings?: {
    limit?: number;
    showType?: boolean;
  };
}

const MediaSourcesWidget: React.FC<MediaSourcesWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const limit = settings.limit || 5;
  const showType = settings.showType !== undefined ? settings.showType : true;

  const { data: mediaSources = [], isLoading } = useQuery({
    queryKey: ['/api/media-sources'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'newspaper':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500';
      case 'tv':
        return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500';
      case 'radio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-500';
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{t('mediaCenter.mediaSources')}</CardTitle>
          <Link href="/media-center/sources">
            <Button variant="ghost" size="sm" className="h-7 p-0">
              {t('common.viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : mediaSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <Newspaper className="h-12 w-12 mb-2 opacity-20" />
            <p>{t('mediaCenter.noMediaSources')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {mediaSources.slice(0, limit).map((source: any) => (
              <li key={source.id} className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{source.name}</div>
                    {showType && source.type && (
                      <Badge variant="outline" className={getTypeColor(source.type)}>
                        {source.type}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    {source.website && (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        <a 
                          href={source.website.startsWith('http') ? source.website : `https://${source.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {source.website.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaSourcesWidget;