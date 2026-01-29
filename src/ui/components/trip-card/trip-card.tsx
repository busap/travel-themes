import { Trip } from '@/types/trip';
import { TripCardVariant } from '@/enums/trip-card-variant';
import { ImmersiveCard } from './variants/immersive-card';
import { PolaroidCard } from './variants/polaroid-card';

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
    return (
      <PolaroidCard
        trip={trip}
        priority={priority}
        rotation={rotation}
        scale={scale}
        offset={offset}
      />
    );
  }

  return <ImmersiveCard trip={trip} priority={priority} />;
}

