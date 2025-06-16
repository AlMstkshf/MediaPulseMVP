import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPlaceholderProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error placeholder component with retry button
 * 
 * @param props Component props
 * @returns Error placeholder component
 */
const ErrorPlaceholder: React.FC<ErrorPlaceholderProps> = ({ 
  title = 'Error Loading Data',
  message = 'There was a problem loading the data. Please try again.',
  onRetry,
  className = '' 
}) => {
  return (
    <div 
      className={`my-4 ${className}`}
      aria-live="assertive"
      role="alert"
    >
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="text-sm">{message}</div>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3" 
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorPlaceholder;