import { useTranslation } from "react-i18next";
import { BarChart4 } from "lucide-react";
import { withRtl } from "@/lib/withRtl";

interface SentimentDistributionProps {
  rtl?: boolean;
}

interface PlatformSentiment {
  name: string;
  value: number;
  positive?: boolean;
}

const SentimentDistribution = ({ rtl = false }: SentimentDistributionProps) => {
  const { t } = useTranslation();
  
  // Platform sentiment data
  const platformSentiment: PlatformSentiment[] = [
    { name: t('platforms.twitter'), value: 75, positive: true },
    { name: t('platforms.facebook'), value: 64, positive: true },
    { name: t('platforms.instagram'), value: 82, positive: true },
    { name: t('platforms.news'), value: 51, positive: false }
  ];
  
  return (
    <div className="bg-white rounded-md border overflow-hidden p-4 mt-4">
      <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
        <BarChart4 className="h-4 w-4 mr-2 text-[#cba344]" />
        {t('analysis.sentimentDistribution')}
      </div>
      
      {/* Positive */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">{t('analysis.positive')}</span>
          <span className="text-xs text-right">68%</span>
        </div>
        <div className="h-2.5 bg-green-100 rounded-sm overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: '68%' }}></div>
        </div>
      </div>
      
      {/* Neutral */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">{t('analysis.neutral')}</span>
          <span className="text-xs text-right">20%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-sm overflow-hidden">
          <div className="h-full bg-gray-400" style={{ width: '20%' }}></div>
        </div>
      </div>
      
      {/* Negative */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">{t('analysis.negative')}</span>
          <span className="text-xs text-right">12%</span>
        </div>
        <div className="h-2.5 bg-red-100 rounded-sm overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: '12%' }}></div>
        </div>
      </div>
      
      {/* Platform Sentiment */}
      <div>
        <h4 className="text-xs text-gray-500 mb-3">{t('analysis.sentimentByPlatform')}</h4>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
          {platformSentiment.map((platform, index) => (
            <div key={index}>
              <div className="p-1 rounded bg-blue-100 mb-1 text-xs text-center">
                {platform.name}
              </div>
              <span className={`${platform.positive ? 'text-green-600' : 'text-yellow-600'} font-medium text-xs`}>
                {platform.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withRtl(SentimentDistribution);