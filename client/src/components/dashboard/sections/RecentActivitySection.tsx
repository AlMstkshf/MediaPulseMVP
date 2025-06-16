import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { withRtl } from "@/lib/withRtl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getSocialMediaIcon } from "@/lib/icon-utils";
import { AlertTriangle, BarChart2, Clock, MessageSquare, Zap } from "lucide-react";
import { Link } from "wouter";
import { getQueryFn } from "@/lib/queryClient";

interface RecentActivitySectionProps {
  className?: string;
}

interface RecentActivityResponse {
  recentPlatformsWithActivity: string[];
  activityCounts: Record<string, number>;
}

interface ActivityItem {
  id: number;
  type: "mention" | "post" | "alert" | "report" | "trend";
  title: string;
  description: string;
  platform?: string;
  timestamp: string;
  status?: "positive" | "neutral" | "negative" | "important";
  link?: string;
}

// Helper function to create ActivityItems from the API response
const createActivityItemsFromResponse = (data: any, t: any): ActivityItem[] => {
  // Handle case where data is undefined or null
  if (!data) return [];
  
  // Check if data has the expected structure
  if (data.recentPlatformsWithActivity && Array.isArray(data.recentPlatformsWithActivity) && data.activityCounts) {
    // Convert the data to ActivityItems
    return data.recentPlatformsWithActivity.map((platform: string, index: number) => {
      const count = data.activityCounts[platform] || 0;
      return {
        id: index,
        type: "mention",
        title: t("dashboard.recent_activity.platform_activity", { platform: platform }),
        description: t("dashboard.recent_activity.count_posts", { count: count }),
        platform: platform,
        timestamp: t("dashboard.recent_activity.last_week"),
        status: "positive",
        link: `/social-media?platform=${platform}`
      };
    });
  }
  
  // If data doesn't have the expected structure, return empty array
  console.warn("Recent activity data doesn't have expected format:", data);
  return [];
};

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  // Fetch recent activity data
  const { data: recentActivityData, isLoading, error } = useQuery({
    queryKey: ["/api/social-posts/recent-activity"],
    queryFn: getQueryFn(),
    // Fetch interval every 5 minutes
    refetchInterval: 300000,
  });
  
  // Convert the API response to ActivityItems
  const activityItems = useMemo(() => {
    return createActivityItemsFromResponse(recentActivityData, t);
  }, [recentActivityData, t]);
  
  // Format and prepare the activity items with appropriate icons
  const formattedActivityItems = useMemo(() => {
    if (!activityItems || activityItems.length === 0) return [];
    
    return activityItems.map(item => {
      // Determine icon based on activity type
      let icon;
      switch (item.type) {
        case "mention":
          icon = item.platform ? getSocialMediaIcon(item.platform, "h-5 w-5") : <MessageSquare className="h-5 w-5" />;
          break;
        case "alert":
          icon = <AlertTriangle className="h-5 w-5 text-warning" />;
          break;
        case "report":
          icon = <BarChart2 className="h-5 w-5 text-primary" />;
          break;
        case "trend":
          icon = <Zap className="h-5 w-5 text-secondary" />;
          break;
        default:
          icon = <Clock className="h-5 w-5 text-muted-foreground" />;
      }
      
      // Determine badge color based on status
      let badgeVariant: "outline" | "destructive" | "secondary" | "default" = "outline";
      switch (item.status) {
        case "positive":
          badgeVariant = "secondary"; // Use secondary for positive since success isn't available
          break;
        case "negative":
          badgeVariant = "destructive";
          break;
        case "important":
          badgeVariant = "secondary";
          break;
        default:
          badgeVariant = "outline";
      }
      
      return {
        ...item,
        icon,
        badgeVariant,
      };
    });
  }, [activityItems]);
  
  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-full max-w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t("dashboard.recent_activity.title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("common.error_loading_data")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("common.please_try_again")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className={isRtl ? "text-right" : ""}>
          {t("dashboard.recent_activity.title")}
        </CardTitle>
        <CardDescription className={isRtl ? "text-right" : ""}>
          {t("dashboard.recent_activity.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedActivityItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t("dashboard.recent_activity.no_activity")}
          </div>
        ) : (
          <div className="space-y-4">
            {formattedActivityItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-start gap-4 pb-4 border-b ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="space-y-1 flex-1">
                  {item.link ? (
                    <Link href={item.link}>
                      <span className="font-medium hover:underline cursor-pointer">{item.title}</span>
                    </Link>
                  ) : (
                    <div className="font-medium">{item.title}</div>
                  )}
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={item.badgeVariant} className="text-xs">
                    {item.status ? t(`dashboard.recent_activity.status.${item.status}`) : null}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default withRtl(RecentActivitySection);