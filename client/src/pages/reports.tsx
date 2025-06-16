import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox
} from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download as DownloadIcon, 
  Calendar as CalendarIcon, 
  Filter as FilterIcon, 
  Clock, 
  ThumbsUp, 
  Send, 
  Zap, 
  Lightbulb, 
  TrendingUp,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  BarChart2,
  Save,
  Mail,
  FileUp,
  Plus,
  BarChartHorizontal,
  PanelTop,
  Gauge,
  Users,
  Newspaper,
  Check,
  Loader2,
  // already imported above
  // already imported above
  // already imported above
  ChevronRight,
  File,
  ArrowUp,
  ArrowDown,
  Share2,
  Printer
} from "lucide-react";

// Sample data for charts
const kpiData = (t: (key: string) => string) => [
  { name: t('charts.digitalResponsiveness'), value: 85, fill: '#8884d8' },
  { name: t('charts.negativeFeedbackResponse'), value: 65, fill: '#83a6ed' },
  { name: t('charts.positiveEngagement'), value: 78, fill: '#8dd1e1' },
  { name: t('charts.osintMaturity'), value: 72, fill: '#82ca9d' },
  { name: t('charts.futureReadiness'), value: 80, fill: '#a4de6c' },
  { name: t('charts.strategicForesight'), value: 68, fill: '#d0ed57' },
  { name: t('charts.sentimentAnalytics'), value: 76, fill: '#ffc658' },
  { name: t('charts.innovationIndex'), value: 82, fill: '#ff8042' },
];

const trendData = (t: (key: string) => string) => [
  { name: t('charts.months.jan'), value: 65 },
  { name: t('charts.months.feb'), value: 59 },
  { name: t('charts.months.mar'), value: 80 },
  { name: t('charts.months.apr'), value: 71 },
  { name: t('charts.months.may'), value: 56 },
  { name: t('charts.months.jun'), value: 62 },
  { name: t('charts.months.jul'), value: 70 },
  { name: t('charts.months.aug'), value: 75 },
  { name: t('charts.months.sep'), value: 82 },
];

const responseTimeData = (t: (key: string) => string) => [
  { name: `${t('charts.week')} 1`, positive: 35, negative: 65 },
  { name: `${t('charts.week')} 2`, positive: 40, negative: 55 },
  { name: `${t('charts.week')} 3`, positive: 45, negative: 52 },
  { name: `${t('charts.week')} 4`, positive: 50, negative: 48 },
  { name: `${t('charts.week')} 5`, positive: 65, negative: 45 },
  { name: `${t('charts.week')} 6`, positive: 70, negative: 40 },
  { name: `${t('charts.week')} 7`, positive: 75, negative: 38 },
  { name: `${t('charts.week')} 8`, positive: 80, negative: 35 },
];

const sentimentData = (t: (key: string) => string) => [
  { name: t('analysis.positive'), value: 60, color: '#4CAF50' },
  { name: t('analysis.neutral'), value: 25, color: '#FFC107' },
  { name: t('analysis.negative'), value: 15, color: '#F44336' },
];

// Sample data for saved reports
const sampleSavedReports = [
  { 
    id: 1, 
    name: 'Q1 Strategic Report', 
    date: '2025-03-31', 
    components: ['excellence', 'social', 'sentiment'], 
    author: 'Ahmed Hassan'
  },
  { 
    id: 2, 
    name: 'Social Media Performance', 
    date: '2025-04-15', 
    components: ['social', 'sentiment'], 
    author: 'Sara Mahmoud'
  },
  { 
    id: 3, 
    name: 'Yearly Excellence Indicators', 
    date: '2025-01-05', 
    components: ['excellence'], 
    author: 'Mohammed Al Falasi'
  },
];

// Form schema for creating smart reports
const formSchema = z.object({
  name: z.string().min(3, { message: "Report name must be at least 3 characters" }),
  components: z.array(z.string()).min(1, { message: "Select at least one component" }),
  options: z.object({
    includeCharts: z.boolean().default(true),
    includeRawData: z.boolean().default(false),
    includeSummary: z.boolean().default(true),
  }),
});

const Reports = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState(t('dashboard.last30Days'));
  const [reportType, setReportType] = useState("smart");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Generate the chart data with translations
  const translatedKpiData = kpiData(t);
  const translatedTrendData = trendData(t);
  const translatedResponseTimeData = responseTimeData(t);
  const translatedSentimentData = sentimentData(t);
  
  // Set up form for creating smart reports
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      components: [],
      options: {
        includeCharts: true,
        includeRawData: false,
        includeSummary: true,
      },
    },
  });
  
  // Define report type
  type Report = {
    id: number;
    name: string;
    date: string;
    components: string[];
    author: string;
  };
  
  // Fetch reports from API
  const { 
    data: reports = [] as Report[], 
    isLoading, 
    isRefetching,
    refetch 
  } = useQuery<Report[]>({ 
    queryKey: ['/api/reports'],
    refetchOnWindowFocus: false
  });
  
  // Define template type
  type ReportTemplate = {
    id: number;
    name: string;
    date: string;
    components: string[];
    author: string;
  };

  // Fetch report templates from API
  const { 
    data: reportTemplates = [] as ReportTemplate[]
  } = useQuery<ReportTemplate[]>({ 
    queryKey: ['/api/reports/templates'],
    refetchOnWindowFocus: false
  });
  
  // Define a function to refresh reports
  const refreshReports = useCallback(() => {
    refetch();
    
    if (autoRefresh) {
      toast({
        title: t('reports.refreshingReports'),
        description: t('reports.reportsUpdatedAutomatically'),
        variant: "default",
      });
    }
  }, [refetch, autoRefresh, toast, t]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (autoRefresh) {
      // Refresh every 30 seconds when auto-refresh is enabled
      intervalId = window.setInterval(() => {
        refreshReports();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshReports]);
  
  // Create a new report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create report");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      refetch();
      
      setIsGeneratingReport(false);
      setCreateDialogOpen(false);
      
      // Show success toast
      toast({
        title: t('reports.reportCompiledSuccess'),
        description: `${form.getValues().name} ${t('reports.reportExported')}`,
        variant: "default",
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('reports.reportCreationFailed'),
        description: error.message,
        variant: "destructive",
      });
      setIsGeneratingReport(false);
    }
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGeneratingReport(true);
    createReportMutation.mutate(values);
  }
  
  // Component icon map
  const componentIcons: Record<string, React.ReactNode> = {
    excellence: <Gauge className="h-4 w-4" />,
    social: <Users className="h-4 w-4" />,
    sentiment: <BarChartHorizontal className="h-4 w-4" />,
    entities: <PanelTop className="h-4 w-4" />,
    media: <Newspaper className="h-4 w-4" />,
  };

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reports.title')}</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Select defaultValue="last30days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('dashboard.timeFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('dashboard.today')}</SelectItem>
                <SelectItem value="last7days">{t('dashboard.last7Days')}</SelectItem>
                <SelectItem value="last30days">{t('dashboard.last30Days')}</SelectItem>
                <SelectItem value="last90days">{t('dashboard.last90Days')}</SelectItem>
                <SelectItem value="custom">{t('dashboard.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="bg-[#cba344] hover:bg-[#b8943e] text-white"
            onClick={() => setCreateDialogOpen(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>{t('reports.createSmartReport')}</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="smart" onValueChange={setReportType} className="space-y-6" dir={t('direction') as 'ltr' | 'rtl'}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger value="smart" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reports.smartReportsTitle')}
          </TabsTrigger>
          <TabsTrigger value="excellence" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('navigation.excellenceIndicators')}
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reports.socialMediaReport')}
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:border-b-2 data-[state=active]:border-[#cba344] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">
            {t('reports.sentimentReport')}
          </TabsTrigger>
        </TabsList>
        
        {/* Create Smart Report Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('reports.createSmartReport')}</DialogTitle>
              <DialogDescription>
                {t('reports.smartReportsDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.smartReportName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('reports.smartReportNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <h4 className="text-sm font-medium mb-3">{t('reports.reportComponents')}</h4>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="components"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { value: 'excellence', label: t('reports.excellenceComponent') },
                              { value: 'social', label: t('reports.socialMediaComponent') },
                              { value: 'sentiment', label: t('reports.sentimentComponent') },
                              { value: 'entities', label: t('reports.entitiesComponent') },
                              { value: 'media', label: t('reports.mediaComponent') },
                            ].map((component) => (
                              <FormField
                                key={component.value}
                                control={form.control}
                                name="components"
                                render={({ field }) => {
                                  return (
                                    <FormItem key={component.value} className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(component.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, component.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== component.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center space-x-2">
                                          {componentIcons[component.value]}
                                          <span>{component.label}</span>
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">{t('reports.exportOptions')}</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="options.includeCharts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center">
                              <BarChart2 className="h-4 w-4 mr-2" />
                              {t('reports.includeCharts')}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="options.includeRawData"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              {t('reports.includeRawData')}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="options.includeSummary"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center">
                              <FileUp className="h-4 w-4 mr-2" />
                              {t('reports.includeSummary')}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)}>
                    {t('dashboard.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#cba344] hover:bg-[#b8943e] text-white"
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('reports.generatingReport')}
                      </>
                    ) : (
                      <>
                        <PieChartIcon className="mr-2 h-4 w-4" />
                        {t('reports.compileReport')}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Smart Reports Tab Content */}
        <TabsContent value="smart" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>{t('reports.smartReportsTitle')}</CardTitle>
                <CardDescription>{t('reports.smartReportsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{t('reports.savedReports')}</h3>
                      <p className="text-sm text-muted-foreground">{t('reports.latestReports')}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={refreshReports}
                          disabled={isRefetching}
                          className="h-9"
                        >
                          {isRefetching ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="mr-1"
                            >
                              <path d="M21 2v6h-6"></path>
                              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                              <path d="M3 22v-6h6"></path>
                              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                            </svg>
                          )}
                          {t('reports.refresh')}
                        </Button>

                        <div className="flex items-center gap-1">
                          <Label 
                            htmlFor="auto-refresh" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {t('reports.autoRefresh')}
                          </Label>
                          <Checkbox 
                            id="auto-refresh" 
                            checked={autoRefresh}
                            onCheckedChange={(checked) => {
                              setAutoRefresh(checked === true);
                              if (checked === true) {
                                toast({
                                  title: t('reports.autoRefreshEnabled'),
                                  description: t('reports.autoRefreshEnabledDescription'),
                                  variant: "default",
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        className="bg-[#cba344] hover:bg-[#b8943e] text-white"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('reports.createSmartReport')}
                      </Button>
                    </div>
                  </div>
                  
                  {reports.length > 0 ? (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <Card key={report.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-lg">{report.name}</h4>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(report.date).toLocaleDateString()}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{t('forms.author', "Author")}: {report.author}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {report.components.map((component: string) => (
                                    <span 
                                      key={component} 
                                      className="inline-flex items-center bg-muted rounded-md px-2 py-1 text-xs"
                                    >
                                      {componentIcons[component]}
                                      <span className="ml-1">{t(`reports.${component}Component`)}</span>
                                    </span>
                                  ))}
                                </div>
                                <div className="space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => {
                                      toast({
                                        title: t('reports.viewingDetailedReport'),
                                        description: `${report.name} ${t('reports.reportLoaded')}`,
                                        variant: "default",
                                      });
                                      
                                      // Navigate to the detailed report view
                                      setSelectedReport(report);
                                      setViewReportDialogOpen(true);
                                    }}
                                  >
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    {t('reports.viewDetailedReport')}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => {
                                      const exportFormat = "pdf"; // Default format
                                      
                                      toast({
                                        title: t('reports.exportingData'),
                                        description: `${report.name} ${t('reports.beingExported')} (${exportFormat.toUpperCase()})`,
                                        variant: "default",
                                      });
                                      
                                      // Call the API endpoint to export the report
                                      // The browser will handle the download automatically
                                      window.location.href = `/api/reports/${report.id}/export/${exportFormat}`;
                                      
                                      // Show completion toast after a delay
                                      setTimeout(() => {
                                        toast({
                                          title: t('reports.exportComplete'),
                                          description: `${report.name} ${t('reports.hasBeenExported')}`,
                                          variant: "default",
                                        });
                                      }, 1500);
                                    }}
                                  >
                                    <DownloadIcon className="h-3.5 w-3.5 mr-1" />
                                    {t('reports.exportData')}
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-muted p-6 min-w-[150px] flex flex-col justify-center items-center">
                                <div className="text-center mb-2">
                                  <BarChart2 className="h-8 w-8 mx-auto mb-2 text-[#cba344]" />
                                  <p className="text-xs font-medium">{report.components.length} {t('reports.reportComponents')}</p>
                                </div>
                                <div className="mt-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2"
                                    onClick={() => {
                                      toast({
                                        title: t('reports.schedulingReport'),
                                        description: t('reports.scheduleEmailSet'),
                                        variant: "default",
                                      });
                                    }}
                                  >
                                    <Mail className="h-3.5 w-3.5 mr-1" />
                                    {t('reports.scheduleReport')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                      <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="font-medium text-lg mb-1">{t('reports.noSavedReports')}</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {t('reports.smartReportsDescription')}
                      </p>
                      <Button 
                        className="bg-[#cba344] hover:bg-[#b8943e] text-white"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('reports.createSmartReport')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.reportTemplates')}</CardTitle>
                <CardDescription>
                  {t('reports.saveAsTemplate')}
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 text-xs">
                    <div className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 text-blue-500"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      {t('reports.autoUpdateHint', "Enable auto-refresh to automatically discover new templates and features as they're added to the system.")}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-[#cba344]" />
                      <div>
                        <h4 className="font-medium">{t('navigation.excellenceIndicators')}</h4>
                        <p className="text-xs text-muted-foreground">3 {t('reports.reportComponents')}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Pre-populate form with the Excellence Indicators template
                        form.reset({
                          name: t('navigation.excellenceIndicators'),
                          components: ['excellence'],
                          options: {
                            includeCharts: true,
                            includeRawData: true,
                            includeSummary: true,
                          },
                        });
                        
                        // Open the create dialog with pre-populated data
                        setCreateDialogOpen(true);
                        
                        toast({
                          title: t('reports.templateSelected'),
                          description: t('reports.excellenceTemplateLoaded'),
                          variant: "default",
                        });
                      }}
                    >
                      {t('reports.useTemplate')}
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-[#cba344]" />
                      <div>
                        <h4 className="font-medium">{t('reports.socialMediaReport')}</h4>
                        <p className="text-xs text-muted-foreground">2 {t('reports.reportComponents')}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Pre-populate form with the Social Media template
                        form.reset({
                          name: t('reports.socialMediaReport'),
                          components: ['social', 'sentiment'],
                          options: {
                            includeCharts: true,
                            includeRawData: false,
                            includeSummary: true,
                          },
                        });
                        
                        // Open the create dialog with pre-populated data
                        setCreateDialogOpen(true);
                        
                        toast({
                          title: t('reports.templateSelected'),
                          description: t('reports.socialMediaTemplateLoaded'),
                          variant: "default",
                        });
                      }}
                    >
                      {t('reports.useTemplate')}
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-[#cba344]" />
                      <div>
                        <h4 className="font-medium">{t('navigation.entityMonitoring')}</h4>
                        <p className="text-xs text-muted-foreground">4 {t('reports.reportComponents')}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Pre-populate form with the Entity Monitoring template
                        form.reset({
                          name: t('navigation.entityMonitoring'),
                          components: ['entities', 'social', 'sentiment', 'media'],
                          options: {
                            includeCharts: true,
                            includeRawData: true,
                            includeSummary: true,
                          },
                        });
                        
                        // Open the create dialog with pre-populated data
                        setCreateDialogOpen(true);
                        
                        toast({
                          title: t('reports.templateSelected'),
                          description: t('reports.entityMonitoringTemplateLoaded'),
                          variant: "default",
                        });
                      }}
                    >
                      {t('reports.useTemplate')}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    // If no reports exist yet, show a message
                    if (!reports || reports.length === 0) {
                      toast({
                        title: t('reports.noReportsToSave'),
                        description: t('reports.createReportFirst'),
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // Otherwise, you could open a dialog to select which report to save as a template
                    toast({
                      title: t('reports.templateSaved'),
                      description: t('reports.templateSavedDescription'),
                      variant: "default",
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('reports.saveAsTemplate')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="excellence" className="mt-0 space-y-6" dir={t('direction') as 'ltr' | 'rtl'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 flex items-start">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Gauge className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('excellence.economicPillar')}</p>
                  <h3 className="text-2xl font-bold">85/100</h3>
                  <p className="text-xs text-green-500">+7% {t('reports.improvement')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-start">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('excellence.socialPillar')}</p>
                  <h3 className="text-2xl font-bold">79/100</h3>
                  <p className="text-xs text-green-500">+5% {t('reports.improvement')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-start">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <ThumbsUp className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('excellence.knowledgePillar')}</p>
                  <h3 className="text-2xl font-bold">88/100</h3>
                  <p className="text-xs text-green-500">+10% {t('reports.improvement')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-start">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <Lightbulb className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('excellence.innovationPillar')}</p>
                  <h3 className="text-2xl font-bold">83/100</h3>
                  <p className="text-xs text-green-500">+6% {t('reports.improvement')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2 border-2 border-[#cba344] shadow-lg">
              <CardHeader className="bg-[#cba344] bg-opacity-10">
                <CardTitle className="flex items-center" dir="ltr">
                  <Gauge className="mr-2 h-5 w-5" />
                  {t('navigation.excellenceIndicators')}
                </CardTitle>
                <CardDescription>{t('excellence.indicatorsDescription', "Comprehensive overview of the institutional excellence indicators across all pillars")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4">{t('excellence.reportDescription', "Download the full excellence indicators report with detailed analysis and insights.")}</p>
                <Button 
                  className="bg-[#cba344] hover:bg-[#b8943e] text-white" 
                  onClick={() => window.location.href = "/excellence-indicators"}
                >
                  <Gauge className="mr-2 h-4 w-4" />
                  {t('navigation.viewExcellenceIndicators')}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.latestChanges')}</CardTitle>
                <CardDescription>{t('reports.changesDescription', "Recent updates to excellence indicators")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3" dir="ltr">
                    <div className="p-1.5 rounded-full bg-blue-100">
                      <Zap className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('excellence.knowledgeScoreImproved')}</p>
                      <p className="text-xs text-gray-500">2 {t('reports.daysAgo')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3" dir="ltr">
                    <div className="p-1.5 rounded-full bg-green-100">
                      <Zap className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('excellence.innovationMetricsUpdated')}</p>
                      <p className="text-xs text-gray-500">5 {t('reports.daysAgo')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('excellence.pillarComparison')}</CardTitle>
                <CardDescription>{t('excellence.pillarComparisonDescription', "Comparison of excellence pillars performance")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                      barSize={10}
                      data={[
                        { name: t('excellence.economicPillar'), value: 85, fill: '#4285F4' },
                        { name: t('excellence.socialPillar'), value: 79, fill: '#34A853' },
                        { name: t('excellence.knowledgePillar'), value: 88, fill: '#8F63D2' },
                        { name: t('excellence.innovationPillar'), value: 83, fill: '#FBBC05' },
                        { name: t('excellence.digitalPillar'), value: 76, fill: '#EA4335' },
                      ]}
                    >
                      <RadialBar
                        label={{ position: 'insideStart', fill: '#666', fontSize: 12 }}
                        background
                        dataKey="value"
                      />
                      <Legend
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('excellence.yearlyTrends')}</CardTitle>
                <CardDescription>{t('excellence.yearlyTrendsDescription', "Performance trends over the past year")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: t('charts.months.jan'), economic: 78, social: 72, knowledge: 80, innovation: 75 },
                        { month: t('charts.months.feb'), economic: 80, social: 74, knowledge: 82, innovation: 76 },
                        { month: t('charts.months.mar'), economic: 81, social: 75, knowledge: 83, innovation: 78 },
                        { month: t('charts.months.apr'), economic: 82, social: 76, knowledge: 84, innovation: 79 },
                        { month: t('charts.months.may'), economic: 83, social: 77, knowledge: 85, innovation: 80 },
                        { month: t('charts.months.jun'), economic: 83, social: 78, knowledge: 86, innovation: 81 },
                        { month: t('charts.months.jul'), economic: 84, social: 78, knowledge: 87, innovation: 81 },
                        { month: t('charts.months.aug'), economic: 84, social: 79, knowledge: 87, innovation: 82 },
                        { month: t('charts.months.sep'), economic: 85, social: 79, knowledge: 88, innovation: 83 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[70, 90]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="economic" 
                        stroke="#4285F4" 
                        name={t('excellence.economicPillar')} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="knowledge" 
                        stroke="#8F63D2" 
                        name={t('excellence.knowledgePillar')} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="innovation" 
                        stroke="#FBBC05" 
                        name={t('excellence.innovationPillar')} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('excellence.subindicatorsDistribution')}</CardTitle>
                <CardDescription>{t('excellence.subindicatorsDistributionDescription', "Distribution of sub-indicators by performance level")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: t('excellence.excellent'), count: 12, fill: '#34A853' },
                        { category: t('excellence.veryGood'), count: 18, fill: '#4285F4' },
                        { category: t('excellence.good'), count: 8, fill: '#FBBC05' },
                        { category: t('excellence.average'), count: 5, fill: '#EA4335' },
                        { category: t('excellence.needsImprovement'), count: 2, fill: '#757575' },
                      ]}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name={t('excellence.subindicatorsCount')}
                        fill="#cba344"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('excellence.pillarContribution')}</CardTitle>
                <CardDescription>{t('excellence.pillarContributionDescription', "Contribution of each pillar to overall excellence score")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('excellence.economicPillar'), value: 26, color: '#4285F4' },
                          { name: t('excellence.socialPillar'), value: 18, color: '#34A853' },
                          { name: t('excellence.knowledgePillar'), value: 23, color: '#8F63D2' },
                          { name: t('excellence.innovationPillar'), value: 19, color: '#FBBC05' },
                          { name: t('excellence.digitalPillar'), value: 14, color: '#EA4335' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: t('excellence.economicPillar'), value: 26, color: '#4285F4' },
                          { name: t('excellence.socialPillar'), value: 18, color: '#34A853' },
                          { name: t('excellence.knowledgePillar'), value: 23, color: '#8F63D2' },
                          { name: t('excellence.innovationPillar'), value: 19, color: '#FBBC05' },
                          { name: t('excellence.digitalPillar'), value: 14, color: '#EA4335' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              className="bg-[#cba344] hover:bg-[#b8943e] text-white"
              onClick={() => window.location.href = "/excellence-indicators?download=true"}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              {t('excellence.downloadFullReport')}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="social" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Social Media Report Header */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <CardTitle>{t('reports.socialMediaReport')}</CardTitle>
                    <CardDescription>{t('reports.socialMediaReportDescription')}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[160px]">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={t('dashboard.timeFilter')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">{t('dashboard.last7Days')}</SelectItem>
                        <SelectItem value="30">{t('dashboard.last30Days')}</SelectItem>
                        <SelectItem value="90">{t('dashboard.last90Days')}</SelectItem>
                        <SelectItem value="custom">{t('dashboard.custom')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: t('reports.preparingReport'),
                          description: t('reports.socialMediaReportPreparing'),
                          variant: "default",
                        });
                        
                        // Simulate report generation and download
                        setTimeout(() => {
                          toast({
                            title: t('reports.reportReady'),
                            description: t('reports.downloadStarting'),
                            variant: "default",
                          });
                          
                          // For an actual implementation, you would:
                          // 1. Make an API call to generate the report
                          // 2. Handle the response as a blob
                          // 3. Create a download link and trigger it
                          
                          // Example implementation:
                          // fetch('/api/reports/social-media', {
                          //   method: 'POST',
                          //   headers: { 'Content-Type': 'application/json' },
                          //   body: JSON.stringify({ 
                          //     timeRange: socialTimeRange, 
                          //     platforms: ['twitter', 'facebook', 'instagram', 'linkedin'] 
                          //   }),
                          // })
                          // .then(response => response.blob())
                          // .then(blob => {
                          //   const url = window.URL.createObjectURL(blob);
                          //   const a = document.createElement('a');
                          //   a.href = url;
                          //   a.download = `social-media-report-${new Date().toISOString().slice(0, 10)}.pdf`;
                          //   document.body.appendChild(a);
                          //   a.click();
                          //   document.body.removeChild(a);
                          // });
                        }, 2000);
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      {t('dashboard.downloadReport')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Platform Performance Overview Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-[#1DA1F2]">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                  Twitter
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-3xl font-bold">1,245</div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.likes', { count: 820 })}</span>
                    <span className="text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.comments', { count: 245 })}</span>
                    <span className="text-green-600">+8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('monitoring.engagement.shares', { count: 180 })}</span>
                    <span className="text-amber-600">+2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-[#4267B2]">
                    <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20.26 20.26 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2z" />
                  </svg>
                  Facebook
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-3xl font-bold">3,128</div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    8%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.likes', { count: 1450 })}</span>
                    <span className="text-green-600">+11%</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.comments', { count: 678 })}</span>
                    <span className="text-green-600">+5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('monitoring.engagement.shares', { count: 1000 })}</span>
                    <span className="text-green-600">+9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-[#C13584]">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.044.976.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.67 0 2.987-.01 4.04-.058.976-.044 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.054.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.044-.976-.207-1.504-.344-1.857a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.054-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.469a3.334 3.334 0 1 0 0-6.667 3.334 3.334 0 0 0 0 6.667zm6.538-8.672a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                  </svg>
                  Instagram
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-3xl font-bold">2,734</div>
                  <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    3%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.likes', { count: 2230 })}</span>
                    <span className="text-amber-600">-1%</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('monitoring.engagement.comments', { count: 504 })}</span>
                    <span className="text-red-600">-8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('monitoring.engagement.shares', { count: 0 })}</span>
                    <span className="text-muted-foreground">n/a</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('reports.socialMediaEngagement')}</CardTitle>
                <CardDescription>{t('reports.engagementTrendsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: t('charts.months.jan'), twitter: 4000, facebook: 2400, instagram: 2400 },
                        { name: t('charts.months.feb'), twitter: 3000, facebook: 1398, instagram: 2210 },
                        { name: t('charts.months.mar'), twitter: 2000, facebook: 9800, instagram: 2290 },
                        { name: t('charts.months.apr'), twitter: 2780, facebook: 3908, instagram: 2000 },
                        { name: t('charts.months.may'), twitter: 1890, facebook: 4800, instagram: 2181 },
                        { name: t('charts.months.jun'), twitter: 2390, facebook: 3800, instagram: 2500 }
                      ]}
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
                      <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="facebook" stroke="#4267B2" />
                      <Line type="monotone" dataKey="instagram" stroke="#C13584" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.sentimentDistribution')}</CardTitle>
                <CardDescription>{t('reports.sentimentByPlatformDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('analysis.positive'), value: 65, fill: '#34A853' },
                          { name: t('analysis.neutral'), value: 25, fill: '#FBBC05' },
                          { name: t('analysis.negative'), value: 10, fill: '#EA4335' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Content */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('reports.topPerformingContent')}</CardTitle>
                <CardDescription>{t('reports.contentWithHighestEngagement')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Twitter Post */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 fill-[#1DA1F2]">
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">UAE Government</h4>
                          <span className="text-muted-foreground ml-2 text-sm">@uaegov</span>
                        </div>
                        <p className="mt-1 text-sm">Excited to announce our new digital services platform that will make government services more accessible for all UAE residents! #DigitalUAE #SmartGovernment</p>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <span className="mr-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            324
                          </span>
                          <span className="mr-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            56
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            128
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          +126%
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">vs avg</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Facebook Post */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 fill-[#4267B2]">
                          <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20.26 20.26 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">Ministry of Education UAE</h4>
                        </div>
                        <p className="mt-1 text-sm">Congratulations to all students on their outstanding achievements in the recent examinations! The future of the UAE is bright with such talented young minds. #EducationFirst #UAEPride</p>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <span className="mr-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            832
                          </span>
                          <span className="mr-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            215
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            98
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          +89%
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">vs avg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Demographics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('reports.audienceDemographics')}</CardTitle>
                <CardDescription>{t('reports.audienceInsights')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { age: '18-24', count: 18 },
                        { age: '25-34', count: 35 },
                        { age: '35-44', count: 25 },
                        { age: '45-54', count: 12 },
                        { age: '55-64', count: 8 },
                        { age: '65+', count: 2 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="age" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name={t('reports.audiencePercentage')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.geographicDistribution')}</CardTitle>
                <CardDescription>{t('reports.audienceLocation')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Abu Dhabi</span>
                    <span className="text-sm text-muted-foreground">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Dubai</span>
                    <span className="text-sm text-muted-foreground">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sharjah</span>
                    <span className="text-sm text-muted-foreground">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ajman</span>
                    <span className="text-sm text-muted-foreground">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Other Emirates</span>
                    <span className="text-sm text-muted-foreground">6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '6%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <Card className="lg:col-span-3">
              <CardContent className="pt-6">
                <div className="flex flex-wrap justify-between gap-3">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: t('reports.preparingPrint'),
                        description: t('reports.printDialogOpening'),
                        variant: "default",
                      });
                      
                      // Using the browser's print functionality
                      setTimeout(() => {
                        window.print();
                      }, 500);
                    }}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {t('reports.printReport')}
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => {
                      // Open a sharing dialog
                      toast({
                        title: t('reports.shareOptions'),
                        description: t('reports.selectSharingOption'),
                        variant: "default",
                      });
                      
                      // Create a sharing URL
                      const shareUrl = window.location.href;
                      
                      // Try to use the Web Share API if available
                      if (navigator.share) {
                        navigator.share({
                          title: t('reports.socialMediaReportTitle'),
                          text: t('reports.socialMediaReportDescription'),
                          url: shareUrl,
                        }).catch(() => {
                          // Fallback if sharing fails
                          navigator.clipboard.writeText(shareUrl);
                          toast({
                            title: t('reports.linkCopied'),
                            description: t('reports.urlCopiedToClipboard'),
                            variant: "default",
                          });
                        });
                      } else {
                        // Fallback for browsers that don't support the Web Share API
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: t('reports.linkCopied'),
                          description: t('reports.urlCopiedToClipboard'),
                          variant: "default",
                        });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('reports.shareReport')}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: t('reports.preparingDownload'),
                        description: t('reports.generatingPDF'),
                        variant: "default",
                      });
                      
                      // Simulate PDF generation and download
                      setTimeout(() => {
                        toast({
                          title: t('reports.downloadReady'),
                          description: t('reports.downloadStarting'),
                          variant: "default",
                        });
                        
                        // In a real implementation, you would call an API endpoint to generate the PDF
                        // For example:
                        // fetch('/api/reports/social-media/full-report', {
                        //   method: 'GET',
                        // })
                        // .then(response => response.blob())
                        // .then(blob => {
                        //   const url = window.URL.createObjectURL(blob);
                        //   const a = document.createElement('a');
                        //   a.href = url;
                        //   a.download = `social-media-full-report-${new Date().toISOString().slice(0, 10)}.pdf`;
                        //   document.body.appendChild(a);
                        //   a.click();
                        //   document.body.removeChild(a);
                        // });
                      }, 2000);
                    }}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {t('reports.downloadFullReport')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sentiment" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.sentimentAnalysis')}</CardTitle>
              <CardDescription>{t('reports.sentimentAnalysisDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">{t('reports.sentimentDistribution')}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={translatedSentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {translatedSentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">{t('reports.keyInsights')}</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <h4 className="font-medium">{t('reports.positiveSentiment')}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{t('reports.positiveSentimentDesc')}</p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <h4 className="font-medium">{t('reports.neutralSentiment')}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{t('reports.neutralSentimentDesc')}</p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <h4 className="font-medium">{t('reports.negativeSentiment')}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{t('reports.negativeSentimentDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => {
                    toast({
                      title: t('reports.preparingExport'),
                      description: t('reports.exportingData'),
                      variant: "default",
                    });
                    
                    // Simulate export data generation
                    setTimeout(() => {
                      toast({
                        title: t('reports.exportReady'),
                        description: t('reports.downloadStarting'),
                        variant: "default", 
                      });
                      
                      // In a real implementation, you would call an API endpoint
                      // For CSV or Excel export:
                      // fetch('/api/reports/sentiment-analysis/export', {
                      //   method: 'GET',
                      // })
                      // .then(response => response.blob())
                      // .then(blob => {
                      //   const url = window.URL.createObjectURL(blob);
                      //   const a = document.createElement('a');
                      //   a.href = url;
                      //   a.download = `sentiment-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
                      //   document.body.appendChild(a);
                      //   a.click();
                      //   document.body.removeChild(a);
                      // });
                    }, 1500);
                  }}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t('reports.exportData')}
                </Button>
                <Button className="bg-[#cba344] hover:bg-[#b8943e]" onClick={() => window.location.href = "/reports/performance-visualization"}>
                  {t('reports.viewDetailedReport')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.customReport')}</CardTitle>
              <CardDescription>{t('reports.customReportDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('reports.customReportTitle')}</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{t('reports.customReportMessage')}</p>
                <Button>
                  {t('reports.createCustomReport')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Report Dialog */}
      <Dialog open={viewReportDialogOpen} onOpenChange={setViewReportDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name || ''}</DialogTitle>
            <DialogDescription>
              {t('reports.createdOn')} {selectedReport?.date ? new Date(selectedReport.date).toLocaleDateString() : ''} • {selectedReport?.author || ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 py-4">
              {/* Report Summary Header */}
              <div className="bg-muted p-6 rounded-lg mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1">{selectedReport.name}</h3>
                    <p className="text-sm text-muted-foreground">{t('reports.componentsIncluded')}: {selectedReport.components.length}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const format = "pdf";
                        window.location.href = `/api/reports/${selectedReport.id}/export/${format}`;
                        
                        toast({
                          title: t('reports.exportingData'),
                          description: `${selectedReport.name} ${t('reports.beingExported')} (PDF)`,
                          variant: "default",
                        });
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      {t('reports.exportPDF')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const format = "excel";
                        window.location.href = `/api/reports/${selectedReport.id}/export/${format}`;
                        
                        toast({
                          title: t('reports.exportingData'),
                          description: `${selectedReport.name} ${t('reports.beingExported')} (Excel)`,
                          variant: "default",
                        });
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      {t('reports.exportExcel')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: t('reports.preparingPrint'),
                          description: t('reports.printDialogOpening'),
                          variant: "default",
                        });
                        
                        setTimeout(() => {
                          window.print();
                        }, 500);
                      }}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      {t('reports.print')}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Components Display */}
              <div className="space-y-8">
                {selectedReport.components.includes('excellence') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gauge className="h-5 w-5 mr-2 text-[#cba344]" />
                        {t('reports.excellenceComponent')}
                      </CardTitle>
                      <CardDescription>{t('reports.excellenceDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={translatedKpiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name={t('reports.performanceScore')} />
                          <Bar dataKey="target" fill="#82ca9d" name={t('reports.targetScore')} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                
                {selectedReport.components.includes('social') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-[#cba344]" />
                        {t('reports.socialMediaComponent')}
                      </CardTitle>
                      <CardDescription>{t('reports.socialMediaDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-3">{t('reports.engagementOverTime')}</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={translatedResponseTimeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" />
                                <Line type="monotone" dataKey="facebook" stroke="#4267B2" name="Facebook" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-3">{t('reports.platformBreakdown')}</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Twitter', value: 35, fill: '#1DA1F2' },
                                    { name: 'Facebook', value: 40, fill: '#4267B2' },
                                    { name: 'Instagram', value: 15, fill: '#C13584' },
                                    { name: 'LinkedIn', value: 10, fill: '#0077B5' },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedReport.components.includes('sentiment') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChartHorizontal className="h-5 w-5 mr-2 text-[#cba344]" />
                        {t('reports.sentimentComponent')}
                      </CardTitle>
                      <CardDescription>{t('reports.sentimentDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium mb-3">{t('reports.sentimentDistribution')}</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={translatedSentimentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {translatedSentimentData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3">{t('reports.sentimentOverTime')}</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={translatedTrendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="positive" stroke="#4CAF50" name={t('analysis.positive')} />
                              <Line type="monotone" dataKey="negative" stroke="#F44336" name={t('analysis.negative')} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReportDialogOpen(false)}>
              {t('dialog.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Reports;
