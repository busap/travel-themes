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

// ── Final assembled puzzle layout ────────────────────────────────────────────
//
//   grid-template-areas:
//     "img0  img0  img3"   ← img0 spans cols 1+2 (wide top-left)
//     "img1  img2  img3"   ← img3 spans rows 1+2 (tall right)
//     "img1  img4  img5"   ← img1 spans rows 2+3 (tall left)
//
//   ┌──────────────────────┬───────────┐
//   │  img0  (wide)        │           │
//   ├───────────┬──────────┤   img3    │
//   │           │  img2    │   (tall)  │
//   │   img1    ├──────────┼───────────┤
//   │  (tall)   │  img4    │   img5    │
//   └───────────┴──────────┴───────────┘
//
// At START each cell is displaced outward so it peeks in from the viewport
// edge. As the user scrolls the pinned section, cells converge to x:0 y:0
// and the puzzle snaps together. Text stays in the center and fades out.

const CELL_CLASSES = [
  styles.cellImg0,
  styles.cellImg1,
  styles.cellImg2,
  styles.cellImg3,
  styles.cellImg4,
  styles.cellImg5,
] as const;

// How far (in vw/vh) each cell starts displaced from its grid position.
// Direction = away from the grid center, so cells "peel off" outward.
const DISPLACED: { x: string; y: string }[] = [
  { x: '-30vw', y: '-28vh' }, // img0 wide top-left  → push top-left
  { x: '-30vw', y: '28vh'  }, // img1 tall left      → push bottom-left
  { x: '0vw',   y: '-28vh' }, // img2 center-middle  → push up
  { x: '30vw',  y: '-28vh' }, // img3 tall right     → push top-right
  { x: '0vw',   y: '28vh'  }, // img4 center-bottom  → push down
  { x: '30vw',  y: '28vh'  }, // img5 bottom-right   → push bottom-right
];

export function ImageGridHeroTheme({ trip, config }: ImageGridHeroThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const heroTextRef  = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);
  const cellRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const galleryRef   = useRef<HTMLDivElement>(null);

  const animationEnabled = config.animation?.enabled ?? true;
  const ease = config.animation?.timeline?.ease ?? 'power2.inOut';

  const { photos: validatedPhotos, handleImageError } = useValidatedImages(trip.photos);

  const heroPhotos    = validatedPhotos.slice(0, 6);
  const galleryPhotos = validatedPhotos.slice(6);

  useEffect(() => {
    if (!animationEnabled || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cells = cellRefs.current.filter(Boolean);

      // ── Immediately place cells at displaced (but visible) start positions
      cells.forEach((cell, i) => {
        const d = DISPLACED[i];
        if (cell && d) gsap.set(cell, { x: d.x, y: d.y });
      });

      // ── Pinned scroll timeline ────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // All cells converge to their grid slots simultaneously
      cells.forEach((cell, i) => {
        const d = DISPLACED[i];
        if (!cell || !d) return;
        tl.to(cell, { x: 0, y: 0, duration: 0.8, ease }, 0);
      });

      // Text fades out in the second half as images fill in
      tl.to(heroTextRef.current, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0.45);

      // ── Gallery reveal on scroll ──────────────────────────────────────
      if (galleryRef.current) {
        galleryRef.current.querySelectorAll('[data-gallery-item]').forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 36 },
            {
              opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
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
        {trip.year && <span> · {trip.year}</span>}
      </p>
      <h1 className={styles.title}>{trip.name}</h1>
      {trip.description && (
        <p className={styles.description}>{trip.description}</p>
      )}
    </div>
  );

  const renderGrid = () => (
    <div className={styles.heroGrid} ref={gridRef}>
      {heroPhotos.slice(0, 6).map((photo, index) => (
        <div
          key={index}
          className={`${styles.gridCell} ${CELL_CLASSES[index]}`}
          ref={(el) => { cellRefs.current[index] = el; }}
        >
          <Image
            src={photo.src}
            alt={photo.title || `${trip.name} – photo ${index + 1}`}
            fill
            sizes="(max-width: 768px) 60vw, 40vw"
            style={{ objectFit: 'cover' }}
            onError={() => handleImageError(photo.src)}
          />
          {photo.title && (
            <div className={styles.cellOverlay}>
              <span className={styles.cellCaption}>{photo.title}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
        {renderGrid()}
      </section>
      {renderGallery()}
    </div>
  );
}
