'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useValidatedImages } from '@/hooks/use-validated-images';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './image-grid-hero-theme.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImageGridHeroThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

// Grid is 3 columns × 2 rows. Each cell's starting position is its
// nearest viewport edge/corner so it "flies in" toward the center.
//
//  ┌─────────────────────────────────────────────┐
//  │                                             │
//  │  [0 ↘ TL]  [1 ↓ TC]  [2 ↙ TR]            │
//  │  [3 ↗ BL]  [4 ↑ BC]  [5 ↖ BR]            │
//  │                                             │
//  └─────────────────────────────────────────────┘
//
//  Arrows show the direction each image travels TO reach its slot.
const CELL_START: { x: string; y: string }[] = [
  { x: '-65vw', y: '-65vh' }, // 0 top-left  → from top-left corner
  { x: '0vw',   y: '-75vh' }, // 1 top-center → from top edge
  { x: '65vw',  y: '-65vh' }, // 2 top-right  → from top-right corner
  { x: '-65vw', y: '65vh'  }, // 3 bottom-left → from bottom-left corner
  { x: '0vw',   y: '75vh'  }, // 4 bottom-center → from bottom edge
  { x: '65vw',  y: '65vh'  }, // 5 bottom-right → from bottom-right corner
];

export function ImageGridHeroTheme({ trip, config }: ImageGridHeroThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef     = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const galleryRef  = useRef<HTMLDivElement>(null);
  const cellRefs    = useRef<(HTMLDivElement | null)[]>([]);

  const animationEnabled = config.animation?.enabled ?? true;
  const ease = config.animation?.timeline?.ease ?? 'power3.out';

  const { photos: validatedPhotos, handleImageError } = useValidatedImages(trip.photos);

  // 6 photos fill the hero grid; the rest go in the gallery below
  const heroPhotos   = validatedPhotos.slice(0, 6);
  const galleryPhotos = validatedPhotos.slice(6);

  useEffect(() => {
    if (!animationEnabled) return;

    const ctx = gsap.context(() => {
      // ── 1. Pinned scroll-assembly animation ──────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=180%',        // 180 vh of scroll drives the entire pin
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Title fades up into place at the very start of the scroll
      tl.fromTo(
        heroTextRef.current,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        0
      );

      // Every image flies simultaneously from its edge to its grid slot
      cellRefs.current.forEach((cell, i) => {
        if (!cell) return;
        const { x, y } = CELL_START[i] ?? { x: '0vw', y: '0vh' };
        tl.fromTo(
          cell,
          { x, y, opacity: 0, scale: 0.82 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.8, ease },
          0.15 // slight offset so text appears just before images start moving
        );
      });

      // ── 2. Gallery items reveal on scroll ────────────────────────────
      if (galleryRef.current) {
        const items = galleryRef.current.querySelectorAll('[data-gallery-item]');
        items.forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease,
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [animationEnabled, validatedPhotos.length, ease]);

  // ── Render helpers ──────────────────────────────────────────────────

  const renderHeroText = () => (
    <div className={styles.heroText} ref={heroTextRef}>
      <p className={styles.eyebrow}>
        {trip.countries.join(' · ')}
        {trip.year && <span className={styles.year}> · {trip.year}</span>}
      </p>
      <h1 className={styles.title}>{trip.name}</h1>
      {trip.description && (
        <p className={styles.description}>{trip.description}</p>
      )}
    </div>
  );

  const renderHeroGrid = () => {
    if (heroPhotos.length === 0) return null;
    return (
      <div className={styles.gridWrapper}>
        <div className={styles.heroGrid} ref={gridRef}>
          {heroPhotos.map((photo, index) => (
            <div
              key={index}
              className={styles.gridCell}
              ref={(el) => { cellRefs.current[index] = el; }}
            >
              <Image
                src={photo.src}
                alt={photo.title || `${trip.name} – photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 27vw"
                style={{ objectFit: 'cover' }}
                onError={() => handleImageError(photo.src)}
              />
              {photo.title && (
                <div className={styles.cellOverlay}>
                  <span className={styles.cellTitle}>{photo.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGallery = () => {
    if (galleryPhotos.length === 0) return null;
    return (
      <section className={styles.gallery} ref={galleryRef}>
        <div className={styles.galleryHeader}>
          <h2 className={styles.galleryHeading}>All Photos</h2>
          <div className={styles.galleryDivider} />
        </div>
        <div className={styles.galleryGrid}>
          {galleryPhotos.map((photo, index) => (
            <div key={index} className={styles.galleryItem} data-gallery-item>
              <div className={styles.galleryItemInner}>
                <Image
                  src={photo.src}
                  alt={photo.title || `${trip.name} – photo ${index + 7}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  onError={() => handleImageError(photo.src)}
                />
                {photo.title && (
                  <div className={styles.galleryOverlay}>
                    <span className={styles.galleryItemTitle}>{photo.title}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={styles.theme} ref={containerRef}>
      <section className={styles.hero} ref={heroRef}>
        {renderHeroText()}
        {renderHeroGrid()}
        <div className={styles.scrollHint}>
          <span className={styles.scrollLabel}>scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>
      {renderGallery()}
    </div>
  );
}
