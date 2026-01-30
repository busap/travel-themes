'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useRef } from 'react';
import { PolaroidCard } from '@/ui/components/polaroid-card/polaroid-card';
import { PolaroidCardVariant } from '@/enums/polaroid-card-variant';
import { ScrollHint } from '@/ui/components/scroll-hint/scroll-hint';
import { getPolaroidTransform } from "@/utils/polaroid-layout";
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import { useScrollBasedReveal } from '@/hooks/use-scroll-based-reveal';

interface CollageThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function CollageTheme({ trip, config }: CollageThemeProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHorizontalScroll = config.layout.scrollDirection === 'horizontal';
  const animationEnabled = config.animation.enabled;
  const revealPattern = config.photos.revealPattern;
  const isScrollBasedReveal = animationEnabled && revealPattern === 'scroll-based';
  const photosToShow = config.photos?.count
    ? trip.photos.slice(0, config.photos.count)
    : trip.photos;

  useHorizontalScroll(scrollContainerRef, isHorizontalScroll);

  const visiblePhotos = useScrollBasedReveal({
    containerRef: scrollContainerRef,
    enabled: isScrollBasedReveal ?? false,
    totalItems: trip.photos.length,
    itemCount: config.photos?.count,
  });

  const renderHeader = () => (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm pointer-events-none">
      <h1 className={`text-lg sm:text-xl ${config.styling?.typography?.titleClasses || 'md:text-2xl font-bold'}`}>
        {trip.name}
      </h1>
      <p className={config.styling?.typography?.bodyClasses || 'text-xs sm:text-sm text-zinc-600'}>
        {trip.countries.join(', ')} {trip.year && `• ${trip.year}`}
      </p>
    </div>
  );

  const renderPolaroidCards = () => {
    return (
      <div className={`h-full flex items-center px-4 sm:px-8 md:px-16 lg:px-32 ${config.layout.spacing} min-w-max`}>
        {photosToShow.map((photo, index) => {
          const { rotation, offset } = getPolaroidTransform(index);
          const isVisible = visiblePhotos.has(index);

          const cardClasses = isScrollBasedReveal
            ? `transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`
            : '';

          return (
            <div
              key={index}
              data-photo-index={index}
              className={cardClasses}
            >
              <PolaroidCard
                variant={PolaroidCardVariant.Photo}
                imageSrc={photo.src}
                imageAlt={photo.title || `Photo ${index + 1}`}
                caption={photo.title}
                rotation={rotation}
                verticalOffset={offset.y}
                aspectRatio="portrait"
              />
            </div>
          );
        })}
      </div>
    );
  };

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
