'use client';

import Image from 'next/image';
import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { useMemo } from 'react';
import { CursorImageTrail } from './cursor-image-trail';
import styles from './trail-theme.module.scss';

interface TrailThemeProps {
  trip: Trip;
  config: ThemeConfig;
}

export function TrailTheme({ trip, config }: TrailThemeProps) {
  const photos = useMemo(
    () => trip.photos.filter((p) => p.src?.trim()),
    [trip.photos],
  );

  const stackPhotos = useMemo(
    () => photos.slice(0, 5),
    [photos],
  );

  const trailImages = useMemo(
    () => photos.map((photo) => photo.src),
    [photos],
  );

  const titleClasses =
    config.styling?.typography?.titleClasses || styles.title;
  const subtitleClasses =
    config.styling?.typography?.bodyClasses || styles.subtitle;

  const renderInfo = () => (
    <div className={styles.meta}>
      <h1 className={`${styles.title} ${titleClasses}`}>
        {trip.name}
      </h1>
      <p className={subtitleClasses}>
        {trip.countries.join(', ')}
        {trip.year ? ` • ${trip.year}` : ''}
      </p>
    </div>
  );

  const renderStack = () => (
    <div className={styles.stack}>
      {stackPhotos.map((photo, index) => (
        <div key={photo.src} className={styles.card}>
          <div className={styles.cardInner}>
            <Image
              src={photo.src}
              alt={photo.title || `Photo ${index + 1}`}
              className={styles.cardImage}
              fill
              sizes="(max-width: 768px) 90vw, 640px"
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        {renderInfo()}
        {renderStack()}
        {trailImages.length > 0 && (
          <CursorImageTrail
            images={trailImages}
            spawnThreshold={200}
            smoothing={0.14}
            lifespan={4000}
            maxItems={26}
          />
        )}
      </div>
    </div>
  );
}

