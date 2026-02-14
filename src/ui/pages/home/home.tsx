import { TripCard } from '@/ui/components/trip-card/trip-card';
import { TripCardVariant } from '@/enums/trip-card-variant';
import { getAllTrips } from '@/utils/trip';
import { getPolaroidTransform } from '@/utils/polaroid-layout';
import styles from './home.module.scss';

export function Home() {
  const trips = getAllTrips();

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          TravelThemes
        </h1>
        <p className={styles.subtitle}>
          Adventures through the lens
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {trips.map((trip, index) => {
            const { rotation, scale, offset } = getPolaroidTransform(index);

            return (
              <TripCard
                key={trip.id}
                trip={trip}
                variant={TripCardVariant.Polaroid}
                rotation={rotation}
                scale={scale}
                offset={offset}
                priority={index < 3}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
