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

Themes that render many photos use a shared virtualization layer to avoid mounting off-screen content.

### Files

| File | Purpose |
|------|---------|
| `src/utils/virtualization.ts` | Pure math helpers — `clampRange`, `computeVirtualRange`, `progressToIndex`, `clampProgress`, `isInRange`, `rangeToSet`. No side-effects; unit-tested. |
| `src/hooks/use-virtual-window.ts` | `useVirtualWindow()` — unified hook for both virtualization strategies (see below). |

### Two modes

**`mode: "scroll-progress"`** — for sticky-scroll sequences (e.g. Parallax). Derives a focus index from global scroll progress within a defined `totalScrollHeight`, then keeps `before`/`after` items mounted around it.

```ts
const { isMounted } = useVirtualWindow({
  mode: "scroll-progress",
  count,
  totalScrollHeight,
  containerRef,   // element whose offsetTop anchors the math
  before: 2,
  after: 4,
});
```

**`mode: "dom-visibility"`** — for scrollable lists/grids (e.g. Feed, Grid Hover). Queries `[data-virtual-index]` (or a custom `indexAttr`) elements to detect which items are in the viewport, then maintains a sliding mount window around them.

```ts
const { isMounted } = useVirtualWindow({
  mode: "dom-visibility",
  count,
  containerRef,    // scroll container; omit to use window scroll
  indexAttr: "data-virtual-index",
  rootMarginPx: 0, // expand detection area (like IntersectionObserver rootMargin)
  additive: false, // set true for monotonic reveal (rows never unmount once shown)
  before: 2,
  after: 3,
});
```

Both modes return only `{ focusIndex, isMounted(i) }`. Mark items with the chosen data attribute so the hook can find them.

### Additive vs sliding window

- Default (sliding): the mount window tracks the current scroll position. Items far above or below may unmount. Good for long feeds.
- `additive: true`: the mount window start is pinned at 0 and only the end grows. Items are never unmounted once revealed. Good for grids where re-mounting would cause layout shift.

### Where not to use

Do not add virtualization to themes with fewer than ~10 items — the overhead is not worth it and may cause visible pop-in. Drift's per-wave IntersectionObserver is intentionally kept component-local and does not need this hook.

## Don't

- Don't put helper functions in mock files — use `src/utils/`
- Don't mix utils from different domains in one file
- Don't embed config in entity types — use separate composition/linking objects
- Don't use plain `<img>` tags — use Next.js `<Image>`
