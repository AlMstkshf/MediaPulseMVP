"use client";

import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * ScrollArea provides a container with custom styled scrollbars.
 * It uses Radix UI ScrollArea under the hood and ensures accessibility.
 */
export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      asChild
      className="h-full w-full rounded-[inherit]"
    >
      <div>{children}</div>
    </ScrollAreaPrimitive.Viewport>

    {/** Vertical and horizontal scrollbars */}
    <ScrollBar orientation="vertical" />
    <ScrollBar orientation="horizontal" />

    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = "ScrollArea";

export interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > {
  /**
   * Orientation of the scrollbar
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * ScrollBar renders a styled scrollbar thumb and track.
 * It supports both vertical and horizontal orientations.
 */
export const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    role="scrollbar"
    aria-orientation={orientation}
    className={cn(
      "flex transition-colors touch-none select-none",
      orientation === "vertical"
        ? "h-full w-2.5 border-l border-l-transparent p-[1px]"
        : "w-full h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className="relative flex-1 rounded-full bg-border"
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = "ScrollBar";
