import { TripCard } from '@/ui/components/trip-card/trip-card';
import { TripCardVariant } from '@/enums/trip-card-variant';
import { getAllTrips } from '@/utils/trip';
import { getPolaroidTransform } from '@/utils/polaroid-layout';

export function Home() {
  const trips = getAllTrips();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-6 py-12 md:px-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
          TravelThemes
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Adventures through the lens
        </p>
      </header>

      <main className="px-6 pb-16 md:px-12 md:pb-24">
        <div className="grid gap-12 sm:gap-16 md:gap-20 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
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
