import { useState, useCallback, useEffect } from 'react';

export interface UseDialogOptions {
  /**
   * Initial open state of the dialog
   */
  initialOpen?: boolean;
  
  /**
   * Callback to run when the dialog should reset its state
   */
  onReset?: () => void;
  
  /**
   * Whether to automatically reset when closing the dialog
   */
  autoReset?: boolean;
  
  /**
   * Callback to run when the dialog opens
   */
  onOpen?: () => void;
  
  /**
   * Callback to run when the dialog closes
   */
  onClose?: () => void;
}

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
   * Function to manually reset the dialog's state
   */
  reset: () => void;
}

/**
 * Hook to manage dialog state and form resetting
 */
export function useDialog({
  initialOpen = false,
  onReset,
  autoReset = false,
  onOpen,
  onClose,
}: UseDialogOptions = {}): UseDialogReturn {
  const [open, setOpenState] = useState<boolean>(initialOpen);
  const [hasOpened, setHasOpened] = useState<boolean>(initialOpen);
  
  // Track the previous open state to detect changes
  const [prevOpen, setPrevOpen] = useState<boolean>(initialOpen);
  
  // Function to reset the dialog's state
  const reset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Function to set the open state with side effects
  const setOpen = useCallback((newOpenState: boolean) => {
    setOpenState(newOpenState);
    
    if (newOpenState && !open) {
      // Dialog is opening
      setHasOpened(true);
      if (onOpen) {
        onOpen();
      }
    } else if (!newOpenState && open) {
      // Dialog is closing
      if (onClose) {
        onClose();
      }
      
      // Auto-reset if enabled
      if (autoReset) {
        reset();
      }
    }
  }, [open, onOpen, onClose, autoReset, reset]);
  
  // Function to toggle the open state
  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);
  
  // Effect to track changes in the open state
  useEffect(() => {
    if (prevOpen !== open) {
      setPrevOpen(open);
    }
  }, [open, prevOpen]);
  
  // Reset when first opened
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
    }
  }, [open, hasOpened]);
  
  return {
    open,
    setOpen,
    toggle,
    reset,
  };
}