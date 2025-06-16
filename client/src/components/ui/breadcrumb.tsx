import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Slot } from '@radix-ui/react-slot';

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** Custom separator between items */
  separator?: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Marks this item as the current page */
  isCurrentPage?: boolean;
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render as child using Radix Slot */
  asChild?: boolean;
  /** Destination URL */
  href?: string;
}

/**
 * Container for breadcrumb items with optional custom separator.
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, children, ...props }, ref) => {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const Icon = isRtl ? ChevronLeft : ChevronRight;
    const defaultSep = <Icon aria-hidden className="h-4 w-4" />;

    const items = React.Children.toArray(children) as React.ReactElement<BreadcrumbItemProps>[];
    const list: React.ReactNode[] = [];

    items.forEach((child, idx) => {
      list.push(child);
      if (idx < items.length - 1) {
        list.push(
          <li
            key={`sep-${idx}`}
            className="inline-flex items-center mx-2 text-muted-foreground"
            aria-hidden="true"
          >
            {separator ?? defaultSep}
          </li>
        );
      }
    });

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn('flex', className)}
        {...props}
      >
        <ol className="flex items-center flex-wrap">{list}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

/**
 * Individual breadcrumb item.
 */
export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(({ className, isCurrentPage, children, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center', className)}
    aria-current={isCurrentPage ? 'page' : undefined}
    {...props}
  >
    {children}
  </li>
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

/**
 * Link within a breadcrumb item. Supports `asChild` to render via Slot.
 */
export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ className, asChild = false, href, children, ...props }, ref) => {
  const Component = asChild ? Slot : href ? 'a' : 'span';
  const classes = cn(
    'inline-flex items-center text-sm font-medium underline-offset-4 hover:underline',
    !props['aria-current'] && 'text-muted-foreground hover:text-foreground',
    !href && 'cursor-default pointer-events-none',
    className
  );

  const element = (
    <Component ref={ref} className={classes} {...(href && !asChild ? { href } : {})} {...props}>
      {children}
    </Component>
  );

  return href && !asChild ? <Link to={href}>{element}</Link> : element;
});
BreadcrumbLink.displayName = 'BreadcrumbLink';
