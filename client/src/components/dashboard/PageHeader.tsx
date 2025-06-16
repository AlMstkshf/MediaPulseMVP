import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Calendar, Download } from "lucide-react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  showDateFilter?: boolean;
  showDownload?: boolean;
  onDateFilterChange?: (period: string) => void;
  onDownload?: () => void;
}

const PageHeader = ({
  title,
  actions,
  showDateFilter = true,
  showDownload = true,
  onDateFilterChange,
  onDownload
}: PageHeaderProps) => {
  const { t } = useTranslation();
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center space-x-4">
        {showDateFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{t('dashboard.last30Days')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDateFilterChange?.(t('dashboard.today'))}>
                {t('dashboard.today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateFilterChange?.(t('dashboard.last7Days'))}>
                {t('dashboard.last7Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateFilterChange?.(t('dashboard.last30Days'))}>
                {t('dashboard.last30Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateFilterChange?.(t('dashboard.last90Days'))}>
                {t('dashboard.last90Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateFilterChange?.(t('dashboard.custom'))}>
                {t('dashboard.custom')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {showDownload && (
          <Button className="bg-[#cba344] hover:bg-[#b8943e] text-white" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            <span>{t('dashboard.downloadReport')}</span>
          </Button>
        )}
        
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
