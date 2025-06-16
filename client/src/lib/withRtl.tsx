import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A Higher Order Component (HOC) that adds RTL support to any component
 * @param Component The component to wrap with RTL support
 * @returns A new component with RTL support
 */
export function withRtl<P extends object>(
  Component: React.ComponentType<P & { rtl?: boolean }>
): React.FC<P & { rtl?: boolean }> {
  const WithRtlComponent: React.FC<P & { rtl?: boolean }> = (props) => {
    const { i18n } = useTranslation();
    const isRtl = props.rtl ?? (i18n.language === 'ar');
    
    // Pass the rtl prop to the wrapped component
    return <Component {...props} rtl={isRtl} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithRtlComponent.displayName = `withRtl(${displayName})`;

  return WithRtlComponent;
}