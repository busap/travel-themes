import { useEffect, useState, RefObject } from "react";

interface UseScrollBasedRevealOptions {
	containerRef: RefObject<HTMLElement | null>;
	enabled: boolean;
	totalItems: number;
	itemCount?: number;
	/** How many items ahead of the rightmost visible item to pre-mount. */
	mountAhead?: number;
	/** How many items behind the leftmost visible item to keep mounted. */
	mountBehind?: number;
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
	mountBehind = 3,
}: UseScrollBasedRevealOptions): UseScrollBasedRevealResult {
	const count = itemCount ?? totalItems;

	const getInitialVisible = (): Set<number> => {
		if (!enabled)
			return new Set(Array.from({ length: count }, (_, i) => i));
		return new Set<number>();
	};

	const getInitialMounted = (): Set<number> => {
		if (!enabled)
			return new Set(Array.from({ length: count }, (_, i) => i));
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
			const minVisible = Math.min(...newlyVisible);

			setVisibleItems((prev) => {
				const next = new Set(prev);
				newlyVisible.forEach((i) => next.add(i));
				return next;
			});

			setMountedItems((prev) => {
				const windowStart = Math.max(0, minVisible - mountBehind);
				const windowEnd = Math.min(count - 1, maxVisible + mountAhead);

				const next = new Set<number>();
				for (let i = windowStart; i <= windowEnd; i++) {
					next.add(i);
				}

				// Avoid unnecessary state updates when window is unchanged.
				if (next.size === prev.size) {
					let same = true;
					for (const index of next) {
						if (!prev.has(index)) {
							same = false;
							break;
						}
					}
					if (same) return prev;
				}

				return next;
			});
		};

		handleScroll();
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [containerRef, count, enabled, mountAhead, mountBehind]);

	return { visibleItems, mountedItems };
}
