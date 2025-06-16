"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

/**
 * Props for ResizablePanelGroup
 */
export interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Container for resizable panels. Supports horizontal or vertical layout.
 */
export const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn(
      "flex h-full w-full",
      // Switch to column layout for vertical direction
      props.direction === "vertical"
        ? "flex-col"
        : "flex-row",
      className
    )}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

/**
 * Single resizable panel
 */
export const ResizablePanel = ResizablePrimitive.Panel;
ResizablePanel.displayName = "ResizablePanel";

/**
 * Props for the resize handle between panels
 */
export interface ResizableHandleProps
  extends React.ComponentProps<
    typeof ResizablePrimitive.PanelResizeHandle
  > {
  /**
   * Whether to render the visual grip icon
   */
  withHandle?: boolean;
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Resize handle for dragging panels to adjust size.
 * Uses aria attributes for accessibility.
 */
export const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  ResizableHandleProps
>(({ withHandle = false, className, ...props }, ref) => {
  const direction = props["data-panel-group-direction"] as
    | "horizontal"
    | "vertical";

  return (
    <ResizablePrimitive.PanelResizeHandle
      ref={ref}
      role="separator"
      aria-orientation={direction === "vertical" ? "horizontal" : "vertical"}
      className={cn(
        "relative flex items-center justify-center bg-border",
        // size and pseudo-element for bar
        direction === "vertical"
          ? "h-px w-full after:absolute after:inset-x-0 after:h-1"
          : "w-px h-full after:absolute after:inset-y-0 after:w-1",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex items-center justify-center rounded-sm border bg-border p-1">
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
});
ResizableHandle.displayName = "ResizableHandle";
