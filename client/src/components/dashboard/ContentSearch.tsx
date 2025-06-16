import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, Calendar, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useSocialPosts } from '@/hooks/use-social';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Content Search component for searching social media posts and content
export default function ContentSearch() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  
  // States for search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | ''>('');
  const [searchType, setSearchType] = useState<'keyword' | 'hashtag' | 'topic'>('keyword');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // For advanced filters dialog
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [engagementType, setEngagementType] = useState<string>('');
  
  // Handle platform selection
  const handlePlatformToggle = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };
  
  // Format date range for display
  const getDateRangeDisplay = () => {
    if (!dateFrom && !dateTo) return t('search.anyTime');
    
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'MMM d, yyyy')} - ${format(dateTo, 'MMM d, yyyy')}`;
    }
    
    if (dateFrom) {
      return `${t('search.from')} ${format(dateFrom, 'MMM d, yyyy')}`;
    }
    
    if (dateTo) {
      return `${t('search.until')} ${format(dateTo, 'MMM d, yyyy')}`;
    }
  };
  
  // Clear search filters
  const clearFilters = () => {
    setPlatforms([]);
    setSentiment('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setAuthorFilter('');
    setEngagementType('');
  };
  
  // Search submissions
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setShowResults(true);
      setIsLoading(false);
    }, 800);
  };
  
  // Fetch data from API
  const { data: socialPosts, isLoading: isPostsLoading } = useSocialPosts({
    keyword: searchType === 'keyword' ? searchTerm : '',
    hashtag: searchType === 'hashtag' ? searchTerm : '',
    topic: searchType === 'topic' ? searchTerm : '',
    platforms: platforms.length > 0 ? platforms : undefined,
    sentiment: sentiment 
      ? sentiment === 'positive' ? 1 
      : sentiment === 'negative' ? -1 
      : 0 
      : undefined,
    dateFrom,
    dateTo,
    author: authorFilter || undefined,
  });
  
  // Apply filters on search submission
  const searchWithFilters = () => {
    setShowResults(true);
    handleSearch();
  };
  
  // Create filter badge list
  const getActiveFilters = () => {
    const filters = [];
    
    if (platforms.length > 0) {
      filters.push(`${t('search.platforms')}: ${platforms.join(', ')}`);
    }
    
    if (sentiment) {
      const sentimentLabel = 
        sentiment === 'positive' ? t('search.positive') :
        sentiment === 'neutral' ? t('search.neutral') :
        sentiment === 'negative' ? t('search.negative') : '';
      
      if (sentimentLabel) {
        filters.push(`${t('search.sentiment')}: ${sentimentLabel}`);
      }
    }
    
    if (dateFrom || dateTo) {
      filters.push(`${t('search.date')}: ${getDateRangeDisplay()}`);
    }
    
    if (authorFilter) {
      filters.push(`${t('search.author')}: ${authorFilter}`);
    }
    
    if (engagementType) {
      filters.push(`${t('search.engagement')}: ${engagementType}`);
    }
    
    return filters;
  };
  
  // Get search type label
  const getSearchTypeLabel = () => {
    switch(searchType) {
      case 'keyword': return t('search.keyword');
      case 'hashtag': return t('search.hashtag');
      case 'topic': return t('search.topic');
      default: return t('search.keyword');
    }
  };
  
  return (
    <div className="mb-6">
      <Card className="p-4">
        <div className={`flex flex-col space-y-4 ${isRtl ? 'items-end' : 'items-start'}`}>
          <div className={`flex w-full ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`relative flex-grow ${isRtl ? 'ml-2' : 'mr-2'}`}>
              <div className="flex">
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`border-r-0 rounded-${isRtl ? 'r' : 'l'}-md rounded-${isRtl ? 'l' : 'r'}-none px-3 focus:ring-0`}
                    >
                      {getSearchTypeLabel()} <Search className={`ml-2 h-4 w-4 ${isRtl ? 'mr-2' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align={isRtl ? "end" : "start"}>
                    <div className="p-1">
                      <button 
                        className={`w-full text-${isRtl ? 'right' : 'left'} px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 ${searchType === 'keyword' ? 'bg-slate-100' : ''}`}
                        onClick={() => {
                          setSearchType('keyword');
                          setIsFilterOpen(false);
                        }}
                      >
                        {t('search.keyword')}
                      </button>
                      <button 
                        className={`w-full text-${isRtl ? 'right' : 'left'} px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 ${searchType === 'hashtag' ? 'bg-slate-100' : ''}`}
                        onClick={() => {
                          setSearchType('hashtag');
                          setIsFilterOpen(false);
                        }}
                      >
                        {t('search.hashtag')}
                      </button>
                      <button 
                        className={`w-full text-${isRtl ? 'right' : 'left'} px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 ${searchType === 'topic' ? 'bg-slate-100' : ''}`}
                        onClick={() => {
                          setSearchType('topic'); 
                          setIsFilterOpen(false);
                        }}
                      >
                        {t('search.topic')}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder={t('search.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchWithFilters();
                    }
                  }}
                  className={`flex-grow rounded-${isRtl ? 'l' : 'r'}-none`}
                />
                <Button 
                  onClick={searchWithFilters}
                  className={`rounded-${isRtl ? 'none' : 'l-none'} rounded-${isRtl ? 'l-none' : 'none'} bg-blue-500 hover:bg-blue-600`}
                  disabled={isLoading || !searchTerm.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2">{t('search.search')}</span>
                </Button>
              </div>
            </div>
            
            <div className={`flex space-x-2 ${isRtl ? 'space-x-reverse' : ''}`}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="px-3 flex items-center"
                    aria-label={t('search.filters')}
                  >
                    <Filter className="w-4 h-4" />
                    <span className={`${isRtl ? 'mr-2' : 'ml-2'} hidden sm:inline-block`}>
                      {t('search.filters')}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align={isRtl ? "end" : "start"}>
                  <div className="space-y-4 p-2">
                    <div>
                      <h4 className="font-medium mb-2">{t('search.platforms')}</h4>
                      <div className={`flex flex-wrap gap-2 ${isRtl ? 'space-x-reverse' : ''}`}>
                        {['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`platform-${platform}`}
                              checked={platforms.includes(platform.toLowerCase())}
                              onCheckedChange={() => handlePlatformToggle(platform.toLowerCase())}
                            />
                            <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                              {platform}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">{t('search.sentiment')}</h4>
                      <Select 
                        value={sentiment} 
                        onValueChange={(value: "" | "positive" | "neutral" | "negative") => setSentiment(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('search.anySentiment')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('search.anySentiment')}</SelectItem>
                          <SelectItem value="positive">{t('search.positive')}</SelectItem>
                          <SelectItem value="neutral">{t('search.neutral')}</SelectItem>
                          <SelectItem value="negative">{t('search.negative')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">{t('search.date')}</h4>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {getDateRangeDisplay()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 flex flex-col space-y-2">
                            <div>
                              <h5 className="text-sm font-medium">{t('search.from')}</h5>
                              <CalendarComponent
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                initialFocus
                              />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">{t('search.to')}</h5>
                              <CalendarComponent
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                initialFocus
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setIsDatePickerOpen(false);
                                }}
                              >
                                {t('search.apply')}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearFilters}
                      >
                        {t('search.clearFilters')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAdvancedFilters(true)}
                      >
                        {t('search.advancedFilters')}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Active filters */}
          {getActiveFilters().length > 0 && (
            <div className={`flex flex-wrap gap-2 ${isRtl ? 'space-x-reverse' : ''}`}>
              {getActiveFilters().map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  {filter}
                </Badge>
              ))}
              <Button 
                variant="link" 
                size="sm" 
                className="h-5 p-0 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                {t('search.clearAll')}
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Results section */}
      {showResults && (
        <Card className="p-4 mt-4">
          <h3 className="text-lg font-medium mb-4">
            {isPostsLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('search.searchingFor')} "{searchTerm}"
              </div>
            ) : (
              <>
                {t('search.resultsFor')} "{searchTerm}" 
                <span className="text-muted-foreground text-sm font-normal ml-2">
                  ({socialPosts?.length || 0} {t('search.results')})
                </span>
              </>
            )}
          </h3>
          
          {isPostsLoading ? (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : socialPosts && socialPosts.length > 0 ? (
            <div className="space-y-4">
              {socialPosts.map((post) => (
                <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className={`${isRtl ? 'ml-4' : 'mr-4'}`}>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {post.authorAvatarUrl ? (
                          <img 
                            src={post.authorAvatarUrl} 
                            alt={post.authorName || 'User avatar'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {(post.authorName || '').substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {post.authorName || t('search.unknownAuthor')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{post.authorUsername || 'user'} · {post.platform}
                          </div>
                        </div>
                        <div>
                          <Badge 
                            className={
                              post.sentiment === 1 ? 'bg-green-100 text-green-800' : 
                              post.sentiment === -1 ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {post.sentiment === 1 ? t('search.positive') : 
                             post.sentiment === -1 ? t('search.negative') : 
                             t('search.neutral')}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2">{post.content}</div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        {post.postedAt ? format(new Date(post.postedAt), 'MMM d, yyyy • h:mm a') : ''}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {t('search.noResults')}
            </div>
          )}
        </Card>
      )}
      
      {/* Advanced filters dialog */}
      <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('search.advancedFilters')}</DialogTitle>
            <DialogDescription>
              {t('search.advancedFiltersDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="author-filter">{t('search.authorFilter')}</Label>
              <Input 
                id="author-filter" 
                placeholder={t('search.authorFilterPlaceholder')}
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engagement-type">{t('search.engagementType')}</Label>
              <Select value={engagementType} onValueChange={setEngagementType}>
                <SelectTrigger id="engagement-type">
                  <SelectValue placeholder={t('search.anyEngagement')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('search.anyEngagement')}</SelectItem>
                  <SelectItem value="high">{t('search.highEngagement')}</SelectItem>
                  <SelectItem value="medium">{t('search.mediumEngagement')}</SelectItem>
                  <SelectItem value="low">{t('search.lowEngagement')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAuthorFilter('');
                setEngagementType('');
              }}
            >
              {t('search.reset')}
            </Button>
            <Button onClick={() => setShowAdvancedFilters(false)}>
              {t('search.apply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

