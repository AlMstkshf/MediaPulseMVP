import { queryClient } from '@/lib/queryClient';
import { saveAs } from 'file-saver';

export interface SubIndicator {
  id?: string;  // Optional ID for the indicator
  name: string;
  value: number | string;
  unit: string;
  target?: number | string;
  status?: 'success' | 'warning' | 'error';
}

export interface KpiData {
  id?: string;  // Optional ID for the KPI
  category: string;
  current: number;
  target: number;
  status?: 'success' | 'warning' | 'error';  // Optional status for the KPI
  metrics: SubIndicator[];
}

export interface KpiFilter {
  dateFrom?: Date;
  dateTo?: Date;
  axis?: string;
}

/**
 * Fetch KPI data with optional filters
 */
export const fetchKpis = async (filters?: KpiFilter): Promise<KpiData[]> => {
  let url = '/api/performance/kpi-breakdown';
  const params = new URLSearchParams();

  if (filters?.dateFrom) {
    params.append('dateFrom', filters.dateFrom.toISOString());
  }
  
  if (filters?.dateTo) {
    params.append('dateTo', filters.dateTo.toISOString());
  }
  
  if (filters?.axis && filters.axis !== 'all') {
    params.append('axis', filters.axis);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch KPI data');
  }
  
  const data: KpiData[] = await response.json();
  
  // Add status for each metric based on comparison with target
  return data.map(kpi => ({
    ...kpi,
    metrics: kpi.metrics.map(metric => {
      let status: 'success' | 'warning' | 'error' = 'warning';
      
      if (typeof metric.value === 'number' && metric.target !== undefined) {
        const targetValue = typeof metric.target === 'string' ? 
          parseFloat(metric.target) : metric.target;
          
        // Set status based on percentage of target
        const percentage = metric.value / targetValue;
        if (percentage >= 0.9) status = 'success';
        else if (percentage >= 0.7) status = 'warning';
        else status = 'error';
      }
      
      return {
        ...metric,
        status
      };
    })
  }));
};

/**
 * Compute sub-indicators based on main KPI data
 */
export const computeSubIndicators = (kpiData: KpiData[]): KpiData[] => {
  return kpiData;
};

/**
 * Filter KPIs by strategic axis
 */
export const filterKpisByAxis = (kpiData: KpiData[], axis: string): KpiData[] => {
  if (!axis || axis === 'all') return kpiData;
  
  // Map axis names to potential category identifiers with updated GEM2.1 axes
  const axisMap: Record<string, string[]> = {
    'communication': ['government communication', 'communication', 'الوعي بالعلامة التجارية', 'brand', 'awareness', 'تواصل', 'media', 'التواصل الحكومي'],
    'innovation': ['innovation', 'الابتكار', 'innovate', 'الإبتكار'],
    'smart': ['smart transformation', 'smart empowerment', 'smart', 'ذكي', 'digital', 'transformation', 'الأداء الرقمي', 'التمكين الذكي'],
    'data': ['data & knowledge', 'data management', 'بيانات', 'analytics', 'المعرفة', 'إدارة البيانات']
  };
  
  // Get the keywords for the selected axis
  const keywords = axisMap[axis] || [];
  
  // Filter KPIs whose category contains any of the keywords
  return kpiData.filter(kpi => 
    keywords.some(keyword => 
      kpi.category.toLowerCase().includes(keyword.toLowerCase())
    )
  );
};

/**
 * Export KPI data to CSV
 */
export const exportToCsv = (kpiData: KpiData[]): string => {
  if (!kpiData || kpiData.length === 0) return '';
  
  // Create headers
  const headers = ['Category', 'Current Value', 'Target Value', 'Metric Name', 'Metric Value', 'Metric Unit', 'Status'];
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  kpiData.forEach(kpi => {
    kpi.metrics.forEach((metric, index) => {
      const row = [
        index === 0 ? kpi.category : '', // Show category only in first row of each KPI
        index === 0 ? kpi.current : '',
        index === 0 ? kpi.target : '',
        metric.name,
        metric.value,
        metric.unit || '',
        metric.status || ''
      ];
      
      csv += row.map(value => {
        // Handle values with commas by enclosing in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',') + '\n';
    });
  });
  
  return csv;
};

/**
 * Generate PDF content for KPI data
 * Note: This returns a placeholder function - actual PDF generation would be implemented separately
 */
export const exportToPdf = (kpiData: KpiData[], elementId: string): void => {
  // In a real implementation, this would use jsPDF or another library to generate a PDF
  console.log(`Printing element ${elementId} with KPI data`);
  
  // Simplified version: Just trigger the print dialog for the specified element
  const element = document.getElementById(elementId);
  if (element) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>KPI Report</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
      `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>KPI Report</h1>');
      printWindow.document.write(element.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }
};

/**
 * Reset the KPI data cache
 */
export const resetKpiCache = (): void => {
  queryClient.invalidateQueries({ queryKey: ['/api/performance/kpi-breakdown'] });
};

/**
 * Export all KPIs to a comprehensive report
 * @param kpiData All KPI data arrays grouped by strategic axis
 * @param format Export format ('csv', 'pdf', 'excel')
 * @param title Report title
 */
export const exportFullReport = (
  kpiData: { 
    communication: KpiData[], 
    innovation: KpiData[], 
    smart: KpiData[], 
    data: KpiData[] 
  }, 
  format: 'csv' | 'pdf' | 'excel',
  title: string = 'Institutional Excellence Indicators Report'
): void => {
  // Combine all KPIs into a single array for export
  const allKpis = [
    ...kpiData.communication,
    ...kpiData.innovation,
    ...kpiData.smart,
    ...kpiData.data
  ];

  if (allKpis.length === 0) {
    console.warn('No KPI data available for export');
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `excellence_indicators_report_${timestamp}`;

  switch (format) {
    case 'csv':
      const csv = exportToCsv(allKpis);
      const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(csvBlob, `${filename}.csv`);
      break;
      
    case 'pdf':
      // Create a temporary div to render the full report
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-report-container';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      
      // Render report headers
      tempDiv.innerHTML = `
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <hr />
      `;
      
      // Add each strategic axis section
      const sections = [
        { title: 'Government Communication', data: kpiData.communication },
        { title: 'Innovation', data: kpiData.innovation },
        { title: 'Smart Transformation', data: kpiData.smart },
        { title: 'Data & Knowledge Management', data: kpiData.data }
      ];
      
      sections.forEach(section => {
        if (section.data.length > 0) {
          const sectionDiv = document.createElement('div');
          sectionDiv.innerHTML = `<h2>${section.title}</h2>`;
          
          section.data.forEach(kpi => {
            const kpiDiv = document.createElement('div');
            kpiDiv.innerHTML = `
              <h3>${kpi.category}</h3>
              <p>Current: ${kpi.current}% | Target: ${kpi.target}%</p>
              <table>
                <thead>
                  <tr>
                    <th>Metric Name</th>
                    <th>Value</th>
                    <th>Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${kpi.metrics.map(metric => `
                    <tr>
                      <td>${metric.name}</td>
                      <td>${metric.value}${metric.unit ? ' ' + metric.unit : ''}</td>
                      <td>${metric.target || '-'}</td>
                      <td class="${metric.status || ''}">${metric.status || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
            sectionDiv.appendChild(kpiDiv);
          });
          
          tempDiv.appendChild(sectionDiv);
        }
      });
      
      // Generate and download PDF
      exportToPdf(allKpis, 'temp-report-container');
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempDiv);
      }, 1000);
      break;
      
    case 'excel':
      // In a real implementation, this would use a library like xlsx or exceljs
      console.log('Excel export not fully implemented');
      
      // For demo purposes, just export as CSV
      const excelCsv = exportToCsv(allKpis);
      const excelBlob = new Blob([excelCsv], { type: 'application/vnd.ms-excel' });
      saveAs(excelBlob, `${filename}.xls`);
      break;
  }
};

export default {
  fetchKpis,
  computeSubIndicators,
  filterKpisByAxis,
  exportToCsv,
  exportToPdf,
  resetKpiCache,
  exportFullReport
};