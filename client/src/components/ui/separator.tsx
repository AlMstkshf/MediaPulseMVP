"use client";

import React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * Orientation of the separator.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * If true, the separator is decorative (hidden from assistive tech). Otherwise, it has role="separator".
   */
  decorative?: boolean;
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * A separator (divider) component that can be horizontal or vertical.
 * Uses Radix UI Separator under the hood and supports accessibility attributes.
 */
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      orientation = "horizontal",
      decorative = true,
      className,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      role={decorative ? undefined : "separator"}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";
