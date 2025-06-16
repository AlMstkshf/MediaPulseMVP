import React, { useEffect, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { forceTranslation } from '../../lib/i18n/namespace-loader';

/**
 * This component ensures critical dashboard translations are available
 * It forces essential translations to be available regardless of language loading issues
 */
const DashboardTranslationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const dashboardEssentials = {
      en: {
        // Essential English translations that must be available
        'dashboard.title': 'Dashboard',
        'dashboard.widgets.customContent': 'Custom Content',
        'dashboard.widgets.settings': 'Settings',
        'dashboard.widgets.remove': 'Remove',
        'dashboard.widgets.customContentSettings.label': 'Custom Content (HTML supported):',
        'dashboard.widgets.customContentSettings.placeholder': 'Enter your custom content here...',
        'dashboard.widgets.customContentSettings.helpText': 'Use HTML tags to format your content. For example, <h3>Title</h3> for headings, <p>Text</p> for paragraphs, <ul><li>Item</li></ul> for lists.',
        'dashboard.widgets.customContentSettings.rtlSupport': 'RTL Language Support:',
        'dashboard.widgets.customContentSettings.rtlSupportText': 'Your content will automatically display correctly in right-to-left languages like Arabic.'
      },
      ar: {
        // Essential Arabic translations that must be available
        'dashboard.title': 'لوحة التحكم',
        'dashboard.widgets.customContent': 'محتوى مخصص',
        'dashboard.widgets.settings': 'إعدادات',
        'dashboard.widgets.remove': 'إزالة',
        'dashboard.widgets.customContentSettings.label': 'المحتوى المخصص (يدعم HTML):',
        'dashboard.widgets.customContentSettings.placeholder': 'أدخل المحتوى المخصص هنا...',
        'dashboard.widgets.customContentSettings.helpText': 'استخدم علامات HTML لتنسيق المحتوى الخاص بك. على سبيل المثال، <h3>العنوان</h3> للعناوين، <p>النص</p> للفقرات، <ul><li>العنصر</li></ul> للقوائم.',
        'dashboard.widgets.customContentSettings.rtlSupport': 'دعم اللغات من اليمين إلى اليسار:',
        'dashboard.widgets.customContentSettings.rtlSupportText': 'سيتم عرض المحتوى الخاص بك تلقائيًا بشكل صحيح في اللغات التي تُكتب من اليمين إلى اليسار مثل العربية.'
      }
    };
    
    // Force load critical translations
    const currentLang = i18n.language;
    const translations = currentLang === 'ar' ? dashboardEssentials.ar : dashboardEssentials.en;
    
    // Load all the essential translations
    Object.entries(translations).forEach(([key, value]) => {
      forceTranslation(currentLang, key, value);
    });
    
    // Also load them for the fallback language if it's different
    if (i18n.options.fallbackLng && i18n.options.fallbackLng !== currentLang) {
      const fallbackLang = 'en'; // Default fallback
      const fallbackTranslations = dashboardEssentials.en;
      
      Object.entries(fallbackTranslations).forEach(([key, value]) => {
        forceTranslation(fallbackLang, key, value);
      });
    }
    
    // Log completion
    console.log(`Forced critical dashboard translations for ${currentLang}`);
  }, [i18n.language]);
  
  return <>{children}</>;
};

export default DashboardTranslationProvider;