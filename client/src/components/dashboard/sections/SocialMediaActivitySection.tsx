import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { withRtl } from "@/lib/withRtl";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getSocialMediaIcon } from "@/lib/icon-utils";
import { AlertCircle } from "lucide-react";
import SocialMediaPoller from "@/components/shared/SocialMediaPoller";

interface SocialMediaActivitySectionProps {
  className?: string;
}

interface PlatformCount {
  platform: string;
  count: number;
}

interface ChartDataItem {
  name: string;
  count: number;
  color: string;
}

// Color mapping for different platforms
const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2", 
  instagram: "#E1306C",
  facebook: "#4267B2",
  linkedin: "#0077B5",
  reddit: "#FF4500",
  youtube: "#FF0000",
  tiktok: "#000000",
  news: "#FF9900",
  default: "#666666"
};

const SocialMediaActivitySection: React.FC<SocialMediaActivitySectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  // Fetch social media platform counts with automatic polling
  const { 
    data: platformCounts, 
    isLoading, 
    error
  } = useQuery({
    queryKey: ["/api/social-posts/count-by-platform"],
    refetchInterval: 15000, // Refetch every 15 seconds
  });
  
  // Format data for chart using memoization
  const chartData = useMemo<ChartDataItem[]>(() => {
    if (!platformCounts || !Array.isArray(platformCounts)) return [];
    
    // Map the platform counts to chart data
    return (platformCounts as PlatformCount[]).map((item: PlatformCount) => ({
      name: item.platform,
      count: item.count,
      color: PLATFORM_COLORS[item.platform.toLowerCase()] || PLATFORM_COLORS.default
    }));
  }, [platformCounts]);
  
  // Calculate total posts
  const totalPosts = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum: number, item: ChartDataItem) => sum + item.count, 0);
  }, [chartData]);
  
  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t("dashboard.social_media_activity.title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("common.error_loading_data")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{t("common.please_try_again")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={isRtl ? "text-right" : ""}>
            {t("dashboard.social_media_activity.title")}
          </CardTitle>
          <SocialMediaPoller showStatus={true} />
        </div>
        <CardDescription className={isRtl ? "text-right" : ""}>
          {t("dashboard.social_media_activity.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-xl font-medium">
            {t("dashboard.social_media_activity.total_posts", {
              count: totalPosts,
            })}
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {chartData.slice(0, 4).map((item: ChartDataItem, index: number) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5"
              >
                <div className="mb-1">
                  {getSocialMediaIcon(item.name, "h-6 w-6")}
                </div>
                <div className="text-lg font-semibold">{item.count}</div>
                <div className="text-xs text-muted-foreground">{item.name}</div>
              </div>
            ))}
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout={isRtl ? "vertical" : "horizontal"}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {isRtl ? (
                <YAxis dataKey="name" type="category" width={100} />
              ) : (
                <XAxis dataKey="name" />
              )}
              {isRtl ? <XAxis type="number" /> : <YAxis />}
              <Tooltip
                formatter={(value, name, props: any) => [
                  `${value} ${t("dashboard.social_media_activity.posts")}`,
                  props.payload.name,
                ]}
                labelFormatter={() => ""}
                contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
              />
              <Bar dataKey="count" name={t("dashboard.social_media_activity.posts")}>
                {chartData.map((entry: ChartDataItem, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap the component with our RTL handler and a SocialMediaPoller for global monitoring
const EnhancedSocialMediaActivitySection: React.FC<SocialMediaActivitySectionProps> = (props) => (
  <SocialMediaPoller>
    {withRtl(SocialMediaActivitySection)(props)}
  </SocialMediaPoller>
);

export default EnhancedSocialMediaActivitySection;