"use client";

import { useSyncExternalStore } from "react";

// `(hover: none)` is the reliable "this is a touch device" signal: it asks
// whether the primary input can hover at all, so hover-driven interactions must
// be replaced with tap-driven ones. Phones and tablets match; a mouse doesn't.
const TOUCH_QUERY = "(hover: none)";

function subscribe(callback: () => void) {
	const query = window.matchMedia(TOUCH_QUERY);
	query.addEventListener("change", callback);
	return () => query.removeEventListener("change", callback);
}

function getSnapshot() {
	return window.matchMedia(TOUCH_QUERY).matches;
}

// Server-rendered markup always assumes hover, so a touch device swaps to its
// tap behaviour on hydration rather than mismatching the HTML.
function getServerSnapshot() {
	return false;
}

export function useIsTouch(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
