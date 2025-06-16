import React from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetProps } from '../types';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { 
  Settings2, 
  ChevronDown,
  BarChart4
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import KpiOverview from '../KpiOverview';

interface KpiOverviewSettings {
  title: string;
  maxItems: number;
  compact: boolean;
  showViewAllLink: boolean;
}

const KpiOverviewWidget: React.FC<WidgetProps> = ({ 
  id, 
  title,
  settings = {}, 
  isEditing, 
  onRemove,
  onSettingsChange 
}) => {
  const { t } = useTranslation();
  
  // Combine default settings with provided settings
  const widgetSettings: KpiOverviewSettings = {
    title: title || t('performance.kpiOverview'),
    maxItems: 2,
    compact: true,
    showViewAllLink: true,
    ...settings
  };

  // Handler for updating settings
  const updateSettings = (newSettings: Partial<KpiOverviewSettings>) => {
    onSettingsChange(id, {
      ...widgetSettings,
      ...newSettings
    });
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <BarChart4 className="h-5 w-5" />
          <CardTitle className="text-base font-medium">{widgetSettings.title}</CardTitle>
        </div>
        
        {isEditing && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 hover:bg-muted rounded-sm"
                  aria-label={t('dashboard.widgetSettings')}
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateSettings({ maxItems: 1 })}>
                  <span className={widgetSettings.maxItems === 1 ? "font-bold" : ""}>
                    {t('dashboard.showOneItem')}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ maxItems: 2 })}>
                  <span className={widgetSettings.maxItems === 2 ? "font-bold" : ""}>
                    {t('dashboard.showTwoItems')}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ maxItems: 4 })}>
                  <span className={widgetSettings.maxItems === 4 ? "font-bold" : ""}>
                    {t('dashboard.showFourItems')}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ compact: !widgetSettings.compact })}>
                  {widgetSettings.compact ? t('dashboard.expandedView') : t('dashboard.compactView')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ showViewAllLink: !widgetSettings.showViewAllLink })}>
                  {widgetSettings.showViewAllLink 
                    ? t('dashboard.hideViewAllLink') 
                    : t('dashboard.showViewAllLink')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => onRemove(id)}
                >
                  {t('dashboard.removeWidget')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <KpiOverview 
          maxItems={widgetSettings.maxItems} 
          compact={widgetSettings.compact} 
          showViewAllLink={widgetSettings.showViewAllLink}
        />
      </CardContent>
    </Card>
  );
};

export default KpiOverviewWidget;