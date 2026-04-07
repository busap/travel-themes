import { Theme } from "@/enums/theme";

export interface ThemeConfig {
	// Component to render this theme
	component: string; // 'minimal-theme' | 'immersive-theme' | etc.

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
}

// Configuration map - initially empty/minimal
const themeConfigs: Record<Theme, ThemeConfig> = {
	[Theme.Collage]: {
		component: "collage-theme",
		animation: {},
	},
	[Theme.Aurora]: {
		component: "aurora-theme",
		animation: {
			scrollTrigger: {
				scrub: 2,
				pin: true,
				start: "center center",
				end: "+=100%",
			},
			timeline: {
				duration: 2,
				ease: "power2.out",
				stagger: 0.3,
			},
		},
	},
	[Theme.Mosaic]: {
		component: "mosaic-theme",
		animation: {
			scrollTrigger: {
				start: "top 85%",
				end: "top 60%",
			},
			timeline: {
				duration: 0.4,
				ease: "power2.out",
				stagger: 0.1,
			},
		},
	},
	[Theme.Drift]: {
		component: "drift-theme",
		animation: {
			scrollTrigger: {
				start: "top 85%",
			},
			timeline: {
				duration: 0.8,
				ease: "power3.out",
				stagger: 0.12,
			},
		},
	},
	[Theme.Trail]: {
		component: "trail-theme",
		animation: {},
	},
	[Theme.SmoothScroll]: {
		component: "smooth-scroll-theme",
		animation: {
			scrollTrigger: {
				scrub: 5,
				start: "top top",
				end: "bottom top",
			},
			timeline: {
				duration: 1,
				ease: "none",
			},
		},
	},
	[Theme.DragShuffle]: {
		component: "drag-shuffle-theme",
		animation: {
			timeline: {
				duration: 0.45,
				ease: "power3.out",
			},
		},
	},
	[Theme.PhotoCarousel]: {
		component: "photo-carousel-theme",
		animation: {
			timeline: {
				duration: 1.0,
				ease: "linear",
			},
		},
	},
	[Theme.Trippy]: {
		component: "trippy-theme",
		animation: {
			scrollTrigger: {
				scrub: 1,
				start: "top top",
				end: "bottom bottom",
			},
			timeline: {
				duration: 1,
				ease: "power2.out",
			},
		},
	},
	[Theme.ImageGridHero]: {
		component: "image-grid-hero-theme",
		animation: {
			scrollTrigger: {
				start: "top top",
				end: "+=180%",
				scrub: 1.2,
				pin: true,
			},
			timeline: {
				duration: 0.8,
				ease: "power3.out",
				stagger: 0,
			},
		},
	},
	[Theme.GridHover]: {
		component: "grid-hover-theme",
		animation: {},
	},
	[Theme.Parallax]: {
		component: "parallax-theme",
		animation: {
			scrollTrigger: {
				scrub: 1.5,
				start: "top top",
				end: "bottom bottom",
			},
			timeline: {
				duration: 0.75,
				ease: "power3.out",
				stagger: 0.09,
			},
		},
	},
	[Theme.Feed]: {
		component: "feed-theme",
		animation: {
			timeline: {
				duration: 0.5,
				ease: "power2.out",
				stagger: 0.1,
			},
		},
	},
	[Theme.Showcase]: {
		component: "showcase-theme",
		animation: {
			timeline: {
				duration: 0.4,
				ease: "ease",
			},
		},
	},
};

export function getThemeConfig(theme: Theme): ThemeConfig {
	return themeConfigs[theme];
}
