import React, { useEffect } from 'react';
import i18next from 'i18next';

/**
 * This component applies a direct fix for translations that aren't loading correctly
 * It bypasses the normal i18next loading mechanism by directly setting translations
 * in the i18next instance
 */
const DirectTranslationFix: React.FC = () => {
  useEffect(() => {
    // Critical dashboard translations in Arabic that must be available
    const criticalArabicTranslations = {
      'dashboard': {
        'title': 'لوحة التحكم',
        'saveChanges': 'حفظ التغييرات',
        'cancel': 'إلغاء',
        'customizeDashboard': 'تخصيص لوحة التحكم',
        'loading': 'جاري تحميل لوحة التحكم...',
        'saveSuccess': 'تم حفظ لوحة التحكم',
        'saveSuccessDescription': 'تم حفظ تخطيط لوحة التحكم بنجاح',
        'saveFailed': 'فشل حفظ لوحة التحكم',
        'widgets': {
          'sentimentAnalysis': 'تحليل المشاعر',
          'mediaMentions': 'الإشارات الإعلامية',
          'keywordTrends': 'اتجاهات الكلمات الرئيسية',
          'entityComparison': 'مقارنة الكيانات',
          'socialMediaStats': 'إحصائيات وسائل التواصل الاجتماعي',
          'recentReports': 'التقارير الحديثة',
          'kpiOverview': 'نظرة عامة على مؤشرات الأداء',
          'customContent': 'محتوى مخصص',
          'settings': 'إعدادات',
          'remove': 'إزالة',
          'displayError': 'لا يمكن عرض هذا المكون',
          'errorMessage': 'حدث خطأ أثناء عرض هذا المكون',
          'customContentSettings': {
            'label': 'المحتوى المخصص (يدعم HTML):',
            'placeholder': 'أدخل المحتوى المخصص هنا...',
            'helpText': 'استخدم علامات HTML لتنسيق المحتوى الخاص بك. على سبيل المثال، <h3>العنوان</h3> للعناوين، <p>النص</p> للفقرات، <ul><li>العنصر</li></ul> للقوائم.',
            'rtlSupport': 'دعم اللغات من اليمين إلى اليسار:',
            'rtlSupportText': 'سيتم عرض المحتوى الخاص بك تلقائيًا بشكل صحيح في اللغات التي تُكتب من اليمين إلى اليسار مثل العربية.'
          }
        }
      },
      'common': {
        'language': 'اللغة',
        'dashboard': 'لوحة التحكم',
        'admin': 'مدير',
        'manager': 'مدير',
        'user': 'مستخدم',
        'guest': 'زائر',
        'userMenu': 'قائمة المستخدم'
      },
      'app': {
        'title': 'نبض الإعلام',
        'version': 'الإصدار'
      }
    };

    // Direct fix for translation issues
    const fixTranslations = () => {
      try {
        // First check if we have Arabic resource bundle
        if (!i18next.hasResourceBundle('ar', 'translation')) {
          // Create empty bundle if it doesn't exist
          i18next.addResourceBundle('ar', 'translation', {}, true, true);
        }
        
        // Get the current Arabic translations
        const currentTranslations = i18next.getResourceBundle('ar', 'translation');
        
        // Add our critical translations, ensuring not to overwrite existing ones that might be working
        const mergedTranslations = { 
          ...currentTranslations,
          ...criticalArabicTranslations
        };
        
        // Replace the entire Arabic resource bundle with our merged version
        i18next.addResourceBundle('ar', 'translation', mergedTranslations, true, true);
        
        // Force immediate reload if we're in Arabic mode
        if (i18next.language === 'ar') {
          // Force the language again to make sure changes are applied 
          i18next.changeLanguage('ar');
        }
        
        console.log('Direct translation fix applied for Arabic dashboard translations');
      } catch (error) {
        console.error('Error applying direct translation fix:', error);
      }
    };

    // Apply fix immediately
    fixTranslations();
    
    // Also apply fix when language changes
    const languageChangedHandler = () => {
      fixTranslations();
    };
    
    i18next.on('languageChanged', languageChangedHandler);
    
    return () => {
      i18next.off('languageChanged', languageChangedHandler);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default DirectTranslationFix;