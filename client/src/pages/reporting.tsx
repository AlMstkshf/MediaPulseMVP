import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSocialPosts } from "@/hooks/use-sentiment";
import { useSentimentReports } from "@/hooks/use-sentiment-reports";
import { SentimentReport, SocialPost } from "@shared/schema";
import { saveAs } from 'file-saver';
import PageLayout from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { format as formatDate, subDays, isSameDay, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Download, Calendar as CalendarIcon, Filter, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const ReportingDashboard = () => {
  const { t, i18n } = useTranslation();
  const [reportType, setReportType] = useState<string>("sentiment");
  const [timeframe, setTimeframe] = useState<string>("weekly");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date()
  });
  
  // Fetch data
  const { data: posts, isLoading: isLoadingPosts } = useSocialPosts({
    dateFrom: dateRange.from,
    dateTo: dateRange.to
  });
  
  const { data: sentimentReports, isLoading: isLoadingReports } = useSentimentReports({
    dateFrom: dateRange.from,
    dateTo: dateRange.to
  });
  
  // Helper function to format dates according to locale
  const formatLocalDate = (date: Date | undefined) => {
    if (!date) return "";
    return formatDate(
      date,
      "MMMM d, yyyy",
      { locale: i18n.language === "ar" ? ar : undefined }
    );
  };
  
  // Prepare data for sentiment trend chart
  const sentimentChartData = useMemo(() => {
    if (!sentimentReports || sentimentReports.length === 0) return [];
    
    // Group data by date
    const groupedByDate = sentimentReports.reduce((acc: Record<string, any>, report: SentimentReport) => {
      const date = formatDate(new Date(report.date), 'MMM dd');
      
      if (!acc[date]) {
        acc[date] = {
          date,
          positive: report.positive || 0,
          neutral: report.neutral || 0,
          negative: report.negative || 0,
          total: (report.positive || 0) + (report.neutral || 0) + (report.negative || 0)
        };
      } else {
        acc[date].positive += report.positive || 0;
        acc[date].neutral += report.neutral || 0;
        acc[date].negative += report.negative || 0;
        acc[date].total += (report.positive || 0) + (report.neutral || 0) + (report.negative || 0);
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [sentimentReports]);
  
  // Generate report
  const generateReport = () => {
    // Logic to generate report based on selected parameters
    console.log("Generating report with parameters:", {
      type: reportType,
      timeframe,
      dateRange
    });
    
    // In a real implementation, this would fetch data and generate a report
  };
  
  // Use toast for notifications
  const { toast } = useToast();
  
  // Helper function to convert an array of objects to CSV
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    // Get headers
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    
    // Convert each row to CSV
    const rows = data.map(row => {
      return headers.map(fieldName => {
        // Handle strings that might contain commas
        const value = row[fieldName] === null || row[fieldName] === undefined 
          ? '' 
          : String(row[fieldName]);
          
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Return combined CSV
    return [headerRow, ...rows].join('\n');
  };
  
  // Helper function to convert objects to text for different report types
  const getReportText = (): string => {
    const title = `${t('reporting.title')} - ${reportType} (${dateRange.from ? formatLocalDate(dateRange.from) : ''} - ${dateRange.to ? formatLocalDate(dateRange.to) : ''})`;
    let content = '';
    
    // Add summary information
    content += `${t('reporting.totalPosts')}: ${posts?.length || 0}\n`;
    
    // Add different sections based on report type
    if (reportType === 'sentiment') {
      content += `\n${t('reporting.sentimentTrends')}:\n`;
      sentimentChartData.forEach(item => {
        content += `${item.date}: ${t('reporting.positive')}: ${item.positive}, ${t('reporting.neutral')}: ${item.neutral}, ${t('reporting.negative')}: ${item.negative}\n`;
      });
    }
    
    return `${title}\n\n${content}`;
  };
  
  // Export report to different formats
  const exportReport = (format: string) => {
    try {
      // Get formatted date for filename
      const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
      const fromDate = dateRange.from ? formatDate(dateRange.from, 'MM-dd') : 'start';
      const toDate = dateRange.to ? formatDate(dateRange.to, 'MM-dd') : 'now';
      const reportPeriod = `${fromDate}_to_${toDate}`;
      const filename = `report_${reportType}_${reportPeriod}_${dateStr}`;
      
      if (format === 'csv') {
        // Prepare data for CSV
        let dataToExport;
        if (reportType === 'sentiment') {
          dataToExport = sentimentChartData;
        } else if (reportType === 'platform' && posts) {
          // Group posts by platform
          const platformCounts: Record<string, number> = {};
          posts.forEach(post => {
            const platform = post.platform || 'unknown';
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
          });
          
          dataToExport = Object.entries(platformCounts).map(([platform, count]) => ({
            platform,
            count
          }));
        } else {
          dataToExport = posts || [];
        }
        
        // Convert to CSV and download
        const csvContent = convertToCSV(dataToExport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}.csv`);
        
        toast({
          title: t('reporting.exportSuccess'),
          description: t('reporting.csvExportDesc'),
          duration: 3000,
        });
      } else if (format === 'txt') {
        // Generate plain text report
        const textContent = getReportText();
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${filename}.txt`);
        
        toast({
          title: t('reporting.exportSuccess'),
          description: t('reporting.textExportDesc'),
          duration: 3000,
        });
      } else {
        // For other formats (PDF, Excel) - we'd implement these with additional libraries
        // For now, let's just show a message
        toast({
          title: t('reporting.comingSoon'),
          description: t('reporting.formatNotSupported', { format: format.toUpperCase() }),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('reporting.exportError'),
        description: t('reporting.exportErrorDesc'),
        variant: 'destructive',
        duration: 3000,
      });
    }
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reporting.title')}</h2>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => generateReport()}
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>{t('reporting.generateReport')}</span>
          </Button>
          <Button 
            className="bg-[#cba344] hover:bg-[#b8943e] text-white"
            onClick={() => exportReport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            <span>{t('reporting.export')}</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('reporting.reportParameters')}</CardTitle>
            <CardDescription>
              {t('reporting.configureReportDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">{t('reporting.reportType', 'Report Type')}</Label>
                <Select 
                  value={reportType} 
                  onValueChange={setReportType}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder={t('reporting.selectReportType', 'Select report type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentiment">{t('reporting.sentimentAnalysis', 'Sentiment Analysis')}</SelectItem>
                    <SelectItem value="keywords">{t('reporting.keywordPerformance', 'Keyword Performance')}</SelectItem>
                    <SelectItem value="platform">{t('reporting.platformBreakdown', 'Platform Breakdown')}</SelectItem>
                    <SelectItem value="engagement">{t('reporting.engagementMetrics', 'Engagement Metrics')}</SelectItem>
                    <SelectItem value="summary">{t('reporting.executiveSummary', 'Executive Summary')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">{t('reporting.timeframe', 'Timeframe')}</Label>
                <Select 
                  value={timeframe} 
                  onValueChange={setTimeframe}
                >
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder={t('reporting.selectTimeframe', 'Select timeframe')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('reporting.daily', 'Daily')}</SelectItem>
                    <SelectItem value="weekly">{t('reporting.weekly', 'Weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('reporting.monthly', 'Monthly')}</SelectItem>
                    <SelectItem value="quarterly">{t('reporting.quarterly', 'Quarterly')}</SelectItem>
                    <SelectItem value="custom">{t('reporting.custom', 'Custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('reporting.dateRange', 'Date Range')}</Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {formatLocalDate(dateRange.from)} - {formatLocalDate(dateRange.to)}
                            </>
                          ) : (
                            formatLocalDate(dateRange.from)
                          )
                        ) : (
                          <span>{t('reporting.pickDates', 'Pick dates')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => setDateRange(range ? { 
                          from: range.from, 
                          to: range.to || undefined 
                        } : { 
                          from: undefined, 
                          to: undefined 
                        })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('reporting.quickStats')}</CardTitle>
            <CardDescription>
              {t('reporting.overviewDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('reporting.totalPosts')}:</span>
                <span className="font-bold text-lg">{posts?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('reporting.averageSentiment')}:</span>
                <span className="font-bold text-lg">
                  {sentimentReports && sentimentReports.length > 0
                    ? (() => {
                        const totalPositive = sentimentReports.reduce((acc: number, report: SentimentReport) => acc + (report.positive || 0), 0);
                        const totalNegative = sentimentReports.reduce((acc: number, report: SentimentReport) => acc + (report.negative || 0), 0);
                        const totalNeutral = sentimentReports.reduce((acc: number, report: SentimentReport) => acc + (report.neutral || 0), 0);
                        const total = totalPositive + totalNegative + totalNeutral;
                        
                        if (total === 0) return "N/A";
                        
                        // Calculate weighted score (0-100 scale)
                        const score = Math.round((totalPositive * 100 + totalNeutral * 50) / total);
                        return `${score}%`;
                      })()
                    : "N/A"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('reporting.platforms')}:</span>
                <span className="font-bold text-lg">
                  {new Set(posts?.map(post => post.platform)).size || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('reporting.reportPeriod')}:</span>
                <span className="text-sm">
                  {formatLocalDate(dateRange.from)} - {formatLocalDate(dateRange.to)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reporting.sentimentTrends')}</CardTitle>
            <CardDescription>
              {t('reporting.sentimentTrendsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : sentimentReports && sentimentReports.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sentimentChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const formattedName = name === 'positive' 
                          ? t('reporting.positive') 
                          : name === 'neutral' 
                          ? t('reporting.neutral') 
                          : t('reporting.negative');
                        return [value, formattedName];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        return value === 'positive' 
                          ? t('reporting.positive') 
                          : value === 'neutral' 
                          ? t('reporting.neutral') 
                          : t('reporting.negative');
                      }}
                    />
                    <Bar 
                      dataKey="positive" 
                      stackId="a" 
                      fill="#4CAF50" 
                      name="positive"
                    />
                    <Bar 
                      dataKey="neutral" 
                      stackId="a" 
                      fill="#FFB74D" 
                      name="neutral"
                    />
                    <Bar 
                      dataKey="negative" 
                      stackId="a" 
                      fill="#F44336" 
                      name="negative"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {t('reporting.noSentimentData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reporting.platformDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useMemo(() => {
                        if (!posts || posts.length === 0) return [];
                        
                        // Count posts by platform
                        const platformCounts: Record<string, number> = {};
                        
                        posts.forEach(post => {
                          const platform = post.platform || 'unknown';
                          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
                        });
                        
                        // Convert to array for chart
                        return Object.entries(platformCounts).map(([name, value]) => ({
                          name,
                          value
                        }));
                      }, [posts])}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {useMemo(() => {
                        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];
                        
                        if (!posts || posts.length === 0) return [];
                        
                        const platforms = Array.from(new Set(posts.map(post => post.platform || 'unknown')));
                        
                        return platforms.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ));
                      }, [posts])}
                    </Pie>
                    <Tooltip formatter={(value) => [value, t('reporting.posts')]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {t('reporting.noPostData')}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('reporting.keywordPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={useMemo(() => {
                      if (!posts || posts.length === 0) return [];
                      
                      // Extract keywords from posts and count occurrences
                      const keywordCounts: Record<string, number> = {};
                      
                      posts.forEach(post => {
                        if (!post.keywords) return;
                        
                        // Parse keywords from JSON if needed
                        let keywords: string[] = [];
                        try {
                          if (typeof post.keywords === 'string') {
                            keywords = JSON.parse(post.keywords);
                          } else if (Array.isArray(post.keywords)) {
                            keywords = post.keywords as string[];
                          }
                        } catch (e) {
                          // Skip if unable to parse
                          return;
                        }
                        
                        keywords.forEach(keyword => {
                          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
                        });
                      });
                      
                      // Sort by occurrence count and take top 7
                      return Object.entries(keywordCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 7)
                        .map(([keyword, count]) => ({
                          keyword,
                          count
                        }));
                    }, [posts])}
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="keyword" 
                      type="category" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [value, t('reporting.occurrences')]}
                      labelFormatter={(value) => `${value}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#8884d8" 
                      name={t('reporting.occurrences')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {t('reporting.noKeywordData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{t('reporting.exportOptions')}</CardTitle>
                <CardDescription>
                  {t('reporting.exportDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2" 
                onClick={() => exportReport('pdf')}
                disabled={!sentimentReports || sentimentReports.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>PDF</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2" 
                onClick={() => exportReport('excel')}
                disabled={!sentimentReports || sentimentReports.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2" 
                onClick={() => exportReport('csv')}
                disabled={!sentimentReports || sentimentReports.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>CSV</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2" 
                onClick={() => exportReport('txt')}
                disabled={!sentimentReports || sentimentReports.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>TXT</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reporting.scheduledReports')}</CardTitle>
            <CardDescription>
              {t('reporting.scheduledReportsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">{t('reporting.active')}</TabsTrigger>
                <TabsTrigger value="scheduled">{t('reporting.scheduled')}</TabsTrigger>
                <TabsTrigger value="history">{t('reporting.history')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <div className="text-center py-8 text-gray-500">
                  {t('reporting.noActiveReports')}
                </div>
              </TabsContent>
              
              <TabsContent value="scheduled">
                <div className="text-center py-8 text-gray-500">
                  {t('reporting.noScheduledReports')}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="text-center py-8 text-gray-500">
                  {t('reporting.noReportHistory')}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ReportingDashboard;