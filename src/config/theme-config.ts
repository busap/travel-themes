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
  [Theme.Aurora]: {
    component: 'aurora-theme',
    layout: {
      type: 'vertical-parallax',
      scrollDirection: 'vertical',
      spacing: 'gap-8',
    },
    animation: {
      enabled: true,
      scrollTrigger: {
        scrub: 2,
        pin: true,
        start: 'center center',
        end: '+=100%',
      },
      timeline: {
        duration: 2,
        ease: 'power2.out',
        stagger: 0.3,
      },
    },
    photos: {
      arrangement: 'flow',
      revealPattern: 'scroll-based',
    },
    styling: {
      colorScheme: 'aurora',
      typography: {
        titleClasses: 'text-4xl md:text-6xl font-light tracking-wide',
        bodyClasses: 'text-base md:text-lg text-white/80',
      },
    },
  },
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return themeConfigs[theme];
}
