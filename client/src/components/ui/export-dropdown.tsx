import React from 'react';
import { FileDown, FileCheck, FileText, Download, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ExportFormat } from '@/lib/export-utils';

export interface ExportDropdownProps {
  /** Callback invoked with chosen export format */
  onExport: (format: ExportFormat) => void;
  /** Button label override */
  label?: string;
  /** Disable the dropdown trigger */
  disabled?: boolean;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Dropdown menu for exporting data in various formats
 */
export function ExportDropdown({
  onExport,
  label,
  disabled = false,
  variant = 'outline',
  size = 'default',
}: ExportDropdownProps) {
  const { t } = useTranslation();
  const defaultLabel = t('common.export', 'Export');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled}>
          <Download className="h-4 w-4 mr-2" aria-hidden />
          {label ?? defaultLabel}
          <ChevronDown className="h-4 w-4 ml-1" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onExport('pdf')}>
          <FileDown className="h-4 w-4 mr-2 text-red-500" aria-hidden />
          <span>{t('export.pdf', 'PDF Document')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onExport('excel')}>
          <FileCheck className="h-4 w-4 mr-2 text-green-600" aria-hidden />
          <span>{t('export.excel', 'Excel Spreadsheet')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onExport('csv')}>
          <FileText className="h-4 w-4 mr-2 text-blue-500" aria-hidden />
          <span>{t('export.csv', 'CSV File')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

ExportDropdown.displayName = 'ExportDropdown';
