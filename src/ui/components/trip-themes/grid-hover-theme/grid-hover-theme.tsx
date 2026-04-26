"use client";

import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { useState, useCallback } from "react";
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

export function GridHoverTheme({ trip }: GridHoverThemeProps) {
	const [hoveredCell, setHoveredCell] = useState<number | null>(null);
	const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
	const [isHovering, setIsHovering] = useState(false);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

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

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const w = typeof window !== "undefined" ? window.innerWidth : 1;
			const h = typeof window !== "undefined" ? window.innerHeight : 1;
			setMousePos({
				x: e.clientX / w,
				y: e.clientY / h,
			});
		},
		[]
	);

	const rotateX = (mousePos.y - 0.5) * -10;
	const rotateY = (mousePos.x - 0.5) * 10;

	const renderHero = () => (
		<section
			className={styles.hero}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => {
				setIsHovering(false);
				setMousePos({ x: 0.5, y: 0.5 });
				setHoveredCell(null);
			}}
			style={
				{
					"--mouse-x": `${mousePos.x * 100}%`,
					"--mouse-y": `${mousePos.y * 100}%`,
				} as React.CSSProperties
			}
		>
			<div className={styles.spotlight} />

			<div
				className={styles.perspectiveWrapper}
				style={{
					transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
					transition: isHovering
						? "transform 0.08s ease-out"
						: "transform 0.7s ease-out",
				}}
			>
				<div className={styles.grid}>
					{Array.from({ length: cellCount }, (_, cellIndex) => {
						const photo = trip.photos[cellIndex];
						const showPhoto = !!photo;
						const isActive = hoveredCell === cellIndex;
						const rowIndex = Math.floor(cellIndex / GRID_COLS);
						const isFirstInRow = cellIndex % GRID_COLS === 0;
						const isLoaded = loadedImages.has(cellIndex);

						return (
							<div
								key={cellIndex}
								data-row-index={
									isFirstInRow ? rowIndex : undefined
								}
								className={[
									styles.cell,
									showPhoto ? styles.hasPhoto : "",
									isActive ? styles.active : "",
								].join(" ")}
								onMouseEnter={() =>
									showPhoto && setHoveredCell(cellIndex)
								}
								onMouseLeave={() => setHoveredCell(null)}
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
													: "eager"
											}
											onLoad={() =>
												setLoadedImages(
													(prev) =>
														new Set([
															...prev,
															cellIndex,
														])
												)
											}
										/>
										{!isLoaded && (
											<div className={styles.skeleton} />
										)}
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
