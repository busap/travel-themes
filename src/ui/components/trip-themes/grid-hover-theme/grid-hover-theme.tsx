'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Syne, Space_Grotesk } from 'next/font/google';
import { useValidatedImages } from '@/hooks/use-validated-images';
import styles from './grid-hover-theme.module.scss';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

interface GridHoverThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

const GRID_COLS = 6;
const MIN_ROWS_WHEN_EMPTY = 5;
const MIN_CELLS_WHEN_EMPTY = GRID_COLS * MIN_ROWS_WHEN_EMPTY;

export function GridHoverTheme({ trip, config }: GridHoverThemeProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  const animationEnabled = config.animation?.enabled ?? true;
  const { photos: validatedPhotos, failedSrcs, handleImageError } = useValidatedImages(trip.photos);
  const visiblePhotos = validatedPhotos.filter((photo) => !failedSrcs.has(photo.src));
  const cellCount =
    visiblePhotos.length > 0 ? visiblePhotos.length : MIN_CELLS_WHEN_EMPTY;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1;
    setMousePos({
      x: e.clientX / w,
      y: e.clientY / h,
    });
  }, []);

  const rotateX = (mousePos.y - 0.5) * -10;
  const rotateY = (mousePos.x - 0.5) * 10;

  const renderHero = () => (
    <section
      className={styles.hero}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePos({ x: 0.5, y: 0.5 });
        setHoveredCell(null);
      }}
      style={{
        '--mouse-x': `${mousePos.x * 100}%`,
        '--mouse-y': `${mousePos.y * 100}%`,
      } as React.CSSProperties}
    >
      <div className={styles.spotlight} />

      <div
        className={styles.perspectiveWrapper}
        style={animationEnabled ? {
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.7s ease-out',
        } : undefined}
      >
        <div className={styles.grid}>
          {Array.from({ length: cellCount }, (_, cellIndex) => {
            const photo = visiblePhotos[cellIndex];
            const showPhoto = !!photo;
            const isActive = hoveredCell === cellIndex;

            return (
              <div
                key={cellIndex}
                className={[
                  styles.cell,
                  showPhoto ? styles.hasPhoto : '',
                  isActive ? styles.active : '',
                ].join(' ')}
                onMouseEnter={() => showPhoto && setHoveredCell(cellIndex)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {showPhoto && (
                  <div className={styles.photoReveal}>
                    <Image
                      src={photo!.src}
                      alt={photo!.title || `Photo ${cellIndex + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 17vw"
                      style={{ objectFit: 'cover' }}
                      onError={() => handleImageError(photo!.src)}
                    />
                    <div className={styles.photoSheen} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.titleLayer}>
        <p className={`${styles.eyebrow} ${spaceGrotesk.className}`}>
          {trip.countries.join(' · ')}{trip.year ? ` · ${trip.year}` : ''}
        </p>
        <h1 className={`${styles.title} ${syne.className}`}>{trip.name}</h1>
        <p className={`${styles.hint} ${spaceGrotesk.className}`}>move to explore</p>
      </div>
    </section>
  );

  return (
    <div className={styles.theme}>
      {renderHero()}
    </div>
  );
}
