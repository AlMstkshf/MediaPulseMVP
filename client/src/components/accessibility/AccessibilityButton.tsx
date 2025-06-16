import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accessibility } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AccessibilityPanel from './AccessibilityPanel';

export const AccessibilityButton = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="rounded-full w-9 h-9 interactive-element"
              aria-label={t('accessibility.settings', 'Accessibility Settings')}
            >
              <Accessibility className="h-5 w-5" />
              <span className="sr-only">{t('accessibility.settings', 'Accessibility Settings')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('accessibility.settings', 'Accessibility Settings')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <AccessibilityPanel open={open} onOpenChange={setOpen} />
    </>
  );
};

export default AccessibilityButton;