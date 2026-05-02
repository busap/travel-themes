# TravelThemes

Photo-centric travel website where trips are displayed through themed visual presentations.

## Tech Stack

| Technology   | Purpose                                  |
| ------------ | ---------------------------------------- |
| Next.js      | Framework (App Router)                   |
| React        | UI library                               |
| TypeScript   | Type safety                              |
| Tailwind CSS | Styling (with @apply in SCSS modules)    |
| SCSS         | CSS preprocessor (module-based)          |
| Node.js      | Runtime                                  |
| Storybook    | Component development                    |
| Vitest       | Unit testing framework                   |
| Playwright   | E2E and visual testing                   |
| Cloudinary   | Image optimization (via next-cloudinary) |
| GSAP         | Animations, ScrollTrigger, timelines     |

## Iteration Log

**What to log**: Only architectural changes and significant additions — new folder structures, patterns, abstractions, data flow changes, dependencies, conventions.

### Iteration 1

- Initialized Next.js 16.1.3 with TypeScript + Tailwind
- Created types, enums, mock data
- Built home page with trip cards
- Created AGENTS.md
- Added Storybook, Playwright, Cloudinary, GSAP

### Iteration 2

- Restructured project to separate components and pages
- Created `src/ui/` directory with `components/` and `pages/` subdirectories
- Moved home page to `src/ui/pages/home/`
- Reorganized app router with route groups: `src/app/(home)/`
- Established Storybook organization: components only
- Updated AGENTS.md with structural principles

### Iteration 3

- Design flexible theme configuration system for trip detail pages
- Create theme-config.ts with ThemeConfig interface
- Set up dynamic routing for trip details: `/trips/[id]` (uses trip ID)
- Created TripDetail page component with theme system integration
- Create ThemeRenderer component for dynamic theme loading
- Prepare infrastructure for GSAP-based theme animations

### Iteration 4

- Implemented type-safe routing system
- Created `src/config/routes.ts` with route definitions and type parameters
- Created `src/utils/route.ts` with route builder functions
- Updated TripCard component to use route builders instead of hardcoded URLs
- Updated E2E tests to use route builders for consistency
- Established pattern: all URLs must use route builders, never string literals
- Set up comprehensive unit testing with Vitest
- Created unit tests for routing system, trip utilities, and configurations
- Organized tests into mirrored structures:
    - `tests/unit/` mirrors `src/` structure
    - `tests/e2e/` mirrors `src/app/` route structure
- Added test scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:all`
- Documented testing strategy and conventions

### Iteration 5

- Added `Collage` theme - horizontal scrolling collage layout.
- Created `src/ui/` structure with clear split between reusable components and route-level pages.
- Locked testing convention: pages use E2E, components use Storybook.
- Resolved Next.js build conflicts introduced during the structure split.

### Iteration 6

- Created unified `PolaroidCard` component with `Trip` and `Photo` variants
- Refactored `TripCard` and `CollageTheme` to use shared polaroid component
- Pattern: Create unified components with variants instead of duplicating code

### Iteration 7

- Established render function pattern for complex components
- Added convention: Break complex components into named render functions for better organization and readability

### Iteration 8

- Added config-driven theme system across trip detail pages.
- Updated `Collage` theme - fully driven by `ThemeConfig`.
- Created custom hooks pattern in `src/hooks/`:
    - `useHorizontalScroll` - reusable horizontal scroll conversion
    - `useScrollBasedReveal` - reusable scroll-based reveal animations
- Made `ThemeConfig` fully optional to support different theme needs without forcing unused fields.
- Added convention: extract config values as constants at the top of each theme component.

### Iteration 9

- Migrated to SCSS modules (`.module.scss`) with CSS Modules pattern (camelCase class names)
- Adopted Tailwind-first approach: use `@apply` with Tailwind utilities in SCSS modules
- Added `src/styles/_breakpoints.scss` with SCSS variables matching Tailwind breakpoints

### Iteration 10

- Added `Aurora` theme - animated gradient + scroll reveal style.
- Added `Mosaic` theme - fullscreen masonry grid with expand interactions.
- Added `Drift` theme - editorial wave/magazine style composition.

### Iteration 11

- Added `Feed` theme - social-feed inspired vertical card flow.
- Added `Trail` theme - cursor photo-trail presentation.
- Added `SmoothScroll` theme - smooth vertical parallax motion style.
- Added `DragShuffle` theme - draggable stacked photo-card style.
- Added `Showcase` theme - focused sequential spotlight presentation.
- Added `PhotoCarousel` theme - cinematic carousel browsing style.
- Added `Trippy` theme - psychedelic layered scroll-reactive visuals.
- Added `ImageGridHero` theme - pinned grid assembly hero sequence.
- Added `GridHover` theme - interactive hover-reactive image grid.
- Added `Parallax` theme - strip-based parallax/morph transition style.

### Iteration 12

- Replaced home page trip card grid with fullscreen interactive 3D globe (`globe.gl` + Three.js).
- Visited countries rendered as textured/highlighted polygons on the globe; hover rotates and zooms in.
- Added `TripStrip` component — fixed side panel with compact `TripCard` items that drive globe focus via hover.
- `TripCard` gained a `compact` variant (collapses expandable content until hover) for strip use.
- Removed `TripCardVariant` enum and `variants/` sub-components (ImmersiveCard, PolaroidCard variant) — no longer needed.
- Pattern: home page globe focus is controlled by `focusTripId` state passed down from `HomeHero`.

### Iteration 13

- Unified the virtualization layer: `useScrollBasedReveal` folded into `useVirtualWindow` as `mode: "dom-visibility"` (alongside `mode: "scroll-progress"`), with `additive` for monotonic-reveal grids.
- Rolled the hook out to every remaining bespoke virtualization site:
    - `Trippy`, `Parallax` — `scroll-progress` mode for sticky/pinned-scroll lazy mounting.
    - `Drift`, `Mosaic`, `Image-Grid-Hero` gallery, `Grid Hover`, `Photo Carousel` — replaced per-section/per-cell `IntersectionObserver` (and Mosaic's `ScrollTrigger.create`) with `dom-visibility` mode. Existing data attributes (`data-photo-index`, `data-row-index`, `data-gallery-index`) are reused via `indexAttr` so click/animation handlers keep working.
    - `Collage`, `Feed` — container-scroll `dom-visibility`.
    - `Aurora` — uses the pure utils (`computeVirtualRange` + `rangeToSet`) directly against its `useScrollPinnedReveal` focus index.
- Convention: when GSAP queries DOM at mount (Trippy, Mosaic), keep the queried element as a permanent wrapper and gate the heavy `<Image>` inside it — never gate the queried element behind `isMounted` itself.
- Knock-on cleanups: Mosaic's `isInInitialViewport` ref-during-render replaced with a fixed-index priority heuristic; Aurora's set-merge `useEffect` replaced with a `useMemo` window.
- Trippy specifically: `additive: true` to avoid backward-scroll decode flicker, plus `onLeave`/`onLeaveBack` callbacks on each per-photo `ScrollTrigger` that snap the scrub tween to its terminal state on exit (otherwise fast reverse scroll lets several photos hang mid-fade for `scrub` seconds while flying past).

### Iteration 14

- Migrated image storage from Supabase to Cloudinary.
- `next.config.ts`: replaced `*.supabase.co` remote pattern with `res.cloudinary.com`.
- `prisma/seed.ts`: replaced Supabase storage client with Cloudinary Admin API for listing resources; `publicUrl()` now builds `f_auto,q_auto` Cloudinary CDN URLs — no pre-compression needed.
- `.env.example`: replaced Supabase storage vars with `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Removed unused `src/lib/supabase.ts` singleton (Cloudinary has no equivalent client-side singleton needed).

