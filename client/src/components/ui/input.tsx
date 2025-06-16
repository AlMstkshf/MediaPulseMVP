"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Text input component with unified styling and accessibility support.
 * Supports file inputs via `file:*` utilities.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input"> & { type?: string }
>(({ className, type = "text", ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
      "text-base md:text-sm placeholder:text-muted-foreground",
      "ring-offset-background focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
