import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SkipLink component provides keyboard users a way to bypass navigation
 * and jump directly to main content
 */
export const SkipLink: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      aria-label={t('accessibility.skipToContent', 'Skip to main content')}
    >
      {t('accessibility.skipToContent', 'Skip to main content')}
    </a>
  );
};

export default SkipLink;