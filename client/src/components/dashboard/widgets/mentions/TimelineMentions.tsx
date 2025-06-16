import React from 'react';
import { Mention } from '@/types/mentions';
import { getSentimentInfo, getSourceInfo, formatDate } from '@/utils/mentionsHelpers';

interface TimelineMentionsProps {
  mentions: Mention[];
  onMentionClick?: (mention: Mention) => void;
}

const TimelineMentions: React.FC<TimelineMentionsProps> = ({ mentions, onMentionClick }) => {
  const handleMentionClick = (e: React.MouseEvent<HTMLAnchorElement>, mention: Mention) => {
    if (onMentionClick) {
      e.preventDefault();
      onMentionClick(mention);
      window.open(mention.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (mentions.length === 0) {
    return (
      <div className="text-center py-5 text-gray-500">
        No mentions found for the selected criteria
      </div>
    );
  }

  return (
    <div className="relative pl-5">
      {/* Vertical timeline line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200 z-10"></div>
      
      {mentions.map((mention) => {
        const { color, icon } = getSentimentInfo(mention.sentiment);
        const { badge, color: badgeColor } = getSourceInfo(mention.platform);
        
        return (
          <div 
            key={mention.id}
            className="relative mb-4 pl-4"
          >
            {/* Timeline dot */}
            <div 
              className="absolute left-[-8px] top-0 w-3 h-3 rounded-full border-2 border-white z-20"
              style={{ backgroundColor: color }}
            ></div>
            
            {/* Content */}
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="text-xs font-medium mb-2 text-gray-500">
                {formatDate(mention.date)}
              </div>
              
              <div className="mb-2">
                <span className="mr-1" title={`Sentiment: ${mention.sentiment}`} style={{ color }}>
                  {icon}
                </span>
                
                <a 
                  href={mention.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => handleMentionClick(e, mention)}
                  className="font-medium text-gray-800 hover:text-gray-900 no-underline"
                >
                  {mention.title}
                </a>
                
                <span 
                  className="ml-2 px-2 py-0.5 rounded-full text-white text-xs"
                  style={{ backgroundColor: badgeColor }}
                >
                  {badge}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Source: {mention.source}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineMentions;