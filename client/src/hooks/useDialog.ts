import { useState, useCallback, useEffect } from "react";

/**
 * Interface for the return value of useDialog hook
 */
export interface UseDialogReturn {
  /**
   * Current open state of the dialog
   */
  open: boolean;

  /**
   * Function to set the open state
   */
  setOpen: (open: boolean) => void;

  /**
   * Function to toggle the open state
   */
  toggle: () => void;

  /**
   * Function to handle open change event from Dialog component
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Reset state when dialog closes
   * This is called automatically when dialog closes unless autoReset is false
   */
  resetState: () => void;
}

/**
 * Options for the useDialog hook
 */
export interface UseDialogOptions {
  /**
   * Initial open state
   */
  initialOpen?: boolean;
  
  /**
   * Function to reset any state when dialog closes
   */
  onReset?: () => void;
  
  /**
   * Whether to automatically call onReset when dialog closes
   */
  autoReset?: boolean;
}

/**
 * Hook for managing dialog open state with form reset capabilities
 *
 * @param options Configuration options
 * @returns Object with open state and methods to control it
 */
export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const {
    initialOpen = false,
    onReset = () => {},
    autoReset = true,
  } = options;
  
  const [open, setOpen] = useState<boolean>(initialOpen);

  const resetState = useCallback(() => {
    if (typeof onReset === 'function') {
      onReset();
    }
  }, [onReset]);

  const toggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const onOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    
    // If dialog is closing and autoReset is enabled, reset state
    if (!newOpen && autoReset) {
      resetState();
    }
  }, [autoReset, resetState]);
  
  // Reset state when component unmounts if dialog is open
  useEffect(() => {
    return () => {
      if (open && autoReset) {
        resetState();
      }
    };
  }, [open, autoReset, resetState]);

  return {
    open,
    setOpen,
    toggle,
    onOpenChange,
    resetState,
  };
}

export default useDialog;
