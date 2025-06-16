import { ReactNode, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatWidget from "../chat/ChatWidget";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [isLoginPage] = useRoute("/login");
  const { i18n } = useTranslation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, isLoginPage, navigate]);
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  // Don't show layout for login page
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f4e9]">
        <div className="w-16 h-16 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-[#f9f4e9] ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f9f4e9]">
          {children}
        </main>
      </div>
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export { PageLayout };
export default PageLayout;
