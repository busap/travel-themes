# TravelThemes - Agent Instructions

> Instructions for AI agents working on this project.

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Route group for home page
│   └── trips/[id]/        # Dynamic trip routes
├── ui/
│   ├── pages/             # Page components (E2E tested, no stories)
│   └── components/        # Reusable components (with .stories.tsx)
│       └── trip-themes/
├── config/                 # Route and theme configuration
├── enums/                  # Enums (one per file)
├── hooks/                  # Custom React hooks
├── mocks/                  # Mock data only
├── types/                  # Type definitions (one per file)
└── utils/                  # Helper functions (grouped by domain)
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

**Flow**: Trip ID -> `getThemeForTrip()` -> Theme enum -> `getThemeConfig()` -> ThemeRenderer -> Theme component

**Rules**:
- Themes are config-driven via `theme-config.ts`, not hardcoded
- Extract config values as constants at the top of the component
- Only specify config options that the theme actually uses (all ThemeConfig fields are optional)
- Themes are implemented incrementally, one at a time

**Adding a theme**: Create component in `src/ui/components/trip-themes/{name}/`, update `theme-config.ts`, add case to ThemeRenderer, create story, extract reusable hooks if applicable.

## Don't

- Don't put helper functions in mock files — use `src/utils/`
- Don't mix utils from different domains in one file
- Don't embed config in entity types — use separate composition/linking objects
- Don't use plain `<img>` tags — use Next.js `<Image>`
