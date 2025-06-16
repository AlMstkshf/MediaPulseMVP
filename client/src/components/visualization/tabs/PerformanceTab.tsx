import { memo } from "react";
import { useTranslation } from "react-i18next";
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

interface PerformanceTabProps {
  kpiBreakdownData?: KpiData[];
  isLoading: boolean;
}

// Memoized performance tab to prevent unnecessary re-renders
const PerformanceTab = memo(({ kpiBreakdownData, isLoading }: PerformanceTabProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t("performance.loadingInstitutionalPerformanceData")} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t("performance.institutionalPerformance")}</h3>
      <p className="text-muted-foreground max-w-4xl">
        {t("performance.institutionalPerformanceDescription")}
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpiBreakdownData?.map((kpi, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{kpi.category}</CardTitle>
                  <CardDescription>{t("performance.currentVsTarget")}</CardDescription>
                </div>
                <Badge variant={kpi.current >= kpi.target ? "default" : "outline"}>
                  {kpi.current >= kpi.target 
                    ? t("performance.onTrack") 
                    : t("performance.needsImprovement")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t("performance.current")}</span>
                <span className="text-2xl font-bold">{kpi.current}%</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">{t("performance.target")}</span>
                <span className="text-lg">{kpi.target}%</span>
              </div>
              
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mt-2 mb-6">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {kpi.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-muted/40 p-3 rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                    <div className="text-xl font-semibold">
                      {typeof metric.value === 'number' 
                        ? new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-US').format(metric.value) 
                        : metric.value}
                      {metric.unit && <span className="text-sm ml-1 rtl:mr-1 rtl:ml-0">{metric.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                {t("performance.lastUpdated")}: {new Date().toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
});

PerformanceTab.displayName = "PerformanceTab";

export default PerformanceTab;