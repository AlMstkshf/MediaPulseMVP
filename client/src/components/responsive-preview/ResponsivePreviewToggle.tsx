import { Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useResponsivePreview } from './ResponsivePreviewProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResponsivePreviewToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  iconOnly?: boolean;
}

export function ResponsivePreviewToggle({
  className,
  variant = 'outline',
  iconOnly = false,
}: ResponsivePreviewToggleProps) {
  const { t } = useTranslation();
  const { isEnabled, togglePreview } = useResponsivePreview();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={iconOnly ? 'icon' : 'default'}
            onClick={togglePreview}
            className={className}
            aria-label={t('preview.toggleResponsivePreview')}
          >
            <Smartphone className={iconOnly ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
            {!iconOnly && t('preview.responsivePreview')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('preview.toggleResponsivePreview')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}