import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SimpleLanguageSwitcher from "../i18n/SimpleLanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Globe, ChevronDown, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Sidebar from "./Sidebar";
import { changeLanguage as changeAppLanguage } from "@/lib/i18n";
import ConnectionStatusIndicator from "@/components/shared/ConnectionStatusIndicator";
import { ResponsivePreviewToggle } from "@/components/responsive-preview";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [notifications] = useState([
    {
      id: 1,
      message: t('notifications.keywordAlert'),
      time: t('notifications.minutesAgo', { minutes: 10 })
    },
    {
      id: 2,
      message: t('notifications.negativeReaction'),
      time: t('notifications.minutesAgo', { minutes: 25 })
    },
    {
      id: 3,
      message: t('notifications.newReport'),
      time: t('notifications.hoursAgo', { hours: 1 })
    }
  ]);

  const changeLanguage = (lng: string) => {
    // Use the imported function that persists the selection to localStorage
    changeAppLanguage(lng);
  };

  // Check if RTL
  const isRTL = i18n.language === 'ar';
  
  return (
    <header className="bg-background shadow-sm px-4 py-2 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2" aria-label={t('navigation.toggleMenu')}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-64">
            <div className="h-full overflow-auto">
              <Sidebar isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3" aria-hidden="true">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V3M7 14.5V17.5M11.5 10.5V17.5M16 7V17.5M21 3.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold font-sans text-foreground">{t('app.title')}</h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* WebSocket Connection Status */}
        <div className="hidden md:block">
          <ConnectionStatusIndicator showLabel={true} size="md" />
        </div>
        
        {/* Compact status indicator for mobile */}
        <div className="block md:hidden">
          <ConnectionStatusIndicator showLabel={false} size="sm" />
        </div>
        
        {/* Notifications Menu - Collapse text on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-10 px-2 sm:px-3">
              <span className="sr-only">{t('notifications.title')}</span>
              <span className="hidden sm:inline mx-2">{t('notifications.title')}</span>
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive">
                <span aria-hidden="true">{notifications.length}</span>
                <span className="sr-only">{t('notifications.count', { count: notifications.length })}</span>
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('notifications.title')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="py-3 px-4 hover:bg-accent cursor-pointer flex flex-col items-start">
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-3 px-4 text-center text-sm text-muted-foreground">
                {t('notifications.noNotifications', 'No notifications')}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle className="h-10" />
        
        {/* Responsive Preview Toggle */}
        <div className="hidden sm:block">
          <ResponsivePreviewToggle iconOnly variant="ghost" className="h-10" />
        </div>
        
        {/* Simple Language Switcher */}
        <div className="language-switcher">
          <SimpleLanguageSwitcher />
        </div>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center h-10 px-2">
                <span className="sr-only">{t('common.userMenu')}</span>
                <img 
                  src={user.avatarUrl || "/avatar-placeholder.png"} 
                  alt="" 
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="mx-2 text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {t(`common.${user.role.toLowerCase()}`)} 
                    {user.role === "admin" && (
                      <Badge className="ml-1 bg-primary text-white text-xs">
                        {t('common.admin')}
                      </Badge>
                    )}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 ml-1 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="sm:hidden">{user.fullName}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href="/profile">{t('settings.profileSettings')}</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
