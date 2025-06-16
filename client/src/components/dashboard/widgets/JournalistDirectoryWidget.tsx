import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronRight, Mail, Phone, Search, User2, Loader2 } from 'lucide-react';

interface JournalistDirectoryWidgetProps {
  data?: any;
  settings?: {
    limit?: number;
    showSearch?: boolean;
  };
}

const JournalistDirectoryWidget: React.FC<JournalistDirectoryWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const limit = settings.limit || 5;
  const showSearch = settings.showSearch !== undefined ? settings.showSearch : true;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: journalists = [], isLoading } = useQuery({
    queryKey: ['/api/journalists'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const filteredJournalists = journalists.filter((journalist: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (journalist.name && journalist.name.toLowerCase().includes(query)) ||
      (journalist.arabicName && journalist.arabicName.toLowerCase().includes(query)) ||
      (journalist.mediaOutlet && journalist.mediaOutlet.toLowerCase().includes(query))
    );
  });

  // Get the initials from a name
  const getInitials = (name: string) => {
    if (!name) return 'JN';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{t('mediaCenter.journalistDirectory')}</CardTitle>
          <Link href="/media-center/journalists">
            <Button variant="ghost" size="sm" className="h-7 p-0">
              {t('common.viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {showSearch && (
          <div className="mb-4 relative">
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
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : filteredJournalists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <User2 className="h-12 w-12 mb-2 opacity-20" />
            <p>{searchQuery ? t('mediaCenter.noJournalistsFound') : t('mediaCenter.noJournalists')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredJournalists.slice(0, limit).map((journalist: any) => (
              <li key={journalist.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={journalist.avatarUrl} alt={journalist.name} />
                  <AvatarFallback>{getInitials(journalist.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{journalist.name}</div>
                  <div className="text-xs text-muted-foreground">{journalist.mediaOutlet}</div>
                </div>
                <div className="flex gap-1">
                  {journalist.email && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                      <a href={`mailto:${journalist.email}`} title={journalist.email}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {journalist.phone && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                      <a href={`tel:${journalist.phone}`} title={journalist.phone}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalistDirectoryWidget;