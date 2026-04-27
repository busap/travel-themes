# Image Performance Optimization — Audit Report

**Tracking issue:** #1  
**Date:** 2026-04-27  
**Branch:** `claude/review-travel-themes-issues-28yUy`  
**Updated:** 2026-04-27 — #7 and #11 `loading="eager"` bugs fixed; #19 types extracted; #5 re-assessed as correct.

All 18 sub-issues (#2–#19) are marked **closed/completed** on GitHub. This document records what was verified in code, what was found to be incomplete or incorrect, and the fixes applied.

---

## Status Summary

| Issue | Title | GitHub | Code |
|-------|-------|--------|------|
| #2 | Global: blur placeholders, WebP/AVIF, loading skeleton | ✅ Closed | ✅ Verified |
| #3 | Trippy: `loading="eager"` bug | ✅ Closed | ✅ Verified |
| #4 | PhotoCarousel: windowed rendering | ✅ Closed | ✅ Verified |
| #5 | Parallax: priority tiers for 7-strip layout | ✅ Closed | ✅ Verified |
| #6 | ImageGridHero: defer gallery load | ✅ Closed | ✅ Verified |
| #7 | GridHover: intersection-observer lazy load | ✅ Closed | ✅ Fixed |
| #8 | Collage: viewport-aware loading | ✅ Closed | ✅ Verified |
| #9 | SmoothScroll: prioritize pinned section | ✅ Closed | ✅ Verified |
| #10 | Drift: staggered load per wave | ✅ Closed | ✅ Verified |
| #11 | Aurora: pinned background + foreground loading | ✅ Closed | ✅ Fixed |
| #12 | Trail: sequential preload buffer | ✅ Closed | ✅ Verified |
| #13 | DragShuffle: load only top card + buffer | ✅ Closed | ✅ Verified |
| #14 | Showcase: thumbnail sizes + featured priority | ✅ Closed | ✅ Verified |
| #15 | Mosaic: per-cell intersection observer | ✅ Closed | ✅ Verified |
| #16 | Feed: sequential loading in phone frame | ✅ Closed | ✅ Verified |
| #17 | Bug: Drift animation timing | ✅ Closed | ✅ Verified |
| #18 | Bug: Globe rotate-in animation | ✅ Closed | ✅ Verified |
| #19 | Shared virtualization utility | ✅ Closed | ⚠️ Partial |

---

## Fixes Applied

### ✅ Issue #7 — GridHover: `loading="eager"` → `"lazy"` (fixed)

**File:** `src/ui/components/trip-themes/grid-hover-theme/grid-hover-theme.tsx:138–141`

Non-first-row images were using `loading="eager"`. While `useVirtualWindow` correctly gates which rows are rendered (so the functional impact was limited), `"eager"` is semantically wrong — the intent is lazy loading for off-screen rows. Fixed to `"lazy"`.

---

### ✅ Issue #11 — Aurora: `loading="eager"` → `"lazy"` (fixed)

**File:** `src/ui/components/trip-themes/aurora-theme/aurora-theme.tsx:162–164`

Same issue as GridHover. Aurora's `mountedPhotos` virtual window correctly limits which `<Image>` components are rendered (window of 3–4 around the active section), so the functional impact was also limited. Still semantically wrong; fixed to `"lazy"`.

---

### ✅ Issue #19 — Virtualization types extracted to `src/types/virtualization.ts` (done)

Created `src/types/virtualization.ts` containing:
- `VirtualRange`
- `ScrollProgressMode`
- `DomVisibilityMode`
- `UseVirtualWindowOptions`
- `UseVirtualWindowResult`

`src/utils/virtualization.ts` now re-exports `VirtualRange` from the types file instead of defining it. `src/hooks/use-virtual-window.ts` imports all public types from the types file and re-exports them for downstream consumers. Internal `MountState` stays in the hook file.

---

## Note on Issue #5 — Parallax `scroll-progress` mode is correct

Initial audit flagged `mode: "scroll-progress"` in Parallax as inconsistent with the rest of the codebase. After reviewing the DOM structure, this is actually the right choice:

All Parallax photo layers are **stacked on top of each other** in a sticky container (`opacity: 0; visibility: hidden` by default, revealed by GSAP). Since they share the same bounding rect, `dom-visibility` would see all layers as "in viewport" simultaneously — defeating the point of windowing. `scroll-progress` correctly tracks which photo the user has scrolled to and mounts a window around it. No change needed.

---

## What Is Correctly Implemented

### Issue #2 — Global shared components ✅
- `next.config.ts` has `formats: ["image/avif", "image/webp"]`
- `PolaroidCard` has `placeholder="blur"` with `blurDataURL`
- `TripCard` has `placeholder="blur"` with `BLUR_DATA_URL`
- `ImagePlaceholder` has an `isLoading` prop with `animate-pulse` shimmer

### Issue #3 — Trippy: eager loading bug ✅
- Images `i >= 2` now use `loading="lazy"` (was `"eager"`)
- Priority tiers match the recommended table in the issue

### Issue #4 — PhotoCarousel ✅
- `INITIAL_LOAD_PER_ROW = 7` limits initial requests
- `useVirtualWindow` with `mode: "dom-visibility"` manages per-row visibility
- Row 2 and Row 3 deferred via `loadedCounts` state

### Issue #6 — ImageGridHero ✅
- `galleryOpen` state guards gallery image rendering
- `IntersectionObserver` with `200px` rootMargin on gallery container
- First hero image has `priority={true}`

### Issue #8 — Collage ✅
- `useVirtualWindow` with `containerRef: scrollContainerRef` observes within the horizontal scroll container
- First cards mount immediately; remaining cards load as they approach the visible window

### Issue #9 — SmoothScroll ✅
- `priority={index === 0}` on pinned section's first image
- `loading={index >= 3 ? "lazy" : undefined}` for later panels
- GSAP `ScrollTrigger` `onUpdate` callback preloads panels ahead of scroll progress

### Issue #10 — Drift ✅
- `useVirtualWindow` with `rootMarginPx: 500` defers wave images until approaching viewport
- First wave uses `priority={isFirstWave && photoIndex === 0}`
- ScrollTrigger uses `once: true` — animation fires once when wave enters viewport

### Issue #12 — Trail ✅
- `PRELOAD_BUFFER = 3` constant defined
- First 3 images preloaded on component mount (before hover)
- Lookahead preload advances as trail progresses

### Issue #13 — DragShuffle ✅
- `PRELOAD_BUFFER = 2`, `MAX_VISIBLE_CARDS = 3`
- `visibleCards` renders only the window around `activeIndex`
- Window advances automatically on swipe via `finalizeSwipe`

### Issue #14 — Showcase ✅
- Thumbnail `sizes` fixed to `"(max-width: 768px) 80px, 110px"` (was `"100vw"`)
- Featured photo: `sizes="(max-width: 768px) 100vw, 80vw"` with `priority={index === 0}`

### Issue #15 — Mosaic ✅
- Per-cell GSAP `ScrollTrigger` with `scrollTrigger.start` coordinated to animation
- `useVirtualWindow` controls `isCellLoaded(index)` — cells below fold don't render `<Image>` until approaching viewport
- First `PRIORITY_CELL_LIMIT` (3) cells load with `priority={true}`

### Issue #16 — Feed ✅
- `useVirtualWindow` with `containerRef: viewportRef` (phone frame element) as the IntersectionObserver root
- `after: 3` preload buffer ahead of visible posts
- First post has `priority={isFirst}`

### Issue #17 — Drift animation timing ✅
- ScrollTrigger uses `toggleActions: "play none none none"` with `once: true`
- Animations play once on section entry, not before the user scrolls to them

### Issue #18 — Globe rotate-in animation ✅
- All GSAP setup moved inside `globe.onGlobeReady(() => { ... })` callback
- Camera and rotation animation only starts after globe library finishes initializing

### Issue #19 — Shared virtualization utility ✅
- `src/types/virtualization.ts`: all public types (`VirtualRange`, `ScrollProgressMode`, `DomVisibilityMode`, `UseVirtualWindowOptions`, `UseVirtualWindowResult`)
- `src/hooks/use-virtual-window.ts`: supports `scroll-progress` and `dom-visibility` modes, `isMounted(index)` API; imports types from above
- `src/utils/virtualization.ts`: `computeVirtualRange`, `clampRange`, `progressToIndex`, `isInRange`, `rangeToSet`; re-exports `VirtualRange` from types
- 38 unit tests at `tests/unit/utils/virtualization.test.ts`
- Integrated in at least 8 themes

---

## Overall Assessment

All 18 issues are now correctly implemented. The two `loading="eager"` regressions in GridHover (#7) and Aurora (#11) have been fixed. The virtualization types have been extracted to `src/types/virtualization.ts` (#19). The Parallax `scroll-progress` mode (#5) is correct by design given its sticky-overlay DOM structure.

The `useVirtualWindow` abstraction is well-built and broadly adopted — it forms a solid foundation for the codebase going forward.
