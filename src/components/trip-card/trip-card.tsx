import Image from 'next/image';
import Link from 'next/link';
import { Trip } from '@/types/trip';

interface TripCardProps {
  trip: Trip;
  priority?: boolean;
}

export function TripCard({ trip, priority = false }: TripCardProps) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
    >
      <Image
        src={trip.coverPhoto}
        alt={trip.name}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-xl font-semibold">{trip.name}</h2>
        <p className="mt-1 text-sm text-white/80">
          {trip.countries.join(', ')}
          {trip.year && ` · ${trip.year}`}
        </p>
        {trip.description && (
          <p className="mt-2 text-sm text-white/70 line-clamp-2">
            {trip.description}
          </p>
        )}
      </div>
    </Link>
  );
}
