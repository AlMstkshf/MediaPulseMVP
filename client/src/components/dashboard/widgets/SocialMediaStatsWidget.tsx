import React from 'react';

interface SocialMediaStatsWidgetProps {
  data: any;
  settings?: any;
}

// Default sample data for demonstration
const DEFAULT_STATS = {
  platforms: {
    twitter: { mentions: 245, positive: 160, neutral: 65, negative: 20 },
    facebook: { mentions: 180, positive: 120, neutral: 45, negative: 15 },
    instagram: { mentions: 130, positive: 100, neutral: 25, negative: 5 },
    linkedin: { mentions: 90, positive: 70, neutral: 15, negative: 5 },
    news: { mentions: 75, positive: 40, neutral: 25, negative: 10 }
  },
  totals: {
    mentions: 720,
    positive: 490,
    neutral: 175,
    negative: 55
  }
};

const SocialMediaStatsWidget: React.FC<SocialMediaStatsWidgetProps> = ({ data, settings }) => {
  const stats = data.socialStats || DEFAULT_STATS;
  const dataSource = settings?.dataSource || 'all';
  const timeRange = settings?.timeRange || 'week';
  
  // Function to get platform name from key
  const getPlatformName = (key: string) => {
    switch(key) {
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      case 'news':
        return 'News Sources';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };
  
  // Function to get platform icon
  const getPlatformIcon = (key: string) => {
    switch(key) {
      case 'twitter':
        return '🐦';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      case 'news':
        return '📰';
      default:
        return '🌐';
    }
  };
  
  // Function to filter platforms based on dataSource
  const getPlatforms = () => {
    if (dataSource === 'all') {
      return Object.keys(stats.platforms);
    } else {
      return [dataSource];
    }
  };
  
  // Calculate totals for filtered platforms
  const calculateFilteredTotals = () => {
    const platforms = getPlatforms();
    return {
      mentions: platforms.reduce((sum, platform) => sum + stats.platforms[platform].mentions, 0),
      positive: platforms.reduce((sum, platform) => sum + stats.platforms[platform].positive, 0),
      neutral: platforms.reduce((sum, platform) => sum + stats.platforms[platform].neutral, 0),
      negative: platforms.reduce((sum, platform) => sum + stats.platforms[platform].negative, 0)
    };
  };
  
  const filteredTotals = calculateFilteredTotals();
  
  // Create sentiment percentage for visualization
  const sentimentPercentages = {
    positive: (filteredTotals.positive / filteredTotals.mentions) * 100,
    neutral: (filteredTotals.neutral / filteredTotals.mentions) * 100,
    negative: (filteredTotals.negative / filteredTotals.mentions) * 100
  };
  
  return (
    <div className="social-media-stats-widget">
      <div className="widget-info">
        <p>
          {dataSource === 'all' ? 'All Platforms' : getPlatformName(dataSource)} | 
          {timeRange === 'day' ? ' Last 24 Hours' : 
           timeRange === 'week' ? ' Last 7 Days' : 
           timeRange === 'month' ? ' Last 30 Days' : ' Last 90 Days'}
        </p>
      </div>
      
      {/* Total mentions summary */}
      <div className="mentions-summary" style={{ 
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {filteredTotals.mentions}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Total Mentions
        </div>
      </div>
      
      {/* Sentiment bar */}
      <div className="sentiment-bar" style={{ marginBottom: '15px' }}>
        <div style={{ 
          height: '20px', 
          display: 'flex', 
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${sentimentPercentages.positive}%`, 
            backgroundColor: '#4CAF50',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {sentimentPercentages.positive > 10 ? `${Math.round(sentimentPercentages.positive)}%` : ''}
          </div>
          <div style={{ 
            width: `${sentimentPercentages.neutral}%`, 
            backgroundColor: '#FFC107',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {sentimentPercentages.neutral > 10 ? `${Math.round(sentimentPercentages.neutral)}%` : ''}
          </div>
          <div style={{ 
            width: `${sentimentPercentages.negative}%`, 
            backgroundColor: '#F44336',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {sentimentPercentages.negative > 10 ? `${Math.round(sentimentPercentages.negative)}%` : ''}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div>Positive: {filteredTotals.positive}</div>
          <div>Neutral: {filteredTotals.neutral}</div>
          <div>Negative: {filteredTotals.negative}</div>
        </div>
      </div>
      
      {/* Platform breakdown */}
      <div className="platform-breakdown">
        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Platform Breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {getPlatforms().map(platform => {
            const platformData = stats.platforms[platform];
            const platformTotal = platformData.mentions;
            const posPercentage = (platformData.positive / platformTotal) * 100;
            const neuPercentage = (platformData.neutral / platformTotal) * 100;
            const negPercentage = (platformData.negative / platformTotal) * 100;
            
            return (
              <div key={platform} className="platform-item" style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px'
              }}>
                <div style={{ marginRight: '10px', fontSize: '20px' }}>
                  {getPlatformIcon(platform)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {getPlatformName(platform)}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {platformTotal}
                    </div>
                  </div>
                  <div style={{ 
                    height: '6px', 
                    display: 'flex', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ width: `${posPercentage}%`, backgroundColor: '#4CAF50' }}></div>
                    <div style={{ width: `${neuPercentage}%`, backgroundColor: '#FFC107' }}></div>
                    <div style={{ width: `${negPercentage}%`, backgroundColor: '#F44336' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStatsWidget;