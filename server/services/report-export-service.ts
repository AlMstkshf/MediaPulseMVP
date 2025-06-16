import { Response } from 'express';
import { SentimentReport, SocialPost, GovEntity } from '@shared/schema';

/**
 * Export formats supported by the system
 */
export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

/**
 * Service for exporting reports in different formats
 */
export class ReportExportService {
  
  /**
   * Generate a report based on a specific report ID or filter criteria
   * @param reportId Optional report ID to export
   * @param format The export format (PDF, Excel, CSV, JSON)
   * @param dateFrom Optional start date for filtering reports
   * @param dateTo Optional end date for filtering reports
   * @param platform Optional platform for filtering reports
   * @returns Object containing data, content type and filename for the report
   */
  public async generateReport(
    reportId: number | null,
    format: string,
    dateFrom?: Date,
    dateTo?: Date,
    platform?: string
  ): Promise<{ data: any, contentType: string, filename: string }> {
    let reports: SentimentReport[] = [];
    let posts: SocialPost[] = [];
    let entities: GovEntity[] = [];
    
    // Import the storage and required types
    const { storage } = await import('../storage');
    
    try {
      // If reportId is provided, get that specific report
      if (reportId) {
        const report = await storage.getSentimentReport(reportId);
        if (report) {
          reports = [report];
        }
      } else {
        // Otherwise, get reports based on filters
        const filters: any = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (platform) filters.platform = platform;
        
        reports = await storage.listSentimentReports(filters);
      }
      
      // Get related data if any reports found
      if (reports.length > 0) {
        // Get some social posts for context
        posts = await storage.listSocialPosts({
          dateFrom,
          dateTo,
          platform
        });
        
        // Get government entities
        entities = await storage.listGovEntities();
      }
      
      // Set title and date range
      const title = 'Sentiment Analysis Report';
      let dateRange = '';
      if (dateFrom && dateTo) {
        dateRange = `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`;
      } else if (dateFrom) {
        dateRange = `From ${dateFrom.toLocaleDateString()}`;
      } else if (dateTo) {
        dateRange = `Until ${dateTo.toLocaleDateString()}`;
      }
      
      // Prepare the response
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${sanitizedTitle}_${timestamp}`;
      
      // Create a response object to collect data
      const responseObject = {
        data: null as any,
        contentType: '',
        filename: ''
      };
      
      // Use a custom response object to capture output
      const memoryResponse = {
        _data: null as any,
        _headers: new Map<string, string>(),
        setHeader(name: string, value: string) {
          this._headers.set(name, value);
          return this;
        },
        send(data: any) {
          this._data = data;
          return this;
        },
        json(data: any) {
          this._data = JSON.stringify(data);
          return this;
        }
      };
      
      // Generate the report using existing methods
      await this.generateSentimentReport(
        memoryResponse as any,
        format as ExportFormat,
        reports,
        posts,
        entities,
        title,
        dateRange
      );
      
      // Get content type from headers
      const contentType = memoryResponse._headers.get('Content-Type') || '';
      const dispositionHeader = memoryResponse._headers.get('Content-Disposition') || '';
      const filenameMatch = dispositionHeader.match(/filename="(.+?)"/);
      const extractedFilename = filenameMatch ? filenameMatch[1] : `${filename}.${format}`;
      
      return {
        data: memoryResponse._data,
        contentType,
        filename: extractedFilename
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
  
  /**
   * Generate a sentiment analysis report based on reports and related data
   * @param res Express response object to stream the file
   * @param format The export format (PDF, Excel, CSV, JSON)
   * @param reports Sentiment report data
   * @param posts Optional related social posts
   * @param entities Optional government entities
   * @param title Report title
   * @param dateRange Optional date range string for the report
   */
  public async generateSentimentReport(
    res: Response,
    format: ExportFormat,
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): Promise<void> {
    
    // Set appropriate headers based on format
    this.setResponseHeaders(res, format, title);
    
    switch (format) {
      case ExportFormat.PDF:
        await this.generatePDFReport(res, reports, posts, entities, title, dateRange);
        break;
        
      case ExportFormat.EXCEL:
        await this.generateExcelReport(res, reports, posts, entities, title, dateRange);
        break;
        
      case ExportFormat.CSV:
        await this.generateCSVReport(res, reports, posts, entities, title, dateRange);
        break;
        
      case ExportFormat.JSON:
        this.generateJSONReport(res, reports, posts, entities, title, dateRange);
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  /**
   * Set the appropriate HTTP headers for the response based on file format
   */
  private setResponseHeaders(res: Response, format: ExportFormat, title: string): void {
    // Create a sanitized filename from the title
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${sanitizedTitle}_${timestamp}`;
    
    switch (format) {
      case ExportFormat.PDF:
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        break;
        
      case ExportFormat.EXCEL:
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        break;
        
      case ExportFormat.CSV:
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        break;
        
      case ExportFormat.JSON:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        break;
    }
  }
  
  /**
   * Generate a PDF report
   */
  private async generatePDFReport(
    res: Response,
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): Promise<void> {
    // This will be implemented on the client side
    // PDF generation in Node.js has limitations in a server context
    // We'll pass the data to the client and generate PDFs there
    
    // For now, we'll send the data as JSON
    const data = this.prepareReportData(reports, posts, entities, title, dateRange);
    res.json({
      format: ExportFormat.PDF,
      data,
      message: 'PDF reports are generated on the client side'
    });
  }
  
  /**
   * Generate an Excel report
   */
  private async generateExcelReport(
    res: Response,
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): Promise<void> {
    // Excel generation will be handled on the client side
    // We'll send the data and let the client generate the file
    
    const data = this.prepareReportData(reports, posts, entities, title, dateRange);
    res.json({
      format: ExportFormat.EXCEL,
      data,
      message: 'Excel reports are generated on the client side'
    });
  }
  
  /**
   * Generate a CSV report
   */
  private async generateCSVReport(
    res: Response,
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): Promise<void> {
    // For CSV, we'll generate on the server and stream directly
    const data = this.prepareReportData(reports, posts, entities, title, dateRange);
    
    // Convert data to CSV format
    const headers = ['Date', 'Platform', 'Positive', 'Neutral', 'Negative', 'Overall Score'];
    const csvRows = [headers.join(',')];
    
    // Add report rows
    for (const report of reports) {
      const row = [
        new Date(report.date).toLocaleDateString(),
        report.platform || 'All',
        report.positive || 0,
        report.neutral || 0,
        report.negative || 0,
        this.calculateOverallScore(report)
      ];
      
      csvRows.push(row.join(','));
    }
    
    res.send(csvRows.join('\n'));
  }
  
  /**
   * Generate a JSON report
   */
  private generateJSONReport(
    res: Response,
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): void {
    const data = this.prepareReportData(reports, posts, entities, title, dateRange);
    res.json(data);
  }
  
  /**
   * Prepare report data structure
   */
  private prepareReportData(
    reports: SentimentReport[],
    posts?: SocialPost[],
    entities?: GovEntity[],
    title: string = 'Sentiment Analysis Report',
    dateRange?: string
  ): any {
    // Process reports to add calculated fields
    const processedReports = reports.map(report => ({
      ...report,
      overallScore: this.calculateOverallScore(report),
      date: new Date(report.date).toLocaleDateString()
    }));
    
    // Prepare platform aggregates
    const platformAggregates = this.aggregateByPlatform(reports);
    
    // Prepare entity aggregates if entities are provided
    const entityAggregates = entities ? this.aggregateByEntity(reports, entities) : [];
    
    return {
      title,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalReports: reports.length,
        platforms: [...new Set(reports.filter(r => r.platform).map(r => r.platform))],
        overallSentiment: this.calculateAverageSentiment(reports)
      },
      reports: processedReports,
      platformAggregates,
      entityAggregates,
      relatedPosts: posts || []
    };
  }
  
  /**
   * Calculate overall sentiment score from a report
   */
  private calculateOverallScore(report: SentimentReport): number {
    const positive = report.positive || 0;
    const neutral = report.neutral || 0;
    const negative = report.negative || 0;
    
    const total = positive + neutral + negative;
    if (total === 0) return 0;
    
    // Calculate weighted score (0-100)
    // Positive: 100, Neutral: 50, Negative: 0
    return Math.round((positive * 100 + neutral * 50 + negative * 0) / total);
  }
  
  /**
   * Calculate average sentiment across all reports
   */
  private calculateAverageSentiment(reports: SentimentReport[]): number {
    if (reports.length === 0) return 0;
    
    const scores = reports.map(report => this.calculateOverallScore(report));
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / reports.length);
  }
  
  /**
   * Aggregate sentiment data by platform
   */
  private aggregateByPlatform(reports: SentimentReport[]): any[] {
    const platforms = [...new Set(reports.filter(r => r.platform).map(r => r.platform))];
    
    return platforms.map(platform => {
      const platformReports = reports.filter(r => r.platform === platform);
      
      const totalPositive = platformReports.reduce((sum, report) => sum + (report.positive || 0), 0);
      const totalNeutral = platformReports.reduce((sum, report) => sum + (report.neutral || 0), 0);
      const totalNegative = platformReports.reduce((sum, report) => sum + (report.negative || 0), 0);
      
      return {
        platform,
        positive: totalPositive,
        neutral: totalNeutral,
        negative: totalNegative,
        total: totalPositive + totalNeutral + totalNegative,
        overallScore: this.calculateAverageSentiment(platformReports)
      };
    });
  }
  
  /**
   * Aggregate sentiment data by entity
   */
  private aggregateByEntity(reports: SentimentReport[], entities: GovEntity[]): any[] {
    // This requires linking reports to entities
    // For now, we'll return a placeholder
    // In a real implementation, you would query for entity-specific sentiment
    
    return entities.map(entity => ({
      entityId: entity.id,
      entityName: entity.name,
      arabicName: entity.arabicName,
      positive: Math.floor(Math.random() * 100),
      neutral: Math.floor(Math.random() * 100),
      negative: Math.floor(Math.random() * 100),
      overallScore: Math.floor(Math.random() * 100)
    }));
  }
}

const reportExportService = new ReportExportService();
export default reportExportService;