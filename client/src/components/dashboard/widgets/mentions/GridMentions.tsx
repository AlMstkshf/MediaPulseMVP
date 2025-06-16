import React from 'react';
import { Mention } from '@/types/mentions';
import { getSentimentInfo, getSourceInfo, formatDate, truncateText } from '@/utils/mentionsHelpers';

interface GridMentionsProps {
  mentions: Mention[];
  onMentionClick?: (mention: Mention) => void;
}

const GridMentions: React.FC<GridMentionsProps> = ({ mentions, onMentionClick }) => {
  const handleMentionClick = (e: React.MouseEvent<HTMLAnchorElement>, mention: Mention) => {
    if (onMentionClick) {
      e.preventDefault();
      onMentionClick(mention);
      window.open(mention.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (mentions.length === 0) {
    return (
      <div className="text-center py-5 text-gray-500 col-span-full">
        No mentions found for the selected criteria
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {mentions.map((mention) => {
        const { color, icon } = getSentimentInfo(mention.sentiment);
        const { badge, color: badgeColor } = getSourceInfo(mention.platform);
        
        return (
          <div 
            key={mention.id} 
            className="border border-gray-200 rounded-md p-3 bg-gray-50"
          >
            <div className="flex items-center gap-1 mb-2">
              <span title={`Sentiment: ${mention.sentiment}`} style={{ color }}>
                {icon}
              </span>
              <span 
                className="px-2 py-0.5 rounded-full text-white text-xs"
                style={{ backgroundColor: badgeColor }}
              >
                {badge}
              </span>
            </div>
            
            <a 
              href={mention.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => handleMentionClick(e, mention)}
              className="block font-medium text-gray-800 hover:text-gray-900 no-underline text-xs mb-2"
            >
              {truncateText(mention.title, 50)}
            </a>
            
            <div className="text-xs text-gray-500">
              {mention.source}<br />
              {formatDate(mention.date)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridMentions;