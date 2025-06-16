import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface PressReleasesWidgetProps {
  data?: any;
  settings?: {
    limit?: number;
    showStatus?: boolean;
  };
}

const PressReleasesWidget: React.FC<PressReleasesWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const limit = settings.limit || 5;
  const showStatus = settings.showStatus !== undefined ? settings.showStatus : true;

  const { data: pressReleases = [], isLoading } = useQuery({
    queryKey: ['/api/press-releases'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{t('mediaCenter.latestPressReleases')}</CardTitle>
          <Link href="/media-center">
            <Button variant="ghost" size="sm" className="h-7 p-0">
              {t('common.viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[220px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : pressReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
            <FileText className="h-12 w-12 mb-2 opacity-20" />
            <p>{t('mediaCenter.noPressReleases')}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pressReleases.slice(0, limit).map((release: any) => (
              <li key={release.id} className="flex gap-3 items-start">
                <div className="rounded-md bg-primary/10 p-2 mt-0.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <Link href={`/media-center/press-releases/${release.id}`}>
                      <span className="font-medium hover:text-primary cursor-pointer">
                        {release.title}
                      </span>
                    </Link>
                    {showStatus && (
                      <Badge variant="outline" className={getStatusColor(release.status || 'draft')}>
                        {release.status || 'Draft'}
                      </Badge>
                    )}
                  </div>
                  {release.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{release.summary}</p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {release.createdAt && 
                      formatDistanceToNow(new Date(release.createdAt), { addSuffix: true })}
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

export default PressReleasesWidget;