import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  BarChart2, ChevronDown, RefreshCcw, TrendingUp 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { withRtl } from "@/lib/withRtl";

interface RealtimeSentimentTrendsProps {
  rtl?: boolean;
}

const RealtimeSentimentTrends = ({ rtl = false }: RealtimeSentimentTrendsProps) => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState("all");
  const [timeRange, setTimeRange] = useState("7days");
  const [isConnected, setIsConnected] = useState(false);
  
  // These would come from your API or WebSocket in a real implementation
  const sentimentData = {
    positive: 38,
    neutral: 43,
    negative: 19
  };
  
  return (
    <div className="bg-white rounded-md border overflow-hidden p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-medium">{t('dashboard.realtimeSentimentTrends')}</h3>
          <p className="text-xs text-gray-500">{t('dashboard.trackSentimentChanges')}</p>
        </div>
        <Badge 
          variant="outline" 
          className={isConnected 
            ? "bg-green-100 text-green-800 text-xs px-2 rounded-full" 
            : "bg-red-100 text-red-800 text-xs px-2 rounded-full"
          }
        >
          {isConnected ? t('connection.live') : t('connection.offline')}
        </Badge>
      </div>
      
      <div className="flex items-center mb-4 gap-4">
        <div className="flex items-center border rounded px-3 py-1.5 text-xs bg-gray-50">
          <span className="mr-2">{t('dashboard.allPlatforms')}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
        <div className="flex items-center border rounded px-3 py-1.5 text-xs bg-gray-50">
          <span className="mr-2">{t('dashboard.last7Days')}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
        <div className="ml-auto">
          <button className="p-1.5 rounded hover:bg-gray-100" title="Refresh">
            <RefreshCcw className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Sentiment Trend Chart */}
        <div className="border rounded p-3">
          <h4 className="text-xs font-medium mb-2">{t('dashboard.sentimentTrend')}</h4>
          <div className="h-28 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 py-1">
              <span>80%</span>
              <span>60%</span>
            </div>
            
            {/* Chart area with trend line */}
            <div className="ml-8 h-full relative">
              {/* Horizontal grid lines */}
              <div className="absolute w-full h-1/2 border-b border-gray-100"></div>
              
              {/* Trend line (as SVG) */}
              <svg className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area under the line */}
                <path 
                  d="M0,40 C20,35 40,20 60,25 C80,30 100,15 120,20 C140,25 160,35 180,25 C200,15 220,10 240,5 L240,80 L0,80 Z" 
                  fill="url(#lineGradient)" 
                />
                
                {/* The line itself */}
                <path 
                  d="M0,40 C20,35 40,20 60,25 C80,30 100,15 120,20 C140,25 160,35 180,25 C200,15 220,10 240,5" 
                  fill="none" 
                  stroke="#4ade80" 
                  strokeWidth="2" 
                />
                
                {/* End dot with highlight */}
                <circle cx="240" cy="5" r="4" fill="#fff" stroke="#4ade80" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right column: Overall Sentiment */}
        <div className="border rounded p-3">
          <h4 className="text-xs font-medium mb-3">{t('sentiment.overallSentiment')}</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs">{t('sentiment.positive')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium">{sentimentData.positive}%</span>
                <TrendingUp className="ml-1 h-3 w-3 text-green-500" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                <span className="text-xs">{t('sentiment.neutral')}</span>
              </div>
              <span className="text-xs font-medium">{sentimentData.neutral}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xs">{t('sentiment.negative')}</span>
              </div>
              <span className="text-xs font-medium">{sentimentData.negative}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRtl(RealtimeSentimentTrends);