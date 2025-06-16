"use client";

import React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

/**
 * HoverCard root, wrap trigger and content
 */
export const HoverCard = HoverCardPrimitive.Root;
HoverCard.displayName = "HoverCard";

/**
 * Trigger element for HoverCard, supports custom child
 */
export const HoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <HoverCardPrimitive.Trigger ref={ref} asChild {...props}>
    {children}
  </HoverCardPrimitive.Trigger>
));
HoverCardTrigger.displayName = "HoverCardTrigger";

/**
 * Content of the HoverCard, wrapped in a portal
 */
export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
    align?: React.ComponentProps<typeof HoverCardPrimitive.Content>["align"];
    sideOffset?: React.ComponentProps<typeof HoverCardPrimitive.Content>["sideOffset"];
  }
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
        "outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-hover-card-content-transform-origin]",
        className
      )}
      {...props}
    >
      {children}
      <HoverCardPrimitive.Arrow className="fill-popover-foreground" />
    </HoverCardPrimitive.Content>
  </HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = "HoverCardContent";
