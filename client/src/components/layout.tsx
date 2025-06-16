import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  FileText, 
  BarChart3, 
  Users, 
  MonitorPlay, 
  Radio, 
  Video, 
  HelpCircle,
  Sun,
  Moon,
  Globe,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// Theme toggle component using next-themes
const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// Language toggle component
const LanguageToggle = () => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    // Store language preference
    localStorage.setItem('i18nextLng', newLang);
    // Handle RTL/LTR
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle language"
      className="h-9 w-9"
      onClick={toggleLanguage}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
};
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

type LayoutProps = {
  children: React.ReactNode;
  hideNav?: boolean;
};

export default function Layout({ children, hideNav = false }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Navigation items
  const navigationItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/",
      active: location === "/",
    },
    {
      title: "Media Center",
      icon: <MonitorPlay className="h-5 w-5" />,
      href: "/media-center",
      active: location.startsWith("/media-center"),
    },
    {
      title: "Social Media",
      icon: <Radio className="h-5 w-5" />,
      href: "/social-media",
      active: location.startsWith("/social-media"),
    },
    {
      title: "Social Publishing",
      icon: <Radio className="h-5 w-5" />,
      href: "/social-publishing",
      active: location.startsWith("/social-publishing"),
    },
    {
      title: "Monitoring",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/monitoring",
      active: location.startsWith("/monitoring"),
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      href: "/reports",
      active: location.startsWith("/reports"),
    },
    {
      title: "Context Hints",
      icon: <Languages className="h-5 w-5" />,
      href: "/context-hints",
      active: location.startsWith("/context-hints"),
    },
    {
      title: "Tutorials",
      icon: <Video className="h-5 w-5" />,
      href: "/tutorials",
      active: location.startsWith("/tutorials"),
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      active: location.startsWith("/users"),
      adminOnly: true,
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/support",
      active: location.startsWith("/support") || location.startsWith("/help"),
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      active: location.startsWith("/settings"),
    },
  ];

  // Filtered navigation for the current user
  const filteredNavigation = navigationItems.filter(
    (item) => !item.adminOnly || (user && user.role === "admin")
  );

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation for desktop
  const DesktopNav = () => (
    <div className="fixed inset-y-0 start-0 z-50 hidden w-72 flex-col bg-background shadow-sm border-r lg:flex">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
              AP
            </div>
            <span className="text-xl font-semibold tracking-tight">
              {t('app.title')}
            </span>
          </a>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-[#cba344] bg-opacity-20 text-[#8a6c14] font-semibold dark:bg-opacity-30 dark:text-[#f0d78b]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {t(`navigation.${item.title.toLowerCase().replace(/\s+/g, "")}`)}
              </a>
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      {user.username}
                    </p>
                    {user.role === "admin" && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="mt-1 w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("navigation.logout")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button className="w-full">{t("navigation.login")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile navigation
  const MobileNav = () => (
    <div className="flex lg:hidden items-center justify-between h-16 px-4 border-b bg-background">
      <Link href="/">
        <a className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            AP
          </div>
          <span className="text-xl font-semibold tracking-tight">
            {t('app.title')}
          </span>
        </a>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
              <Link href="/">
                <a className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
                    AP
                  </div>
                  <span className="text-xl font-semibold tracking-tight">
                    {t('app.title')}
                  </span>
                </a>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="flex flex-1 flex-col">
              <nav className="space-y-1 px-3 py-4">
                {filteredNavigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-[#cba344] bg-opacity-20 text-[#8a6c14] font-semibold dark:bg-opacity-30 dark:text-[#f0d78b]"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {item.icon}
                      {t(`navigation.${item.title.toLowerCase().replace(/\s+/g, "")}`)}
                    </a>
                  </Link>
                ))}
              </nav>
              <div className="border-t p-4 mt-auto">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="mt-1 w-full justify-start gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("navigation.logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login">
                      <Button className="w-full">
                        {t("navigation.login")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  if (hideNav) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <DesktopNav />
      <MobileNav />

      <main className="lg:pl-72">
        {children}
      </main>
    </div>
  );
}