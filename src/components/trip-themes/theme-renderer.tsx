import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';

interface ThemeRendererProps {
  trip: Trip;
  config: ThemeConfig;
}

export function ThemeRenderer({ trip, config }: ThemeRendererProps) {
  // As new theme components are created, add them here

  switch (config.component) {
    case 'minimal-theme':
      // Future: return <MinimalTheme trip={trip} config={config} />
      // Fallback placeholder for now
      return (
        <div className="min-h-screen p-12 bg-white dark:bg-zinc-950">
          <h1 className="text-4xl font-bold">{trip.name}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Countries: {trip.countries.join(', ')}
          </p>
          {trip.year && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">Year: {trip.year}</p>
          )}
          {trip.description && (
            <p className="mt-4 text-zinc-700 dark:text-zinc-300">{trip.description}</p>
          )}
          <p className="mt-8 text-zinc-500">Minimal theme - Coming soon</p>
        </div>
      );

    case 'immersive-theme':
      // Future: return <ImmersiveTheme trip={trip} config={config} />
      return (
        <div className="min-h-screen p-12 bg-zinc-950 text-white">
          <h1 className="text-4xl font-bold">{trip.name}</h1>
          <p className="mt-2 text-zinc-400">Countries: {trip.countries.join(', ')}</p>
          {trip.year && <p className="mt-1 text-zinc-400">Year: {trip.year}</p>}
          {trip.description && (
            <p className="mt-4 text-zinc-300">{trip.description}</p>
          )}
          <p className="mt-8 text-zinc-500">Immersive theme - Coming soon</p>
        </div>
      );

    case 'editorial-theme':
      // Future: return <EditorialTheme trip={trip} config={config} />
      return (
        <div className="min-h-screen p-12 bg-zinc-100 dark:bg-zinc-900">
          <h1 className="text-4xl font-bold font-serif">{trip.name}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Countries: {trip.countries.join(', ')}
          </p>
          {trip.year && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">Year: {trip.year}</p>
          )}
          {trip.description && (
            <p className="mt-4 text-zinc-700 dark:text-zinc-300">{trip.description}</p>
          )}
          <p className="mt-8 text-zinc-500">Editorial theme - Coming soon</p>
        </div>
      );

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
