import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Import components
import SocialMediaIcons from './SocialMediaIcons';
import BadgeGroup from './widgets/BadgeGroup';
import { SectionErrorBoundary } from '@/components/shared/ErrorBoundary';
import SocketStatus from '@/components/shared/SocketStatus';

// Import hooks
import { useSocket } from '@/hooks/useSocket';
import { useCreateSocialPost } from '@/hooks/useCreateSocialPost';

// Import platform config
import PLATFORMS from '@/config/platforms';

const SocialMediaStats: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastPlatform, setLastPlatform] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const lastPlatformTimeoutRef = useRef<number | null>(null);
  
  // Set up WebSocket connection (now using polling under the hood)
  const { 
    connected,
    sendMessage
  } = useSocket({
    autoConnect: true
  });
  
  // Use our API hook for creating social posts
  const { createPost, isLoading } = useCreateSocialPost();
  
  // Function to handle the creation of a test post
  const handleCreateTestPost = (platform: string) => {
    setLastPlatform(platform); // For UI highlighting
    
    // Create post data
    const postData = {
      platform: platform,
      content: `Test post for ${platform} platform created at ${new Date().toLocaleTimeString()}`,
      authorName: 'Test User',
      authorUsername: 'testuser',
      postUrl: 'https://example.com/test'
    };
    
    // Call the post creation function
    createPost(postData).then((data) => {
      toast({
        title: "Success",
        description: `Created test post for ${platform}`,
        duration: 3000
      });
      
      // Force immediate polling update if real-time is enabled
      if (realTimeEnabled) {
        // Invalidate queries to trigger poll updates
        queryClient.invalidateQueries({ 
          queryKey: ['/api/social-posts/count-by-platform'] 
        });
      }
    }).catch((error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
        duration: 5000
      });
    });
    
    // Clean up any existing timeout
    if (lastPlatformTimeoutRef.current) {
      window.clearTimeout(lastPlatformTimeoutRef.current);
    }
    
    // Set new timeout to clear platform highlighting
    lastPlatformTimeoutRef.current = window.setTimeout(() => {
      setLastPlatform(null);
      lastPlatformTimeoutRef.current = null;
    }, 5000);
  };
  
  // Toggle real-time updates
  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
    toast({
      title: realTimeEnabled ? "Real-time Updates Disabled" : "Real-time Updates Enabled",
      description: realTimeEnabled 
        ? "Updates will require page refresh" 
        : "You will see updates immediately",
      duration: 3000
    });
  };
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (lastPlatformTimeoutRef.current) {
        window.clearTimeout(lastPlatformTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <SectionErrorBoundary title="Error in Social Media Monitoring">
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 lg:col-span-9 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Social Media Monitoring</CardTitle>
            <BadgeGroup
              connected={connected}
              realTimeEnabled={realTimeEnabled}
              onToggleRealTime={toggleRealTime}
            />
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="mb-4">
              <SocialMediaIcons />
            </div>
            
            {!connected && (
              <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Polling connection is not active. Updates are disabled.
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center">
              {PLATFORMS.map((platform) => (
                <Button 
                  key={platform.name}
                  variant={lastPlatform === platform.name ? "default" : "outline"}
                  onClick={() => handleCreateTestPost(platform.name)}
                  disabled={isLoading}
                  size="sm"
                  className={`${lastPlatform === platform.name 
                    ? `${platform.color} ${platform.hoverColor} ${platform.textColor || ''}`
                    : ""
                  } whitespace-nowrap`}
                >
                  {isLoading && lastPlatform === platform.name ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  Simulate {platform.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Socket status card */}
        <div className="col-span-12 lg:col-span-3">
          <SocketStatus />
        </div>
      </div>
    </SectionErrorBoundary>
  );
};

export default SocialMediaStats;