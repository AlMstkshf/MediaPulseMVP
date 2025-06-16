"use client";

import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * Popover root component
 */
export const Popover = PopoverPrimitive.Root;
Popover.displayName = "Popover";

/**
 * Popover trigger (button or element to open the popover)
 */
export const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ children, className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn("inline-flex items-center", className)}
    {...props}
    aria-haspopup="dialog"
  >
    {children}
  </PopoverPrimitive.Trigger>
));
PopoverTrigger.displayName = "PopoverTrigger";

/**
 * Popover content (the panel shown when open)
 */
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /** Alignment of the popover relative to trigger */
    align?: React.ComponentProps<typeof PopoverPrimitive.Content>["align"];
    /** Offset in pixels from the trigger */
    sideOffset?: number;
  }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground",
        "shadow-md outline-none",
        "data-[state=open]:animate-in",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-popover-content-transform-origin]",
        className
      )}
      role="dialog"
      tabIndex={-1}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
