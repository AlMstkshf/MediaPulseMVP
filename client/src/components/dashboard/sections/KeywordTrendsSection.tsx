import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { withRtl } from "@/lib/withRtl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getTrendIcon } from "@/lib/icon-utils";

interface KeywordTrendsSectionProps {
  className?: string;
}

interface KeywordData {
  id: number;
  word: string;
  category: string;
  count: number;
  trend: number; // percentage change over time period
}

const CATEGORIES = ["all", "general", "product", "service", "industry", "competitor"];
const TIME_PERIODS = ["day", "week", "month"];

const KeywordTrendsSection: React.FC<KeywordTrendsSectionProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("week");
  
  // Fetch keyword data
  const { data: keywordsData, isLoading, error } = useQuery<KeywordData[]>({
    queryKey: ["/api/keywords", { category: selectedCategory, period: timePeriod }],
    refetchInterval: 300000, // Refetch every 5 minutes
  });
  
  // Process data for visualization
  const processedData = useMemo(() => {
    if (!keywordsData) return [];
    
    // Sort by count in descending order and take the top 10
    return [...keywordsData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        ...item,
        // Generate a color based on trend (positive = green, negative = red)
        color: item.trend >= 0 ? "#10b981" : "#ef4444",
      }));
  }, [keywordsData]);
  
  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle>{t("dashboard.keyword_trends.title")}</CardTitle>
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
          {t("dashboard.keyword_trends.title")}
        </CardTitle>
        <CardDescription className={isRtl ? "text-right" : ""}>
          {t("dashboard.keyword_trends.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`flex flex-wrap justify-between gap-4 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.keyword_trends.select_category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {t(`dashboard.keyword_trends.categories.${category}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.keyword_trends.select_period")} />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map(period => (
                <SelectItem key={period} value={period}>
                  {t(`dashboard.keyword_trends.periods.${period}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {processedData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("dashboard.keyword_trends.no_data")}
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={processedData}
                layout={isRtl ? "vertical" : "horizontal"}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {isRtl ? (
                  <YAxis 
                    dataKey="word" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 12 }}
                  />
                ) : (
                  <XAxis 
                    dataKey="word" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }}
                  />
                )}
                {isRtl ? <XAxis type="number" /> : <YAxis />}
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    t("dashboard.keyword_trends.mentions")
                  ]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="count" name={t("dashboard.keyword_trends.mentions")}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-8 space-y-2">
              <h4 className={`text-sm font-medium ${isRtl ? "text-right" : ""}`}>
                {t("dashboard.keyword_trends.trending_keywords")}
              </h4>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ${isRtl ? "text-right" : ""}`}>
                {processedData.slice(0, 6).map(keyword => (
                  <div 
                    key={keyword.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-primary/5"
                  >
                    <span className="font-medium">#{keyword.word}</span>
                    <Badge variant="outline" className="ml-auto">
                      {keyword.count}
                    </Badge>
                    <div className="flex items-center">
                      {getTrendIcon(keyword.trend)}
                      <span 
                        className={keyword.trend >= 0 ? "text-success" : "text-destructive"}
                      >
                        {keyword.trend > 0 ? "+" : ""}{keyword.trend}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default withRtl(KeywordTrendsSection);