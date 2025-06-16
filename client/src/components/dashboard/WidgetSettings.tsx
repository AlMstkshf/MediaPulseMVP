import React, { useState } from 'react';
import { WidgetType } from './types';
import { useTranslation } from 'react-i18next';

interface WidgetSettingsProps {
  type: WidgetType;
  settings: any;
  onSave: (settings: any) => void;
  onCancel: () => void;
}

const WidgetSettings: React.FC<WidgetSettingsProps> = ({
  type,
  settings,
  onSave,
  onCancel
}) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState(settings.title || '');
  const [timeRange, setTimeRange] = useState(settings.timeRange || 'week');
  const [dataSource, setDataSource] = useState(settings.dataSource || 'all');
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshInterval || 0);
  const [customContent, setCustomContent] = useState(settings.customContent || '');
  const [maxItems, setMaxItems] = useState(settings.maxItems || 2);
  const [compact, setCompact] = useState(settings.compact !== undefined ? settings.compact : true);
  const [showViewAllLink, setShowViewAllLink] = useState(settings.showViewAllLink !== undefined ? settings.showViewAllLink : true);
  
  const handleSave = () => {
    const newSettings = {
      ...settings,
      title,
      timeRange,
      dataSource,
      refreshInterval: parseInt(refreshInterval.toString()),
    };
    
    if (type === WidgetType.CustomContent) {
      newSettings.customContent = customContent;
    }
    
    if (type === WidgetType.KpiOverview) {
      newSettings.maxItems = parseInt(maxItems.toString());
      newSettings.compact = compact;
      newSettings.showViewAllLink = showViewAllLink;
    }
    
    onSave(newSettings);
  };
  
  // Render different settings based on widget type
  const renderTypeSpecificSettings = () => {
    switch (type) {
      case WidgetType.SentimentAnalysis:
        return (
          <>
            <div className="form-group">
              <label>Entity:</label>
              <select 
                value={settings.entityId || 'all'} 
                onChange={(e) => settings.entityId = e.target.value}
              >
                <option value="all">All Entities</option>
                <option value="1">Dubai Municipality</option>
                <option value="2">Abu Dhabi Media</option>
                <option value="3">Sharjah Government</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chart Type:</label>
              <select 
                value={settings.chartType || 'pie'} 
                onChange={(e) => settings.chartType = e.target.value}
              >
                <option value="pie">Pie Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </>
        );
        
      case WidgetType.MediaMentions:
        return (
          <>
            <div className="form-group">
              <label>Source:</label>
              <select 
                value={settings.source || 'all'} 
                onChange={(e) => settings.source = e.target.value}
              >
                <option value="all">All Sources</option>
                <option value="news">News</option>
                <option value="social">Social Media</option>
                <option value="blogs">Blogs</option>
              </select>
            </div>
            <div className="form-group">
              <label>Display Type:</label>
              <select 
                value={settings.displayType || 'list'} 
                onChange={(e) => settings.displayType = e.target.value}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="timeline">Timeline</option>
              </select>
            </div>
          </>
        );
        
      case WidgetType.KeywordTrends:
        return (
          <>
            <div className="form-group">
              <label>Keywords (comma separated):</label>
              <input 
                type="text" 
                value={settings.keywords || ''} 
                onChange={(e) => settings.keywords = e.target.value}
                placeholder="e.g. innovation, digital, sustainability"
              />
            </div>
            <div className="form-group">
              <label>Trend Type:</label>
              <select 
                value={settings.trendType || 'volume'} 
                onChange={(e) => settings.trendType = e.target.value}
              >
                <option value="volume">Volume</option>
                <option value="sentiment">Sentiment</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </>
        );
        
      case WidgetType.EntityComparison:
        return (
          <>
            <div className="form-group">
              <label>Entities (Select up to 5):</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.entities?.includes('1') || false} 
                    onChange={(e) => {
                      const entities = settings.entities || [];
                      if (e.target.checked) entities.push('1');
                      else entities.splice(entities.indexOf('1'), 1);
                      settings.entities = entities;
                    }}
                  />
                  Dubai Municipality
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.entities?.includes('2') || false}
                    onChange={(e) => {
                      const entities = settings.entities || [];
                      if (e.target.checked) entities.push('2');
                      else entities.splice(entities.indexOf('2'), 1);
                      settings.entities = entities;
                    }}
                  />
                  Abu Dhabi Media
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.entities?.includes('3') || false}
                    onChange={(e) => {
                      const entities = settings.entities || [];
                      if (e.target.checked) entities.push('3');
                      else entities.splice(entities.indexOf('3'), 1);
                      settings.entities = entities;
                    }}
                  />
                  Sharjah Government
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Comparison Metric:</label>
              <select 
                value={settings.metric || 'sentiment'} 
                onChange={(e) => settings.metric = e.target.value}
              >
                <option value="sentiment">Sentiment</option>
                <option value="mentions">Mentions</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </>
        );
        
      case WidgetType.CustomContent:
        return (
          <>
            <div className="form-group">
              <label>{t('dashboard.widgets.customContentSettings.label', 'Custom Content (HTML supported):')}</label>
              <textarea
                rows={5}
                value={customContent}
                onChange={(e) => {
                  // Sanitize input to prevent problematic component markup
                  let newContent = e.target.value;
                  // Remove any instances of reactcontentarea tags that could cause issues
                  newContent = newContent.replace(/<noname>reactcontentarea<\/noname>/g, '');
                  newContent = newContent.replace(/<[\/]?reactcontentarea[^>]*>/g, '');
                  setCustomContent(newContent);
                }}
                placeholder={t('dashboard.widgets.customContentSettings.placeholder', 'Enter your custom content here...')}
                className="w-full p-2 border rounded"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="form-group">
              <p className="text-sm text-gray-500 mt-2">
                {t('dashboard.widgets.customContentSettings.helpText', 'Use HTML tags to format your content. For example, <h3>Title</h3> for headings, <p>Text</p> for paragraphs, <ul><li>Item</li></ul> for lists.')}
              </p>
              <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                <h4 className="font-bold text-blue-700">{t('dashboard.widgets.customContentSettings.rtlSupport', 'RTL Language Support:')}</h4>
                <p className="text-blue-600">
                  {t('dashboard.widgets.customContentSettings.rtlSupportText', 'Your content will automatically display correctly in right-to-left languages like Arabic.')}
                </p>
              </div>
            </div>
          </>
        );
        
      case WidgetType.KpiOverview:
        return (
          <>
            <div className="form-group">
              <label>Maximum KPIs to Display:</label>
              <input 
                type="number" 
                value={maxItems} 
                onChange={(e) => setMaxItems(parseInt(e.target.value) || 2)}
                min="1"
                max="5"
              />
            </div>
            <div className="form-group">
              <label>Layout Style:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={compact} 
                    onChange={(e) => setCompact(e.target.checked)}
                  />
                  Compact View
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Display Options:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={showViewAllLink} 
                    onChange={(e) => setShowViewAllLink(e.target.checked)}
                  />
                  Show "View All" Link
                </label>
              </div>
            </div>
          </>
        );
      
      // New widget types
      case WidgetType.SocialEngagement:
        return (
          <>
            <div className="form-group">
              <label>Platforms:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.platforms?.includes('twitter') || false} 
                    onChange={(e) => {
                      const platforms = settings.platforms || [];
                      if (e.target.checked) platforms.push('twitter');
                      else platforms.splice(platforms.indexOf('twitter'), 1);
                      settings.platforms = platforms;
                    }}
                  />
                  Twitter
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.platforms?.includes('facebook') || false}
                    onChange={(e) => {
                      const platforms = settings.platforms || [];
                      if (e.target.checked) platforms.push('facebook');
                      else platforms.splice(platforms.indexOf('facebook'), 1);
                      settings.platforms = platforms;
                    }}
                  />
                  Facebook
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.platforms?.includes('instagram') || false}
                    onChange={(e) => {
                      const platforms = settings.platforms || [];
                      if (e.target.checked) platforms.push('instagram');
                      else platforms.splice(platforms.indexOf('instagram'), 1);
                      settings.platforms = platforms;
                    }}
                  />
                  Instagram
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.PressReleases:
        return (
          <>
            <div className="form-group">
              <label>Number of Press Releases:</label>
              <input 
                type="number" 
                value={settings.limit || 5} 
                onChange={(e) => settings.limit = parseInt(e.target.value) || 5}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>Display Options:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.showStatus !== undefined ? settings.showStatus : true} 
                    onChange={(e) => settings.showStatus = e.target.checked}
                  />
                  Show Status
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.JournalistDirectory:
        return (
          <>
            <div className="form-group">
              <label>Number of Journalists:</label>
              <input 
                type="number" 
                value={settings.limit || 5} 
                onChange={(e) => settings.limit = parseInt(e.target.value) || 5}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>Display Options:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.showSearch !== undefined ? settings.showSearch : true} 
                    onChange={(e) => settings.showSearch = e.target.checked}
                  />
                  Show Search Box
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.MediaSources:
        return (
          <>
            <div className="form-group">
              <label>Number of Media Sources:</label>
              <input 
                type="number" 
                value={settings.limit || 5} 
                onChange={(e) => settings.limit = parseInt(e.target.value) || 5}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>Display Options:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.showType !== undefined ? settings.showType : true} 
                    onChange={(e) => settings.showType = e.target.checked}
                  />
                  Show Media Type
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.OsintMonitoring:
        return (
          <>
            <div className="form-group">
              <label>Default Tab:</label>
              <select 
                value={settings.defaultTab || 'keywords'} 
                onChange={(e) => settings.defaultTab = e.target.value}
              >
                <option value="keywords">Keywords</option>
                <option value="accounts">Accounts</option>
                <option value="alerts">Alerts</option>
              </select>
            </div>
            <div className="form-group">
              <label>Display Options:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.showSearch !== undefined ? settings.showSearch : true} 
                    onChange={(e) => settings.showSearch = e.target.checked}
                  />
                  Show Search Box
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.QuickActions:
        return (
          <>
            <div className="form-group">
              <label>Number of Columns:</label>
              <select 
                value={settings.columns || 2} 
                onChange={(e) => settings.columns = parseInt(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="form-group">
              <label>Actions to Display:</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('monitor-keyword') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('monitor-keyword');
                      else actions.splice(actions.indexOf('monitor-keyword'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Monitor Keyword
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('keyword-alert') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('keyword-alert');
                      else actions.splice(actions.indexOf('keyword-alert'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Create Keyword Alert
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('flagged-account') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('flagged-account');
                      else actions.splice(actions.indexOf('flagged-account'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Flag Account
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('create-report') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('create-report');
                      else actions.splice(actions.indexOf('create-report'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Create Report
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('schedule-post') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('schedule-post');
                      else actions.splice(actions.indexOf('schedule-post'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Schedule Post
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.actions?.includes('add-press-release') || false} 
                    onChange={(e) => {
                      const actions = settings.actions || [];
                      if (e.target.checked) actions.push('add-press-release');
                      else actions.splice(actions.indexOf('add-press-release'), 1);
                      settings.actions = actions;
                    }}
                  />
                  Add Press Release
                </label>
              </div>
            </div>
          </>
        );
        
      case WidgetType.SocialMediaTrends:
        return (
          <>
            <div className="form-group">
              <label>Default View:</label>
              <select 
                value={settings.defaultView || 'distribution'} 
                onChange={(e) => settings.defaultView = e.target.value}
              >
                <option value="distribution">Platform Distribution</option>
                <option value="engagement">Engagement Metrics</option>
                <option value="bestTimes">Best Posting Times</option>
              </select>
            </div>
          </>
        );
        
      case WidgetType.EntityMentions:
        return (
          <>
            <div className="form-group">
              <label>Number of Entities:</label>
              <input 
                type="number" 
                value={settings.limit || 5} 
                onChange={(e) => settings.limit = parseInt(e.target.value) || 5}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>View Type:</label>
              <select 
                value={settings.view || 'list'} 
                onChange={(e) => settings.view = e.target.value}
              >
                <option value="list">List</option>
                <option value="chart">Chart</option>
              </select>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="widget-settings">
      <h4>Widget Settings</h4>
      
      <div className="form-group">
        <label>Widget Title:</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter widget title"
        />
      </div>
      
      <div className="form-group">
        <label>Time Range:</label>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Data Source:</label>
        <select value={dataSource} onChange={(e) => setDataSource(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="twitter">Twitter</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="news">News</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Auto Refresh (minutes, 0 for none):</label>
        <input 
          type="number" 
          value={refreshInterval} 
          onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 0)}
          min="0"
          max="60"
        />
      </div>
      
      {renderTypeSpecificSettings()}
      
      <div className="form-actions">
        <button onClick={handleSave}>Save Settings</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default WidgetSettings;