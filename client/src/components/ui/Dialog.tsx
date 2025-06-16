"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Import CSS module
import styles from "./Dialog.module.css";

/**
 * Props for Dialog component
 */
export interface DialogProps extends DialogPrimitive.DialogProps {
  /**
   * Initial open state
   */
  initialOpen?: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Children of the component
   */
  children: React.ReactNode;
}

const Dialog = (props: DialogProps) => {
  // Extract initialOpen and pass the rest of the props to DialogPrimitive.Root
  const { initialOpen, onOpenChange, ...dialogProps } = props;

  // Use initialOpen if provided
  const [open, setOpen] = React.useState(initialOpen || false);

  // Update local open state when initialOpen prop changes
  React.useEffect(() => {
    if (initialOpen !== undefined) {
      setOpen(initialOpen);
    }
  }, [initialOpen]);

  // Handle open change events
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    // Call onOpenChange callback if provided
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      {...dialogProps}
    />
  );
};

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(styles.dialogOverlay, className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Ref for the content element to restore focus when closed
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Ref to store the element that had focus before opening
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Automatically save and restore focus
  useEffect(() => {
    return () => {
      // Restore focus on unmount
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, []);

  // Handle open state change
  const handleOpenStateChange = (state: string) => {
    if (state === "open") {
      // Save currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Focus on dialog content
      if (contentRef.current) {
        contentRef.current.focus();
      }
    }
  };

  // Merge refs
  const mergedRef = (node: HTMLDivElement) => {
    contentRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={mergedRef}
        onOpenAutoFocus={(e) => {
          e.preventDefault(); // Prevent default auto focus
          // We'll handle focus manually in the useEffect
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault(); // Prevent default focus restore
          // We'll handle focus manually in the cleanup function
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape key to close the dialog
        }}
        onInteractOutside={(e) => {
          // Allow clicking outside to close the dialog
        }}
        onOpenChange={() => {}}
        onStateChange={(state) => handleOpenStateChange(state)}
        className={cn(styles.dialogContent, className)}
        role="dialog"
        aria-modal="true"
        tabIndex={-1} // Make the dialog focusable
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={styles.closeButton}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles.dialogHeader, className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles.dialogFooter, className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(styles.dialogTitle, className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(styles.dialogDescription, className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
