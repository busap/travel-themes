# TravelThemes - Agent Instructions

> Instructions for AI agents working on this project.

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Route group for home page
│   └── trips/[id]/        # Dynamic trip routes
├── db/                     # Server-only async DB queries (Prisma). Never import in client components.
├── ui/
│   ├── pages/             # Page components (E2E tested, no stories)
│   └── components/        # Reusable components (with .stories.tsx)
│       └── trip-themes/
├── config/                 # Route and theme configuration
├── enums/                  # Enums (one per file)
├── hooks/                  # Custom React hooks
├── lib/                    # Client singletons (Prisma, Supabase)
├── mocks/                  # Mock data only
├── types/                  # Type definitions (one per file)
└── utils/                  # Client-safe sync helpers (no DB imports)
```

### Key Structural Principles

1. **Route Groups**: Use `(home)` pattern to organize routes without affecting URLs
2. **Components** (`src/ui/components/`): Have `.stories.tsx` files
3. **Pages** (`src/ui/pages/`): E2E tested, no stories
4. **App Router**: Page files are thin wrappers that render from `src/ui/pages/`

## Testing

- **Unit** (`tests/unit/`): Pure functions, utils, config. Files: `*.test.ts`. Mirrors `src/` structure.
- **E2E** (`tests/e2e/`): Full pages, user flows. Files: `*.spec.ts`. Mirrors `src/app/` routes.
- **Component** (Storybook): Visual testing via co-located `*.stories.tsx`.
- E2E tests use route builders (no hardcoded URLs)
- `npm test` | `npm run test:e2e` | `npm run test:all` | `npm run storybook`

## Routing

Route definitions in `src/config/routes.ts`, builders in `src/utils/route.ts`. Never use string literals for URLs — always use route builders.

**Adding routes**: Add key to `RouteKey` enum, add config to `routes` object, add param types, optionally create convenience function in `src/utils/route.ts`.

## Imports

Always use `@/` alias with full path to the source file. No barrel `index.ts` files.

## Components

Components live in `src/ui/components/{name}/` with a co-located `.stories.tsx`. Pages live in `src/ui/pages/{name}/` (E2E tested, no stories).

**Styling**: SCSS modules (`.module.scss`) with Tailwind `@apply`. Use `@reference` (not `@import`) for globals. Class names are camelCase in SCSS. Only create semantically-named classes.

**Media queries**: Use `@use "path/to/styles/breakpoints" as *;` for `$breakpoint-{sm|md|lg|xl|2xl}` variables.

**Complex components**: Break into named render functions (`renderHeader`, `renderContent`, etc.) for readability.

**Storybook**: One story per variant if the component has variants; one story with configurable args otherwise.

## Theme System

**CRITICAL**: Trip detail pages use a flexible theme system. Each trip can have a completely different layout. The home page does not use themes.

**Flow**: Trip ID -> `getThemeForTrip()` (`src/db/trips.ts`, server) -> Theme enum -> `getThemeConfig()` -> ThemeRenderer -> Theme component

**Rules**:

- Themes are config-driven via `theme-config.ts`, not hardcoded
- Extract config values as constants at the top of the component
- Only specify config options that the theme actually uses (all ThemeConfig fields are optional)
- Themes are implemented incrementally, one at a time

**Adding a theme**:

- Add enum value in `src/enums/theme.ts`
- Create component in `src/ui/components/trip-themes/{name}/`
- Update `src/config/theme-config.ts` with config for the new enum key
- Add case to `src/ui/components/trip-themes/theme-renderer.tsx`
- Wire demo data in `src/mocks/trip-themes.ts` and, when needed, add/update trip content in `src/mocks/trips.ts`
- Create story and extract reusable hooks if applicable

## Virtualization

Shared layer to avoid mounting off-screen photos. Skip it for themes with <~10 items.

- `src/utils/virtualization.ts` — pure helpers (`clampRange`, `computeVirtualRange`, `progressToIndex`, `clampProgress`, `isInRange`, `rangeToSet`).
- `src/hooks/use-virtual-window.ts` — `useVirtualWindow({ mode, count, before, after, ... })` returning `{ focusIndex, isMounted(i) }`.

**`mode: "scroll-progress"`** — sticky pinned sequences. Focus index = scroll progress within `totalScrollHeight` anchored to `containerRef.offsetTop`.

**`mode: "dom-visibility"`** — queries `[data-virtual-index]` (or custom `indexAttr`) under `containerRef` (or window if omitted). `rootMarginPx` expands detection like `IntersectionObserver`'s `rootMargin`.

Both modes accept `additive: true` — the mount window only grows, never unmounts on scroll-back. Use it where remounting causes layout shift (grids) or decode flicker (image-heavy scrub timelines like Trippy); default is a sliding window.

### Theme map

| Theme                   | Mode                          | Notes                                                                                                                                                         |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parallax                | `scroll-progress`             | Photo per pinned section.                                                                                                                                     |
| Trippy                  | `scroll-progress`, `additive` | `additive` + per-section `onLeave`/`onLeaveBack` snap the scrub tween to terminal state — needed because `scrub` lag causes reverse-scroll opacity overshoot. |
| Feed                    | `dom-visibility` container    | Vertical phone-frame.                                                                                                                                         |
| Collage                 | `dom-visibility` container    | Visible gate derived from `focusIndex`.                                                                                                                       |
| Grid Hover              | `dom-visibility` window       | Per-row, `additive`.                                                                                                                                          |
| Drift                   | `dom-visibility` window       | Parent passes `isMounted` into each `WaveSection`.                                                                                                            |
| Mosaic                  | `dom-visibility` window       | `additive`; reuses existing `data-photo-index` via `indexAttr`.                                                                                               |
| Image Grid Hero gallery | `dom-visibility` window       | Per-item lazy mount; a separate one-shot IO gates the GSAP timeline (the hook's initial window isn't empty).                                                  |
| Photo Carousel          | `dom-visibility` window       | `before: 0, after: 0` for strict viewport presence per row.                                                                                                   |
| Aurora                  | utility-only                  | `computeVirtualRange` + `rangeToSet` driven by `useScrollPinnedReveal` callbacks.                                                                             |

**GSAP gotcha:** if a timeline queries DOM at mount (Trippy, Mosaic), keep the queried element (e.g. `<div data-photo-img>`) permanent and render the heavy `<Image>` _inside_ it — never gate the queried element itself behind `isMounted`.

## Don't

- Don't put helper functions in mock files — use `src/utils/`
- Don't mix utils from different domains in one file
- Don't embed config in entity types — use separate composition/linking objects
- Don't use plain `<img>` tags — use Next.js `<Image>`
