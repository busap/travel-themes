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

## TODO

### Add unit tests for src/db/ once Prisma client is generated

`src/db/**` is excluded from the Vitest coverage scope because the
generated client (`src/generated/prisma/`) does not exist yet. Once
it is generated (`npm run db:generate`), re-include it in the coverage
config and add `tests/unit/db/trips.test.ts` that mocks `@/lib/prisma`
and covers:

- `getTripById` — found / not found, country mapping, photo sort order, null→undefined coercion, invalid country throws
- `getAllTrips` — empty result, multiple trips mapped correctly
- `getThemeForTrip` — known theme, null falls back to `Theme.Collage`, unknown string falls back to `Theme.Collage`

### Add globe tooltip e2e test once DB is seeded

`tests/e2e/home/globe.spec.ts` defers the tooltip interaction test because:
1. The globe auto-rotates, making country polygon positions non-deterministic
2. Visited countries only exist once trips are seeded

When ready: disable auto-rotation (`controls.autoRotate = false`) via a
test-only hook or `page.evaluate`, then hover the known centroid of a seeded
country and assert that `GlobeTooltipCard` renders the trip name and country
name. Also test the mobile variant (portal-rendered `<Link>`) using a mobile
viewport.

### Add e2e theme tests as trips are seeded

`tests/e2e/themes/` has one file per theme. Currently only `mosaic.spec.ts`
exists (for `barcelona-2021`). As new trips are added to `prisma/trips-data.ts`
and seeded, add a spec file for each theme that covers its specific UI:

| Theme         | Test ideas                                                              |
| ------------- | ----------------------------------------------------------------------- |
| Collage       | back button (`aria-label="Go back"`), horizontal scroll, polaroid cards |
| Aurora        | gradient background renders, scroll reveal triggers                     |
| Drift         | editorial sections visible                                              |
| Feed          | vertical card flow renders                                              |
| Trail         | cursor trail canvas present                                             |
| SmoothScroll  | smooth scroll container renders                                         |
| DragShuffle   | draggable stack renders                                                 |
| Showcase      | spotlight panel renders                                                 |
| PhotoCarousel | carousel navigation (prev/next)                                         |
| Trippy        | layered scroll elements present                                         |
| ImageGridHero | pinned grid assembly renders                                            |
| GridHover     | hover-reactive grid renders                                             |
| Parallax      | parallax strips render                                                  |

### Switch storage from Supabase to Cloudinary (~20 trips / 1 GB limit)

1. Create a Cloudinary account and get your cloud name
2. Add env var: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Update `next.config.ts` — replace Supabase remote pattern with Cloudinary:
    ```ts
    { protocol: "https", hostname: "res.cloudinary.com" }
    ```
4. Update `publicUrl()` in `prisma/seed.ts` to build Cloudinary URLs:
    ```ts
    function publicUrl(path: string) {
    	return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/trip-photos/${path}`;
    }
    ```
5. Upload all images to Cloudinary (same folder structure: `trip-photos/[id]/cover/`, `trip-photos/[id]/photos/`)
6. Re-run `npm run db:seed` to update all URLs in the DB
7. Pre-compressing images before upload is no longer needed — `f_auto,q_auto` in the URL handles it
