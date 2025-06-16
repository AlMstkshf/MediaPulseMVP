import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSentimentReports } from "@/hooks/use-sentiment";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SENTIMENT_COLORS } from "@/lib/constants";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { withRtl } from "@/lib/withRtl";
import { 
  exportReport, 
  ExportFormat, 
  prepareSentimentReportData 
} from "@/lib/export-utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface SentimentAnalysisProps {
  rtl?: boolean;
}

const SentimentAnalysis = ({ rtl = false }: SentimentAnalysisProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sentiment");
  const [isExporting, setIsExporting] = useState(false);
  const { data: sentimentReports, isLoading } = useSentimentReports();
  
  const textAlignClass = rtl ? "text-right" : "text-left";
  const marginClass = rtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = rtl ? "flex-row-reverse" : "flex-row";

  // Function to handle report export
  const handleExport = (format: ExportFormat) => {
    try {
      setIsExporting(true);
      
      if (!report) {
        throw new Error("No report data available to export");
      }
      
      // Prepare the report data for export
      const exportData = prepareSentimentReportData(report);
      
      // Export the report in the selected format
      exportReport(exportData, format);
      
      // Show success message
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Data for the chart
  const sentimentData = sentimentReports?.[0]
    ? [
        {
          name: t('calendar.jan1'), // "1 Jan"
          positive: 65,
          neutral: 25,
          negative: 10,
        },
        {
          name: t('calendar.jan15'), // "15 Jan" 
          positive: 55,
          neutral: 30,
          negative: 15,
        },
        {
          name: t('calendar.feb1'), // "1 Feb"
          positive: 48,
          neutral: 32,
          negative: 20,
        },
        {
          name: t('calendar.feb15'), // "15 Feb"
          positive: 52,
          neutral: 28,
          negative: 20,
        },
        {
          name: t('calendar.mar1'), // "1 Mar"
          positive: 42,
          neutral: 35,
          negative: 23,
        },
      ]
    : [];

  const report = sentimentReports?.[0];

  const influentialKeywords = report?.keywords ? [
    ...(report.keywords.positive || []),
    ...(report.keywords.neutral || []),
    ...(report.keywords.negative || [])
  ] : ["الابتكار", "التقدم", "التنمية", "المستقبل", "الاستدامة", "التكنولوجيا", "المجتمع"];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b p-0">
        <Tabs defaultValue="sentiment" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex border-b w-full rounded-none bg-transparent">
            <TabsTrigger 
              value="sentiment" 
              className={`px-6 py-3 font-medium ${activeTab === "sentiment" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
            >
              {t('analysis.sentimentAnalysis')}
            </TabsTrigger>
            <TabsTrigger 
              value="platforms" 
              className={`px-6 py-3 font-medium ${activeTab === "platforms" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
            >
              {t('analysis.platforms')}
            </TabsTrigger>
            <TabsTrigger 
              value="topics" 
              className={`px-6 py-3 font-medium ${activeTab === "topics" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
            >
              {t('analysis.mainTopics')}
            </TabsTrigger>
            <TabsTrigger 
              value="demographics" 
              className={`px-6 py-3 font-medium ${activeTab === "demographics" ? "text-[#cba344] border-b-2 border-[#cba344]" : "text-gray-500"}`}
            >
              {t('analysis.demographics')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="p-4">
            <div className="flex flex-col gap-6">
              <div className={`flex justify-between items-center ${flexDirectionClass}`}>
                <h3 className={`text-lg font-bold ${textAlignClass}`}>{t('analysis.sentimentAnalysis')}</h3>
                <ExportDropdown 
                  onExport={handleExport}
                  label={t('export.exportReport', 'Export Report')}
                  disabled={isExporting || !sentimentReports?.length}
                  variant="outline"
                />
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('analysis.positive'), value: report?.positive || 0, color: SENTIMENT_COLORS.POSITIVE },
                        { name: t('analysis.neutral'), value: report?.neutral || 0, color: SENTIMENT_COLORS.NEUTRAL },
                        { name: t('analysis.negative'), value: report?.negative || 0, color: SENTIMENT_COLORS.NEGATIVE }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {/* Add explicit cell colors */}
                      {[
                        { color: SENTIMENT_COLORS.POSITIVE },
                        { color: SENTIMENT_COLORS.NEUTRAL },
                        { color: SENTIMENT_COLORS.NEGATIVE }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className={`text-lg font-bold mb-4 ${textAlignClass}`}>{t('analysis.sentimentOverTime')}</h3>
                <div className="bg-gray-100 rounded-lg p-4 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sentimentData}
                      margin={{
                        top: 5,
                        right: rtl ? 20 : 30,
                        left: rtl ? 30 : 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="positive" 
                        stroke={SENTIMENT_COLORS.POSITIVE} 
                        activeDot={{ r: 8 }} 
                        name={t('analysis.positive')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="neutral" 
                        stroke={SENTIMENT_COLORS.NEUTRAL} 
                        name={t('analysis.neutral')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="negative" 
                        stroke={SENTIMENT_COLORS.NEGATIVE} 
                        name={t('analysis.negative')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-bold mb-4 ${textAlignClass}`}>{t('analysis.sentimentDistribution')}</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className={`mb-4 flex items-center ${flexDirectionClass}`}>
                    <div 
                      className={`w-3 h-3 rounded-full ${marginClass}`} 
                      style={{ backgroundColor: SENTIMENT_COLORS.POSITIVE }}
                    ></div>
                    <span className="text-sm">{t('analysis.positive')}</span>
                    <span className={`text-sm font-bold ${rtl ? 'ml-auto' : 'mr-auto'}`}>{report?.positive || 42}%</span>
                  </div>
                  <div className={`mb-4 flex items-center ${flexDirectionClass}`}>
                    <div 
                      className={`w-3 h-3 rounded-full ${marginClass}`} 
                      style={{ backgroundColor: SENTIMENT_COLORS.NEUTRAL }}
                    ></div>
                    <span className="text-sm">{t('analysis.neutral')}</span>
                    <span className={`text-sm font-bold ${rtl ? 'ml-auto' : 'mr-auto'}`}>{report?.neutral || 35}%</span>
                  </div>
                  <div className={`mb-4 flex items-center ${flexDirectionClass}`}>
                    <div 
                      className={`w-3 h-3 rounded-full ${marginClass}`} 
                      style={{ backgroundColor: SENTIMENT_COLORS.NEGATIVE }}
                    ></div>
                    <span className="text-sm">{t('analysis.negative')}</span>
                    <span className={`text-sm font-bold ${rtl ? 'ml-auto' : 'mr-auto'}`}>{report?.negative || 23}%</span>
                  </div>

                  <h4 className={`text-md font-bold mt-6 mb-3 ${textAlignClass}`}>{t('analysis.influentialKeywords')}</h4>
                  <div className="flex flex-wrap">
                    {influentialKeywords.map((keyword, index) => (
                      <span key={index} className="bg-[#f9f4e9] m-1 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="p-4 text-center text-gray-500">
              {t('analysis.platforms')} content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <div className="p-4 text-center text-gray-500">
              {t('analysis.mainTopics')} content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="demographics">
            <div className="p-4 text-center text-gray-500">
              {t('analysis.demographics')} content will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

// Export the component wrapped with our RTL HOC
export default withRtl(SentimentAnalysis);