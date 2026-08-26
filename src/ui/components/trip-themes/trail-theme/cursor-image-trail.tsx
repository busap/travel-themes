"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { resolveImageUrl } from "@/utils/image-url";
import styles from "./cursor-image-trail.module.scss";

const PRELOAD_BUFFER = 3;
// Trail cards are ~330px wide; a 640px derivative stays crisp at 2x DPR.
const TRAIL_IMAGE_WIDTH = 640;
// Touch devices reveal one photo per tap, so cap the on-screen pile lower than
// the pointer trail — taps are deliberate, not a continuous stream.
const TAP_MAX_ITEMS = 12;

const TOUCH_QUERY = "(hover: none)";

function subscribeToTouch(callback: () => void) {
	const query = window.matchMedia(TOUCH_QUERY);
	query.addEventListener("change", callback);
	return () => query.removeEventListener("change", callback);
}

function getTouchSnapshot() {
	return window.matchMedia(TOUCH_QUERY).matches;
}

interface CursorImageTrailProps {
	images: string[];
	spawnThreshold?: number;
	smoothing?: number;
	lifespan?: number;
	maxItems?: number;
}

interface Point {
	x: number;
	y: number;
}

export function CursorImageTrail({
	images,
	spawnThreshold = 80,
	smoothing = 0.13,
	lifespan = 2400,
	maxItems = 20,
}: CursorImageTrailProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mouseRef = useRef<Point>({ x: 0, y: 0 });
	const interpRef = useRef<Point>({ x: 0, y: 0 });
	const lastSpawnRef = useRef<Point>({ x: 0, y: 0 });
	const rafRef = useRef<number | null>(null);
	const imageIndexRef = useRef(0);
	const itemsRef = useRef<HTMLDivElement[]>([]);

	// Touch devices have no hover. Following a finger meant listening to
	// `touchmove`, which fights the browser's own scroll/rubber-band gesture and
	// makes the page jump on iOS — so those devices reveal a photo per tap
	// instead, and never observe the drag at all.
	const isTouch = useSyncExternalStore(
		subscribeToTouch,
		getTouchSnapshot,
		() => false
	);

	useEffect(() => {
		if (typeof window === "undefined" || images.length === 0) return;
		images.slice(0, PRELOAD_BUFFER).forEach((src) => {
			const img = new window.Image();
			img.src = resolveImageUrl(src, TRAIL_IMAGE_WIDTH);
		});
	}, [images]);

	useEffect(() => {
		if (!containerRef.current || images.length === 0) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (prefersReduced) return;

		const container = containerRef.current;
		const itemLimit = isTouch ? TAP_MAX_ITEMS : maxItems;

		const distance = (a: Point, b: Point) => {
			const dx = a.x - b.x;
			const dy = a.y - b.y;
			return Math.hypot(dx, dy);
		};

		const randomness = (min: number, max: number) =>
			min + Math.random() * (max - min);

		// `origin` is where the photo lands (viewport coords); `direction` is the
		// vector it drifts along as it fades in — the pointer's travel on desktop,
		// a random nudge for a tap.
		const spawnItem = (origin: Point, direction: Point) => {
			if (!container) return;

			const rect = container.getBoundingClientRect();

			const xInContainer = origin.x - rect.left;
			const yInContainer = origin.y - rect.top;

			const el = document.createElement("div");
			el.className = styles.item;

			const src = images[imageIndexRef.current % images.length];
			imageIndexRef.current += 1;
			el.style.backgroundImage = `url(${resolveImageUrl(src, TRAIL_IMAGE_WIDTH)})`;

			const preloadSrc =
				images[
					(imageIndexRef.current + PRELOAD_BUFFER - 1) % images.length
				];
			const preloadImg = new window.Image();
			preloadImg.src = resolveImageUrl(preloadSrc, TRAIL_IMAGE_WIDTH);

			// Append before measuring so offsetWidth/Height are real (they're 0
			// pre-insertion), then keep the item fully within the container so it
			// never spills off-screen — important on narrow phones.
			container.appendChild(el);
			itemsRef.current.push(el);

			const itemW = el.offsetWidth;
			const itemH = el.offsetHeight;
			const clampAxis = (value: number, extent: number, size: number) =>
				Math.max(0, Math.min(value, Math.max(0, extent - size)));

			const baseLeft = clampAxis(
				xInContainer - itemW / 2,
				rect.width,
				itemW
			);
			const baseTop = clampAxis(
				yInContainer - itemH / 2,
				rect.height,
				itemH
			);

			const len = Math.hypot(direction.x, direction.y) || 1;
			const normX = direction.x / len;
			const normY = direction.y / len;

			const slideDistance = randomness(24, 60);

			el.style.left = `${baseLeft}px`;
			el.style.top = `${baseTop}px`;
			const rotation = randomness(-12, 12);
			el.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg)`;

			if (itemsRef.current.length > itemLimit) {
				const first = itemsRef.current.shift();
				if (first && first.parentElement === container) {
					container.removeChild(first);
				}
			}

			requestAnimationFrame(() => {
				const targetLeft = clampAxis(
					baseLeft + normX * slideDistance,
					rect.width,
					itemW
				);
				const targetTop = clampAxis(
					baseTop + normY * slideDistance,
					rect.height,
					itemH
				);
				el.style.left = `${targetLeft}px`;
				el.style.top = `${targetTop}px`;
				el.style.opacity = "1";
			});

			window.setTimeout(() => {
				el.style.opacity = "0";
				window.setTimeout(() => {
					if (el.parentElement === container) {
						container.removeChild(el);
					}
				}, 700);
			}, lifespan);
		};

		const cleanupItems = () => {
			itemsRef.current.forEach((el) => {
				if (el.parentElement === container) container.removeChild(el);
			});
			itemsRef.current = [];
		};

		// Tap-to-reveal is bound on every device — a touchscreen laptop reports
		// hover but still gets tapped.
		const handleTouchStart = (event: TouchEvent) => {
			const touch = event.touches[0];
			if (!touch) return;
			const angle = Math.random() * Math.PI * 2;
			spawnItem(
				{ x: touch.clientX, y: touch.clientY },
				{ x: Math.cos(angle), y: Math.sin(angle) }
			);
		};

		window.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});

		// Without hover there's no pointer to follow, so tapping is the whole
		// interaction — skip the mouse listener and its animation loop entirely.
		if (isTouch) {
			return () => {
				window.removeEventListener("touchstart", handleTouchStart);
				cleanupItems();
			};
		}

		const handleMouseMove = (event: MouseEvent) => {
			mouseRef.current = { x: event.clientX, y: event.clientY };
			if (!interpRef.current.x && !interpRef.current.y) {
				interpRef.current = { x: event.clientX, y: event.clientY };
				lastSpawnRef.current = { x: event.clientX, y: event.clientY };
			}
		};

		window.addEventListener("mousemove", handleMouseMove);

		const tick = () => {
			const target = mouseRef.current;
			const current = interpRef.current;

			interpRef.current = {
				x: current.x + (target.x - current.x) * smoothing,
				y: current.y + (target.y - current.y) * smoothing,
			};

			if (
				distance(interpRef.current, lastSpawnRef.current) >
				spawnThreshold
			) {
				lastSpawnRef.current = { ...interpRef.current };
				spawnItem(interpRef.current, {
					x: mouseRef.current.x - interpRef.current.x,
					y: mouseRef.current.y - interpRef.current.y,
				});
			}

			rafRef.current = window.requestAnimationFrame(tick);
		};

		rafRef.current = window.requestAnimationFrame(tick);

		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("mousemove", handleMouseMove);
			if (rafRef.current != null) {
				cancelAnimationFrame(rafRef.current);
			}
			cleanupItems();
		};
	}, [images, spawnThreshold, smoothing, lifespan, maxItems, isTouch]);

	return <div ref={containerRef} className={styles.container} />;
}
