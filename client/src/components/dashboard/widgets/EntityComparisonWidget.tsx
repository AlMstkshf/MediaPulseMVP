import React from 'react';
import { useTranslation } from 'react-i18next';

interface EntityComparisonWidgetProps {
  data: any;
  settings?: any;
}

// Default sample data for demonstration
const DEFAULT_ENTITIES = [
  { id: 1, name: 'Dubai Municipality', sentiment: 85, mentions: 150, engagement: 1250 },
  { id: 2, name: 'Abu Dhabi Media', sentiment: 72, mentions: 120, engagement: 980 },
  { id: 3, name: 'Sharjah Government', sentiment: 68, mentions: 90, engagement: 750 }
];

interface Entity {
  id: number;
  name: string;
  sentiment: number;
  mentions: number;
  engagement: number;
  [key: string]: any;
}

const EntityComparisonWidget: React.FC<EntityComparisonWidgetProps> = ({ data, settings }) => {
  const { t } = useTranslation();
  const entities = data.entities || DEFAULT_ENTITIES;
  const selectedEntityIds = settings?.entities || entities.map((e: Entity) => e.id.toString());
  const metric = settings?.metric || 'sentiment';
  const timeRange = settings?.timeRange || 'week';
  
  // Filter entities based on selection
  const filteredEntities = entities.filter((entity: Entity) => 
    selectedEntityIds.includes(entity.id.toString())
  );
  
  // Function to get label for metric
  const getMetricLabel = () => {
    switch(metric) {
      case 'sentiment':
        return t('dashboard.entity_comparison.sentimentScore');
      case 'mentions':
        return t('dashboard.entity_comparison.totalMentions');
      case 'engagement':
        return t('dashboard.entity_comparison.engagementRate');
      default:
        return t('dashboard.entity_comparison.value');
    }
  };
  
  // Function to get value for entity based on metric
  const getMetricValue = (entity: Entity) => {
    switch(metric) {
      case 'sentiment':
        return entity.sentiment;
      case 'mentions':
        return entity.mentions;
      case 'engagement':
        return entity.engagement;
      default:
        return 0;
    }
  };
  
  // Calculate max value for scaling the bars
  const maxValue = Math.max(...filteredEntities.map((e: Entity) => getMetricValue(e)));
  
  // Function to get color based on sentiment score
  const getColorForValue = (entity: Entity) => {
    if (metric === 'sentiment') {
      // Color based on sentiment score
      const value = entity.sentiment;
      if (value >= 80) return '#4CAF50'; // Very positive - green
      if (value >= 60) return '#8BC34A'; // Positive - light green
      if (value >= 40) return '#FFC107'; // Neutral - yellow
      if (value >= 20) return '#FF9800'; // Negative - orange
      return '#F44336'; // Very negative - red
    } else {
      // For other metrics, use a consistent color scheme
      const index = entities.findIndex((e: Entity) => e.id === entity.id);
      const colors = ['#3498db', '#9b59b6', '#2ecc71', '#f1c40f', '#e74c3c'];
      return colors[index % colors.length];
    }
  };

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case 'day':
        return t("dashboard.widgets.sentimentAnalysis.timeRanges.day");
      case 'week':
        return t("dashboard.widgets.sentimentAnalysis.timeRanges.week");
      case 'month':
        return t("dashboard.widgets.sentimentAnalysis.timeRanges.month");
      case 'quarter':
        return t("dashboard.widgets.sentimentAnalysis.timeRanges.quarter");
      default:
        return t("dashboard.widgets.sentimentAnalysis.timeRanges.week");
    }
  };
  
  return (
    <div className="entity-comparison-widget">
      <div className="widget-info">
        <p>
          {t('dashboard.entity_comparison.comparing', { count: filteredEntities.length })} | 
          {getTimeRangeLabel()} |
          {t('dashboard.entity_comparison.metric')}: {getMetricLabel()}
        </p>
      </div>
      
      <div className="comparison-chart" style={{ padding: '10px 0' }}>
        {filteredEntities.length > 0 ? (
          <div className="horizontal-bars">
            {filteredEntities.map((entity: Entity) => {
              const value = getMetricValue(entity);
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={entity.id} className="bar-row" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ 
                      width: '120px', 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={entity.name}>
                      {entity.name}
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 'bold' }}>
                      {value}{metric === 'sentiment' ? t('dashboard.entity_comparison.percentSymbol') : ''}
                    </div>
                  </div>
                  
                  <div className="bar-container" style={{ 
                    height: '10px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div className="bar" style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: getColorForValue(entity),
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            {t('dashboard.entity_comparison.noEntitiesSelected')}
          </div>
        )}
      </div>
      
      {filteredEntities.length > 0 && (
        <div className="comparison-summary" style={{ fontSize: '13px', padding: '5px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          {(() => {
            switch(metric) {
              case 'sentiment':
                // Find best and worst sentiment
                const bestEntity = [...filteredEntities].sort((a, b) => b.sentiment - a.sentiment)[0];
                return t('dashboard.entity_comparison.highestSentiment', { 
                  name: bestEntity.name, 
                  score: bestEntity.sentiment 
                });
              
              case 'mentions':
                // Find most mentioned
                const mostMentioned = [...filteredEntities].sort((a, b) => b.mentions - a.mentions)[0];
                return t('dashboard.entity_comparison.mostMentions', { 
                  name: mostMentioned.name, 
                  count: mostMentioned.mentions 
                });
              
              case 'engagement':
                // Find highest engagement
                const mostEngaged = [...filteredEntities].sort((a, b) => b.engagement - a.engagement)[0];
                return t('dashboard.entity_comparison.highestEngagement', { 
                  name: mostEngaged.name, 
                  count: mostEngaged.engagement 
                });
              
              default:
                return '';
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default EntityComparisonWidget;