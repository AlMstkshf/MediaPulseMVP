import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes for the card container */
  className?: string;
}

/**
 * Container for a card UI.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Additional classes for the header */
  className?: string;
}

/**
 * Header section of the card, typically contains title and description.
 */
export const CardHeader = React.forwardRef<HTMLElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </header>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Additional classes for the title */
  className?: string;
}

/**
 * Title element for the card. Renders as an <h3> for semantic structure.
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  CardTitleProps
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional classes for the description */
  className?: string;
}

/**
 * Description text for the card, renders as a paragraph.
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Additional classes for the content */
  className?: string;
}

/**
 * Main content area of the card.
 */
export const CardContent = React.forwardRef<HTMLElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </section>
  )
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Additional classes for the footer */
  className?: string;
}

/**
 * Footer section of the card, typically contains actions.
 */
export const CardFooter = React.forwardRef<HTMLElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </footer>
  )
);
CardFooter.displayName = 'CardFooter';
