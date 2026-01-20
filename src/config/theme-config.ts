import { Theme } from '@/enums/theme';

export interface ThemeConfig {
  // Component to render this theme
  component: string; // 'minimal-theme' | 'immersive-theme' | etc.

  // Layout configuration
  layout: {
    type: 'card-grid' | 'horizontal-scroll' | 'vertical-parallax' | 'photo-trail' | 'masonry';
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
    arrangement: 'grid' | 'trail' | 'stack' | 'scatter' | 'flow';
    revealPattern: 'sequential' | 'random' | 'scroll-based';
    count?: number;
  };

  // Styling hints (can override in component)
  styling: {
    colorScheme?: string; // For CSS variables
    typography?: {
      titleClasses: string;
      bodyClasses: string;
    };
  };
}

// Configuration map - initially empty/minimal
const themeConfigs: Record<Theme, ThemeConfig> = {
  [Theme.Minimal]: {
    component: 'minimal-theme',
    layout: {
      type: 'card-grid',
      scrollDirection: 'none',
      spacing: 'gap-12',
    },
    animation: {
      enabled: false, // Will be implemented later
    },
    photos: {
      arrangement: 'grid',
      revealPattern: 'sequential',
    },
    styling: {
      typography: {
        titleClasses: 'text-xl font-semibold',
        bodyClasses: 'text-sm',
      },
    },
  },
  [Theme.Immersive]: {
    component: 'immersive-theme',
    layout: {
      type: 'card-grid',
      scrollDirection: 'none',
      spacing: 'gap-12',
    },
    animation: {
      enabled: false, // Will be implemented later
    },
    photos: {
      arrangement: 'grid',
      revealPattern: 'sequential',
    },
    styling: {},
  },
  [Theme.Editorial]: {
    component: 'editorial-theme',
    layout: {
      type: 'card-grid',
      scrollDirection: 'none',
      spacing: 'gap-12',
    },
    animation: {
      enabled: false, // Will be implemented later
    },
    photos: {
      arrangement: 'grid',
      revealPattern: 'sequential',
    },
    styling: {},
  },
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return themeConfigs[theme];
}
