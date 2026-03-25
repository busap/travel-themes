'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Inter, Bebas_Neue } from 'next/font/google';
import { useMousePosition } from '@/hooks/use-mouse-position';
import { getGridCellSize } from '@/utils/mosaic-layout';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './mosaic-theme.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

interface MosaicThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function MosaicTheme({ trip, config }: MosaicThemeProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [expandedPhotoIndex, setExpandedPhotoIndex] = useState<number | null>(null);

  const animationEnabled = config.animation?.enabled ?? true;
  const spacing = config.layout?.spacing ?? 'gap-4';
  const titleClasses = config.styling?.typography?.titleClasses ?? '';
  const bodyClasses = config.styling?.typography?.bodyClasses ?? '';
  const stagger = config.animation?.timeline?.stagger ?? 0.1;
  const duration = config.animation?.timeline?.duration ?? 0.4;
  const ease = config.animation?.timeline?.ease ?? 'power2.out';
  const scrollTriggerStart = config.animation?.scrollTrigger?.start ?? 'top 85%';
  const scrollTriggerEnd = config.animation?.scrollTrigger?.end ?? 'top 60%';

  const validatedPhotos = trip.photos;
  const mousePosition = useMousePosition(gridRef);

  useEffect(() => {
    if (!animationEnabled || !gridRef.current) return;

    const gridEl = gridRef.current;
    const photoItems = gridEl.querySelectorAll('[data-photo-item]');

    const ctx = gsap.context(() => {
      photoItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            scale: 0.9,
          },
          {
            opacity: 1,
            scale: 1,
            duration,
            ease,
            scrollTrigger: {
              trigger: item,
              start: scrollTriggerStart,
              end: scrollTriggerEnd,
              toggleActions: 'play none none none',
            },
            delay: (index % 6) * stagger,
          }
        );
      });

    }, gridEl);

    return () => ctx.revert();
  }, [animationEnabled, validatedPhotos.length, duration, ease, stagger, scrollTriggerStart, scrollTriggerEnd]);

  const scrollToKeepPhotoInView = (photoRef: HTMLDivElement) => {
    const rect = photoRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const padding = 40;

    const scaledWidth = rect.width * 1.2;
    const scaledHeight = rect.height * 1.2;

    const photoCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    let scrollX = 0;
    let scrollY = 0;

    const leftEdge = photoCenter.x - scaledWidth / 2;
    const rightEdge = photoCenter.x + scaledWidth / 2;

    if (leftEdge < padding) {
      scrollX = leftEdge - padding;
    } else if (rightEdge > viewportWidth - padding) {
      scrollX = rightEdge - (viewportWidth - padding);
    } else if (scaledWidth + padding * 2 <= viewportWidth) {
      scrollX = photoCenter.x - viewportWidth / 2;
    }

    const topEdge = photoCenter.y - scaledHeight / 2;
    const bottomEdge = photoCenter.y + scaledHeight / 2;

    if (topEdge < padding) {
      scrollY = topEdge - padding;
    } else if (bottomEdge > viewportHeight - padding) {
      scrollY = bottomEdge - (viewportHeight - padding);
    } else if (scaledHeight + padding * 2 <= viewportHeight) {
      scrollY = photoCenter.y - viewportHeight / 2;
    }

    if (scrollX !== 0 || scrollY !== 0) {
      window.scrollBy({
        top: scrollY,
        left: scrollX,
        behavior: 'smooth',
      });
    }
  };

  const handlePhotoClick = (index: number, photoRef: HTMLDivElement | null) => {
    if (!photoRef || !animationEnabled) return;

    if (expandedPhotoIndex === index) {
      gsap.to(photoRef, {
        scale: 1,
        duration,
        ease,
        zIndex: 1,
      });
      setExpandedPhotoIndex(null);
    } else {
      if (expandedPhotoIndex !== null) {
        const prevItem = gridRef.current?.querySelector(
          `[data-photo-index="${expandedPhotoIndex}"]`
        );
        if (prevItem) {
          gsap.to(prevItem, { scale: 1, duration, ease, zIndex: 1 });
        }
      }

      setExpandedPhotoIndex(index);
      gsap.to(photoRef, {
        scale: 1.2,
        duration,
        ease,
        zIndex: 10,
        onComplete: () => scrollToKeepPhotoInView(photoRef),
      });
    }
  };

  const renderHeader = () => (
    <div className={styles.header}>
      <h1 className={`${styles.title} ${titleClasses} ${bebas.className}`}>
        {trip.name}
      </h1>
      <p className={`${styles.subtitle} ${bodyClasses} ${inter.className}`}>
        {trip.countries.join(', ')} {trip.year && `• ${trip.year}`}
      </p>
    </div>
  );

  const renderPhotoGrid = () => {
    if (validatedPhotos.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={inter.className}>No photos available</p>
        </div>
      );
    }

    return (
      <div
        ref={gridRef}
        className={`${styles.photoGrid} ${spacing}`}
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`,
        } as React.CSSProperties}
      >
        {validatedPhotos.map((photo, index) => {
          const gridSize = getGridCellSize(photo, index);
          const isExpanded = expandedPhotoIndex === index;

          return (
            <div
              key={index}
              data-photo-item
              data-photo-index={index}
              className={`${styles.photoItem} ${isExpanded ? styles.photoItemExpanded : ''}`}
              style={{
                gridColumn: gridSize.gridColumn,
                gridRow: gridSize.gridRow,
                opacity: 0
              }}
              onClick={(e) => handlePhotoClick(index, e.currentTarget as HTMLDivElement)}
            >
              <Image
                src={photo.src}
                alt={photo.title || `Photo ${index + 1}`}
                className={styles.photoImage}
                fill
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.theme}>
      {renderHeader()}
      {renderPhotoGrid()}
    </div>
  );
}
