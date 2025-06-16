"use client";

import React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';

export interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  /** Whether the collapsible is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Collapsible root component wrapping Radix CollapsiblePrimitive.Root
 */
export const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>((
  { className, open, defaultOpen, onOpenChange, children, ...props },
  ref
) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn('rounded-md border bg-background', className)}
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Root>
));
Collapsible.displayName = 'Collapsible';

export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Trigger
  > {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Trigger for toggling the Collapsible
 */
export const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-between w-full py-2 text-sm font-medium',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      className
    )}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Content
  > {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Content for the Collapsible, includes smooth height transition
 */
export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden transition-all duration-300',
      className
    )}
    {...props}
  >
    <div className="pt-2">
      {children}
    </div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = 'CollapsibleContent';
