import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Hash, AlertTriangle, Loader2, Search, Globe, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OsintMonitoringWidgetProps {
  data?: any;
  settings?: {
    defaultTab?: string;
    showSearch?: boolean;
  };
}

const OsintMonitoringWidget: React.FC<OsintMonitoringWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const defaultTab = settings.defaultTab || 'keywords';
  const showSearch = settings.showSearch !== undefined ? settings.showSearch : true;
  
  const [tab, setTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: keywords = [], isLoading: keywordsLoading } = useQuery({
    queryKey: ['/api/keywords'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: flaggedAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/social/flagged-accounts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredKeywords = keywords.filter((keyword: any) => {
    if (!searchQuery) return true;
    return keyword.word.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredAccounts = flaggedAccounts.filter((account: any) => {
    if (!searchQuery) return true;
    return (
      (account.username && account.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (account.name && account.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Get the sentiment status (alert, warning, normal)
  const getAlertStatus = (alertLevel: number) => {
    if (alertLevel >= 3) return 'alert';
    if (alertLevel >= 1) return 'warning';
    return 'normal';
  };

  // Get sentiment status badge style
  const getAlertBadgeStyle = (status: string) => {
    switch (status) {
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-500';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{t('socialMedia.osintMonitoring')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="keywords">
              <Hash className="h-4 w-4 mr-1" />
              {t('socialMedia.keywords')}
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {t('socialMedia.flaggedAccounts')}
            </TabsTrigger>
          </TabsList>
          
          {showSearch && (
            <div className="mb-3 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('common.search')}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <TabsContent value="keywords" className="mt-0">
            {keywordsLoading ? (
              <div className="flex items-center justify-center h-[180px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{searchQuery ? t('socialMedia.noKeywordsFound') : t('socialMedia.noMonitoredKeywords')}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('socialMedia.addKeyword')}
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredKeywords.slice(0, 5).map((keyword: any) => {
                  const alertStatus = getAlertStatus(keyword.alertLevel || 0);
                  return (
                    <li key={keyword.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-1.5 rounded mr-2">
                          <Hash className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{keyword.word}</div>
                          <div className="text-xs text-muted-foreground">{keyword.category}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getAlertBadgeStyle(alertStatus)}>
                        {alertStatus === 'alert' ? t('socialMedia.highAlert') : 
                         alertStatus === 'warning' ? t('socialMedia.warning') : 
                         t('socialMedia.normal')}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-0">
            {accountsLoading ? (
              <div className="flex items-center justify-center h-[180px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{searchQuery ? t('socialMedia.noAccountsFound') : t('socialMedia.noFlaggedAccounts')}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('socialMedia.flagAccount')}
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredAccounts.slice(0, 4).map((account: any) => (
                  <li key={account.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={account.avatarUrl} alt={account.username} />
                      <AvatarFallback>
                        {account.username?.substring(0, 2).toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{account.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        @{account.username} • {account.platform}
                        {account.url && (
                          <a 
                            href={account.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getAlertBadgeStyle(account.alertLevel >= 2 ? 'alert' : 'warning')}>
                      {account.alertLevel >= 2 ? t('socialMedia.highRisk') : t('socialMedia.watch')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            
            {!accountsLoading && filteredAccounts.length > 0 && (
              <Alert className="mt-4">
                <AlertDescription>
                  {t('socialMedia.lastScanCompleted', { 
                    timeAgo: formatDistanceToNow(new Date(Date.now() - 30 * 60 * 1000), { addSuffix: true }) 
                  })}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OsintMonitoringWidget;