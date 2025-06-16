import React from 'react';

interface RecentReportsWidgetProps {
  data: any;
  settings?: any;
}

// Default sample data for demonstration
const DEFAULT_REPORTS = [
  {
    id: 1,
    title: 'Q1 2025 UAE Government Media Presence Analysis',
    date: '2025-04-15',
    author: 'Media Intelligence Team',
    type: 'quarterly',
    entities: ['Dubai Municipality', 'Abu Dhabi Media', 'Sharjah Government'],
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'March 2025 Smart City Initiatives Media Coverage',
    date: '2025-04-05',
    author: 'Digital Transformation Unit',
    type: 'monthly',
    entities: ['Dubai Municipality', 'DEWA'],
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'UAE Government Services Sentiment Analysis',
    date: '2025-03-28',
    author: 'Customer Happiness Department',
    type: 'special',
    entities: ['All Government Entities'],
    downloadUrl: '#'
  },
  {
    id: 4,
    title: 'February 2025 Social Media Engagement Report',
    date: '2025-03-10',
    author: 'Social Media Team',
    type: 'monthly',
    entities: ['Dubai Police', 'RTA', 'DHA'],
    downloadUrl: '#'
  },
  {
    id: 5,
    title: 'Sustainability Initiatives Media Coverage Analysis',
    date: '2025-02-22',
    author: 'Sustainability Task Force',
    type: 'special',
    entities: ['Ministry of Climate Change', 'DEWA', 'EAD'],
    downloadUrl: '#'
  }
];

const RecentReportsWidget: React.FC<RecentReportsWidgetProps> = ({ data, settings }) => {
  const reports = data.reports || DEFAULT_REPORTS;
  const dataSource = settings?.dataSource || 'all';
  const timeRange = settings?.timeRange || 'month';
  
  // Filter reports by date range
  const getDateForRange = () => {
    const now = new Date();
    switch(timeRange) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setDate(now.getDate() - 30));
      case 'quarter':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  };
  
  const dateLimit = getDateForRange();
  const filteredReports = reports.filter(report => new Date(report.date) >= dateLimit);
  
  // Function to get report type badge
  const getReportTypeBadge = (type: string) => {
    let color = '';
    let label = '';
    
    switch(type) {
      case 'quarterly':
        color = '#8E44AD';
        label = 'Quarterly';
        break;
      case 'monthly':
        color = '#3498DB';
        label = 'Monthly';
        break;
      case 'weekly':
        color = '#16A085';
        label = 'Weekly';
        break;
      case 'daily':
        color = '#27AE60';
        label = 'Daily';
        break;
      case 'special':
        color = '#E74C3C';
        label = 'Special';
        break;
      default:
        color = '#95A5A6';
        label = 'Report';
    }
    
    return (
      <span style={{
        backgroundColor: color,
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        {label}
      </span>
    );
  };
  
  // Function to get report icon
  const getReportIcon = (type: string) => {
    switch(type) {
      case 'quarterly':
        return '📊';
      case 'monthly':
        return '📈';
      case 'weekly':
        return '📋';
      case 'daily':
        return '📝';
      case 'special':
        return '🔍';
      default:
        return '📄';
    }
  };
  
  return (
    <div className="recent-reports-widget">
      <div className="widget-info">
        <p>
          Recent Reports | 
          {timeRange === 'day' ? ' Last 24 Hours' : 
           timeRange === 'week' ? ' Last 7 Days' : 
           timeRange === 'month' ? ' Last 30 Days' : ' Last 90 Days'}
        </p>
      </div>
      
      <div className="reports-list">
        {filteredReports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredReports.map(report => (
              <div key={report.id} style={{
                border: '1px solid #eee',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    {getReportIcon(report.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {report.title}
                      </div>
                      {getReportTypeBadge(report.type)}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      {new Date(report.date).toLocaleDateString()} • {report.author}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Entities: {report.entities.join(', ')}
                    </div>
                    
                    <div style={{ marginTop: '8px' }}>
                      <a 
                        href={report.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: '#2980B9',
                          color: 'white',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Download Report
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px'
          }}>
            No reports found for the selected time period
          </div>
        )}
      </div>
      
      {filteredReports.length > 0 && (
        <div style={{ 
          marginTop: '10px', 
          textAlign: 'center', 
          fontSize: '13px', 
          color: '#666'
        }}>
          Showing {filteredReports.length} of {reports.length} total reports
        </div>
      )}
    </div>
  );
};

export default RecentReportsWidget;