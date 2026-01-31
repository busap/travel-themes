import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { ThemeRenderer } from '@/ui/components/trip-themes/theme-renderer';
import './trip-detail.css';

interface TripDetailProps {
  trip: Trip;
  config: ThemeConfig;
}

export function TripDetail({ trip, config }: TripDetailProps) {
  return (
    <div className="trip-detail">
      <ThemeRenderer trip={trip} config={config} />
    </div>
  );
}
