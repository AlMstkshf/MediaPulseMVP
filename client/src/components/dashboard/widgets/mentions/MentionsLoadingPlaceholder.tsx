import React from 'react';

const MentionsLoadingPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      
      {/* List item placeholders */}
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="py-2 border-b border-gray-100 last:border-0">
          <div className="flex items-center mb-2">
            <div className="h-3 w-3 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="ml-2 h-4 w-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
        </div>
      ))}
    </div>
  );
};

export default MentionsLoadingPlaceholder;