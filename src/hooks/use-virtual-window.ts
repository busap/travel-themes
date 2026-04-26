"use client";

import { useEffect, useRef, useState, RefObject } from "react";
import { clampProgress, clampRange, isInRange, progressToIndex, VirtualRange } from "@/utils/virtualization";

export type { VirtualRange };

/**
 * Scroll-progress mode: derive focus index from global scroll position within a
 * fixed scroll height (e.g. a sticky-scroll sequence like the Parallax theme).
 */
interface ScrollProgressMode {
	mode: "scroll-progress";
	count: number;
	totalScrollHeight: number;
	/** Element whose offsetTop anchors the scroll math. */
	containerRef: RefObject<HTMLElement | null>;
	before?: number;
	after?: number;
	/**
	 * When true the mount window never shrinks — items are never unmounted
	 * once they've entered it. Trades memory for flicker-free backward scroll.
	 */
	additive?: boolean;
}

/**
 * DOM-visibility mode: query [data-virtual-index] elements inside a scroll
 * container (or the window) to detect which items are currently in view, then
 * maintain a sliding mount window around them.
 */
interface DomVisibilityMode {
	mode: "dom-visibility";
	count: number;
	/** Scroll container. Omit to use window scroll. */
	containerRef?: RefObject<HTMLElement | null>;
	/** Data attribute that holds the item index. Default: "data-virtual-index". */
	indexAttr?: string;
	/**
	 * Expand the detection area by this many pixels (mirrors IntersectionObserver
	 * rootMargin). Useful for pre-mounting rows before they scroll into view.
	 */
	rootMarginPx?: number;
	/**
	 * When true the mount window never slides backward — items are never unmounted
	 * once they've been revealed (monotonic / additive reveal).
	 */
	additive?: boolean;
	before?: number;
	after?: number;
}

export type UseVirtualWindowOptions = ScrollProgressMode | DomVisibilityMode;

export interface UseVirtualWindowResult {
	focusIndex: number;
	isMounted: (index: number) => boolean;
}

const DEFAULT_BEFORE = 2;
const DEFAULT_AFTER = 3;

interface MountState {
	focusIndex: number;
	mountedRange: VirtualRange;
}

export function useVirtualWindow(opts: UseVirtualWindowOptions): UseVirtualWindowResult {
	const { count } = opts;
	const before = opts.before ?? DEFAULT_BEFORE;
	const after = opts.after ?? DEFAULT_AFTER;

	// Flatten discriminated-union fields so they're stable deps without casting at each use.
	const mode = opts.mode;
	const containerRef = mode === "scroll-progress"
		? opts.containerRef
		: (opts as DomVisibilityMode).containerRef;
	const totalScrollHeight = mode === "scroll-progress" ? opts.totalScrollHeight : 0;
	const indexAttr = mode === "dom-visibility"
		? ((opts as DomVisibilityMode).indexAttr ?? "data-virtual-index")
		: "data-virtual-index";
	const rootMarginPx = mode === "dom-visibility"
		? ((opts as DomVisibilityMode).rootMarginPx ?? 0)
		: 0;
	const additive = mode === "dom-visibility"
		? ((opts as DomVisibilityMode).additive ?? false)
		: ((opts as ScrollProgressMode).additive ?? false);

	const [state, setState] = useState<MountState>(() => ({
		focusIndex: 0,
		mountedRange: clampRange({ start: -before, end: after }, count),
	}));

	const lastStateRef = useRef(state);

	useEffect(() => {
		if (count <= 0) return;

		const commit = (next: MountState) => {
			const prev = lastStateRef.current;
			if (
				prev.focusIndex === next.focusIndex &&
				prev.mountedRange.start === next.mountedRange.start &&
				prev.mountedRange.end === next.mountedRange.end
			) return;
			lastStateRef.current = next;
			setState(next);
		};

		if (mode === "scroll-progress") {
			const container = containerRef?.current;
			if (!container) return;

			const update = () => {
				const focus = progressToIndex(
					clampProgress((window.scrollY - container.offsetTop) / Math.max(totalScrollHeight, 1)),
					count
				);
				const proposed = clampRange({ start: focus - before, end: focus + after }, count);
				const prevRange = lastStateRef.current.mountedRange;
				const next = additive
					? {
						start: 0,
						end: Math.max(prevRange.end, proposed.end),
					}
					: proposed;
				commit({ focusIndex: focus, mountedRange: next });
			};

			const onEvent = () => window.requestAnimationFrame(update);
			window.addEventListener("scroll", onEvent, { passive: true });
			window.addEventListener("resize", onEvent);
			window.requestAnimationFrame(update);
			return () => {
				window.removeEventListener("scroll", onEvent);
				window.removeEventListener("resize", onEvent);
			};
		}

		// dom-visibility mode
		const container = containerRef?.current ?? null;
		if (containerRef && !container) return; // Container ref provided but not yet mounted.

		const update = () => {
			const liveContainer = containerRef?.current ?? null;
			const elements = liveContainer
				? liveContainer.querySelectorAll(`[${indexAttr}]`)
				: document.querySelectorAll(`[${indexAttr}]`);

			const containerRect = liveContainer?.getBoundingClientRect() ?? null;
			const visible: number[] = [];

			elements.forEach((el) => {
				const idx = parseInt(el.getAttribute(indexAttr) ?? "0");
				const rect = el.getBoundingClientRect();

				const inH = containerRect
					? rect.left < containerRect.right && rect.right > containerRect.left
					: true;
				const inV = containerRect
					? rect.top < containerRect.bottom + rootMarginPx &&
					  rect.bottom > containerRect.top - rootMarginPx
					: rect.top < window.innerHeight + rootMarginPx && rect.bottom > -rootMarginPx;

				if (inH && inV) visible.push(idx);
			});

			if (visible.length === 0) return;

			const minVisible = Math.min(...visible);
			const maxVisible = Math.max(...visible);

			const prevRange = lastStateRef.current.mountedRange;
			const proposedEnd = Math.min(count - 1, maxVisible + after);
			commit({
				focusIndex: maxVisible,
				mountedRange: {
					start: additive ? 0 : Math.max(0, minVisible - before),
					end: additive ? Math.max(prevRange.end, proposedEnd) : proposedEnd,
				},
			});
		};

		const onEvent = () => window.requestAnimationFrame(update);
		const scrollTarget: EventTarget = container ?? window;
		scrollTarget.addEventListener("scroll", onEvent, { passive: true } as AddEventListenerOptions);
		window.requestAnimationFrame(update);
		return () => scrollTarget.removeEventListener("scroll", onEvent);
	}, [count, before, after, mode, containerRef, totalScrollHeight, indexAttr, rootMarginPx, additive]);

	return {
		focusIndex: state.focusIndex,
		isMounted: (index) => isInRange(index, state.mountedRange),
	};
}
