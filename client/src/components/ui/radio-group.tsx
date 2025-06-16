"use client";

import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** RadioGroup value */
  value?: string;
  /** Callback on value change */
  onValueChange?: (value: string) => void;
}

/**
 * RadioGroup wrapper with Radix UI and accessible markup
 */
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    {...props}
    ref={ref}
    className={cn("grid gap-2", className)}
    role="radiogroup"
  />
));
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Value of this radio item */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Individual radio button styled with Radix UI
 */
export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    {...props}
    ref={ref}
    className={cn(
      "relative flex h-4 w-4 items-center justify-center",
      "rounded-full border border-primary",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    role="radio"
  >
    <RadioGroupPrimitive.Indicator asChild>
      <Circle
        className="h-2.5 w-2.5 fill-current text-primary"
        aria-hidden="true"
      />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";
