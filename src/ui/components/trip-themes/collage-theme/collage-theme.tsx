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
import styles from './collage-theme.module.scss';

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
  const photosWithSrc = trip.photos.filter(photo => photo.src?.trim());
  const photosToShow = config.photos?.count
    ? photosWithSrc.slice(0, config.photos.count)
    : photosWithSrc;

  useHorizontalScroll(scrollContainerRef, isHorizontalScroll);

  const visiblePhotos = useScrollBasedReveal({
    containerRef: scrollContainerRef,
    enabled: isScrollBasedReveal ?? false,
    totalItems: photosToShow.length,
    itemCount: photosToShow.length,
  });

  const titleClass = config.styling?.typography?.titleClasses
    ? `${styles.title} ${config.styling.typography.titleClasses}`
    : styles.title;

  const subtitleClass = config.styling?.typography?.bodyClasses || styles.subtitle;

  const cardsContainerClass = `${styles.cardsContainer} ${config.layout.spacing}`.trim();

  const getCardWrapperClass = (isVisible: boolean) => {
    if (!isScrollBasedReveal) return '';
    return isVisible
      ? `${styles.cardWrapper} ${styles.cardWrapperVisible}`
      : `${styles.cardWrapper} ${styles.cardWrapperHidden}`;
  };

  const renderHeader = () => (
    <div className={styles.header}>
      <h1 className={titleClass}>
        {trip.name}
      </h1>
      <p className={subtitleClass}>
        {trip.countries.join(', ')} {trip.year && `• ${trip.year}`}
      </p>
    </div>
  );

  const renderPolaroidCards = () => {
    return (
      <div className={cardsContainerClass}>
        {photosToShow.map((photo, index) => {
          const { rotation, offset } = getPolaroidTransform(index);
          const isVisible = visiblePhotos.has(index);

          return (
            <div
              key={index}
              data-photo-index={index}
              className={getCardWrapperClass(isVisible)}
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
      className={styles.scrollContainer}
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
    <div className={styles.theme}>
      {renderHeader()}
      {renderScrollContainer()}
      {renderScrollHint()}
    </div>
  );
}
