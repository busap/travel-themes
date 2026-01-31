import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { CollageTheme } from './collage-theme/collage-theme';
import './theme-renderer.css';

interface ThemeRendererProps {
  trip: Trip;
  config: ThemeConfig;
}

export function ThemeRenderer({ trip, config }: ThemeRendererProps) {
  // As new theme components are created, add them here

  switch (config.component) {
    case 'collage-theme':
      return <CollageTheme trip={trip} config={config} />;

    default:
      // Default fallback
      return (
        <div className="theme-renderer-fallback">
          <h1 className="theme-renderer-fallback__title">{trip.name}</h1>
          <p className="theme-renderer-fallback__message">Theme not configured</p>
        </div>
      );
  }
}
