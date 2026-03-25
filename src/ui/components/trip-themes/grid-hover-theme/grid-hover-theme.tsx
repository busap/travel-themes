'use client';

import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useRef, useState, useMemo, useCallback } from 'react';
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
const GRID_ROWS = 5;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

function buildPhotoMap(photoCount: number): Map<number, number> {
  const map = new Map<number, number>();
  if (photoCount === 0) return map;

  const count = Math.min(photoCount, TOTAL_CELLS);
  const stride = Math.max(1, Math.floor(TOTAL_CELLS / count));

  for (let i = 0; i < count; i++) {
    map.set((i * stride) % TOTAL_CELLS, i);
  }
  return map;
}

export function GridHoverTheme({ trip, config }: GridHoverThemeProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  const animationEnabled = config.animation?.enabled ?? true;
  const { photos: validatedPhotos, failedSrcs, handleImageError } = useValidatedImages(trip.photos);

  const photoMap = useMemo(() => buildPhotoMap(validatedPhotos.length), [validatedPhotos.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const rotateX = (mousePos.y - 0.5) * -10;
  const rotateY = (mousePos.x - 0.5) * 10;

  const renderHero = () => (
    <section
      ref={heroRef}
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
          {Array.from({ length: TOTAL_CELLS }, (_, cellIndex) => {
            const photoIndex = photoMap.get(cellIndex);
            const hasPhoto = photoIndex !== undefined;
            const photo = hasPhoto ? validatedPhotos[photoIndex] : undefined;
            const showPhoto = !!photo && !failedSrcs.has(photo.src);
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
                      alt={photo!.title || `Photo ${photoIndex! + 1}`}
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

      <div className={styles.bottomFade} />
    </section>
  );

  const renderGallery = () => {
    const visiblePhotos = validatedPhotos.filter(p => !failedSrcs.has(p.src));
    if (visiblePhotos.length === 0) return null;

    return (
      <section className={styles.gallery}>
        <div className={styles.galleryGrid}>
          {visiblePhotos.map((photo, i) => (
            <div key={i} className={styles.galleryItem}>
              <Image
                src={photo.src}
                alt={photo.title || `Photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                onError={() => handleImageError(photo.src)}
                className={styles.galleryImage}
              />
              {photo.title && (
                <div className={styles.caption}>
                  <span className={spaceGrotesk.className}>{photo.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={styles.theme}>
      {renderHero()}
      {renderGallery()}
    </div>
  );
}
