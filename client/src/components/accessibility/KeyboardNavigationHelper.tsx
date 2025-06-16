import React, { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

/**
 * KeyboardNavigationHelper monitors keyboard interactions
 * and manages keyboard-focused state for the application
 */
export const KeyboardNavigationHelper: React.FC = () => {
  const { setPreference, preferences } = useAccessibility();
  const [lastInteractionWasKeyboard, setLastInteractionWasKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track Tab key for detecting keyboard navigation
      if (e.key === 'Tab') {
        if (!lastInteractionWasKeyboard) {
          setLastInteractionWasKeyboard(true);
          
          // Enable keyboard mode if not already enabled
          if (!preferences.keyboardMode) {
            setPreference('keyboardMode', true);
          }
        }
      }
    };

    // Reset to mouse mode on mouse interaction
    const handleMouseDown = () => {
      if (lastInteractionWasKeyboard) {
        setLastInteractionWasKeyboard(false);
        
        // Don't disable keyboard mode automatically
        // as users might use both mouse and keyboard
      }
    };

    // Listen for keyboard and mouse events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [lastInteractionWasKeyboard, preferences.keyboardMode, setPreference]);

  // This component doesn't render anything
  return null;
};

export default KeyboardNavigationHelper;