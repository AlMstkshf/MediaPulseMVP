import React from 'react';
import { useTranslation } from 'react-i18next';

interface KeywordTrendsWidgetProps {
  data: any;
  settings?: any;
}

// Simulated data for demo purposes
const DEFAULT_KEYWORDS = ['digital', 'innovation', 'sustainability', 'AI', 'smart city'];
const DEFAULT_DATA = {
  digital: [25, 32, 41, 38, 29, 35, 42],
  innovation: [18, 25, 33, 39, 42, 40, 38],
  sustainability: [10, 15, 22, 30, 37, 45, 50],
  AI: [5, 8, 12, 18, 25, 35, 40],
  'smart city': [15, 18, 24, 28, 30, 34, 38]
};

const KeywordTrendsWidget: React.FC<KeywordTrendsWidgetProps> = ({ data, settings }) => {
  const { t } = useTranslation();
  const trendData = data.trends || DEFAULT_DATA;
  const trendType = settings?.trendType || 'volume';
  const userKeywords = settings?.keywords ? settings.keywords.split(',').map((k: string) => k.trim()) : null;
  const keywords = userKeywords || DEFAULT_KEYWORDS;
  const timeRange = settings?.timeRange || 'week';
  
  // Hardcoded translations with fallback for when i18n fails
  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    // If the translated value is the same as the key, it means translation failed
    return translated === key ? fallback : translated;
  };

  // Labels for the chart (days of the week, etc.)
  const dayLabels = [
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.mon", "Mon"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.tue", "Tue"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.wed", "Wed"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.thu", "Thu"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.fri", "Fri"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.sat", "Sat"),
    getTranslation("dashboard.widgets.sentimentAnalysis.weekdays.sun", "Sun")
  ];
  
  // Function to generate a color based on keyword string
  const getColorForKeyword = (keyword: string) => {
    // Simple hash function to generate consistent colors for keywords
    const hash = keyword.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h = Math.abs(hash % 360);
    const s = 70;
    const l = 50;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };
  
  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case 'day':
        return getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.day", "Last 24 Hours");
      case 'week':
        return getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.week", "Last 7 Days");
      case 'month':
        return getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.month", "Last 30 Days");
      case 'quarter':
        return getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.quarter", "Last 90 Days");
      default:
        return getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.week", "Last 7 Days");
    }
  };

  const getTrendTypeLabel = () => {
    switch(trendType) {
      case 'volume':
        return getTranslation("dashboard.keyword_trends.volume", "Mention Volume");
      case 'sentiment':
        return getTranslation("dashboard.sentiment_analysis.title", "Sentiment Analysis");
      case 'engagement':
        return getTranslation("dashboard.social_media_activity.title", "Social Media Engagement");
      default:
        return getTranslation("dashboard.keyword_trends.volume", "Mention Volume");
    }
  };
  
  // Additional translations with fallbacks
  const translations = {
    trendingKeywords: getTranslation("dashboard.keyword_trends.trending_keywords", "Trending Keywords"),
    high: getTranslation("common.high", "High"),
    medium: getTranslation("common.medium", "Medium"),
    low: getTranslation("common.low", "Low")
  };

  return (
    <div className="keyword-trends-widget">
      <div className="widget-info">
        <p>
          {getTimeRangeLabel()} | {getTrendTypeLabel()} {translations.trendingKeywords}
        </p>
      </div>
      
      <div className="trends-chart">
        {/* Simple visual representation of a line chart for keywords */}
        <div className="chart-container" style={{ position: 'relative', height: '200px', margin: '10px 0' }}>
          {/* Y-axis labels */}
          <div className="y-axis" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '5px' }}>
            <span>{translations.high}</span>
            <span>{translations.medium}</span>
            <span>{translations.low}</span>
          </div>
          
          {/* Chart area */}
          <div className="chart-area" style={{ position: 'absolute', left: '40px', right: '10px', top: '10px', bottom: '25px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            {keywords.map((keyword: string, keywordIndex: number) => {
              const color = getColorForKeyword(keyword);
              const values = trendData[keyword] || Array(7).fill(0).map(() => Math.floor(Math.random() * 50));
              
              // Normalize values for the chart area height
              const maxValue = Math.max(...values);
              const normalizedValues: number[] = values.map((v: number) => (v / maxValue) * 100);
              
              return (
                <div 
                  key={keyword}
                  className="trend-line"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    right: '10px',
                    bottom: '0',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Line connecting dots */}
                  <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
                    <polyline
                      points={normalizedValues.map((value: number, index: number) => {
                        const x = (index / (normalizedValues.length - 1)) * 100;
                        const y = 100 - value;
                        return `${x}% ${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                    />
                  </svg>
                  
                  {/* Dots for each data point */}
                  {normalizedValues.map((value: number, index: number) => {
                    const x = (index / (normalizedValues.length - 1)) * 100;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          bottom: `${value}%`,
                          width: '8px',
                          height: '8px',
                          backgroundColor: color,
                          borderRadius: '50%',
                          transform: 'translate(-50%, 50%)'
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="x-axis" style={{ position: 'absolute', left: '40px', right: '10px', bottom: 0, height: '20px', display: 'flex', justifyContent: 'space-between' }}>
            {dayLabels.map((day, index) => (
              <span key={index} style={{ fontSize: '12px' }}>{day}</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend for keywords */}
      <div className="trends-legend" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {keywords.map((keyword: string) => (
          <div key={keyword} className="legend-item" style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              backgroundColor: getColorForKeyword(keyword),
              marginRight: '5px',
              borderRadius: '2px'
            }}></span>
            <span>{keyword}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordTrendsWidget;