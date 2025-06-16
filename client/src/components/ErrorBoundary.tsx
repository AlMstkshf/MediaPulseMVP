
import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Component Error</h2>
            <div className="mb-6 space-y-4">
              <div className="bg-red-50 p-4 rounded">
                <p className="text-red-700 font-medium">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="bg-gray-50 p-4 rounded overflow-auto max-h-48">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-[#cba344] text-white rounded-md hover:bg-[#b8943e] transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
