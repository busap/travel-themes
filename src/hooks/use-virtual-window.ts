import { useEffect, useRef, useState, RefObject } from "react";
import {
	VirtualRange,
	clampProgress,
	computeVirtualRange,
	isInRange,
	progressToIndex,
} from "@/utils/virtualization";

export type { VirtualRange };

export interface UseVirtualWindowOptions {
	/** Total number of items. */
	count: number;
	/** Total pixel height of the scroll sequence (used to compute progress). */
	totalScrollHeight: number;
	/** Ref to the element whose offsetTop anchors the scroll math. */
	containerRef: RefObject<HTMLElement | null>;
	/** Items visible on either side of the focused index (active window). */
	overscanBehind?: number;
	overscanAhead?: number;
	/** Extra items to keep mounted beyond the active window (for preloading). */
	mountBufferBehind?: number;
	mountBufferAhead?: number;
	/** Set to false to disable windowing (all items treated as in range). */
	enabled?: boolean;
}

export interface UseVirtualWindowResult {
	focusIndex: number;
	activeRange: VirtualRange;
	mountedRange: VirtualRange;
	/** True when index falls within the active (visible) window. */
	isActive: (index: number) => boolean;
	/** True when index falls within the mounted (preload) window. */
	isMounted: (index: number) => boolean;
}

interface WindowState {
	focusIndex: number;
	activeRange: VirtualRange;
	mountedRange: VirtualRange;
}

function buildState(
	focusIndex: number,
	count: number,
	overscanBehind: number,
	overscanAhead: number,
	mountBufferBehind: number,
	mountBufferAhead: number
): WindowState {
	return {
		focusIndex,
		activeRange: computeVirtualRange(focusIndex, overscanBehind, overscanAhead, count),
		mountedRange: computeVirtualRange(
			focusIndex,
			overscanBehind + mountBufferBehind,
			overscanAhead + mountBufferAhead,
			count
		),
	};
}

export function useVirtualWindow({
	count,
	totalScrollHeight,
	containerRef,
	overscanBehind = 1,
	overscanAhead = 2,
	mountBufferBehind = 1,
	mountBufferAhead = 2,
	enabled = true,
}: UseVirtualWindowOptions): UseVirtualWindowResult {
	const [state, setState] = useState<WindowState>(() =>
		buildState(0, count, overscanBehind, overscanAhead, mountBufferBehind, mountBufferAhead)
	);

	// Track last state in a ref to skip unnecessary renders.
	const lastStateRef = useRef(state);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled || count <= 0) return;

		const update = () => {
			const scrollRange = Math.max(totalScrollHeight, 1);
			const rawProgress = (window.scrollY - container.offsetTop) / scrollRange;
			const focus = progressToIndex(clampProgress(rawProgress), count);
			const next = buildState(
				focus,
				count,
				overscanBehind,
				overscanAhead,
				mountBufferBehind,
				mountBufferAhead
			);

			const prev = lastStateRef.current;
			if (
				prev.focusIndex === next.focusIndex &&
				prev.activeRange.start === next.activeRange.start &&
				prev.activeRange.end === next.activeRange.end &&
				prev.mountedRange.start === next.mountedRange.start &&
				prev.mountedRange.end === next.mountedRange.end
			) {
				return;
			}

			lastStateRef.current = next;
			setState(next);
		};

		const onScrollOrResize = () => window.requestAnimationFrame(update);

		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		window.addEventListener("resize", onScrollOrResize);
		window.requestAnimationFrame(update);

		return () => {
			window.removeEventListener("scroll", onScrollOrResize);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [
		count,
		totalScrollHeight,
		containerRef,
		overscanBehind,
		overscanAhead,
		mountBufferBehind,
		mountBufferAhead,
		enabled,
	]);

	return {
		focusIndex: state.focusIndex,
		activeRange: state.activeRange,
		mountedRange: state.mountedRange,
		isActive: (index) => isInRange(index, state.activeRange),
		isMounted: (index) => isInRange(index, state.mountedRange),
	};
}
