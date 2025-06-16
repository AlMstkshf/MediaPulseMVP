import React from 'react';
import MentionsWidget from '@/components/MentionsWidget';
import SocketStatus from '@/components/shared/SocketStatus';
import { SectionErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * Demo page for showcasing the mentions functionality
 */
const MentionsDemoPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Media Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SectionErrorBoundary>
            <MentionsWidget 
              title="Recent Entity Mentions" 
              limit={6}
            />
          </SectionErrorBoundary>
        </div>
        
        <div className="space-y-6">
          <SocketStatus />
          
          {/* Additional dashboard widgets can be added here */}
        </div>
      </div>
    </div>
  );
};

export default MentionsDemoPage;