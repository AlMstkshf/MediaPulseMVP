"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

/**
 * Pagination navigation wrapper
 */
export const Pagination: React.FC<React.ComponentProps<"nav">> = ({
  className,
  ...props
}) => (
  <nav
    role="navigation"
    aria-label="Pagination"
    className={cn("mx-auto flex justify-center w-full", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

/**
 * Container for pagination items (list)
 */
export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

/**
 * Single pagination list item
 */
export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

/**
 * Link component for pagination (page numbers, prev/next)
 */
export interface PaginationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether this page is the current (active) page */
  isActive?: boolean;
  /** Button size variant */
  size?: ButtonProps["size"];
}
export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(({ isActive, size = "icon", className, ...props }, ref) => (
  <a
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
      className
    )}
    {...props}
  />
));
PaginationLink.displayName = "PaginationLink";

/**
 * Previous page button
 */
export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={cn("flex items-center gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    <span>Previous</span>
  </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

/**
 * Next page button
 */
export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={cn("flex items-center gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";

/**
 * Ellipsis separator for skipped pages
 */
export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn("flex items-center justify-center h-9 w-9", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";
