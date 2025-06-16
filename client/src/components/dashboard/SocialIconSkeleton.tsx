import React from 'react';

/**
 * Loading skeleton for social media icons
 */
const SocialIconSkeleton: React.FC = () => {
  // Create an array of 5 items to render skeleton icons
  const skeletonItems = Array(5).fill(null);

  return (
    <div className="flex justify-center items-center flex-wrap gap-y-6">
      {skeletonItems.map((_, index) => (
        <div key={index} className="flex flex-col items-center mx-4 animate-pulse">
          <div className="relative p-3 rounded-full">
            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="relative w-8 h-8"></div>
          </div>
          <div className="mt-2 h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="mt-1 h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SocialIconSkeleton;