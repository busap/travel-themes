'use client';

import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Bebas_Neue } from 'next/font/google';
import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useValidatedImages } from '@/hooks/use-validated-images';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './trippy-theme.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

// Scroll distance allocated per photo
const PHOTO_SECTION_PX = 1000;

// Fraction of section for each phase
const ENTRY_RATIO = 0.35;
const EXIT_START_RATIO = 0.65;

interface TrippyThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function TrippyTheme({ trip, config }: TrippyThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { photos, failedSrcs, handleImageError } = useValidatedImages(trip.photos);

  const scrub = config.animation?.scrollTrigger?.scrub ?? 2;

  const validPhotos = useMemo(
    () => photos.filter((p) => !failedSrcs.has(p.src)),
    [photos, failedSrcs],
  );

  const totalScrollHeight = useMemo(
    () => validPhotos.length * PHOTO_SECTION_PX,
    [validPhotos.length],
  );

  useEffect(() => {
    if (!containerRef.current || validPhotos.length === 0) return;
    const container = containerRef.current;

    const bgEl = container.querySelector<HTMLElement>('[data-bg]');
    const layers = Array.from(
      container.querySelectorAll<HTMLElement>('[data-photo-layer]'),
    );
    const frames = Array.from(
      container.querySelectorAll<HTMLElement>('[data-photo-frame]'),
    );
    const imgs = Array.from(
      container.querySelectorAll<HTMLElement>('[data-photo-img]'),
    );

    const ctx = gsap.context(() => {
      // Prevent flash: all layers start invisible.
      // Only the entry fromTo at position 0 has immediateRender:true,
      // so it re-applies autoAlpha:0 — consistent and conflict-free.
      gsap.set(layers, { autoAlpha: 0 });

      // Background hue cycles through full 360° as user scrolls
      if (bgEl) {
        gsap.fromTo(
          bgEl,
          { filter: 'hue-rotate(0deg)' },
          {
            filter: 'hue-rotate(360deg)',
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
          },
        );
      }

      layers.forEach((layer, i) => {
        const frame = frames[i];
        const img = imgs[i];
        if (!frame || !img) return;

        // Alternate rotation direction per photo
        const entryRotate = i % 2 === 0 ? 22 : -22;
        const exitRotate = -(entryRotate * 0.6);

        const sectionStart = i * PHOTO_SECTION_PX;
        const sectionEnd = (i + 1) * PHOTO_SECTION_PX;

        // ── Single timeline per photo spanning the full section ────────────
        // Using absolute positions so entry, hold, and exit are one coherent
        // scrubbed sequence. This avoids the two-separate-timelines bug where
        // the exit timeline's fromTo at time=0 would immediately render
        // autoAlpha:1 on every layer (overriding the initial set).
        gsap
          .timeline({
            scrollTrigger: {
              trigger: container,
              start: `top+=${sectionStart} top`,
              end: `top+=${sectionEnd} top`,
              scrub,
            },
          })
          // Entry phase: 0 → ENTRY_RATIO
          .fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENTRY_RATIO, ease: 'none' })
          .fromTo(
            frame,
            { scale: 3, rotate: entryRotate },
            { scale: 1, rotate: 0, ease: 'power2.out', duration: ENTRY_RATIO },
            0,
          )
          .fromTo(
            img,
            { scale: 1.5, filter: 'saturate(2.5) hue-rotate(80deg)' },
            { scale: 1.05, filter: 'saturate(1) hue-rotate(0deg)', ease: 'power2.out', duration: ENTRY_RATIO },
            0,
          )
          // Exit phase: EXIT_START_RATIO → 1.0  (hold is the implicit gap between)
          .fromTo(
            layer,
            { autoAlpha: 1 },
            { autoAlpha: 0, ease: 'none', duration: 1 - EXIT_START_RATIO },
            EXIT_START_RATIO,
          )
          .fromTo(
            frame,
            { scale: 1, rotate: 0 },
            { scale: 0.18, rotate: exitRotate, ease: 'power2.in', duration: 1 - EXIT_START_RATIO },
            EXIT_START_RATIO,
          )
          .fromTo(
            img,
            { scale: 1.05, filter: 'saturate(1) hue-rotate(0deg)' },
            { scale: 1.4, filter: 'saturate(2) hue-rotate(-60deg)', ease: 'power2.in', duration: 1 - EXIT_START_RATIO },
            EXIT_START_RATIO,
          );
      });
    }, container);

    return () => ctx.revert();
  }, [validPhotos, scrub]);

  function renderBackground() {
    return <div data-bg className={styles.bg} aria-hidden />;
  }

  function renderHeader() {
    return (
      <header className={styles.header}>
        <h1 className={`${styles.title} ${bebas.className}`}>{trip.name}</h1>
        <p className={styles.subtitle}>
          {trip.countries.join(' · ')}
          {trip.year ? ` · ${trip.year}` : ''}
        </p>
      </header>
    );
  }

  function renderPhotos() {
    return (
      <div className={styles.photoStack} aria-label="Trip photos">
        {validPhotos.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className={styles.photoLayer}
            data-photo-layer
          >
            <div className={styles.photoFrame} data-photo-frame>
              <Image
                src={photo.src}
                alt={photo.title || `${trip.name} — photo ${i + 1}`}
                className={styles.photoImg}
                data-photo-img
                fill
                sizes="(max-width: 768px) 95vw, 88vw"
                onError={() => handleImageError(photo.src)}
              />
              {/* Chromatic colour wash */}
              <div className={styles.photoChroma} aria-hidden />
            </div>

            {photo.title && (
              <p className={styles.photoCaption}>{photo.title}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderScrollHint() {
    return (
      <div className={styles.scrollHint} aria-hidden>
        <span className={styles.scrollLabel}>scroll</span>
        <span className={styles.scrollLine} />
      </div>
    );
  }

  if (validPhotos.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={styles.theme}
      style={{ '--total-scroll': `${totalScrollHeight}px` } as CSSProperties}
    >
      {renderBackground()}

      <div className={styles.scrollContainer}>
        <div className={styles.stickyStage}>
          {renderHeader()}
          {renderPhotos()}
          {renderScrollHint()}
        </div>
      </div>
    </div>
  );
}
