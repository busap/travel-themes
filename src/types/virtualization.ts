import { RefObject } from "react";

export interface VirtualRange {
	start: number;
	end: number;
}

export interface ScrollProgressMode {
	mode: "scroll-progress";
	count: number;
	totalScrollHeight: number;
	containerRef: RefObject<HTMLElement | null>;
	before?: number;
	after?: number;
	additive?: boolean;
}

export interface DomVisibilityMode {
	mode: "dom-visibility";
	count: number;
	containerRef?: RefObject<HTMLElement | null>;
	indexAttr?: string;
	rootMarginPx?: number;
	additive?: boolean;
	before?: number;
	after?: number;
}

export type UseVirtualWindowOptions = ScrollProgressMode | DomVisibilityMode;

export interface UseVirtualWindowResult {
	focusIndex: number;
	isMounted: (index: number) => boolean;
}
