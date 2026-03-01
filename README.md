# TravelThemes

Photo-centric travel website where trips are displayed through themed visual presentations.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js | Framework (App Router) |
| React | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling (with @apply in SCSS modules) |
| SCSS | CSS preprocessor (module-based) |
| Node.js | Runtime |
| Storybook | Component development |
| Vitest | Unit testing framework |
| Playwright | E2E and visual testing |
| Cloudinary | Image optimization (via next-cloudinary) |
| GSAP | Animations, ScrollTrigger, timelines |

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
- Implemented Collage theme with horizontal scrolling
- Created `src/ui/` with `components/` and `pages/` subdirectories
- Pages tested via E2E only (no Storybook stories)
- Components have Storybook stories
- Fixed Next.js build conflicts

### Iteration 6
- Created unified `PolaroidCard` component with `Trip` and `Photo` variants
- Refactored `TripCard` and `CollageTheme` to use shared polaroid component
- Pattern: Create unified components with variants instead of duplicating code

### Iteration 7
- Established render function pattern for complex components
- Added convention: Break complex components into named render functions for better organization and readability

### Iteration 8
- Implemented config-driven theme system
- Made Collage theme fully driven by ThemeConfig options (scrollDirection, animation, revealPattern)
- Created custom hooks pattern in `src/hooks/`:
  - `useHorizontalScroll` - reusable horizontal scroll conversion
  - `useScrollBasedReveal` - reusable scroll-based reveal animations
- Made ThemeConfig interface fully optional to support different theme needs
- Established pattern: extract config values as constants at component top

### Iteration 9
- Migrated to SCSS modules (`.module.scss`) with CSS Modules pattern (camelCase class names)
- Adopted Tailwind-first approach: use `@apply` with Tailwind utilities in SCSS modules
- Added `src/styles/_breakpoints.scss` with SCSS variables matching Tailwind breakpoints

### Iteration 10
- Implemented Aurora theme with animated gradient background and scroll-based photo reveals

### Iteration 11
- Implemented Mosaic theme with fullscreen masonry grid layout
- Created `src/utils/mosaic-layout.ts` utility for aspect ratio-based grid cell sizing
- Created `src/hooks/use-mouse-position.ts` hook for cursor-tracking effects
- Implemented expand-in-place photo interaction with GSAP animations

### Iteration 12
- Rebuilt Drift theme as wave-based magazine editorial layout
