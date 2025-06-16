import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonText?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  showBackButton = false,
  onBack,
  backButtonText = 'Back',
}) => {
  return (
    <div className={cn('flex flex-col space-y-2 mb-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-2"
            >
              ← {backButtonText}
            </Button>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;