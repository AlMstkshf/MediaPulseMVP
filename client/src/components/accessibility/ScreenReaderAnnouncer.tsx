import React, { useRef, useEffect } from 'react';

interface AnnouncerProps {
  message: string;
  assertive?: boolean;
}

/**
 * ScreenReaderAnnouncer component
 * Creates a live region for screen readers to announce important information
 * 
 * @param message - The message to announce
 * @param assertive - Whether the announcement should interrupt the current task (assertive) or wait (polite)
 */
export const ScreenReaderAnnouncer: React.FC<AnnouncerProps> = ({ 
  message, 
  assertive = false 
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !announcerRef.current) return;
    
    // Set the message to announce
    announcerRef.current.textContent = message;
    
    // Clear the announcer after a delay to prevent repeated announcements
    const timer = setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <div 
      ref={announcerRef}
      className="a11y-announcer"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    />
  );
};

// Create a hook for using the screen reader announcer
export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = React.useState<{ 
    message: string; 
    assertive: boolean; 
  }>({ message: '', assertive: false });

  const announce = React.useCallback((message: string, assertive = false) => {
    setAnnouncement({ message, assertive });
  }, []);

  return {
    announce,
    Announcer: () => (
      <ScreenReaderAnnouncer 
        message={announcement.message} 
        assertive={announcement.assertive} 
      />
    )
  };
};

export default ScreenReaderAnnouncer;