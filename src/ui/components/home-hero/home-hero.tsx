import Image from 'next/image';
import { HeroVariant } from '@/enums/hero-variant';
import { Trip } from '@/types/trip';
import styles from './home-hero.module.scss';

interface HomeHeroProps {
  variant: HeroVariant;
  trips?: Trip[];
  featuredTripId?: string;
}

const MAP_BACKGROUND_URL =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80&auto=format&fit=crop';

function getFeaturedTrip(trips?: Trip[], featuredTripId?: string): Trip | undefined {
  if (!trips || trips.length === 0) return undefined;

  if (featuredTripId) {
    const match = trips.find((trip) => trip.id === featuredTripId);
    if (match) return match;
  }

  return trips[0];
}

function getCollagePhotos(trips?: Trip[], maxPhotos = 8): string[] {
  if (!trips || trips.length === 0) return [];

  const urls: string[] = [];

  for (const trip of trips) {
    for (const photo of trip.photos) {
      if (urls.length >= maxPhotos) {
        return urls;
      }
      urls.push(photo.src);
    }

    if (!trip.photos.length && trip.coverPhoto && urls.length < maxPhotos) {
      urls.push(trip.coverPhoto);
    }

    if (urls.length >= maxPhotos) {
      break;
    }
  }

  return urls;
}

export function HomeHero({ variant, trips, featuredTripId }: HomeHeroProps) {
  const renderMapVariant = () => (
    <section className={`${styles.hero} ${styles.heroMap}`}>
      <div className={styles.backgroundImage}>
        <Image
          src={MAP_BACKGROUND_URL}
          alt="Vintage world map background"
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
      </div>
      <div className={`${styles.overlay} ${styles.overlayDark}`} />
      <div className={styles.content}>
        <h1 className={styles.title}>TravelThemes</h1>
        <p className={styles.subtitle}>Adventures through the lens</p>
      </div>
    </section>
  );

  const renderCollageVariant = () => {
    const collagePhotos = getCollagePhotos(trips);

    return (
      <section className={`${styles.hero} ${styles.heroCollage}`}>
        {collagePhotos.length > 0 && (
          <div className={styles.collageGrid}>
            {collagePhotos.map((src, index) => (
              <div key={`${src}-${index}`} className={styles.collageImageWrapper}>
                <Image
                  src={src}
                  alt="Travel collage background"
                  fill
                  sizes="33vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        <div className={`${styles.overlay} ${styles.overlayDark}`} />
        <div className={styles.content}>
          <h1 className={styles.title}>TravelThemes</h1>
          <p className={styles.subtitle}>Adventures through the lens</p>
        </div>
      </section>
    );
  };

  const renderFullscreenVariant = () => {
    const featuredTrip = getFeaturedTrip(trips, featuredTripId);

    return (
      <section
        className={`${styles.hero} ${styles.heroFullscreen} ${styles.fullscreenFixedDesktop}`}
      >
        {featuredTrip && (
          <Image
            src={featuredTrip.coverPhoto}
            alt={featuredTrip.name}
            fill
            priority
            sizes="100vw"
            className={styles.backgroundImage}
          />
        )}
        <div className={`${styles.overlay} ${styles.overlayGradient}`} />
        <div className={styles.content}>
          <h1 className={styles.title}>TravelThemes</h1>
          <p className={styles.subtitle}>Adventures through the lens</p>
        </div>
      </section>
    );
  };

  const renderHeaderVariant = () => {
    const featuredTrip = getFeaturedTrip(trips, featuredTripId);

    return (
      <section className={`${styles.hero} ${styles.heroHeader}`}>
        {featuredTrip && (
          <Image
            src={featuredTrip.coverPhoto}
            alt={featuredTrip.name}
            fill
            priority
            sizes="100vw"
            className={styles.backgroundImage}
          />
        )}
        <div className={`${styles.overlay} ${styles.overlayMedium}`} />
        <div className={styles.content}>
          <h1 className={styles.title}>TravelThemes</h1>
          <p className={styles.subtitle}>Adventures through the lens</p>
        </div>
      </section>
    );
  };

  switch (variant) {
    case HeroVariant.Map:
      return renderMapVariant();
    case HeroVariant.Collage:
      return renderCollageVariant();
    case HeroVariant.Fullscreen:
      return renderFullscreenVariant();
    case HeroVariant.Header:
      return renderHeaderVariant();
    default:
      return renderMapVariant();
  }
}

