import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Variants for the Alert component styling
 */
const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive:
          'bg-destructive/10 text-destructive border-destructive dark:bg-destructive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

/**
 * Alert component to display important messages.
 * Uses role="alert" for accessibility.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
Alert.displayName = 'Alert';

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * Title for the Alert component.
 * Renders as an <h5> for semantic structure.
 */
export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  AlertTitleProps
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Description text for the Alert component.
 */
export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';
