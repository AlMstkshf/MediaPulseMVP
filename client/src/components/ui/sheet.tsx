"use client";

import React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sheet root—acts as a dialog under the hood
 */
export const Sheet = SheetPrimitive.Root;
Sheet.displayName = "Sheet";

/**
 * Trigger to open the sheet
 */
export const SheetTrigger = SheetPrimitive.Trigger;
SheetTrigger.displayName = "SheetTrigger";

/**
 * Close button for the sheet
 */
export const SheetClose = SheetPrimitive.Close;
SheetClose.displayName = "SheetClose";

/**
 * Portal for rendering sheet overlay and content
 */
export const SheetPortal = SheetPrimitive.Portal;
SheetPortal.displayName = "SheetPortal";

/**
 * Overlay behind the sheet when open
 */
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    aria-hidden
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

/**
 * Variants for sheet slide-in direction
 */
const sheetVariants = cva(
  "fixed z-50 bg-background shadow-lg p-6 transition ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left:
          "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

/**
 * Props for SheetContent, including side variant
 */
export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

/**
 * Content area of the sheet
 */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      side={side}
      className={cn(sheetVariants({ side }), className)}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className={cn(
          "absolute top-4 right-4 rounded-sm opacity-70",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "hover:opacity-100",
          className
        )}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

/**
 * Header area inside the sheet
 */
export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

/**
 * Footer area inside the sheet
 */
export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

/**
 * Title text for the sheet
 */
export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

/**
 * Description text for the sheet
 */
export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";
