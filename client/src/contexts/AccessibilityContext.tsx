import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  keyboardMode: boolean;
  screenReaderMode: boolean;
  focusIndicators: boolean;
}

export interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  setPreference: (key: keyof AccessibilityPreferences, value: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  keyboardMode: false,
  screenReaderMode: false,
  focusIndicators: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load preferences from localStorage
  const loadPreferences = (): AccessibilityPreferences => {
    const savedPrefs = localStorage.getItem('accessibility-preferences');
    if (savedPrefs) {
      try {
        return JSON.parse(savedPrefs);
      } catch (e) {
        console.error('Error parsing saved accessibility preferences', e);
      }
    }
    
    // Set prefers-reduced-motion system preference by default
    const systemReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { 
      ...defaultPreferences, 
      reduceMotion: systemReduceMotion 
    };
  };

  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);

  // Load preferences on initial render
  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    document.documentElement.classList.toggle('high-contrast-mode', preferences.highContrast);
    document.documentElement.classList.toggle('large-text-mode', preferences.largeText);
    document.documentElement.classList.toggle('reduce-motion', preferences.reduceMotion);
    document.documentElement.classList.toggle('keyboard-mode', preferences.keyboardMode);
    document.documentElement.classList.toggle('screen-reader-mode', preferences.screenReaderMode);
    document.documentElement.classList.toggle('focus-visible-mode', preferences.focusIndicators);
    
  }, [preferences]);

  // Listen for system preference changes
  useEffect(() => {
    const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreference('reduceMotion', e.matches);
    };

    reducedMotionMediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => {
      reducedMotionMediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const setPreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, setPreference, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Keyboard navigation hook
export const useKeyboardNavigation = (elementRef: React.RefObject<HTMLElement>, options?: {
  focusKeys?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  const { preferences } = useAccessibility();

  useEffect(() => {
    if (!preferences.keyboardMode || !elementRef.current) return;
    
    const element = elementRef.current;
    const focusKeys = options?.focusKeys || ['Enter', ' '];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusKeys.includes(e.key)) {
        e.preventDefault();
        element.focus();
        options?.onFocus?.();
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementRef, preferences.keyboardMode, options]);
};

// Focus trap hook for modals and dialogs
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Set focus to first element
    firstElement.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      // If shift + tab and on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab and on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
};