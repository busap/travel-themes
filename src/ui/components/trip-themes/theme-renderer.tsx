import { Trip } from '@/types/trip';
import { ThemeConfig } from '@/config/theme-config';
import { CollageTheme } from './collage-theme/collage-theme';
import { AuroraTheme } from './aurora-theme/aurora-theme';
import { MosaicTheme } from './mosaic-theme/mosaic-theme';
import { FeedTheme } from './feed-theme/feed-theme';
import styles from './theme-renderer.module.scss';
import { DriftTheme } from '@/ui/components/trip-themes/drift-theme/drift-theme';
import { TrailTheme } from '@/ui/components/trip-themes/trail-theme/trail-theme';

interface ThemeRendererProps {
  trip: Trip;
  config: ThemeConfig;
}

export function ThemeRenderer({ trip, config }: ThemeRendererProps) {
  // As new theme components are created, add them here

  switch (config.component) {
    case 'collage-theme':
      return <CollageTheme trip={trip} config={config} />;

    case 'aurora-theme':
      return <AuroraTheme trip={trip} config={config} />;

    case 'mosaic-theme':
      return <MosaicTheme trip={trip} config={config} />;

    case 'feed-theme':
      return <FeedTheme trip={trip} config={config} />;

    case 'drift-theme':
      return <DriftTheme trip={trip} config={config} />;

    case 'trail-theme':
      return <TrailTheme trip={trip} config={config} />;

    default:
      // Default fallback
      return (
        <div className={styles.fallback}>
          <h1 className={styles.title}>{trip.name}</h1>
          <p className={styles.message}>Theme not configured</p>
        </div>
      );
  }
}
