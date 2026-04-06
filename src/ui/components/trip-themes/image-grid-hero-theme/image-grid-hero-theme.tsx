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

const CELL_CLASSES = [
  styles.cellImg0,
  styles.cellImg1,
  styles.cellImg2,
  styles.cellImg3,
  styles.cellImg4,
  styles.cellImg5,
] as const;

const DISPLACED: { x: string; y: string }[] = [
  { x: '-30vw', y: '-28vh' },
  { x: '-30vw', y: '28vh'  },
  { x: '0vw',   y: '-42vh' },
  { x: '30vw',  y: '-28vh' },
  { x: '0vw',   y: '28vh'  },
  { x: '30vw',  y: '28vh'  },
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

      cells.forEach((cell, i) => {
        const d = DISPLACED[i];
        if (!cell || !d) return;
        tl.to(cell, { x: 0, y: 0, duration: 0.8, ease }, 0);
      });

      tl.to(
        heroTextRef.current,
        { autoAlpha: 0, scale: 0.78, duration: 0.32, ease: 'power2.out' },
        0
      );

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
          style={
            animationEnabled
              ? { transform: `translate(${DISPLACED[index]?.x ?? '0vw'}, ${DISPLACED[index]?.y ?? '0vh'})` }
              : undefined
          }
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

  const renderScrollIndicator = () => (
    <div className={styles.scrollIndicator} aria-hidden="true">
      <span className={styles.scrollIndicatorLabel}>Scroll</span>
      <span className={styles.scrollIndicatorTrack}>
        <span className={styles.scrollIndicatorDot} />
      </span>
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
        {renderScrollIndicator()}
      </section>
      {renderGallery()}
    </div>
  );
}
