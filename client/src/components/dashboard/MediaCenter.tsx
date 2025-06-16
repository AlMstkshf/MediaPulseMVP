import { useTranslation } from "react-i18next";
import { useMediaItems } from "@/hooks/use-media";
import { MoreVertical, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { useMemo } from "react";
import { getMediaTypeLabel, getCategoryLabel, getTimeSince } from "@/utils/mediaHelpers";

const MediaCenter = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { data: mediaItems, isLoading, error } = useMediaItems();
  
  if (isLoading) {
    return (
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-bold">{t('mediaCenter.title')}</CardTitle>
          <Button variant="link" className="text-[#cba344]">{t('mediaCenter.viewAll')}</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-bold">{t('mediaCenter.title')}</CardTitle>
          <Button variant="link" className="text-[#cba344]">{t('mediaCenter.viewAll')}</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
            <h3 className="text-lg font-medium">{t('common.error_loading_data')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('common.please_try_again')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Define displayItems with a default empty array
  const displayItems = mediaItems?.length ? mediaItems : [];
  
  // Helper functions now imported from utils/mediaHelpers.ts

  return (
    <Card className="w-full mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-bold">{t('mediaCenter.title')}</CardTitle>
        <Button 
          variant="link" 
          className="text-[#cba344]" 
          onClick={() => navigate('/media-center')}
        >
          {t('mediaCenter.viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t('common.no_data_available')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayItems.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-gray-100">
                <div className="h-36 bg-gray-300 relative">
                  <img 
                    src={item.thumbnailUrl || '/placeholder-image.jpg'} 
                    alt={item.title || t('mediaCenter.media_item')} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                    {getMediaTypeLabel(item.mediaType, t)}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">{item.title || t('mediaCenter.untitled')}</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {t('mediaCenter.updated')} {item.updatedAt ? getTimeSince(item.updatedAt, t) : t('common.unknown')}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      <Badge variant="outline" className="bg-[#f9f4e9] border-0 text-xs">
                        {item.category ? getCategoryLabel(item.category, t) : t('common.uncategorized')}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/media-center/view/${item.id}`)}>
                          {t('common.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>{t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('common.download')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('common.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCenter;
