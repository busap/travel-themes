import { useEffect, useState, RefObject } from "react";

interface UseScrollBasedRevealOptions {
	containerRef: RefObject<HTMLElement | null>;
	enabled: boolean;
	totalItems: number;
	itemCount?: number;
	/** How many items ahead of the rightmost visible item to pre-mount. */
	mountAhead?: number;
}

export interface UseScrollBasedRevealResult {
	/** Items that are currently in the scroll container's viewport. */
	visibleItems: Set<number>;
	/**
	 * Items that should be mounted in the DOM (superset of visibleItems).
	 * Includes a lookahead window so upcoming cards start rendering before
	 * the user reaches them.
	 */
	mountedItems: Set<number>;
}

export function useScrollBasedReveal({
	containerRef,
	enabled,
	totalItems,
	itemCount,
	mountAhead = 6,
}: UseScrollBasedRevealOptions): UseScrollBasedRevealResult {
	const count = itemCount ?? totalItems;

	const getInitialVisible = (): Set<number> => {
		if (!enabled) return new Set(Array.from({ length: count }, (_, i) => i));
		return new Set<number>();
	};

	const getInitialMounted = (): Set<number> => {
		if (!enabled) return new Set(Array.from({ length: count }, (_, i) => i));
		// Pre-mount the first batch so the initial render is not empty
		return new Set(
			Array.from({ length: Math.min(mountAhead + 2, count) }, (_, i) => i)
		);
	};

	const [visibleItems, setVisibleItems] =
		useState<Set<number>>(getInitialVisible);
	const [mountedItems, setMountedItems] =
		useState<Set<number>>(getInitialMounted);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled) return;

		const handleScroll = () => {
			const items = container.querySelectorAll("[data-photo-index]");
			const newlyVisible: number[] = [];

			items.forEach((item) => {
				const index = parseInt(
					item.getAttribute("data-photo-index") || "0"
				);
				const rect = item.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();

				if (
					rect.left < containerRect.right &&
					rect.right > containerRect.left
				) {
					newlyVisible.push(index);
				}
			});

			if (newlyVisible.length === 0) return;

			const maxVisible = Math.max(...newlyVisible);

			setVisibleItems((prev) => {
				const next = new Set(prev);
				newlyVisible.forEach((i) => next.add(i));
				return next;
			});

			setMountedItems((prev) => {
				const mountTarget = Math.min(
					maxVisible + mountAhead,
					totalItems - 1
				);
				// Already covers everything up to mountTarget
				if (prev.has(mountTarget)) return prev;
				const next = new Set(prev);
				for (let i = 0; i <= mountTarget; i++) next.add(i);
				return next;
			});
		};

		handleScroll();
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [containerRef, enabled, mountAhead, totalItems]);

	return { visibleItems, mountedItems };
}
