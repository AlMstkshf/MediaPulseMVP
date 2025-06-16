import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Common wrapper to denote loading state for accessibility
 */
const LoadingWrapper: React.FC<React.PropsWithChildren<{ className?: string }>> = memo(({ children, className }) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={className}
  >
    {children}
  </div>
));

/**
 * Skeleton for a card UI
 */
export const CardSkeleton: React.FC<{ 
  hasHeader?: boolean;
  hasFooter?: boolean;
  rows?: number;
  className?: string;
}> = memo(({ hasHeader = true, hasFooter = false, rows = 3, className = '' }) => (
  <LoadingWrapper className={className}>
    <Card>
      {hasHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/3" aria-hidden />
          <Skeleton className="h-4 w-1/2" aria-hidden />
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" aria-hidden />
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter className="flex justify-between">
          <Skeleton className="h-9 w-20" aria-hidden />
          <Skeleton className="h-9 w-20" aria-hidden />
        </CardFooter>
      )}
    </Card>
  </LoadingWrapper>
));
CardSkeleton.displayName = 'CardSkeleton';

/**
 * Skeleton for a post or media item
 */
export const PostSkeleton: React.FC<{ className?: string }> = memo(({ className = '' }) => (
  <LoadingWrapper className={cn('flex space-x-4 p-4', className)}>
    <Skeleton className="h-12 w-12 rounded-full" aria-hidden />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-1/4" aria-hidden />
      <Skeleton className="h-4 w-3/4" aria-hidden />
      <Skeleton className="h-20 w-full rounded-md" aria-hidden />
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-6 w-16" aria-hidden />
        <Skeleton className="h-6 w-16" aria-hidden />
        <Skeleton className="h-6 w-16" aria-hidden />
      </div>
    </div>
  </LoadingWrapper>
));
PostSkeleton.displayName = 'PostSkeleton';

/**
 * Skeleton for a list of posts or media items
 */
export const PostListSkeleton: React.FC<{ count?: number; className?: string }> = memo(({ count = 3, className = '' }) => (
  <div className={cn('divide-y', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
));
PostListSkeleton.displayName = 'PostListSkeleton';

/**
 * Skeleton for a chart
 */
export const ChartSkeleton: React.FC<{ height?: number; className?: string }> = memo(({ height = 300, className = '' }) => (
  <LoadingWrapper className={className}>
    <Skeleton className="h-6 w-1/3 mb-4" aria-hidden />
    <Skeleton
      className="w-full rounded-md"
      style={{ height: `${height}px` }}
      aria-hidden
    />
  </LoadingWrapper>
));
ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Skeleton for a dashboard section
 */
export const DashboardSectionSkeleton: React.FC<{
  title?: boolean;
  columns?: number;
  rows?: number;
  className?: string;
}> = memo(({ title = true, columns = 2, rows = 2, className = '' }) => (
  <LoadingWrapper className={className}>
    {title && <Skeleton className="h-8 w-1/4 mb-6" aria-hidden />}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns * rows }).map((_, i) => (
        <CardSkeleton key={i} hasFooter={false} className="" />
      ))}
    </div>
  </LoadingWrapper>
));
DashboardSectionSkeleton.displayName = 'DashboardSectionSkeleton';

/**
 * Skeleton for a table
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = memo(({ rows = 5, columns = 4, className = '' }) => (
  <LoadingWrapper className={className}>
    <div className="rounded-md border">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" aria-hidden />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-20" aria-hidden />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </LoadingWrapper>
));
TableSkeleton.displayName = 'TableSkeleton';

/**
 * Skeleton for a form
 */
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = memo(({ fields = 4, className = '' }) => (
  <LoadingWrapper className={className}>
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" aria-hidden />
          <Skeleton className="h-10 w-full" aria-hidden />
        </div>
      ))}
      <Skeleton className="h-10 w-24 mt-8" aria-hidden />
    </div>
  </LoadingWrapper>
));
FormSkeleton.displayName = 'FormSkeleton';
