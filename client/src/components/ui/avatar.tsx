"use client"

import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  /** Source URL for the avatar image */
  src?: string;
  /** Alternate text for the avatar image */
  alt?: string;
  /** Fallback content when image fails to load */
  fallbackText?: string;
  /** Size of the avatar in pixels */
  size?: number;
}

/**
 * Avatar root component wrapping Radix Avatar
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt = 'Avatar', fallbackText, size = 40, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative inline-flex overflow-hidden rounded-full bg-gray-100',
      className
    )}
    style={{ width: size, height: size }}
    {...props}
  >
    {src ? (
      <AvatarPrimitive.Image
        className="block w-full h-full object-cover"
        src={src}
        alt={alt}
        onError={(e) => {
          // Hide broken image
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : null}
    <AvatarPrimitive.Fallback
      className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 font-medium"
      delayMs={600}
    >
      {fallbackText || alt.charAt(0)}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
));

Avatar.displayName = 'Avatar';

/**
 * Avatar image component
 */
export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));

AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Avatar fallback component for when the image fails to load
 */
export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
