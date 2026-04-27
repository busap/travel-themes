# Image Performance Optimization — Audit Report

**Tracking issue:** #1  
**Date:** 2026-04-27  
**Branch:** `claude/review-travel-themes-issues-28yUy`

All 18 sub-issues (#2–#19) are marked **closed/completed** on GitHub. This document records what was verified in code, what was found to be incomplete or incorrect, and recommendations.

---

## Status Summary

| Issue | Title | GitHub | Code |
|-------|-------|--------|------|
| #2 | Global: blur placeholders, WebP/AVIF, loading skeleton | ✅ Closed | ✅ Verified |
| #3 | Trippy: `loading="eager"` bug | ✅ Closed | ✅ Verified |
| #4 | PhotoCarousel: windowed rendering | ✅ Closed | ✅ Verified |
| #5 | Parallax: priority tiers for 7-strip layout | ✅ Closed | ⚠️ Partial |
| #6 | ImageGridHero: defer gallery load | ✅ Closed | ✅ Verified |
| #7 | GridHover: intersection-observer lazy load | ✅ Closed | ❌ Bug remains |
| #8 | Collage: viewport-aware loading | ✅ Closed | ✅ Verified |
| #9 | SmoothScroll: prioritize pinned section | ✅ Closed | ✅ Verified |
| #10 | Drift: staggered load per wave | ✅ Closed | ✅ Verified |
| #11 | Aurora: pinned background + foreground loading | ✅ Closed | ❌ Bug remains |
| #12 | Trail: sequential preload buffer | ✅ Closed | ✅ Verified |
| #13 | DragShuffle: load only top card + buffer | ✅ Closed | ✅ Verified |
| #14 | Showcase: thumbnail sizes + featured priority | ✅ Closed | ✅ Verified |
| #15 | Mosaic: per-cell intersection observer | ✅ Closed | ✅ Verified |
| #16 | Feed: sequential loading in phone frame | ✅ Closed | ✅ Verified |
| #17 | Bug: Drift animation timing | ✅ Closed | ✅ Verified |
| #18 | Bug: Globe rotate-in animation | ✅ Closed | ✅ Verified |
| #19 | Shared virtualization utility | ✅ Closed | ⚠️ Partial |

---

## Bugs Found in Closed Issues

### ❌ Issue #7 — GridHover: `loading="eager"` still present

**File:** `src/ui/components/trip-themes/grid-hover-theme/grid-hover-theme.tsx:138–141`

**Problem:** Non-first-row images still use `loading="eager"`, which is the exact bug that was supposed to be fixed. This forces the browser to eagerly fetch all off-screen grid cell images on mount, defeating the purpose of the `useVirtualWindow` integration.

```tsx
// Current (wrong):
loading={
  rowIndex < INITIAL_VISIBLE_ROWS
    ? undefined
    : "eager"   // ← should be "lazy"
}

// Fix:
loading={
  rowIndex < INITIAL_VISIBLE_ROWS
    ? undefined
    : "lazy"
}
```

**Acceptance criteria not met:**
- Images below the fold do not load until their row enters the viewport — **FAILS** (eager loading bypasses this)

---

### ❌ Issue #11 — Aurora: `loading="eager"` instead of `"lazy"`

**File:** `src/ui/components/trip-themes/aurora-theme/aurora-theme.tsx:162–164`

**Problem:** Non-first foreground images use `loading="eager"`, causing all off-screen photos in the Aurora pin sequence to be fetched on mount. This is the same class of bug as GridHover.

```tsx
// Current (wrong):
loading={
  index === 0 ? undefined : "eager"   // ← should be "lazy"
}

// Fix:
loading={
  index === 0 ? undefined : "lazy"
}
```

**Acceptance criteria not met:**
- Subsequent photos load just-in-time via GSAP callbacks — **FAILS** (all load immediately on mount)

---

## Partial Implementations

### ⚠️ Issue #5 — Parallax: no per-strip IntersectionObserver for strips 3–6

**File:** `src/ui/components/trip-themes/parallax-theme/parallax-theme.tsx:87–88`

The issue specified wrapping strips 3–6 in an IntersectionObserver to defer image loading until the strip approaches the viewport. The implementation instead uses `useVirtualWindow` with `mode: "scroll-progress"`, which is scroll-position math rather than DOM visibility observation.

**Why this matters:** `scroll-progress` mode is coupled to the current scroll position and may not defer strip 3–6 images correctly if the user has a very tall viewport or if scroll calculations differ from element visibility. An explicit `dom-visibility` mode with per-strip `containerRef` would be more reliable.

**Recommendation:** Switch the Parallax `useVirtualWindow` call to `mode: "dom-visibility"` with each strip's ref as the container root and a `rootMargin` of `"400px 0px"` to preload one strip ahead — consistent with how Collage, Feed, and GridHover are implemented.

---

### ⚠️ Issue #19 — Virtualization utility: no dedicated types file

The issue specified creating `src/types/virtualization-config.ts` as a dedicated types file. The types (`UseVirtualWindowOptions`, `UseVirtualWindowResult`, `VirtualWindowMode`) are currently defined inline inside `src/hooks/use-virtual-window.ts`.

This is a minor organizational gap. The utility is otherwise complete and well-tested (38 unit tests covering all range math edge cases). Multiple themes (`PhotoCarousel`, `Collage`, `GridHover`, `Mosaic`, `Feed`, `Aurora`, `Drift`, `Parallax`) are integrated.

**Recommendation:** Extract the types to `src/types/virtualization.ts` (or keep them in the hook file — the inline definition is acceptable if no external consumers need to import the types independently).

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

### Issue #19 — Shared virtualization utility ✅ (core)
- `src/hooks/use-virtual-window.ts`: supports `scroll-progress` and `dom-visibility` modes, `isMounted(index)` API
- `src/utils/virtualization.ts`: `computeVirtualRange`, `clampRange`, `progressToIndex`, `isInRange`, `rangeToSet`
- 38 unit tests at `tests/unit/utils/virtualization.test.ts`
- Integrated in at least 8 themes

---

## Recommendations (Priority Order)

| Priority | Action | File | Issue |
|----------|--------|------|-------|
| **P0** | Fix `loading="eager"` → `"lazy"` in GridHover | `grid-hover-theme.tsx:141` | #7 |
| **P0** | Fix `loading="eager"` → `"lazy"` in Aurora | `aurora-theme.tsx:163` | #11 |
| **P1** | Switch Parallax to `mode: "dom-visibility"` for strip-level deferral | `parallax-theme.tsx:88` | #5 |
| **P2** | Extract virtualization types to `src/types/virtualization.ts` | new file | #19 |
| **P2** | Close parent tracking issue #1 after P0 fixes are merged | GitHub | #1 |

---

## Overall Assessment

**16 of 18 issues** are correctly implemented in code. Two issues (#7 and #11) contain a `loading="eager"` regression that directly contradicts the fix each issue was meant to deliver — both are one-line fixes. One issue (#5) has a functionally reasonable but architecturally inconsistent approach compared to the rest of the codebase. Issue #19 is complete in substance with a minor file organization gap.

The `useVirtualWindow` abstraction is well-built and broadly adopted — it forms a solid foundation for the codebase going forward.
