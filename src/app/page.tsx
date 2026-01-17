import { TripCard } from '@/components/trip-card/trip-card';
import { getAllTrips } from '@/utils/trip';

export default function Home() {
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

      <main className="px-6 pb-16 md:px-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} priority={index < 3} />
          ))}
        </div>
      </main>
    </div>
  );
}
