import { Theme } from '@/enums/theme';

export interface ThemeConfig {
  // Component to render this theme
  component: string; // 'minimal-theme' | 'immersive-theme' | etc.

  // Layout configuration
  layout: {
    type?: 'card-grid' | 'horizontal-scroll' | 'vertical-parallax' | 'photo-trail' | 'masonry';
    scrollDirection: 'vertical' | 'horizontal' | 'none';
    aspectRatio?: string;
    spacing: string;
  };

  // Animation configuration (GSAP)
  animation: {
    enabled: boolean;
    scrollTrigger?: {
      trigger?: string;
      start?: string;
      end?: string;
      scrub?: boolean | number;
      pin?: boolean;
    };
    timeline?: {
      duration: number;
      ease: string;
      stagger?: number;
    };
  };

  // Photo presentation
  photos: {
    arrangement?: 'grid' | 'trail' | 'stack' | 'scatter' | 'flow';
    revealPattern: 'sequential' | 'random' | 'scroll-based';
    count?: number;
  };

  // Styling hints (can override in component)
  styling?: {
    colorScheme?: string; // For CSS variables
    typography?: {
      titleClasses: string;
      bodyClasses: string;
    };
  };
}

// Configuration map - initially empty/minimal
const themeConfigs: Record<Theme, ThemeConfig> = {
  [Theme.Collage]: {
    component: 'collage-theme',
    layout: {
      scrollDirection: 'horizontal',
      spacing: 'gap-16',
    },
    animation: {
      enabled: true,
    },
    photos: {
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-2xl font-bold',
        bodyClasses: 'text-sm text-zinc-600',
      },
    }
  },
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return themeConfigs[theme];
}
