import { TripCard } from '@/ui/components/trip-card/trip-card';
import { TripCardVariant } from '@/enums/trip-card-variant';
import { getAllTrips } from '@/utils/trip';
import { getPolaroidTransform } from '@/utils/polaroid-layout';
import './home.css';

export function Home() {
  const trips = getAllTrips();

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">
          TravelThemes
        </h1>
        <p className="home__subtitle">
          Adventures through the lens
        </p>
      </header>

      <main className="home__main">
        <div className="home__grid">
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
