import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-animations";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import KpiEmojiReaction from "./KpiEmojiReaction";

interface KpiData {
  category: string;
  current: number;
  target: number;
  metrics: Array<{
    name: string;
    value: number | string;
    unit: string;
  }>;
}

export interface KpiOverviewProps {
  maxItems?: number;
  compact?: boolean;
  title?: string;
  showViewAllLink?: boolean;
  rtl?: boolean;
}

const KpiOverview = memo(({ 
  maxItems = 4, 
  compact = false, 
  title, 
  showViewAllLink = true,
  rtl = false
}: KpiOverviewProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const isRtl = rtl || isArabic;
  
  // KPI Breakdown Data
  const {
    data: kpiBreakdownData,
    isLoading: isKpiBreakdownLoading,
  } = useQuery<KpiData[]>({
    queryKey: ['/api/performance/kpi-breakdown'],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url as string, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch KPI breakdown data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  if (isKpiBreakdownLoading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: compact ? "200px" : "300px" }}>
        <LoadingSpinner size={compact ? "sm" : "lg"} text={t("performance.loadingInstitutionalPerformanceData")} />
      </div>
    );
  }
  
  // Limit the number of items to display
  const displayData = kpiBreakdownData?.slice(0, maxItems) || [];
  
  return (
    <div className="space-y-4">
      {title && <h3 className="text-xl font-bold">{title}</h3>}
      
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-2 gap-4' : 'gap-6'}`}>
        {displayData.map((kpi, index) => (
          <Card key={index} className={compact ? "overflow-hidden shadow-sm" : ""}>
            <CardHeader className={compact ? "p-4 pb-2" : undefined}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className={compact ? "text-base" : undefined}>{kpi.category}</CardTitle>
                  {!compact && (
                    <CardDescription>{t("performance.currentVsTarget")}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <KpiEmojiReaction 
                    category={kpi.category}
                    current={kpi.current}
                    target={kpi.target}
                    size={compact ? "sm" : "md"}
                  />
                  <Badge variant={kpi.current >= kpi.target ? "default" : "outline"} className={compact ? "text-xs" : ""}>
                    {kpi.current >= kpi.target 
                      ? t("performance.onTrack") 
                      : t("performance.needsImprovement")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className={compact ? "p-4 pt-2" : undefined}>
              <div className="flex justify-between items-center mb-2">
                <span className={`${compact ? "text-xs" : "text-sm"} font-medium`}>{t("performance.current")}</span>
                <span className={compact ? "text-xl font-bold" : "text-2xl font-bold"}>{kpi.current}%</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className={`${compact ? "text-xs" : "text-sm"} font-medium`}>{t("performance.target")}</span>
                <span className={compact ? "text-base" : "text-lg"}>{kpi.target}%</span>
              </div>
              
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden my-2">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }}
                />
              </div>
              
              {!compact && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {kpi.metrics.slice(0, 4).map((metric, idx) => (
                    <div key={idx} className="bg-muted/40 p-3 rounded-lg dark:bg-gray-800">
                      <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                      <div className="text-lg font-semibold">
                        {typeof metric.value === 'number' 
                          ? new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-US').format(metric.value) 
                          : metric.value}
                        {metric.unit && <span className="text-sm ml-1 rtl:mr-1 rtl:ml-0">{metric.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {!compact && (
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  {t("performance.lastUpdated")}: {new Date().toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      {showViewAllLink && kpiBreakdownData && kpiBreakdownData.length > maxItems && (
        <div className="flex justify-end mt-2">
          <Link href="/excellence-indicators" className="text-sm text-primary flex items-center hover:underline">
            {t("dashboard.viewAllKPIs")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
});

KpiOverview.displayName = "KpiOverview";

export default KpiOverview;