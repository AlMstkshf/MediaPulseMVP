import React from 'react';
import { useTranslation } from 'react-i18next';

interface SentimentAnalysisWidgetProps {
  data: any;
  settings?: any;
}

const defaultData = {
  positive: 65,
  neutral: 25,
  negative: 10
};

const SentimentAnalysisWidget: React.FC<SentimentAnalysisWidgetProps> = ({ data, settings }) => {
  const { t } = useTranslation();
  const chartData = data.sentiment || defaultData;
  const chartType = settings?.chartType || 'pie';
  const entity = settings?.entityId || 'all';
  const timeRange = settings?.timeRange || 'week';
  
  // In a real implementation, we would fetch data based on entity and timeRange
  
  const renderPieChart = () => {
    // Basic CSS-based pie chart for demo
    const total = chartData.positive + chartData.neutral + chartData.negative;
    const positiveDeg = (chartData.positive / total) * 360;
    const neutralDeg = (chartData.neutral / total) * 360;
    
    return (
      <div className="pie-chart-container">
        <div 
          className="pie-chart" 
          style={{
            background: `conic-gradient(
              #4CAF50 0deg ${positiveDeg}deg, 
              #FFC107 ${positiveDeg}deg ${positiveDeg + neutralDeg}deg, 
              #F44336 ${positiveDeg + neutralDeg}deg 360deg
            )`,
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            margin: '0 auto'
          }}
        ></div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>{t("dashboard.widgets.sentimentAnalysis.positive")}: {chartData.positive}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FFC107' }}></span>
            <span>{t("dashboard.widgets.sentimentAnalysis.neutral")}: {chartData.neutral}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
            <span>{t("dashboard.widgets.sentimentAnalysis.negative")}: {chartData.negative}%</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderBarChart = () => {
    return (
      <div className="bar-chart-container">
        <div className="bar-chart">
          <div className="bar-container">
            <div className="bar-label">{t("dashboard.widgets.sentimentAnalysis.positive")}</div>
            <div className="bar-track">
              <div 
                className="bar" 
                style={{ 
                  width: `${chartData.positive}%`,
                  backgroundColor: '#4CAF50'
                }}
              ></div>
            </div>
            <div className="bar-value">{chartData.positive}%</div>
          </div>
          <div className="bar-container">
            <div className="bar-label">{t("dashboard.widgets.sentimentAnalysis.neutral")}</div>
            <div className="bar-track">
              <div 
                className="bar" 
                style={{ 
                  width: `${chartData.neutral}%`,
                  backgroundColor: '#FFC107'
                }}
              ></div>
            </div>
            <div className="bar-value">{chartData.neutral}%</div>
          </div>
          <div className="bar-container">
            <div className="bar-label">{t("dashboard.widgets.sentimentAnalysis.negative")}</div>
            <div className="bar-track">
              <div 
                className="bar" 
                style={{ 
                  width: `${chartData.negative}%`,
                  backgroundColor: '#F44336'
                }}
              ></div>
            </div>
            <div className="bar-value">{chartData.negative}%</div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderLineChart = () => {
    // This would be a simple visual representation of line chart
    // In a real implementation, this would use a proper charting library
    return (
      <div className="line-chart-container">
        <div className="line-chart-placeholder">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>{t("dashboard.widgets.sentimentAnalysis.trendOverTime")}</p>
            <div style={{ 
              height: '100px', 
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: '20px'
            }}>
              {[65, 68, 62, 70, 64, 72, 75].map((value, index) => (
                <div 
                  key={index}
                  style={{ 
                    width: '10px',
                    height: `${value}px`,
                    backgroundColor: '#4CAF50',
                    marginRight: '5px'
                  }}
                ></div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '5px'
            }}>
              {[
                t("dashboard.widgets.sentimentAnalysis.weekdays.mon"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.tue"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.wed"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.thu"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.fri"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.sat"),
                t("dashboard.widgets.sentimentAnalysis.weekdays.sun")
              ].map((day, index) => (
                <div key={index} style={{ width: '20px', fontSize: '12px' }}>{day}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return renderPieChart();
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      default:
        return renderPieChart();
    }
  };
  
  // Hardcoded translations for when the i18n system fails
  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    // If the translated value is the same as the key, it means translation failed
    return translated === key ? fallback : translated;
  };

  // Prepare translations with fallbacks
  const translations = {
    allEntities: getTranslation("dashboard.widgets.sentimentAnalysis.allEntities", "All Entities"),
    entityId: getTranslation("dashboard.widgets.sentimentAnalysis.entityId", "Entity ID"),
    timeRangeDay: getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.day", "Last 24 Hours"),
    timeRangeWeek: getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.week", "Last 7 Days"),
    timeRangeMonth: getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.month", "Last 30 Days"),
    timeRangeQuarter: getTranslation("dashboard.widgets.sentimentAnalysis.timeRanges.quarter", "Last 90 Days"),
    overallSentiment: getTranslation("dashboard.widgets.sentimentAnalysis.overallSentiment", "Overall sentiment is "),
    predominantlyPositive: getTranslation("dashboard.widgets.sentimentAnalysis.predominantlyPositive", "predominantly positive"),
    predominantlyNegative: getTranslation("dashboard.widgets.sentimentAnalysis.predominantlyNegative", "predominantly negative"),
    predominantlyNeutral: getTranslation("dashboard.widgets.sentimentAnalysis.predominantlyNeutral", "predominantly neutral")
  };

  return (
    <div className="sentiment-analysis-widget">
      <div className="widget-info">
        <p>
          {entity === 'all' ? translations.allEntities : `${translations.entityId}: ${entity}`} | {' '}
          {timeRange === 'day' ? translations.timeRangeDay : 
           timeRange === 'week' ? translations.timeRangeWeek : 
           timeRange === 'month' ? translations.timeRangeMonth : 
           translations.timeRangeQuarter}
        </p>
      </div>
      
      {renderChart()}
      
      <div className="sentiment-summary">
        <p>
          {translations.overallSentiment}
          <strong>
            {chartData.positive > chartData.neutral && chartData.positive > chartData.negative
              ? translations.predominantlyPositive
              : chartData.negative > chartData.neutral && chartData.negative > chartData.positive
                ? translations.predominantlyNegative
                : translations.predominantlyNeutral}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default SentimentAnalysisWidget;