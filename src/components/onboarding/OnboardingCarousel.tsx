// src/components/onboarding/OnboardingCarousel.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

interface Slide {
  src: string;
  alt: string;
  content: ReactNode;
  imageClassName?: string;
}

interface OnboardingCarouselProps {
  slides: Slide[];
  intervalMs?: number;
}

export function OnboardingCarousel({
  slides,
  intervalMs = 7000,
}: OnboardingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  return (
    <div className="flex-col w-screen h-full absolute flex">
      {/* Text content — grid-stacked so container height never changes */}
      <div className="relative grid px-padding text-center">
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}
            className={cn(
              'col-start-1 row-start-1 transition-all duration-700 ease-in-out',
              index === activeIndex
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            )}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Image track */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className={cn('object-cover', slide.imageClassName)}
              priority={index === 0}
            />
          </div>
        ))}

        {/* Edge blends — fade to background so blob glow shows through seamlessly */}
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b  to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent" />
        <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r to-transparent" />
        <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Dot indicator */}
      <div className="relative bottom-6 mt-2 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              'h-[5.44px] rounded-full transition-all duration-300',
              index === activeIndex
                ? 'w-[21.77px] bg-brand'
                : 'w-[5.44px] bg-brand-lighter'
            )}
          />
        ))}
      </div>
    </div>
  );
}
