import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
}

/**
 * Standard dashboard layout component with header and sidebar
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  fullWidth = false 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0 border-r border-border bg-card">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 overflow-auto p-4 md:p-6 ${fullWidth ? 'max-w-full' : 'max-w-7xl mx-auto'}`}>
          {title && (
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;