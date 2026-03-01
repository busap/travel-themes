# TravelThemes - Agent Instructions

> Instructions for AI agents working on this project.

## Project Overview

TravelThemes is a photo-centric travel website where trips are displayed through themed visual presentations. Each trip can have a different theme that controls how trips are shown.

## Tech Stack (Locked Versions)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.3 | Framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (with @apply in SCSS modules) |
| SCSS | - | CSS preprocessor (module-based) |
| Node.js | 20+ | Runtime |
| Storybook | 10.1.11 | Component development |
| Vitest | 4.0.17 | Unit testing framework |
| Playwright | 1.52.0 | E2E and visual testing |
| Cloudinary | 2.x | Image optimization (via next-cloudinary) |
| GSAP | 3.x | Animations, ScrollTrigger, timelines |

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Route group for home page
│   └── trips/[id]/        # Dynamic trip routes
├── ui/
│   ├── pages/             # Page components (E2E tested, no stories)
│   └── components/        # Reusable components (with .stories.tsx)
│       ├── trip-card/
│       ├── polaroid-card/
│       └── trip-themes/
├── config/                 # Route and theme configuration
├── enums/                  # Enums (one per file)
├── mocks/                  # Mock data only
├── types/                  # Type definitions (one per file)
└── utils/                  # Helper functions (grouped by domain)
```

### Key Structural Principles

1. **Route Groups**: Use `(home)` pattern to organize routes without affecting URLs
2. **Components** (`src/ui/components/`): Have `.stories.tsx` files
3. **Pages** (`src/ui/pages/`): E2E tested, no stories
4. **App Router**: Page files are wrappers that render from `src/ui/pages/`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component folders | kebab-case | `trip-card/` |
| Component files | kebab-case | `trip-card.tsx` |
| Component exports | PascalCase | `export function TripCard()` |
| Type/Interface files | kebab-case | `trip.ts` |
| Type/Interface names | PascalCase | `interface Trip` |
| Enum files | kebab-case | `theme.ts` |
| Enum names | PascalCase | `enum Theme` |
| Util files | kebab-case, by domain | `trip.ts`, `photo.ts` |
| Routes | kebab-case | `/trips/japan-2023` |

## Testing Strategy

```
tests/
├── unit/               # Vitest - mirrors src/
└── e2e/                # Playwright - mirrors app/ routes
```

### Types:
- **Unit** (`tests/unit/`): Pure functions, utils, config. Files: `*.test.ts`
- **E2E** (`tests/e2e/`): Full pages, user flows. Files: `*.spec.ts`
- **Component** (Storybook): Visual testing, co-located `*.stories.tsx`

### Key Conventions:
- Test directories mirror source structure
- E2E tests use route builders (no hardcoded URLs)
- All components must have stories
- Use `@/` alias in tests

### Commands:
- `npm test` - Unit tests
- `npm run test:e2e` - E2E tests
- `npm run test:all` - All tests
- `npm run storybook` - Component stories

## Routing System

The project uses a type-safe routing system to avoid hardcoded URLs.

### Key Principles:
1. **Route definitions** live in `src/config/routes.ts`
2. **Route builders** live in `src/utils/route.ts`
3. Never use string literals for URLs - always use route builders

### Usage:
```tsx
import { getTripRoute, getHomeRoute } from '@/utils/route';
import { buildRoute, RouteKey } from '@/utils/route';

// Convenience functions
<Link href={getTripRoute(trip.id)}>View Trip</Link>
<Link href={getHomeRoute()}>Home</Link>

// Generic builder (type-safe)
buildRoute(RouteKey.TripDetail, { id: 'japan-2023' }) // => '/trip/japan-2023'
buildRoute(RouteKey.Home) // => '/'
```

### Adding New Routes:
1. Add route key to `RouteKey` enum in `src/config/routes.ts`
2. Add route config to `routes` object with path and params
3. Add param types to `RouteParams` type
4. Optionally create convenience function in `src/utils/route.ts`

## Import Conventions

Always use `@/` alias with full path to file:
```typescript
import { Trip } from '@/types/trip';
import { Theme } from '@/enums/theme';
import { TripCard } from '@/ui/components/trip-card/trip-card';
import { trips } from '@/mocks/trips';
import { getAllTrips, getTripById } from '@/utils/trip';
import { getTripRoute } from '@/utils/route';
```

## Component Structure

Components live in folders with their stories:
```
ui/components/
└── trip-card/
    ├── trip-card.tsx           # Main component (no index.ts)
    └── trip-card.stories.tsx   # Storybook story
```

Page components live in folders without stories:
```
ui/pages/
└── home/
    └── home.tsx                # Page component (test with E2E)
```

### Component Internal Organization

**Render Function Pattern**: Break complex components into render functions for better organization and readability.

```tsx
export function ComplexComponent({ data }: Props) {
  // Hooks and state at the top
  const [state, setState] = useState();

  // Render functions for major sections
  const renderHeader = () => (
    <div>...</div>
  );

  const renderContent = () => (
    <div>...</div>
  );

  const renderFooter = () => (
    <div>...</div>
  );

  // Main return uses render functions
  return (
    <div>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
}
```

**When to use**: Apply this pattern to components with:
- Multiple distinct sections (header, content, footer, etc.)
- Complex JSX that would benefit from logical separation
- Reusable parts within the same component

**Benefits**: Improves readability, makes structure clear, easier to maintain and refactor.

### Component Styling Conventions

All component styles use SCSS modules with Tailwind's `@apply` directive (**Tailwind-first approach**).

**File Structure:**
```scss
// component-name.module.scss
@reference "../../../app/globals.scss";

.componentName {
  @apply layout-classes spacing-classes color-classes;
}

.componentNameElement {
  @apply styles-for-sub-element;
}

.componentNameModifier {
  @apply variant-specific-styles;
}
```

**Key Principles:**

1. **Tailwind First**: Use `@apply` with Tailwind utilities as the primary styling approach
2. **SCSS Modules**: Use `.module.scss` extension for scoped styles
3. **Reference, Not Import**: Use `@reference` for globals.scss (not `@import`)
4. **CamelCase in SCSS**: Class names use camelCase in `.module.scss` files
5. **Semantic Names**: Only create classes with semantic purpose (`.card`, `.header`, `.title`)

**Component Pattern:**
```tsx
import styles from './my-component.module.scss';

export function MyComponent({ variant }: Props) {
  const cardClass = variant === 'featured'
    ? `${styles.card} ${styles.cardFeatured}`
    : styles.card;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>...</div>
    </div>
  );
}
```

**Benefits:**
- **Scoped styles**: CSS Modules prevent global class name collisions
- **Tailwind utilities**: Leverage full Tailwind ecosystem with `@apply`
- **Type safety**: TypeScript can validate imported style objects
- **Clean markup**: No inline Tailwind classes cluttering JSX

**Media Queries:** Add `@use "path/to/styles/breakpoints" as *;` to use `$breakpoint-{sm|md|lg|xl|2xl}` variables in custom media queries.

## Custom Hooks

Reusable React hooks live in `src/hooks/` and encapsulate common behaviors across components.

### When to Create Hooks:

Extract logic into a custom hook when:
- The same behavior is needed across multiple components
- The logic involves useState/useEffect patterns that can be reused
- It improves component readability by separating concerns

Don't create hooks for:
- One-off component-specific logic
- Simple derived values (use constants instead)

### When Creating New Features

- **New page**:
  1. Create component in `src/ui/pages/{page-name}/`
  2. Create route group in `src/app/({page-name})/` with layout.tsx and page.tsx
  3. Create E2E test in `tests/e2e/{page-name}/`

- **New component**:
  1. Create in `src/ui/components/{component-name}/`
  2. Create story file with title `"Components/{ComponentName}"`

## Storybook Conventions

**Story Creation Rule**:
- Component has variants/types? → Create one story per variant
- No variants? → Create one story with configurable args

**Example**: See `trip-card.stories.tsx` - has `Polaroid`, `Immersive`, and `AllVariants` stories because `TripCard` has a `variant` prop with multiple enum values.

## Data Model Principles

- **Types** go in `src/types/` - one interface per file
- **Enums** go in `src/enums/` - one enum per file
- **Mock data** goes in `src/mocks/` - data only, no functions
- **Helper functions** go in `src/utils/` - grouped by domain (trip utils in `trip.ts`)
- Keep entities separate - use composition objects to link them

## Theme System Architecture

**CRITICAL**: Trip detail pages use a flexible theme system. Each trip can have a completely different layout.

### Key Points:
- Home page: Standard trip cards (no theme system)
- Trip detail pages (`/trips/[id]`): Use theme system
- Themes implemented incrementally, one at a time
- **Themes are config-driven**: Behavior controlled by `theme-config.ts`, not hardcoded

### Theme Flow:
```
Trip ID → getThemeForTrip() → Theme enum → getThemeConfig() → ThemeRenderer → Theme component
```

### Theme Configuration Pattern:

Themes should be driven by their ThemeConfig, not hardcoded values:

```tsx
export function MyTheme({ trip, config }: ThemeProps) {
  // Extract config values as constants at the top
  const spacing = config.layout?.spacing || 'gap-8';
  const animationEnabled = config.animation?.enabled ?? false;

  // Use hooks with config values
  useHorizontalScroll(containerRef, config.layout?.scrollDirection === 'horizontal');

  // Use config values throughout the component
  return <div className={spacing}>...</div>;
}
```

**Important**:
- Only specify config options that are actually used by the theme
- ThemeConfig fields are optional - themes use what they need
- Compute config-derived values as constants at the top of the component

### When Creating New Themes:
1. Create component in `src/ui/components/trip-themes/{theme-name}/`
2. Update `theme-config.ts` with only the options your theme uses
3. Add case to `ThemeRenderer`
4. Create Storybook story
5. Extract reusable behaviors into custom hooks if applicable

## Don't

- Don't put mock data in `data/` folder - use `mocks/`
- Don't put helper functions in mock files - use `utils/`
- Don't mix utils from different domains in one file
- Don't embed configuration directly in entity types - use separate linking objects
- Don't create `index.ts` barrel files - import directly from source files
- Don't use string literals for fixed value sets - use enums
- Don't guess package versions - check package.json
- Don't put page implementation logic in `src/app/` - use `src/ui/pages/` components
- Don't create components without stories - every component needs a `.stories.tsx` file
- Don't create Storybook stories for pages - pages should be tested with E2E tests instead
- Don't apply theme system to home page - home page uses standard TripCard components
- Don't try to implement all themes at once - themes are added incrementally one by one
- Don't hardcode URLs - use route builders from `utils/route.ts`
- Don't hardcode theme behavior - use config from `theme-config.ts`
- Don't specify unused config options - only include what the theme actually uses
- Don't use inline Tailwind classes - create SCSS modules (`.module.scss`) with `@apply`
- Don't use `@import` in SCSS - use `@reference` for globals
- Don't use plain `<img>` tags - always use Next.js `<Image>` from `next/image` for lazy loading, optimization, and correct `sizes` hints
- Don't commit design plans or documentation in `docs/plans/` - create them locally for planning, but delete them after implementation is complete

## When Adding Dependencies

When installing packages, tools, MCP servers, or any external dependencies:
1. Inform the user what you're adding and why
2. Update this file's Tech Stack table with the new dependency and version
3. Update the Iteration Log with what was added

## Iteration Log

**What to log**: Only architectural changes and significant additions:
- New folder structures or major file reorganizations
- New patterns or abstractions introduced
- Data flow changes
- New dependencies
- New conventions

**What NOT to log**: Implementation details like minor bug fixes, simple renames, things that remain unchanged, or minor code improvements.

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