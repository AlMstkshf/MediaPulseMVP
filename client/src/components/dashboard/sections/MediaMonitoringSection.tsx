import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useMediaItems } from "@/hooks/use-media";
import { withRtl } from "@/lib/withRtl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Newspaper, Radio, Tv, Monitor, ExternalLink } from "lucide-react";
import { getSocialMediaIcon } from "@/lib/icon-utils";

interface MediaMonitoringSectionProps {
  className?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

// Icon mapping for media types
const getMediaTypeIcon = (type: string, className: string = "h-4 w-4") => {
  switch (type.toLowerCase()) {
    case "news":
      return <Newspaper className={className} />;
    case "radio":
      return <Radio className={className} />;
    case "tv":
      return <Tv className={className} />;
    case "online":
      return <Monitor className={className} />;
    default:
      return getSocialMediaIcon(type, className);
  }
};

const MediaMonitoringSection: React.FC<MediaMonitoringSectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  const { data: mediaItems, isLoading, error } = useMediaItems();
  
  // Memoized processing of media data for charts
  const mediaStats = useMemo(() => {
    if (!mediaItems || mediaItems.length === 0) {
      return {
        byType: [],
        bySource: [],
        totalCount: 0,
      };
    }
    
    // Count media by type
    const typeCount = mediaItems.reduce((acc, item) => {
      const type = item.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byType = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Count media by source with a limit on the number of sources
    const sourceCount = mediaItems.reduce((acc, item) => {
      const source = item.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by count and take top 5
    const bySource = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        value,
      }));
    
    return {
      byType,
      bySource,
      totalCount: mediaItems.length,
    };
  }, [mediaItems]);
  
  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t("dashboard.media_monitoring.title")}</CardTitle>
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
          {t("dashboard.media_monitoring.title")}
        </CardTitle>
        <CardDescription className={isRtl ? "text-right" : ""}>
          {t("dashboard.media_monitoring.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-medium">
              {t("dashboard.media_monitoring.total_mentions", {
                count: mediaStats.totalCount,
              })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.media_monitoring.last_update")}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/reports" className="flex items-center gap-1">
              <span>{t("dashboard.media_monitoring.view_all")}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
        
        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="type">
              {t("dashboard.media_monitoring.by_type")}
            </TabsTrigger>
            <TabsTrigger value="source">
              {t("dashboard.media_monitoring.by_source")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="type" className="pt-2">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mediaStats.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.4;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#888"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {mediaStats.byType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} ${t("dashboard.media_monitoring.mentions")}`,
                      name,
                    ]}
                  />
                  <Legend formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                {mediaStats.byType.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-primary/5"
                  >
                    {getMediaTypeIcon(item.name)}
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="source" className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mediaStats.bySource} layout={isRtl ? "vertical" : "horizontal"}>
                <CartesianGrid strokeDasharray="3 3" />
                {isRtl ? (
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                ) : (
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                )}
                {isRtl ? (
                  <XAxis type="number" />
                ) : (
                  <YAxis />
                )}
                <Tooltip
                  formatter={(value) =>
                    `${value} ${t("dashboard.media_monitoring.mentions")}`
                  }
                />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name={t("dashboard.media_monitoring.mentions")}
                >
                  {mediaStats.bySource.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default withRtl(MediaMonitoringSection);