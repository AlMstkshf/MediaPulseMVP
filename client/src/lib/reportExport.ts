import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SentimentReport, SocialPost, GovEntity } from '@shared/schema';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

interface ReportData {
  title: string;
  dateRange?: string;
  generatedAt: string;
  summary: {
    totalReports: number;
    platforms: string[];
    overallSentiment: number;
  };
  reports: any[];
  platformAggregates: any[];
  entityAggregates: any[];
  relatedPosts: any[];
}

export async function generateClientReport(
  format: ExportFormat,
  data: ReportData
): Promise<void> {
  switch (format) {
    case ExportFormat.PDF:
      generatePDFReport(data);
      break;
    case ExportFormat.EXCEL:
      generateExcelReport(data);
      break;
    case ExportFormat.CSV:
      generateCSVReport(data);
      break;
    case ExportFormat.JSON:
      generateJSONReport(data);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Fetch report data from the server
 */
export async function fetchReportData(
  format: string,
  reportId?: number,
  dateFrom?: Date,
  dateTo?: Date,
  platform?: string
): Promise<any> {
  // Build query parameters
  const params = new URLSearchParams();
  if (reportId) {
    params.append('reportId', reportId.toString());
  }
  if (dateFrom) {
    params.append('dateFrom', dateFrom.toISOString());
  }
  if (dateTo) {
    params.append('dateTo', dateTo.toISOString());
  }
  if (platform) {
    params.append('platform', platform);
  }

  // Fetch report data
  const response = await fetch(`/api/sentiment-reports/export/${format}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch report data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate a PDF report using jsPDF
 */
function generatePDFReport(data: ReportData): void {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: data.title,
    subject: 'Sentiment Analysis Report',
    author: 'Media Intelligence Platform',
    keywords: 'sentiment, analysis, report',
    creator: 'Media Intelligence Platform'
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(data.title, 14, 20);
  
  // Add date range if available
  if (data.dateRange) {
    doc.setFontSize(11);
    doc.text(`Period: ${data.dateRange}`, 14, 28);
  }
  
  // Add generation date
  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date(data.generatedAt).toLocaleString()}`, 14, 33);
  
  // Add summary section
  doc.setFontSize(14);
  doc.text('Summary', 14, 42);
  
  doc.setFontSize(10);
  doc.text(`Total Reports: ${data.summary.totalReports}`, 14, 50);
  doc.text(`Platforms: ${data.summary.platforms.join(', ')}`, 14, 56);
  doc.text(`Overall Sentiment: ${data.summary.overallSentiment}/100`, 14, 62);
  
  // Add platforms table
  doc.setFontSize(14);
  doc.text('Platform Analysis', 14, 75);
  
  // Header data for platforms table
  const platformTableHeaders = [['Platform', 'Positive', 'Neutral', 'Negative', 'Total', 'Score']];
  
  // Body data for platforms table
  const platformTableData = data.platformAggregates.map(platform => [
    platform.platform || 'Unknown',
    platform.positive,
    platform.neutral,
    platform.negative,
    platform.total,
    platform.overallScore
  ]);
  
  // @ts-ignore jsPDF-AutoTable's method is not recognized by TypeScript
  doc.autoTable({
    head: platformTableHeaders,
    body: platformTableData,
    startY: 80,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [203, 163, 68] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Add reports table
  const reportsStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Detailed Reports', 14, reportsStartY);
  
  // Header data for reports table
  const reportsTableHeaders = [['Date', 'Platform', 'Positive', 'Neutral', 'Negative', 'Score']];
  
  // Body data for reports table
  const reportsTableData = data.reports.map(report => [
    report.date,
    report.platform || 'All',
    report.positive || 0,
    report.neutral || 0,
    report.negative || 0,
    report.overallScore
  ]);
  
  // @ts-ignore jsPDF-AutoTable's method
  doc.autoTable({
    head: reportsTableHeaders,
    body: reportsTableData,
    startY: reportsStartY + 5,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Save the document
  doc.save(`${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate an Excel report using xlsx
 */
function generateExcelReport(data: ReportData): void {
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  
  // Create summary worksheet
  const summaryData = [
    ['Media Intelligence Platform'],
    [data.title],
    [''],
    ['Period', data.dateRange || 'All Time'],
    ['Generated on', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['Summary'],
    ['Total Reports', data.summary.totalReports],
    ['Platforms', data.summary.platforms.join(', ')],
    ['Overall Sentiment Score', `${data.summary.overallSentiment}/100`],
  ];
  
  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  
  // Create platform analysis worksheet
  const platformHeaders = ['Platform', 'Positive', 'Neutral', 'Negative', 'Total', 'Score'];
  const platformRows = data.platformAggregates.map(platform => [
    platform.platform || 'Unknown',
    platform.positive,
    platform.neutral,
    platform.negative,
    platform.total,
    platform.overallScore
  ]);
  
  const platformData = [platformHeaders, ...platformRows];
  const platformWorksheet = XLSX.utils.aoa_to_sheet(platformData);
  XLSX.utils.book_append_sheet(workbook, platformWorksheet, 'Platforms');
  
  // Create detailed reports worksheet
  const reportHeaders = ['Date', 'Platform', 'Positive', 'Neutral', 'Negative', 'Score'];
  const reportRows = data.reports.map(report => [
    report.date,
    report.platform || 'All',
    report.positive || 0,
    report.neutral || 0,
    report.negative || 0,
    report.overallScore
  ]);
  
  const reportData = [reportHeaders, ...reportRows];
  const reportWorksheet = XLSX.utils.aoa_to_sheet(reportData);
  XLSX.utils.book_append_sheet(workbook, reportWorksheet, 'Reports');
  
  // If there are related posts, add them to a separate worksheet
  if (data.relatedPosts.length > 0) {
    const postHeaders = ['Platform', 'Content', 'Author', 'Posted At', 'Sentiment'];
    const postRows = data.relatedPosts.map(post => [
      post.platform,
      post.content.substring(0, 500), // Limit content length
      post.authorName || 'Unknown',
      post.postedAt ? new Date(post.postedAt).toLocaleString() : 'N/A',
      post.sentiment || 'N/A'
    ]);
    
    const postData = [postHeaders, ...postRows];
    const postWorksheet = XLSX.utils.aoa_to_sheet(postData);
    XLSX.utils.book_append_sheet(workbook, postWorksheet, 'Posts');
  }
  
  // Generate and save the file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Generate a CSV report
 */
function generateCSVReport(data: ReportData): void {
  // Header row
  const header = 'Date,Platform,Positive,Neutral,Negative,Overall Score\n';
  
  // Data rows
  const rows = data.reports.map(report => {
    return [
      report.date,
      `"${report.platform || 'All'}"`,
      report.positive || 0,
      report.neutral || 0,
      report.negative || 0,
      report.overallScore
    ].join(',');
  }).join('\n');
  
  // Combine header and rows
  const csvContent = header + rows;
  
  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Generate a JSON report
 */
function generateJSONReport(data: ReportData): void {
  // Create Blob and download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`);
}