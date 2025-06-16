import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Download, 
  Filter, 
  Calendar,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Printer,
  Share2,
  File
} from "lucide-react";

// Sample data for charts
const socialMediaData = [
  { name: 'يناير', twitter: 4000, facebook: 2400, instagram: 2400 },
  { name: 'فبراير', twitter: 3000, facebook: 1398, instagram: 2210 },
  { name: 'مارس', twitter: 2000, facebook: 9800, instagram: 2290 },
  { name: 'أبريل', twitter: 2780, facebook: 3908, instagram: 2000 },
  { name: 'مايو', twitter: 1890, facebook: 4800, instagram: 2181 },
  { name: 'يونيو', twitter: 2390, facebook: 3800, instagram: 2500 },
  { name: 'يوليو', twitter: 3490, facebook: 4300, instagram: 2100 },
];

const mentionsData = [
  { name: 'يناير', positive: 400, neutral: 300, negative: 100 },
  { name: 'فبراير', positive: 500, neutral: 280, negative: 150 },
  { name: 'مارس', positive: 600, neutral: 400, negative: 120 },
  { name: 'أبريل', positive: 700, neutral: 380, negative: 130 },
  { name: 'مايو', positive: 800, neutral: 500, negative: 90 },
  { name: 'يونيو', positive: 1000, neutral: 600, negative: 70 },
  { name: 'يوليو', positive: 1100, neutral: 650, negative: 50 },
];

import { SENTIMENT_COLORS } from "@/lib/constants";

const sentimentData = [
  { name: 'إيجابي', value: 65, color: SENTIMENT_COLORS.POSITIVE },
  { name: 'محايد', value: 25, color: SENTIMENT_COLORS.NEUTRAL },
  { name: 'سلبي', value: 10, color: SENTIMENT_COLORS.NEGATIVE }
];

const kpiData = [
  { title: 'منشورات جديدة', value: '324', percentChange: 12, isUp: true },
  { title: 'تفاعلات', value: '14.5K', percentChange: 8, isUp: true },
  { title: 'وصول', value: '87.4K', percentChange: 3, isUp: false },
  { title: 'مذكورات', value: '2.6K', percentChange: 14, isUp: true },
];

export default function ReportsDashboard() {
  const { t } = useTranslation();
  const [timePeriod, setTimePeriod] = useState<string>("month");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reportsDashboard.title')}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select defaultValue={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('reportsDashboard.selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('common.week')}</SelectItem>
                <SelectItem value="month">{t('common.month')}</SelectItem>
                <SelectItem value="quarter">{t('common.quarter')}</SelectItem>
                <SelectItem value="year">{t('common.year')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {t('reportsDashboard.filter')}
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('reportsDashboard.export')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                </div>
                <div className={`flex items-center ${kpi.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">{kpi.percentChange}%</span>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{t('reportsDashboard.comparedTo')} {t(`common.${timePeriod}`)}</span>
                {kpi.isUp ? (
                  <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 ml-2" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reportsDashboard.overview')}
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reportsDashboard.socialMedia')}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reportsDashboard.mentions')}
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reportsDashboard.sentiment')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{t('reportsDashboard.socialMediaEngagement')}</CardTitle>
                  <CardDescription>{t('reportsDashboard.lastSixMonths')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={socialMediaData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="twitter" stroke="#1da1f2" activeDot={{ r: 8 }} name={t('reportsDashboard.twitter')} />
                        <Line type="monotone" dataKey="facebook" stroke="#4267B2" name={t('reportsDashboard.facebook')} />
                        <Line type="monotone" dataKey="instagram" stroke="#C13584" name={t('reportsDashboard.instagram')} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{t('reportsDashboard.sentimentAnalysis')}</CardTitle>
                  <CardDescription>{t('reportsDashboard.overall')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex flex-col justify-between">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sentimentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {sentimentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2">{t('reportsDashboard.topKeywords')}</h4>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">الابتكار</div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">التكنولوجيا</div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">الذكاء الاصطناعي</div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">المستقبل</div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">الإبداع</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>{t('reportsDashboard.recentReports')}</CardTitle>
                  <Button variant="link" className="text-[#cba344]">
                    {t('reportsDashboard.viewAll')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-[#f9f4e9] flex items-center justify-center mr-4">
                          <File className="h-5 w-5 text-[#cba344]" />
                        </div>
                        <div>
                          <h4 className="font-medium">{t('reportsDashboard.reportName', { number: idx + 1 })}</h4>
                          <p className="text-sm text-gray-500">{t('reportsDashboard.generated')} {idx + 1} {t('reportsDashboard.daysAgo')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Printer className="h-4 w-4" />
                          <span className="sr-only">{t('common.print')}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">{t('common.share')}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">{t('common.download')}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="social" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('reportsDashboard.socialMediaPerformance')}</CardTitle>
              <CardDescription>{t('reportsDashboard.platformComparison')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={socialMediaData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="twitter" fill="#1da1f2" name={t('reportsDashboard.twitter')} />
                    <Bar dataKey="facebook" fill="#4267B2" name={t('reportsDashboard.facebook')} />
                    <Bar dataKey="instagram" fill="#C13584" name={t('reportsDashboard.instagram')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mentions" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('reportsDashboard.mentionsAnalysis')}</CardTitle>
              <CardDescription>{t('reportsDashboard.sentimentByMonth')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mentionsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positive" fill="#0ea5e9" name={t('reportsDashboard.positive')} />
                    <Bar dataKey="neutral" fill="#eab308" name={t('reportsDashboard.neutral')} />
                    <Bar dataKey="negative" fill="#ef4444" name={t('reportsDashboard.negative')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sentiment" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reportsDashboard.overallSentiment')}</CardTitle>
                <CardDescription>{t('reportsDashboard.sentimentDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('reportsDashboard.sentimentTrends')}</CardTitle>
                <CardDescription>{t('reportsDashboard.overTime')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mentionsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#0ea5e9" activeDot={{ r: 8 }} name={t('reportsDashboard.positive')} />
                      <Line type="monotone" dataKey="neutral" stroke="#eab308" name={t('reportsDashboard.neutral')} />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" name={t('reportsDashboard.negative')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}