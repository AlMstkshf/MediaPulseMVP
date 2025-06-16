"use client";

import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /**
   * Progress value between 0 and 100
   */
  value?: number;
  /**
   * Custom color for the progress indicator (CSS color value)
   */
  indicatorColor?: string;
}

/**
 * A progress bar component.
 *
 * Uses Radix UI Progress under the hood, with enhanced accessibility.
 */
export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorColor, ...props }, ref) => {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full transition-all"
        style={{ 
          transform: `translateX(-${100 - safeValue}%)`,
          backgroundColor: indicatorColor || 'var(--primary)'
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = "Progress";
