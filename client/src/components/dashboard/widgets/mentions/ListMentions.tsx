import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mention } from '@/types/mentions';
import { getSentimentInfo, getSourceInfo, formatDate } from '@/utils/mentionsHelpers';

interface ListMentionsProps {
  mentions: Mention[];
  onMentionClick?: (mention: Mention) => void;
}

const ListMentions: React.FC<ListMentionsProps> = ({ mentions, onMentionClick }) => {
  const { t } = useTranslation();
  
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
        {t('dashboard.media_mentions.noMentionsFound')}
      </div>
    );
  }

  return (
    <ul className="list-none p-0 m-0">
      {mentions.map((mention) => {
        const { color, icon } = getSentimentInfo(mention.sentiment);
        const { badge, color: badgeColor } = getSourceInfo(mention.platform);
        
        return (
          <li key={mention.id} className="py-2 border-b border-gray-100 last:border-0 text-sm">
            <span 
              className="mr-1" 
              title={t('dashboard.media_mentions.sentimentLabel', { sentiment: t(`analysis.${mention.sentiment}`) })} 
              style={{ color }}
            >
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
            
            <div className="mt-1 text-xs text-gray-500">
              {mention.source} • {formatDate(mention.date)}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ListMentions;