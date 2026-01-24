import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';

interface ThemeRendererProps {
  trip: Trip;
  config: ThemeConfig;
}

export function ThemeRenderer({ trip, config }: ThemeRendererProps) {
  // As new theme components are created, add them here

  switch (config.component) {
    case 'collage-theme':
      return <>collage</>

    default:
      // Default fallback
      return (
        <div className="min-h-screen p-12">
          <h1 className="text-4xl font-bold">{trip.name}</h1>
          <p className="mt-4">Theme not configured</p>
        </div>
      );
  }
}
