"use client";

import React from "react";
import * as DrawerPrimitive from "vaul";
import { cn } from "@/lib/utils";

/**
 * Props for Drawer component
 */
export interface DrawerProps extends React.ComponentProps<typeof DrawerPrimitive.Root> {
  /** Scale background when drawer opens */
  shouldScaleBackground?: boolean;
}

/**
 * Root drawer container
 */
export const Drawer = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Root>,
  DrawerProps
>(({ shouldScaleBackground = true, ...props }, ref) => (
  <DrawerPrimitive.Root
    ref={ref}
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
));
Drawer.displayName = "Drawer";

/**
 * Trigger to open the drawer
 */
export const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <DrawerPrimitive.Trigger ref={ref} asChild {...props}>
    {children}
  </DrawerPrimitive.Trigger>
));
DrawerTrigger.displayName = "DrawerTrigger";

export const DrawerPortal = DrawerPrimitive.Portal;
DrawerPortal.displayName = "DrawerPortal";

/**
 * Overlay behind drawer
 */
export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

/**
 * Drawer content panel
 */
export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-lg",
        "border bg-background p-4 pb-safe-transform overflow-auto",
        "mt-24 max-h-[80vh]",
        className
      )}
      {...props}
    >
      {/* Grab handle on top */}
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

/**
 * Header section inside drawer
 */
export const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <header
    className={cn("px-4 pb-2 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

/**
 * Footer section inside drawer
 */
export const DrawerFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <footer
    className={cn("px-4 pt-2 mt-auto flex justify-end space-x-2", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

/**
 * Title text inside drawer
 */
export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

/**
 * Description text inside drawer
 */
export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

/**
 * Close button inside drawer
 */
export const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Close
    ref={ref}
    asChild
    {...props}
    className={cn(
      "absolute top-4 right-4 rounded p-1 text-muted-foreground hover:text-foreground",
      className
    )}
  />
));
DrawerClose.displayName = "DrawerClose";
