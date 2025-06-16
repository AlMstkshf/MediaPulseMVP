import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ResponsivePreview } from './ResponsivePreview';

type ResponsivePreviewContextType = {
  isEnabled: boolean;
  enablePreview: () => void;
  disablePreview: () => void;
  togglePreview: () => void;
};

const ResponsivePreviewContext = createContext<ResponsivePreviewContextType>({
  isEnabled: false,
  enablePreview: () => {},
  disablePreview: () => {},
  togglePreview: () => {},
});

export const useResponsivePreview = () => useContext(ResponsivePreviewContext);

interface ResponsivePreviewProviderProps {
  children: ReactNode;
}

export function ResponsivePreviewProvider({ children }: ResponsivePreviewProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const enablePreview = () => setIsEnabled(true);
  const disablePreview = () => setIsEnabled(false);
  const togglePreview = () => setIsEnabled((prev) => !prev);

  return (
    <ResponsivePreviewContext.Provider
      value={{
        isEnabled,
        enablePreview,
        disablePreview,
        togglePreview,
      }}
    >
      {isEnabled ? <ResponsivePreview defaultOpen={true}>{children}</ResponsivePreview> : children}
    </ResponsivePreviewContext.Provider>
  );
}