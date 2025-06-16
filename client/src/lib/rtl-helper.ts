import { useTranslation } from "react-i18next";

/**
 * Simple hook to check if the current language is RTL
 */
export function useRTL() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return { isRTL };
}

/**
 * Hook to get RTL-aware style helpers
 */
export function useRtlDirection() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return {
    isRtl,
    // Text alignment
    textAlign: isRtl ? 'right' : 'left',
    textAlignReverse: isRtl ? 'left' : 'right',
    
    // Flex direction
    flexDirection: isRtl ? 'row-reverse' : 'row',
    flexDirectionReverse: isRtl ? 'row' : 'row-reverse',
    
    // Margins
    marginStart: isRtl ? 'mr' : 'ml',
    marginEnd: isRtl ? 'ml' : 'mr',
    
    // Padding
    paddingStart: isRtl ? 'pr' : 'pl',
    paddingEnd: isRtl ? 'pl' : 'pr',
    
    // Borders
    borderStart: isRtl ? 'border-r' : 'border-l',
    borderEnd: isRtl ? 'border-l' : 'border-r',
    
    // Position
    start: isRtl ? 'right' : 'left',
    end: isRtl ? 'left' : 'right',
    
    // Tailwind utility classes
    margin: {
      start: {
        '0': isRtl ? 'mr-0' : 'ml-0',
        '1': isRtl ? 'mr-1' : 'ml-1',
        '2': isRtl ? 'mr-2' : 'ml-2',
        '3': isRtl ? 'mr-3' : 'ml-3',
        '4': isRtl ? 'mr-4' : 'ml-4',
        '5': isRtl ? 'mr-5' : 'ml-5',
        '6': isRtl ? 'mr-6' : 'ml-6',
        'auto': isRtl ? 'mr-auto' : 'ml-auto',
      },
      end: {
        '0': isRtl ? 'ml-0' : 'mr-0',
        '1': isRtl ? 'ml-1' : 'mr-1',
        '2': isRtl ? 'ml-2' : 'mr-2',
        '3': isRtl ? 'ml-3' : 'mr-3',
        '4': isRtl ? 'ml-4' : 'mr-4',
        '5': isRtl ? 'ml-5' : 'mr-5',
        '6': isRtl ? 'ml-6' : 'mr-6',
        'auto': isRtl ? 'ml-auto' : 'mr-auto',
      }
    },
    padding: {
      start: {
        '0': isRtl ? 'pr-0' : 'pl-0',
        '1': isRtl ? 'pr-1' : 'pl-1',
        '2': isRtl ? 'pr-2' : 'pl-2',
        '3': isRtl ? 'pr-3' : 'pl-3',
        '4': isRtl ? 'pr-4' : 'pl-4',
        '5': isRtl ? 'pr-5' : 'pl-5',
        '6': isRtl ? 'pr-6' : 'pl-6',
      },
      end: {
        '0': isRtl ? 'pl-0' : 'pr-0',
        '1': isRtl ? 'pl-1' : 'pr-1',
        '2': isRtl ? 'pl-2' : 'pr-2',
        '3': isRtl ? 'pl-3' : 'pr-3',
        '4': isRtl ? 'pl-4' : 'pr-4',
        '5': isRtl ? 'pl-5' : 'pr-5',
        '6': isRtl ? 'pl-6' : 'pr-6',
      }
    },
    
    // Utility function to generate RTL-aware class names
    getClass: (baseClass: string, rtlClass: string) => isRtl ? rtlClass : baseClass,
    
    // Apply RTL-aware transform
    getTransform: (transform: string) => {
      if (isRtl && transform.includes('translate')) {
        // Invert horizontal translations
        return transform.replace(/translateX\(([-\d.]+)([a-z%]*)\)/g, (_, val, unit) => 
          `translateX(${-parseFloat(val)}${unit})`
        );
      }
      return transform;
    },
    
    // Icon rotation for directional icons like arrows
    getIconRotation: (baseRotation: number = 0) => {
      if (isRtl) {
        // Invert horizontal direction for icons
        return baseRotation + 180;
      }
      return baseRotation;
    },
    
    // Get RTL-aware CSS object for style prop
    getStyle: (baseStyles: Record<string, any> = {}) => {
      const rtlStyles = { ...baseStyles };
      
      // Handle text alignment
      if (baseStyles.textAlign === 'left') rtlStyles.textAlign = isRtl ? 'right' : 'left';
      if (baseStyles.textAlign === 'right') rtlStyles.textAlign = isRtl ? 'left' : 'right';
      
      // Handle margins
      if ('marginLeft' in baseStyles) {
        rtlStyles[isRtl ? 'marginRight' : 'marginLeft'] = baseStyles.marginLeft;
        if (isRtl) delete rtlStyles.marginLeft;
      }
      if ('marginRight' in baseStyles) {
        rtlStyles[isRtl ? 'marginLeft' : 'marginRight'] = baseStyles.marginRight;
        if (isRtl) delete rtlStyles.marginRight;
      }
      
      // Handle padding
      if ('paddingLeft' in baseStyles) {
        rtlStyles[isRtl ? 'paddingRight' : 'paddingLeft'] = baseStyles.paddingLeft;
        if (isRtl) delete rtlStyles.paddingLeft;
      }
      if ('paddingRight' in baseStyles) {
        rtlStyles[isRtl ? 'paddingLeft' : 'paddingRight'] = baseStyles.paddingRight;
        if (isRtl) delete rtlStyles.paddingRight;
      }
      
      // Handle left/right positioning
      if ('left' in baseStyles) {
        rtlStyles[isRtl ? 'right' : 'left'] = baseStyles.left;
        if (isRtl) delete rtlStyles.left;
      }
      if ('right' in baseStyles) {
        rtlStyles[isRtl ? 'left' : 'right'] = baseStyles.right;
        if (isRtl) delete rtlStyles.right;
      }
      
      return rtlStyles;
    }
  };
}

/**
 * Get RTL-aware flex direction class
 */
export function getRtlFlexDirection(isRtl: boolean, reverse: boolean = false) {
  if (reverse) {
    return isRtl ? 'flex-row' : 'flex-row-reverse';
  }
  return isRtl ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Get RTL-aware text alignment class
 */
export function getRtlTextAlign(isRtl: boolean, reverse: boolean = false) {
  if (reverse) {
    return isRtl ? 'text-left' : 'text-right';
  }
  return isRtl ? 'text-right' : 'text-left';
}