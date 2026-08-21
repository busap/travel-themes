"use client";

import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { useCallback, useRef } from "react";
import { getCountryNames } from "@/utils/country";
import Image from "next/image";
import { Syne, Space_Grotesk } from "next/font/google";
import { useVirtualWindow } from "@/hooks/use-virtual-window";
import styles from "./grid-hover-theme.module.scss";

const syne = Syne({
	subsets: ["latin"],
	weight: ["700", "800"],
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400"],
	display: "swap",
});

interface GridHoverThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

const GRID_COLS = 6;
const MIN_ROWS_WHEN_EMPTY = 5;
const MIN_CELLS_WHEN_EMPTY = GRID_COLS * MIN_ROWS_WHEN_EMPTY;
const INITIAL_VISIBLE_ROWS = 3;

// Half the spotlight element's size (see .spotlight in the SCSS) — used to
// centre it on the cursor via a transform.
const SPOTLIGHT_HALF_W = 520;
const SPOTLIGHT_HALF_H = 400;

export function GridHoverTheme({ trip }: GridHoverThemeProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const spotlightRef = useRef<HTMLDivElement | null>(null);
	const pointerRef = useRef({ x: 0.5, y: 0.5 });
	const rafPendingRef = useRef(false);

	const cellCount =
		trip.photos.length > 0 ? trip.photos.length : MIN_CELLS_WHEN_EMPTY;
	const numRows = Math.ceil(cellCount / GRID_COLS);

	// additive: rows are never unmounted once revealed.
	// rootMarginPx mirrors the old IntersectionObserver rootMargin.
	// after: INITIAL_VISIBLE_ROWS - 1 so the initial window covers the first 3 rows.
	const { isMounted: isRowMounted } = useVirtualWindow({
		mode: "dom-visibility",
		count: numRows,
		indexAttr: "data-row-index",
		rootMarginPx: 600,
		additive: true,
		after: INITIAL_VISIBLE_ROWS - 1,
	});

	// Drive the tilt + spotlight imperatively (refs + rAF) instead of through
	// React state — updating state on every mousemove re-rendered all cells and
	// made the effect stutter. The active-cell highlight is pure CSS `:hover`.
	const applyPointer = useCallback(() => {
		rafPendingRef.current = false;
		const { x, y } = pointerRef.current;
		if (wrapperRef.current) {
			const rotateX = (y - 0.5) * -10;
			const rotateY = (x - 0.5) * 10;
			wrapperRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		}
		// Move the spotlight with a transform (GPU-composited) rather than
		// repositioning a radial-gradient via CSS vars, which repaints the whole
		// fixed overlay every frame and was the main source of stutter.
		if (spotlightRef.current) {
			const px =
				x * (typeof window !== "undefined" ? window.innerWidth : 0);
			const py =
				y * (typeof window !== "undefined" ? window.innerHeight : 0);
			spotlightRef.current.style.transform = `translate3d(${px - SPOTLIGHT_HALF_W}px, ${py - SPOTLIGHT_HALF_H}px, 0)`;
		}
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const w = typeof window !== "undefined" ? window.innerWidth : 1;
			const h = typeof window !== "undefined" ? window.innerHeight : 1;
			pointerRef.current = { x: e.clientX / w, y: e.clientY / h };
			if (!rafPendingRef.current) {
				rafPendingRef.current = true;
				requestAnimationFrame(applyPointer);
			}
		},
		[applyPointer]
	);

	const handleMouseEnter = useCallback(() => {
		if (wrapperRef.current) {
			wrapperRef.current.style.transition = "transform 0.08s ease-out";
		}
	}, []);

	const handleMouseLeave = useCallback(() => {
		pointerRef.current = { x: 0.5, y: 0.5 };
		if (wrapperRef.current) {
			wrapperRef.current.style.transition = "transform 0.7s ease-out";
			wrapperRef.current.style.transform =
				"perspective(1200px) rotateX(0deg) rotateY(0deg)";
		}
		if (spotlightRef.current) {
			spotlightRef.current.style.transform =
				"translate3d(-9999px, -9999px, 0)";
		}
	}, []);

	const renderHero = () => (
		<section
			className={styles.hero}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div ref={spotlightRef} className={styles.spotlight} />

			<div ref={wrapperRef} className={styles.perspectiveWrapper}>
				<div className={styles.grid}>
					{Array.from({ length: cellCount }, (_, cellIndex) => {
						const photo = trip.photos[cellIndex];
						const showPhoto = !!photo;
						const rowIndex = Math.floor(cellIndex / GRID_COLS);
						const isFirstInRow = cellIndex % GRID_COLS === 0;

						return (
							<div
								key={cellIndex}
								data-row-index={
									isFirstInRow ? rowIndex : undefined
								}
								className={[
									styles.cell,
									showPhoto ? styles.hasPhoto : "",
								].join(" ")}
							>
								{showPhoto && isRowMounted(rowIndex) && (
									<div className={styles.photoReveal}>
										<Image
											src={photo!.src}
											alt={
												photo!.title ||
												`Photo ${cellIndex + 1}`
											}
											fill
											sizes="(max-width: 768px) 25vw, 17vw"
											style={{ objectFit: "cover" }}
											priority={
												rowIndex < INITIAL_VISIBLE_ROWS
											}
											loading={
												rowIndex < INITIAL_VISIBLE_ROWS
													? undefined
													: "lazy"
											}
										/>
										<div className={styles.photoSheen} />
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className={styles.titleLayer}>
				<p className={`${styles.eyebrow} ${spaceGrotesk.className}`}>
					{getCountryNames(trip.countries, " · ")}
					{trip.year ? ` · ${trip.year}` : ""}
				</p>
				<h1 className={`${styles.title} ${syne.className}`}>
					{trip.name}
				</h1>
				<p className={`${styles.hint} ${spaceGrotesk.className}`}>
					move to explore
				</p>
			</div>
		</section>
	);

	return <div className={styles.theme}>{renderHero()}</div>;
}
