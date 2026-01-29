import { Trip } from '@/types/trip';
import { PolaroidCardVariant } from '@/enums/polaroid-card-variant';
import { getTripRoute } from '@/utils/route';
import { PolaroidCard as BasePolaroidCard } from '@/ui/components/polaroid-card/polaroid-card';

interface PolaroidCardProps {
  trip: Trip;
  priority: boolean;
  rotation?: number;
  scale?: number;
  offset?: { x: number; y: number };
}

export function PolaroidCard({
  trip,
  priority,
  rotation,
  scale,
  offset
}: PolaroidCardProps) {
  return (
    <BasePolaroidCard
      variant={PolaroidCardVariant.Trip}
      imageSrc={trip.coverPhoto}
      title={trip.name}
      subtitle={`${trip.countries.join(', ')}${trip.year ? ` • ${trip.year}` : ''}`}
      description={trip.description}
      href={getTripRoute(trip.id)}
      priority={priority}
      rotation={rotation}
      scale={scale}
      offset={offset}
    />
  );
}
