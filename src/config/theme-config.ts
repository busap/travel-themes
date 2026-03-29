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
    animation: {},
    photos: {
      revealPattern: 'scroll-based',
    },
  },
  [Theme.Aurora]: {
    component: 'aurora-theme',
    layout: {
      type: 'vertical-parallax',
      scrollDirection: 'vertical',
      spacing: 'gap-8',
    },
    animation: {
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
  },
  [Theme.Drift]: {
    component: 'drift-theme',
    layout: {
      scrollDirection: 'vertical',
      spacing: 'gap-0',
    },
    animation: {
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
  },
  [Theme.Trail]: {
    component: 'trail-theme',
    layout: {
      type: 'photo-trail',
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {},
    photos: {
      arrangement: 'trail',
      revealPattern: 'scroll-based',
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
  },
  [Theme.DragShuffle]: {
    component: 'drag-shuffle-theme',
    layout: {
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {
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
  },
  [Theme.PhotoCarousel]: {
    component: 'photo-carousel-theme',
    layout: {
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {
      timeline: {
        duration: 1.0,
        ease: 'linear',
      },
    },
    photos: {
      arrangement: 'flow',
      revealPattern: 'sequential',
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
  [Theme.Showcase]: {
    component: 'showcase-theme',
    layout: {
      scrollDirection: 'none',
      spacing: 'gap-0',
    },
    animation: {
      timeline: {
        duration: 0.4,
        ease: 'ease',
      },
    },
    photos: {
      arrangement: 'grid',
      revealPattern: 'sequential',
    },
  }
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return themeConfigs[theme];
}
