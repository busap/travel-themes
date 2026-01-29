'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useEffect, useRef } from 'react';
import { PolaroidCard } from '@/ui/components/polaroid-card/polaroid-card';
import { PolaroidCardVariant } from '@/enums/polaroid-card-variant';
import { ScrollHint } from '@/ui/components/scroll-hint/scroll-hint';
import { getPolaroidTransform } from "@/utils/polaroid-layout";

interface CollageThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function CollageTheme({ trip, config }: CollageThemeProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollLeft = 0;

      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const renderHeader = () => (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
        {trip.name}
      </h1>
      <p className="text-xs sm:text-sm text-zinc-600">
        {trip.countries.join(', ')} {trip.year && `• ${trip.year}`}
      </p>
    </div>
  );

  const renderPolaroidCards = () => (
    <div className="h-full flex items-center px-4 sm:px-8 md:px-16 lg:px-32 gap-4 sm:gap-8 md:gap-12 lg:gap-16 min-w-max">
      {trip.photos.map((photo, index) => {
        const { rotation, offset } = getPolaroidTransform(index);

        return (
          <PolaroidCard
            key={index}
            variant={PolaroidCardVariant.Photo}
            imageSrc={photo.src}
            imageAlt={photo.title || `Photo ${index + 1}`}
            caption={photo.title}
            rotation={rotation}
            verticalOffset={offset.y}
            aspectRatio="portrait"
          />
        );
      })}
    </div>
  );

  const renderScrollContainer = () => (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {renderPolaroidCards()}
    </div>
  );

  const renderScrollHint = () => <ScrollHint />;

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200">
      {renderHeader()}
      {renderScrollContainer()}
      {renderScrollHint()}
    </div>
  );
}
