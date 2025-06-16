import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface MentionsLoadingPlaceholderProps {
  count?: number;
  className?: string;
}

/**
 * Loading placeholder component for mentions list
 * 
 * @param props Component props
 * @returns Loading placeholder component
 */
const MentionsLoadingPlaceholder: React.FC<MentionsLoadingPlaceholderProps> = ({ 
  count = 3,
  className = '' 
}) => {
  return (
    <div 
      className={`space-y-4 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-grow">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MentionsLoadingPlaceholder;