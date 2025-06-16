import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { 
  FileOutput, 
  Bell, 
  Hash, 
  Calendar, 
  FileText, 
  UserPlus, 
  BookOpen, 
  Film,
  Newspaper,
  AlertTriangle,
  ShieldAlert,
  Search,
  Flag
} from 'lucide-react';

interface QuickActionsWidgetProps {
  data?: any;
  settings?: {
    columns?: number;
    actions?: string[];
  };
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ settings = {} }) => {
  const { t } = useTranslation();
  const columns = settings.columns || 2;
  
  // Limit number of actions for better fit
  const selectedActions = settings.actions || [
    'monitor-keyword', 
    'keyword-alert', 
    'create-report',
    'schedule-post',
    'add-press-release',
    'add-journalist'
  ];

  // Define all possible actions
  const allActions = [
    {
      id: 'monitor-keyword',
      label: t('socialMedia.monitorHash'),
      icon: <Hash className="h-4 w-4" />,
      href: '/social-media?tab=osint'
    },
    {
      id: 'keyword-alert',
      label: t('socialMedia.keywordAlert'),
      icon: <Bell className="h-4 w-4" />,
      href: '/settings?tab=alerts'
    },
    {
      id: 'flagged-account',
      label: t('socialMedia.addFlaggedAccount'),
      icon: <Flag className="h-4 w-4" />,
      href: '/social-media?tab=osint'
    },
    {
      id: 'export-osint',
      label: t('socialMedia.exportOsintReport'),
      icon: <FileOutput className="h-4 w-4" />,
      href: '/reports/create?type=osint'
    },
    {
      id: 'create-report',
      label: t('reports.createReport'),
      icon: <FileText className="h-4 w-4" />,
      href: '/reports/create'
    },
    {
      id: 'schedule-post',
      label: t('socialMedia.schedulePost'),
      icon: <Calendar className="h-4 w-4" />,
      href: '/social-media?tab=publishing'
    },
    {
      id: 'add-press-release',
      label: t('mediaCenter.addPressRelease'),
      icon: <Newspaper className="h-4 w-4" />,
      href: '/media-center?tab=press-releases'
    },
    {
      id: 'add-journalist',
      label: t('mediaCenter.addJournalist'),
      icon: <UserPlus className="h-4 w-4" />,
      href: '/media-center?tab=journalists'
    },
    {
      id: 'add-media-source',
      label: t('mediaCenter.addMediaSource'),
      icon: <BookOpen className="h-4 w-4" />,
      href: '/media-center?tab=sources'
    },
    {
      id: 'add-media-file',
      label: t('mediaCenter.uploadMedia'),
      icon: <Film className="h-4 w-4" />,
      href: '/media-center?tab=media'
    },
    {
      id: 'security-scan',
      label: t('security.runSecurityScan'),
      icon: <ShieldAlert className="h-4 w-4" />,
      href: '/security'
    },
    {
      id: 'incident-report',
      label: t('security.reportIncident'),
      icon: <AlertTriangle className="h-4 w-4" />,
      href: '/security/incidents/new'
    },
    {
      id: 'advanced-search',
      label: t('common.advancedSearch'),
      icon: <Search className="h-4 w-4" />,
      href: '/search'
    }
  ];

  // Filter actions based on settings
  const actions = allActions.filter(action => selectedActions.includes(action.id));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="action-buttons-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {actions.map((action) => (
            <Link 
              key={action.id}
              href={action.href}
              className="action-button"
            >
              <div className="action-button-icon">
                {action.icon}
              </div>
              <div className="action-button-text">
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;