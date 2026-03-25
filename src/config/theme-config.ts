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
      scrub?: number;
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
  [Theme.Mosaic]: {
    component: 'mosaic-theme',
    layout: {
      type: 'masonry',
      scrollDirection: 'vertical',
      spacing: 'gap-4',
    },
    animation: {
      enabled: true,
      scrollTrigger: {
        start: 'top 85%',
        end: 'top 60%',
      },
      timeline: {
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.1,
      },
    },
    photos: {
      arrangement: 'grid',
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-4xl font-bold',
        bodyClasses: 'text-base text-zinc-600',
      },
    },
  },
  [Theme.Drift]: {
    component: 'drift-theme',
    layout: {
      scrollDirection: 'vertical',
      spacing: 'gap-0',
    },
    animation: {
      enabled: true,
      scrollTrigger: {
        start: 'top 85%',
      },
      timeline: {
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      },
    },
    photos: {
      arrangement: 'scatter',
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-5xl font-light tracking-wide',
        bodyClasses: 'text-lg text-zinc-600',
      },
    },
  },
  [Theme.Trail]: {
    component: 'trail-theme',
    layout: {
      type: 'photo-trail',
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {
      enabled: true,
    },
    photos: {
      arrangement: 'trail',
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-5xl font-light tracking-wide',
        bodyClasses: 'text-lg text-zinc-500',
      },
    },
  },
  [Theme.SmoothScroll]: {
    component: 'smooth-scroll-theme',
    layout: {
      type: 'vertical-parallax',
      scrollDirection: 'vertical',
      spacing: 'gap-0',
    },
    animation: {
      enabled: true,
      scrollTrigger: {
        scrub: 5,
        start: 'top top',
        end: 'bottom top',
      },
      timeline: {
        duration: 1,
        ease: 'none',
      },
    },
    photos: {
      arrangement: 'flow',
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-4xl font-light tracking-wide',
        bodyClasses: 'text-base text-zinc-400',
      },
    },
  },
  [Theme.DragShuffle]: {
    component: 'drag-shuffle-theme',
    layout: {
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {
      enabled: true,
      timeline: {
        duration: 0.45,
        ease: 'power3.out',
      },
    },
    photos: {
      arrangement: 'stack',
      revealPattern: 'sequential',
      count: 3,
    },
    styling: {
      typography: {
        titleClasses: 'text-3xl md:text-4xl font-black',
        bodyClasses: 'text-sm md:text-base text-white/70',
      },
    },
  },
  [Theme.Trippy]: {
    component: 'trippy-theme',
    layout: {
      type: 'vertical-parallax',
      scrollDirection: 'vertical',
      spacing: 'gap-0',
    },
    animation: {
      enabled: true,
      scrollTrigger: {
        scrub: 2,
        start: 'top top',
        end: 'bottom bottom',
      },
      timeline: {
        duration: 1,
        ease: 'power2.out',
      },
    },
    photos: {
      arrangement: 'stack',
      revealPattern: 'scroll-based',
    },
    styling: {
      typography: {
        titleClasses: 'text-5xl font-black tracking-wide',
        bodyClasses: 'text-sm text-white/40',
      },
    },
  },
  [Theme.Feed]: {
    component: 'feed-theme',
    layout: {
      type: 'card-grid',
      scrollDirection: 'vertical',
      spacing: 'gap-4',
    },
    animation: {
      enabled: true,
      timeline: {
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
      },
    },
    photos: {
      arrangement: 'flow',
      revealPattern: 'scroll-based',
    },
  },
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return themeConfigs[theme];
}
