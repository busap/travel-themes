import Image from 'next/image';
import Link from 'next/link';
import { Trip } from '@/types/trip';
import { TripCardVariant } from '@/enums/trip-card-variant';

interface TripCardProps {
  trip: Trip;
  priority?: boolean;
  variant?: TripCardVariant;
  rotation?: number;
  scale?: number;
  offset?: { x: number; y: number };
}

export function TripCard({
  trip,
  priority = false,
  variant = TripCardVariant.Immersive,
  rotation,
  scale,
  offset
}: TripCardProps) {
  if (variant === TripCardVariant.Polaroid) {
    return <PolaroidCard trip={trip} priority={priority} rotation={rotation} scale={scale} offset={offset} />;
  }
  return <ImmersiveCard trip={trip} priority={priority} />;
}

function PolaroidCard({
  trip,
  priority,
  rotation = -2,
  scale = 1,
  offset = { x: 0, y: 0 }
}: {
  trip: Trip;
  priority: boolean;
  rotation?: number;
  scale?: number;
  offset?: { x: number; y: number };
}) {
  const transformStyle = `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`;

  return (
    <Link
      href={`/trip/${trip.id}`}
      className="group relative block p-4 bg-white dark:bg-zinc-800 shadow-xl transition-all duration-500 hover:rotate-0 hover:scale-105 hover:shadow-2xl"
      style={{ transform: transformStyle }}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={trip.coverPhoto}
          alt={trip.name}
          fill
          priority={priority}
          className="object-cover transition-all duration-500 group-hover:brightness-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="mt-4 pb-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {trip.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {trip.countries.join(', ')}
          {trip.year && ` • ${trip.year}`}
        </p>
        {trip.description && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 italic">
            {trip.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function ImmersiveCard({ trip, priority }: { trip: Trip; priority: boolean }) {
  return (
    <Link
      href={`/trip/${trip.id}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-lg"
    >
      <Image
        src={trip.coverPhoto}
        alt={trip.name}
        fill
        priority={priority}
        className="object-cover transition-all duration-1000 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-pink-500/20 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-8 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="px-3 py-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-full text-xs font-semibold text-zinc-900 dark:text-white">
          {trip.countries[0]}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 transform transition-all duration-700 translate-y-2 group-hover:translate-y-0">
        {trip.year && (
          <div className="mb-3 inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold text-white tracking-wider">
            {trip.year}
          </div>
        )}
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {trip.name}
        </h2>
        {trip.description && (
          <p className="mt-3 text-sm text-white/80 line-clamp-2 opacity-0 transform translate-y-4 transition-all duration-700 delay-100 group-hover:opacity-100 group-hover:translate-y-0">
            {trip.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-700 delay-200 group-hover:opacity-100">
          <span className="text-xs text-white/60">Explore journey</span>
          <svg className="w-4 h-4 text-white/60 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

