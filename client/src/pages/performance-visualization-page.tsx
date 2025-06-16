import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PerformanceVisualization } from "@/components/visualization/PerformanceVisualization";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export default function PerformanceVisualizationPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  return (
    <DashboardLayout>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("navigation.home")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">
                  {t("navigation.reports")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  {t("navigation.performanceVisualization")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-3xl font-bold text-foreground mb-1">{t("navigation.performanceVisualization")}</h1>
            <p className="text-muted-foreground">{t("performance.pageDescription", "Visualize key performance metrics, sentiment analysis, and engagement statistics")}</p>
          </div>
        </div>
        
        <PerformanceVisualization />
      </div>
    </DashboardLayout>
  );
}