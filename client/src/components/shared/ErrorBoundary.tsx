import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  /** مكون fallback مخصص */
  fallback?: ReactNode;
  /** عنوان الرسالة */
  title?: string;
  /** دالة لإعادة الضبط عند المحاولة مرة أخرى */
  onReset?: () => void;
  /** أنماط CSS إضافية */
  className?: string;
  /** مكونات الأطفال التي يُراد حمايتها */
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch errors in child components
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset boundary when fallback prop changes
    if (this.state.hasError && prevProps.fallback !== this.props.fallback) {
      this.resetErrorBoundary();
    }
  }

  private resetErrorBoundary(): void {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  }

  private handleReset = (): void => {
    this.resetErrorBoundary();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, title = 'Something went wrong', className } = this.props;

    if (!hasError) {
      return this.props.children;
    }

    // If user provided a fallback node, render it
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <Alert
        variant="destructive"
        className={className}
        role="alert"
        aria-live="assertive"
        aria-atomic
      >
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="text-sm">
            {error?.message || 'An unexpected error occurred.'}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={this.handleReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
}

/**
 * Section-specific error boundary component with default title
 */
export function SectionErrorBoundary({
  children,
  title = 'Error loading section',
  ...rest
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary title={title} {...rest}>
      {children}
    </ErrorBoundary>
  );
}
