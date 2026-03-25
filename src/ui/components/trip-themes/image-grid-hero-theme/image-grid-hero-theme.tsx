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

export function ImageGridHeroTheme({ trip, config }: ImageGridHeroThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const animationEnabled = config.animation?.enabled ?? true;
  const duration = config.animation?.timeline?.duration ?? 0.8;
  const ease = config.animation?.timeline?.ease ?? 'power3.out';
  const stagger = config.animation?.timeline?.stagger ?? 0.1;

  const { photos: validatedPhotos, handleImageError } = useValidatedImages(trip.photos);

  // First 5 photos for the hero grid, remaining for the gallery
  const heroPhotos = validatedPhotos.slice(0, 5);
  const galleryPhotos = validatedPhotos.slice(5);

  useEffect(() => {
    if (!animationEnabled) return;

    const ctx = gsap.context(() => {
      // Hero text slides in from left
      if (heroTextRef.current) {
        const textElements = heroTextRef.current.querySelectorAll('[data-animate]');
        gsap.fromTo(
          textElements,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration, ease, stagger: 0.12, delay: 0.15 }
        );
      }

      // Hero grid photos stagger in from the right
      if (gridRef.current) {
        const photos = gridRef.current.querySelectorAll('[data-photo]');
        gsap.fromTo(
          photos,
          { opacity: 0, scale: 0.92, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration, ease, stagger, delay: 0.35 }
        );
      }

      // Gallery items reveal on scroll
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
  }, [animationEnabled, validatedPhotos.length, duration, ease, stagger]);

  const renderScrollArrow = () => (
    <svg
      className={styles.arrowIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const renderHeroText = () => (
    <div className={styles.heroText} ref={heroTextRef}>
      <p className={styles.eyebrow} data-animate>
        {trip.countries.join(' · ')}
        {trip.year && <span className={styles.year}> · {trip.year}</span>}
      </p>

      <h1 className={styles.title} data-animate>
        {trip.name}
      </h1>

      {trip.description && (
        <p className={styles.description} data-animate>
          {trip.description}
        </p>
      )}

      <div className={styles.scrollHint} data-animate>
        {renderScrollArrow()}
        <span className={styles.scrollLabel}>Scroll to explore</span>
      </div>
    </div>
  );

  const renderHeroGrid = () => {
    if (heroPhotos.length === 0) return null;

    return (
      <div className={styles.heroGrid} ref={gridRef}>
        {heroPhotos.map((photo, index) => (
          <div
            key={index}
            className={`${styles.gridCell} ${styles[`cell${index + 1}` as keyof typeof styles]}`}
            data-photo
          >
            <div className={styles.cellInner}>
              <Image
                src={photo.src}
                alt={photo.title || `${trip.name} – photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                style={{ objectFit: 'cover' }}
                onError={() => handleImageError(photo.src)}
              />
              {photo.title && (
                <div className={styles.cellOverlay}>
                  <span className={styles.cellTitle}>{photo.title}</span>
                </div>
              )}
            </div>
          </div>
        ))}
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
                  alt={photo.title || `${trip.name} – photo ${index + 6}`}
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
      <section className={styles.hero}>
        {renderHeroText()}
        {renderHeroGrid()}
      </section>
      {renderGallery()}
    </div>
  );
}
