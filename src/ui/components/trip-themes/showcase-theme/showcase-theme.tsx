'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './showcase-theme.module.scss';

interface ShowcaseThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function ShowcaseTheme({ trip, config }: ShowcaseThemeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayPhotos = trip.photos;

  const animationEnabled = config.animation?.enabled ?? true;

  const effectiveIndex =
    displayPhotos.length > 0 ? Math.min(activeIndex, displayPhotos.length - 1) : 0;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, displayPhotos.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);

    const thumbs = scrollRef.current?.children;
    if (thumbs?.[index]) {
      (thumbs[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, []);

  const scrollThumbs = useCallback((direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  }, []);

  const renderChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12L6 8L10 4" />
    </svg>
  );

  const renderChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4L10 8L6 12" />
    </svg>
  );

  const renderActivePhoto = () => {
    if (displayPhotos.length === 0) return null;

    return (
      <div className={styles.activeArea}>
        <div className={styles.photoContainer}>
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.src}
              className={`${styles.activePhoto} ${
                index === effectiveIndex ? styles.activePhotoVisible : styles.activePhotoHidden
              }`}
              style={!animationEnabled ? { transition: 'none' } : undefined}
            >
              <Image
                src={photo.src}
                alt={photo.title || `Photo ${index + 1}`}
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className={styles.gradientOverlay} />

        <div className={styles.tripInfo}>
          <h1 className={styles.tripTitle}>{trip.name}</h1>
          <p className={styles.tripMeta}>
            {trip.countries.join(', ')} {trip.year && `· ${trip.year}`}
          </p>
        </div>

        <div className={styles.photoCounter}>
          {effectiveIndex + 1} / {displayPhotos.length}
        </div>
      </div>
    );
  };

  const renderThumbnailStrip = () => {
    if (displayPhotos.length <= 1) return null;

    return (
      <div className={styles.thumbnailStrip}>
        <button
          className={`${styles.arrow} ${styles.arrowLeft} ${!canScrollLeft ? styles.arrowHidden : ''}`}
          onClick={() => scrollThumbs(-1)}
          aria-label="Scroll thumbnails left"
        >
          {renderChevronLeft()}
        </button>

        <div ref={scrollRef} className={styles.thumbnailScroll}>
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.src}
              className={`${styles.thumbnail} ${index === effectiveIndex ? styles.thumbnailActive : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={photo.src}
                alt={photo.title || `Thumbnail ${index + 1}`}
                width={110}
                height={78}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>

        <button
          className={`${styles.arrow} ${styles.arrowRight} ${!canScrollRight ? styles.arrowHidden : ''}`}
          onClick={() => scrollThumbs(1)}
          aria-label="Scroll thumbnails right"
        >
          {renderChevronRight()}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.theme}>
      {renderActivePhoto()}
      {renderThumbnailStrip()}
    </div>
  );
}
