import { saveAs } from 'file-saver';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SentimentReport } from '@shared/schema';
import { SENTIMENT_COLORS } from './constants';
import { formatDate } from './date-utils';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportableReport {
  title: string;
  date: Date;
  platform?: string;
  entityName?: string;
  positive: number;
  neutral: number;
  negative: number;
  data?: any[];
  keywords?: string[];
}

// Function to prepare sentiment report data for export
export function prepareSentimentReportData(report: SentimentReport): ExportableReport {
  return {
    title: 'Sentiment Analysis Report',
    date: report.date || new Date(),
    platform: report.platform || 'All Platforms',
    entityName: report.entityName || 'All Entities',
    positive: report.positive || 0,
    neutral: report.neutral || 0,
    negative: report.negative || 0,
    keywords: Array.isArray(report.keywords) ? report.keywords : []
  };
}

// Export PDF function
export function exportToPdf(data: ExportableReport): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(data.title, 14, 22);
  
  // Add metadata
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(data.date)}`, 14, 32);
  
  if (data.platform) {
    doc.text(`Platform: ${data.platform}`, 14, 40);
  }
  
  if (data.entityName) {
    doc.text(`Entity: ${data.entityName}`, 14, 48);
  }
  
  // Add sentiment distribution
  doc.text('Sentiment Distribution:', 14, 60);
  
  autoTable(doc, {
    startY: 65,
    head: [['Sentiment', 'Percentage']],
    body: [
      ['Positive', `${data.positive}%`],
      ['Neutral', `${data.neutral}%`],
      ['Negative', `${data.negative}%`]
    ],
    headStyles: { fillColor: [75, 75, 75] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 10 }
  });
  
  // Add keywords if available
  if (data.keywords && data.keywords.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Key Topics:', 14, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Keywords']],
      body: data.keywords.map(keyword => [keyword]),
      headStyles: { fillColor: [75, 75, 75] },
      styles: { fontSize: 10 }
    });
  }
  
  // Add footer with date
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`sentiment-report-${formatDate(data.date, 'yyyy-MM-dd')}.pdf`);
}

// Export Excel function
export function exportToExcel(data: ExportableReport): void {
  const ws = xlsxUtils.json_to_sheet([
    { 
      'Report Title': data.title,
      'Date': formatDate(data.date),
      'Platform': data.platform || 'All Platforms',
      'Entity': data.entityName || 'All Entities'
    }
  ]);
  
  // Add empty row
  xlsxUtils.sheet_add_json(ws, [{}], { origin: -1 });
  
  // Add sentiment distribution
  xlsxUtils.sheet_add_json(ws, [{ 'Sentiment Distribution': '' }], { origin: -1 });
  xlsxUtils.sheet_add_json(ws, [
    { 'Sentiment': 'Positive', 'Percentage': `${data.positive}%` },
    { 'Sentiment': 'Neutral', 'Percentage': `${data.neutral}%` },
    { 'Sentiment': 'Negative', 'Percentage': `${data.negative}%` }
  ], { origin: -1 });
  
  // Add empty row
  xlsxUtils.sheet_add_json(ws, [{}], { origin: -1 });
  
  // Add keywords if available
  if (data.keywords && data.keywords.length > 0) {
    xlsxUtils.sheet_add_json(ws, [{ 'Key Topics': '' }], { origin: -1 });
    xlsxUtils.sheet_add_json(ws, 
      data.keywords.map(keyword => ({ 'Keyword': keyword })),
      { origin: -1 }
    );
  }
  
  // Create workbook and add the worksheet
  const wb = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(wb, ws, 'Sentiment Report');
  
  // Save the Excel file
  writeFile(wb, `sentiment-report-${formatDate(data.date, 'yyyy-MM-dd')}.xlsx`);
}

// Export CSV function
export function exportToCsv(data: ExportableReport): void {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add metadata
  csvContent += `Report Title,${data.title}\r\n`;
  csvContent += `Date,${formatDate(data.date)}\r\n`;
  csvContent += `Platform,${data.platform || 'All Platforms'}\r\n`;
  csvContent += `Entity,${data.entityName || 'All Entities'}\r\n\r\n`;
  
  // Add sentiment distribution
  csvContent += "Sentiment Distribution\r\n";
  csvContent += "Sentiment,Percentage\r\n";
  csvContent += `Positive,${data.positive}%\r\n`;
  csvContent += `Neutral,${data.neutral}%\r\n`;
  csvContent += `Negative,${data.negative}%\r\n\r\n`;
  
  // Add keywords if available
  if (data.keywords && data.keywords.length > 0) {
    csvContent += "Key Topics\r\n";
    csvContent += "Keyword\r\n";
    data.keywords.forEach(keyword => {
      csvContent += `${keyword}\r\n`;
    });
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sentiment-report-${formatDate(data.date, 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Main export function
export function exportReport(data: ExportableReport, format: ExportFormat): void {
  switch (format) {
    case 'pdf':
      exportToPdf(data);
      break;
    case 'excel':
      exportToExcel(data);
      break;
    case 'csv':
      exportToCsv(data);
      break;
    default:
      console.error('Unsupported export format');
  }
}