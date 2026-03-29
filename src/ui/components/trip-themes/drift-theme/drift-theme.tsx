'use client';

import { Trip } from '@/types/trip';
import { Photo } from '@/types/photo';
import { ThemeConfig } from '@/config/theme-config';
import { useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Playfair_Display, Crimson_Pro } from 'next/font/google';
import { seededRandom } from '@/utils/random';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './drift-theme.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

interface DriftThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

type CompositionKey =
  | 'single-left' | 'single-right' | 'single-center'
  | 'duo-staggered' | 'duo-big-small-left' | 'duo-big-small-right' | 'duo-diagonal'
  | 'trio-one-two' | 'trio-two-one' | 'trio-l-shape';

interface Wave {
  photos: Photo[];
  compositionKey: CompositionKey;
  directions: SlideDirection[];
  rotations: number[];
}

const SINGLE_COMPOSITIONS: CompositionKey[] = ['single-left', 'single-right', 'single-center'];
const DUO_COMPOSITIONS: CompositionKey[] = ['duo-staggered', 'duo-big-small-left', 'duo-big-small-right', 'duo-diagonal'];
const TRIO_COMPOSITIONS: CompositionKey[] = ['trio-one-two', 'trio-two-one', 'trio-l-shape'];
const DIRECTIONS: SlideDirection[] = ['left', 'right', 'top', 'bottom'];

const COMPOSITION_CLASS_MAP: Record<CompositionKey, string> = {
  'single-left': styles.singleLeft,
  'single-right': styles.singleRight,
  'single-center': styles.singleCenter,
  'duo-staggered': styles.duoStaggered,
  'duo-big-small-left': styles.duoBigSmallLeft,
  'duo-big-small-right': styles.duoBigSmallRight,
  'duo-diagonal': styles.duoDiagonal,
  'trio-one-two': styles.trioOneTwo,
  'trio-two-one': styles.trioTwoOne,
  'trio-l-shape': styles.trioLShape,
};

function getDirectionOffset(direction: SlideDirection): { x: number; y: number } {
  switch (direction) {
    case 'left': return { x: -250, y: 0 };
    case 'right': return { x: 250, y: 0 };
    case 'top': return { x: 0, y: -180 };
    case 'bottom': return { x: 0, y: 180 };
  }
}

export function DriftTheme({ trip, config }: DriftThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const animationEnabled = config.animation?.enabled ?? true;
  const duration = config.animation?.timeline?.duration ?? 0.8;
  const ease = config.animation?.timeline?.ease ?? 'power3.out';
  const stagger = config.animation?.timeline?.stagger ?? 0.12;
  const triggerStart = config.animation?.scrollTrigger?.start ?? 'top 85%';
  const titleClasses = config.styling?.typography?.titleClasses ?? '';
  const bodyClasses = config.styling?.typography?.bodyClasses ?? '';

  const idSeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < trip.id.length; i++) {
      hash = (hash << 5) - hash + trip.id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [trip.id]);

  const waves = useMemo(() => {
    const activePhotos = trip.photos;
    const result: Wave[] = [];
    let photoIndex = 0;
    let waveIndex = 0;

    while (photoIndex < activePhotos.length) {
      const remaining = activePhotos.length - photoIndex;

      // Determine group size (1-3) via seeded random
      const groupRand = seededRandom(idSeed + waveIndex * 53.7);
      let groupSize: number;
      if (remaining === 1) {
        groupSize = 1;
      } else if (remaining === 2) {
        groupSize = 2;
      } else if (remaining === 3) {
        groupSize = 3;
      } else if (remaining === 4) {
        groupSize = 2;
      } else {
        if (groupRand < 0.3) groupSize = 1;
        else if (groupRand < 0.75) groupSize = 2;
        else groupSize = 3;
      }

      const wavePhotos = activePhotos.slice(photoIndex, photoIndex + groupSize);

      // Pick composition
      const compRand = seededRandom(idSeed + waveIndex * 71.3);
      let compositionKey: CompositionKey;
      if (groupSize === 1) {
        compositionKey = SINGLE_COMPOSITIONS[Math.floor(compRand * SINGLE_COMPOSITIONS.length)];
      } else if (groupSize === 2) {
        compositionKey = DUO_COMPOSITIONS[Math.floor(compRand * DUO_COMPOSITIONS.length)];
      } else {
        compositionKey = TRIO_COMPOSITIONS[Math.floor(compRand * TRIO_COMPOSITIONS.length)];
      }

      // Assign random direction per photo
      const directions: SlideDirection[] = wavePhotos.map((_, i) => {
        const dirRand = seededRandom(idSeed + (photoIndex + i) * 29.3);
        return DIRECTIONS[Math.floor(dirRand * DIRECTIONS.length)];
      });

      // Assign slight rotation per photo (-2 to +2 deg)
      const rotations: number[] = wavePhotos.map((_, i) => {
        const rotRand = seededRandom(idSeed + (photoIndex + i) * 17.3);
        return Math.round((rotRand * 4 - 2) * 100) / 100;
      });

      result.push({ photos: wavePhotos, compositionKey, directions, rotations });
      photoIndex += groupSize;
      waveIndex++;
    }

    return result;
  }, [trip.photos, idSeed]);

  // Set up GSAP ScrollTrigger per wave
  useEffect(() => {
    if (!containerRef.current || waves.length === 0) return;

    const container = containerRef.current;

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const header = container.querySelector('[data-entrance="header"]');
    const subtitle = container.querySelector('[data-entrance="subtitle"]');

    if (!animationEnabled || prefersReduced) {
      const allPhotos = container.querySelectorAll('[data-entrance="photo"]');
      const allCaptions = container.querySelectorAll('[data-entrance="caption"]');
      gsap.set(
        [header, subtitle, ...Array.from(allPhotos), ...Array.from(allCaptions)].filter(Boolean),
        { opacity: 1, x: 0, y: 0, scale: 1 },
      );
      containerRef.current!.style.visibility = 'visible';
      return;
    }

    // Animate header
    if (header) {
      gsap.fromTo(header, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
    if (subtitle) {
      gsap.fromTo(subtitle, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    }

    // Set all photos + captions to initial hidden state (fromTo sets "from" immediately)
    const allPhotos = container.querySelectorAll('[data-entrance="photo"]');
    allPhotos.forEach((photo) => {
      const dir = (photo.getAttribute('data-direction') || 'bottom') as SlideDirection;
      const offset = getDirectionOffset(dir);
      gsap.set(photo, { opacity: 0, x: offset.x, y: offset.y, scale: 0.92 });
    });

    const allCaptions = container.querySelectorAll('[data-entrance="caption"]');
    gsap.set(allCaptions, { opacity: 0, y: 10 });

    // Now that hidden states are set, reveal container
    container.style.visibility = 'visible';

    // Animate per wave section — photos stagger in as a group when the wave scrolls into view
    const waveSections = container.querySelectorAll('[data-wave]');
    waveSections.forEach((section) => {
      const photos = section.querySelectorAll('[data-entrance="photo"]');
      const captions = section.querySelectorAll('[data-entrance="caption"]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: triggerStart,
          toggleActions: 'play none none none',
          once: true,
        },
      });

      photos.forEach((photo, i) => {
        tl.to(photo, {
          opacity: 1, x: 0, y: 0, scale: 1,
          duration, ease,
        }, i * stagger);
      });

      captions.forEach((caption, i) => {
        tl.to(caption, {
          opacity: 1, y: 0,
          duration: 0.4, ease: 'power2.out',
        }, (i * stagger) + 0.3);
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [waves.length, animationEnabled, triggerStart, stagger, duration, ease]);

  const renderHeader = () => (
    <div className={styles.header}>
      <h1
        data-entrance="header"
        className={`${styles.title} ${titleClasses} ${playfair.className}`}
      >
        {trip.name}
      </h1>
      <p
        data-entrance="subtitle"
        className={`${styles.subtitle} ${bodyClasses} ${crimson.className}`}
      >
        {trip.countries.join(', ')}{trip.year ? ` \u2022 ${trip.year}` : ''}
      </p>
    </div>
  );

  const renderPhoto = (photo: Photo, rotation: number, direction: SlideDirection, index: number) => {
    return (
      <div
        key={`${photo.src}-${index}`}
        data-entrance="photo"
        data-direction={direction}
        className={styles.photo}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Image
          src={photo.src}
          alt={photo.title || `Photo ${index + 1}`}
          className={styles.photoImage}
          width={600}
          height={450}
          sizes="(max-width: 768px) 90vw, 550px"
        />
        {photo.title && (
          <p
            data-entrance="caption"
            className={`${styles.caption} ${crimson.className}`}
          >
            {photo.title}
          </p>
        )}
      </div>
    );
  };

  const renderWave = (wave: Wave, waveIndex: number) => {
    const compositionClass = COMPOSITION_CLASS_MAP[wave.compositionKey];

    if (wave.compositionKey === 'trio-one-two') {
      return (
        <section key={waveIndex} data-wave={waveIndex} className={styles.wave}>
          <div className={compositionClass}>
            {renderPhoto(wave.photos[0], wave.rotations[0], wave.directions[0], 0)}
            <div className={styles.trioBottomRow}>
              {renderPhoto(wave.photos[1], wave.rotations[1], wave.directions[1], 1)}
              {renderPhoto(wave.photos[2], wave.rotations[2], wave.directions[2], 2)}
            </div>
          </div>
        </section>
      );
    }

    if (wave.compositionKey === 'trio-two-one') {
      return (
        <section key={waveIndex} data-wave={waveIndex} className={styles.wave}>
          <div className={compositionClass}>
            <div className={styles.trioTopRow}>
              {renderPhoto(wave.photos[0], wave.rotations[0], wave.directions[0], 0)}
              {renderPhoto(wave.photos[1], wave.rotations[1], wave.directions[1], 1)}
            </div>
            {renderPhoto(wave.photos[2], wave.rotations[2], wave.directions[2], 2)}
          </div>
        </section>
      );
    }

    if (wave.compositionKey === 'trio-l-shape') {
      return (
        <section key={waveIndex} data-wave={waveIndex} className={styles.wave}>
          <div className={compositionClass}>
            {renderPhoto(wave.photos[0], wave.rotations[0], wave.directions[0], 0)}
            <div className={styles.trioRightStack}>
              {renderPhoto(wave.photos[1], wave.rotations[1], wave.directions[1], 1)}
              {renderPhoto(wave.photos[2], wave.rotations[2], wave.directions[2], 2)}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section key={waveIndex} data-wave={waveIndex} className={styles.wave}>
        <div className={compositionClass}>
          {wave.photos.map((photo, i) =>
            renderPhoto(photo, wave.rotations[i], wave.directions[i], i)
          )}
        </div>
      </section>
    );
  };

  const renderWaves = () => waves.map((wave, i) => renderWave(wave, i));

  return (
    <div
      ref={containerRef}
      className={styles.layout}
      style={{ visibility: 'hidden' }}
    >
      {renderHeader()}
      {renderWaves()}
    </div>
  );
}
