import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  LayoutGrid,
  Film,
  Hash,
  Radio,
  GraduationCap,
  Settings,
  HelpCircle,
  Building2,
  Award,
  BrainCircuit,
  UsersRound,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SmartRecommendations from "@/components/layout/SmartRecommendations";

interface SidebarProps {
  isMobile?: boolean;
}

interface NavItemProps {
  name: string;
  icon: React.ReactNode;
  path: string;
  isActive: boolean;
  isMobile?: boolean;
  badge?: string;
  onClick?: () => void;
}

// Component for individual navigation items
const NavItem = ({ name, icon, path, isActive, isMobile = false, badge, onClick }: NavItemProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <Link href={path} 
      className={`
        flex items-center p-3 rounded-md font-medium transition-colors
        ${isActive 
          ? "bg-[#cba344] bg-opacity-20 text-[#8a6c14] font-semibold dark:bg-opacity-30 dark:text-[#f0d78b]" 
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        }
      `}
      onClick={onClick}
      role="menuitem"
    >
      <span className={`flex items-center ${isRTL ? 'ml-2' : 'mr-2'}`}>
        {icon}
      </span>
      <span className="flex-grow">{name}</span>
      {badge && (
        <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const isRTL = i18n.language === 'ar';

  // Flatten all navigation items into appropriate groups
  const mainNavItems = [
    // Dashboard items
    {
      name: t('navigation.dashboard'),
      icon: <LayoutDashboard className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/"
    },
    {
      name: t('navigation.personalizedDashboard'),
      icon: <LayoutGrid className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/dashboard/personalized"
    },
    
    // Media and Monitoring items
    {
      name: t('navigation.mediaCenter'),
      icon: <Film className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/media-center"
    },
    {
      name: t('navigation.socialMediaManagement'),
      icon: <Hash className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/social-media"
    },
    {
      name: t('navigation.entityMonitoring'),
      icon: <Building2 className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/entity-monitoring",
    },
    
    // Report items
    {
      name: t('navigation.smartReports'),
      icon: <BrainCircuit className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/reports"
    },
    {
      name: t('navigation.excellenceIndicators'),
      icon: <Award className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/excellence-indicators"
    },
    
    // Resource items
    {
      name: t('navigation.tutorials'),
      icon: <GraduationCap className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/tutorials"
    },
    {
      name: t('navigation.users'),
      icon: <UsersRound className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/users",
      badge: '5'
    }
  ];

  const bottomNavItems = [
    {
      name: t('navigation.settings'),
      icon: <Settings className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/settings"
    },
    {
      name: t('navigation.help'),
      icon: <HelpCircle className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />,
      path: "/support"
    }
  ];

  const isActive = (path: string) => {
    // Handle sub-paths like /entity-monitoring/:id
    if (path.endsWith('*')) {
      const basePath = path.slice(0, -1);
      return location.startsWith(basePath);
    }
    return location === path;
  };

  return (
    <aside 
      className={`
        bg-white dark:bg-gray-900 shadow-md flex flex-col h-full
        ${isMobile ? 'w-full' : 'w-[250px] hidden md:flex'}
        transition-all duration-300 ease-in-out
      `}
      aria-label={t('navigation.sidebarLabel', 'Main Navigation')}
    >
      <div className="p-4 flex-grow overflow-y-auto scrollbar-thin">
        <nav className="space-y-1">
          <ul role="menu">
            {mainNavItems.map((item, index) => (
              <li key={index} className="mb-2" role="none">
                <NavItem 
                  name={item.name} 
                  icon={item.icon} 
                  path={item.path} 
                  isActive={isActive(item.path)}
                  isMobile={isMobile}
                  badge={item.badge}
                />
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Smart Context-Aware Recommendations */}
        <div className="mt-6">
          <SmartRecommendations />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <ul role="menu">
          {bottomNavItems.map((item, index) => (
            <li key={index} className="mb-1" role="none">
              <NavItem 
                name={item.name} 
                icon={item.icon} 
                path={item.path} 
                isActive={isActive(item.path)}
                isMobile={isMobile}
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
