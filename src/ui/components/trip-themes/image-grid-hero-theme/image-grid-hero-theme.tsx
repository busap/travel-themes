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

// 6 images are absolutely positioned around the centered text.
// Each flies in from its nearest viewport corner/edge toward its final slot.
//
// Final layout (approximate, matches the reference):
//
//  ┌─────────────────────────────────────┬───────┐
//  │  img0  (wide landscape, top-left)   │       │
//  ├──────────┬──────────────────────────│ img3  │
//  │          │  img2 (medium landscape) │ tall  │
//  │  img1    ├──────────────────────────│ right │
//  │  large   │  [   centered text   ]  ├───────┤
//  │  portrait│                         │ img5  │
//  │  bot-left├──────────────────────────│ small │
//  │          │  img4 (medium landscape) │       │
//  └──────────┴──────────────────────────┴───────┘
//
// Start offsets push each image well outside the viewport so the assembly
// animation looks like pieces converging from all four edges.

const CELL_CONFIG: {
  cls: string;
  start: { x: string; y: string };
}[] = [
  { cls: 'img0', start: { x: '-55vw', y: '-40vh' } }, // wide top-left  → top-left corner
  { cls: 'img1', start: { x: '-45vw', y: '55vh'  } }, // large portrait → bottom-left corner
  { cls: 'img2', start: { x: '10vw',  y: '-55vh' } }, // med landscape  → top (slight right)
  { cls: 'img3', start: { x: '50vw',  y: '-45vh' } }, // tall portrait  → top-right corner
  { cls: 'img4', start: { x: '5vw',   y: '55vh'  } }, // med landscape  → bottom (slight right)
  { cls: 'img5', start: { x: '50vw',  y: '45vh'  } }, // small portrait → bottom-right corner
];

export function ImageGridHeroTheme({ trip, config }: ImageGridHeroThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const heroTextRef  = useRef<HTMLDivElement>(null);
  const cellRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const galleryRef   = useRef<HTMLDivElement>(null);

  const animationEnabled = config.animation?.enabled ?? true;
  const ease = config.animation?.timeline?.ease ?? 'power3.out';

  const { photos: validatedPhotos, handleImageError } = useValidatedImages(trip.photos);

  const heroPhotos    = validatedPhotos.slice(0, 6);
  const galleryPhotos = validatedPhotos.slice(6);

  useEffect(() => {
    if (!animationEnabled) return;

    const ctx = gsap.context(() => {
      // ── Pinned scroll-assembly timeline ──────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Text fades up just before images start moving
      tl.fromTo(
        heroTextRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0
      );

      // All images converge simultaneously from their edges/corners
      cellRefs.current.forEach((cell, i) => {
        if (!cell) return;
        const { x, y } = CELL_CONFIG[i]?.start ?? { x: '0vw', y: '0vh' };
        tl.fromTo(
          cell,
          { x, y, opacity: 0, scale: 0.85 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.8, ease },
          0.1
        );
      });

      // ── Gallery: scroll-triggered reveal ─────────────────────────────
      if (galleryRef.current) {
        galleryRef.current.querySelectorAll('[data-gallery-item]').forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.7, ease,
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

  const renderHeroImages = () =>
    heroPhotos.map((photo, index) => {
      const cfg = CELL_CONFIG[index];
      if (!cfg) return null;
      return (
        <div
          key={index}
          className={`${styles.imgCell} ${styles[cfg.cls as keyof typeof styles]}`}
          ref={(el) => { cellRefs.current[index] = el; }}
        >
          <Image
            src={photo.src}
            alt={photo.title || `${trip.name} – photo ${index + 1}`}
            fill
            sizes="(max-width: 768px) 60vw, 35vw"
            style={{ objectFit: 'cover' }}
            onError={() => handleImageError(photo.src)}
          />
          {photo.title && (
            <div className={styles.imgOverlay}>
              <span className={styles.imgCaption}>{photo.title}</span>
            </div>
          )}
        </div>
      );
    });

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
        {/* Centered text – sits above images in z-order */}
        <div className={styles.heroText} ref={heroTextRef}>
          <p className={styles.eyebrow}>
            {trip.countries.join(' · ')}
            {trip.year && <span> · {trip.year}</span>}
          </p>
          <h1 className={styles.title}>{trip.name}</h1>
          {trip.description && (
            <p className={styles.description}>{trip.description}</p>
          )}
          <div className={styles.scrollHint}>
            <div className={styles.scrollLine} />
            <span className={styles.scrollLabel}>scroll to explore</span>
          </div>
        </div>

        {/* Absolutely positioned images that fly in from edges */}
        {renderHeroImages()}
      </section>

      {renderGallery()}
    </div>
  );
}
