import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Types for Embla API and options
 */
export type CarouselApi = UseEmblaCarouselType[1];
export type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
export type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1] extends Array<infer U> ? U : never;

/**
 * Props for the Carousel root
 */
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin[];
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

/**
 * Context for sharing Embla carousel state and actions
 */
interface CarouselContextValue {
  carouselRef: React.RefCallback<HTMLDivElement>;
  api: CarouselApi | null;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
CarouselContext.displayName = 'CarouselContext';

/**
 * Hook to access carousel context
 */
export function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be inside <Carousel>');
  return ctx;
}

/**
 * Carousel root component. Wrap CarouselContent, CarouselItem, etc.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      opts,
      plugins = [],
      orientation = 'horizontal',
      setApi,
      className,
      children,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      { axis: orientation === 'horizontal' ? 'x' : 'y', ...opts },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    // Expose API if requested
    useEffect(() => {
      if (api && setApi) setApi(api);
    }, [api, setApi]);

    // Update scroll state
    const updateScroll = useCallback((embla: CarouselApi) => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    }, []);

    useEffect(() => {
      if (!api) return;
      updateScroll(api);
      api.on('reInit', updateScroll);
      api.on('select', updateScroll);
      return () => {
        api.off('reInit', updateScroll);
        api.off('select', updateScroll);
      };
    }, [api, updateScroll]);

    const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = useCallback(() => api?.scrollNext(), [api]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (orientation === 'horizontal') {
          if (event.key === 'ArrowLeft') { event.preventDefault(); scrollPrev(); }
          if (event.key === 'ArrowRight') { event.preventDefault(); scrollNext(); }
        } else {
          if (event.key === 'ArrowUp') { event.preventDefault(); scrollPrev(); }
          if (event.key === 'ArrowDown') { event.preventDefault(); scrollNext(); }
        }
        onKeyDown?.(event);
      },
      [orientation, scrollPrev, scrollNext, onKeyDown]
    );

    return (
      <CarouselContext.Provider
        value={{ carouselRef, api: api || null, scrollPrev, scrollNext, canScrollPrev, canScrollNext, orientation }}
      >
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={cn('relative', className)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

/**
 * Wrapper for scrollable carousel content
 */
export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

/**
 * Individual slide item
 */
export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'flex-shrink-0',
        orientation === 'horizontal' ? 'px-2' : 'py-2',
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

/**
 * Button to navigate to previous slide
 */
export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        'absolute z-10',
        orientation === 'horizontal'
          ? 'left-2 top-1/2 transform -translate-y-1/2'
          : 'top-2 left-1/2 transform -translate-x-1/2 -rotate-90',
        className
      )}
      {...props}
    >
      <ArrowLeft aria-hidden className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

/**
 * Button to navigate to next slide
 */
export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { scrollNext, canScrollNext, orientation } = useCarousel();
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        'absolute z-10',
        orientation === 'horizontal'
          ? 'right-2 top-1/2 transform -translate-y-1/2'
          : 'bottom-2 left-1/2 transform -translate-x-1/2 -rotate-90',
        className
      )}
      {...props}
    >
      <ArrowRight aria-hidden className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';
