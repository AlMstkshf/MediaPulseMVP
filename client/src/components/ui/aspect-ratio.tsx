import React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';
import { cn } from '@/lib/utils';

export interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  /** Aspect ratio value, e.g. "16/9" or 1 for 1:1 */
  ratio?: number;
  /** Additional classes to apply to the container */
  className?: string;
}

/**
 * AspectRatio component ensures its children maintain a given aspect ratio.
 * Uses Radix UI under the hood.
 */
export const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ ratio = 1, className, style, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    className={cn('overflow-hidden', className)}
    ratio={ratio}
    style={style}
    {...props}
  />
));
AspectRatio.displayName = 'AspectRatio';
