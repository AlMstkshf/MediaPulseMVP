import React from 'react';

interface MentionsErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

const MentionsErrorState: React.FC<MentionsErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="py-4 px-3 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center mb-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-red-500 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        <h3 className="text-sm font-medium text-red-800">Failed to load mentions</h3>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 mb-3">
          {error.message || 'An unknown error occurred'}
        </p>
      )}
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};

export default MentionsErrorState;