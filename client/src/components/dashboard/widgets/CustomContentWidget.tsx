import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

interface CustomContentWidgetProps {
  data: any;
  settings?: any;
}

const CustomContentWidget: React.FC<CustomContentWidgetProps> = ({ data, settings }) => {
  const { t, i18n } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';
  
  // Use custom content from settings or default message, sanitizing any potential component markup
  let content = settings?.customContent || '<p>Add your custom content here by editing the widget settings.</p>';
  
  // Fix for the <noname>reactcontentarea</noname> issue
  // Replace any instances of the erroneously rendered component tags
  content = content.replace(/<noname>reactcontentarea<\/noname>/g, '');
  content = content.replace(/<[\/]?reactcontentarea[^>]*>/g, '');
  
  // If content somehow became empty after sanitization, add default message
  if (!content.trim()) {
    content = `<p>${t('dashboard.widgets.customContent', 'Custom Content Area')}</p>`;
  }
  
  // Sanitize content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_ATTR: ['dir', 'lang'],
    ADD_TAGS: ['rtl', 'bdi', 'bdo']
  });
  
  // Configure DOMPurify to better handle RTL content
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (isRTL && node.nodeName) {
      // Add direction attribute to block elements
      if (/^(DIV|P|H[1-6]|SPAN|UL|OL|LI|TABLE|TR|TD|TH)$/i.test(node.nodeName)) {
        node.setAttribute('dir', 'rtl');
        
        // Only set text alignment if not already specified
        const htmlNode = node as HTMLElement;
        if (htmlNode.style && !htmlNode.style.textAlign) {
          htmlNode.style.textAlign = 'right';
        }
      }
    }
  });
  
  // Apply RTL direction to content after rendering
  useEffect(() => {
    if (contentRef.current) {
      // Apply direction to the content container
      contentRef.current.style.direction = isRTL ? 'rtl' : 'ltr';
      contentRef.current.style.textAlign = isRTL ? 'right' : 'left';
      
      // Apply direction attributes to all elements
      const elements = contentRef.current.querySelectorAll('*');
      elements.forEach((el) => {
        const element = el as HTMLElement;
        if (isRTL) {
          element.setAttribute('dir', 'rtl');
          // Apply RTL class to allow stylesheet targeting
          element.classList.add('custom-widget-rtl');
        } else {
          element.setAttribute('dir', 'ltr');
          element.classList.remove('custom-widget-rtl');
        }
      });
    }
  }, [sanitizedContent, isRTL]);
  
  return (
    <div className={`custom-content-widget ${isRTL ? 'rtl-content' : 'ltr-content'} ${isRTL ? 'custom-widget-html-content' : ''}`}>
      <div 
        ref={contentRef}
        className="custom-content"
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={isRTL ? 'ar' : 'en'}
        data-rtl={isRTL ? 'true' : 'false'}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
};

export default CustomContentWidget;