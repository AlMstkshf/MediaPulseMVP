"use client";

import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Root wrapper for NavigationMenu (horizontal menu with dropdowns)
 */
export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    role="menubar"
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = "NavigationMenu";

/**
 * List container for menu triggers
 */
export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    role="menubar"
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

/**
 * Single menu item wrapper
 */
export const NavigationMenuItem = NavigationMenuPrimitive.Item;
NavigationMenuItem.displayName = "NavigationMenuItem";

/**
 * Styling for the trigger button
 */
export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium",
  {
    variants: {},
  }
);

/**
 * Trigger to open a submenu
 */
export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      navigationMenuTriggerStyle(),
      "transition-colors hover:bg-accent hover:text-accent-foreground",
      "focus:outline-none focus:bg-accent focus:text-accent-foreground",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    role="menuitem"
    {...props}
  >
    {children}
    <ChevronDown
      className={cn(
        "ml-1 h-3 w-3 transition-transform duration-200",
        "group-data-[state=open]:rotate-180"
      )}
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

/**
 * Dropdown content panel
 */
export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> & {
    align?: React.ComponentProps<typeof NavigationMenuPrimitive.Content>["align"];
  }
>(({ className, align = "start", ...props }, ref) => (
  <NavigationMenuPrimitive.Portal>
    <NavigationMenuPrimitive.Content
      ref={ref}
      align={align}
      className={cn(
        "md:absolute md:top-full md:left-0 md:w-auto w-full",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        className
      )}
      role="menu"
      {...props}
    />
  </NavigationMenuPrimitive.Portal>
));
NavigationMenuContent.displayName = "NavigationMenuContent";

/**
 * Link inside menu (acts as <a>)
 */
export const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ ...props }, ref) => (
  <NavigationMenuPrimitive.Link ref={ref} role="menuitem" {...props} />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

/**
 * Viewport that renders menu panels
 */
export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute left-0 top-full flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        "origin-top-center relative mt-1.5 w-full md:w-[var(--radix-navigation-menu-viewport-width)]",
        "h-[var(--radix-navigation-menu-viewport-height)] overflow-hidden rounded-md border",
        "bg-popover text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      role="menu"
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = "NavigationMenuViewport";

/**
 * Indicator arrow under trigger
 */
export const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full flex h-1.5 items-end justify-center overflow-hidden",
      "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";
