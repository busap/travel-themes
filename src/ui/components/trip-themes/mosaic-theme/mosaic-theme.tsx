"use client";

import { Trip } from "@/types/trip";
import { Photo } from "@/types/photo";
import { ThemeConfig } from "@/config/theme-config";
import { useRef, useState, useEffect } from "react";
import { getCountryNames } from "@/utils/country";
import Image from "next/image";
import { Inter, Bebas_Neue } from "next/font/google";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { getGridCellSize, GridSize, GridCellAssignment } from "@/utils/mosaic-layout";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./mosaic-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const bebas = Bebas_Neue({
	subsets: ["latin"],
	weight: ["400"],
	display: "swap",
});

function getCellSizes(size: GridSize): string {
	switch (size) {
		case "3x3":
		case "3x4":
			// span 3/12 cols: 25% desktop, 50% mobile (6-col grid)
			return "(max-width: 768px) 50vw, (max-width: 1200px) 28vw, 25vw";
		case "4x3":
			// span 4/12 cols: 33% desktop, 67% mobile
			return "(max-width: 768px) 67vw, (max-width: 1200px) 37vw, 33vw";
		case "6x3":
		case "6x4":
			// span 6/12 cols: 50% desktop, 100% mobile
			return "(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 50vw";
	}
}

interface MosaicCellProps {
	photo: Photo;
	index: number;
	gridSize: GridCellAssignment;
	isExpanded: boolean;
	onCellClick: (index: number, el: HTMLDivElement | null) => void;
}

function MosaicCell({
	photo,
	index,
	gridSize,
	isExpanded,
	onCellClick,
}: MosaicCellProps) {
	const [imageReady, setImageReady] = useState(false);
	// First 4 cells always cover the initial visual row (worst case: 4× span-3
	// in a 12-col grid). No DOM measurement needed — avoids ESLint setState-in-effect
	// and any interaction with GSAP's ScrollTrigger internals.
	const loadEager = index < 4;

	return (
		<div
			data-photo-item
			data-photo-index={index}
			className={`${styles.photoItem} ${isExpanded ? styles.photoItemExpanded : ""}`}
			style={{
				gridColumn: gridSize.gridColumn,
				gridRow: gridSize.gridRow,
				opacity: 0,
			}}
			onClick={(e) => onCellClick(index, e.currentTarget as HTMLDivElement)}
		>
			<Image
				src={photo.src}
				alt={photo.title || `Photo ${index + 1}`}
				className={styles.photoImage}
				fill
				sizes={getCellSizes(gridSize.size)}
				priority={loadEager}
				loading={loadEager ? undefined : "lazy"}
				style={{ objectFit: "cover", opacity: imageReady ? 1 : 0 }}
				onLoad={() => setImageReady(true)}
			/>
			{!imageReady && <div className={styles.skeleton} />}
		</div>
	);
}

interface MosaicThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function MosaicTheme({ trip, config }: MosaicThemeProps) {
	const gridRef = useRef<HTMLDivElement>(null);
	const [expandedPhotoIndex, setExpandedPhotoIndex] = useState<number | null>(
		null
	);

	const spacing = "gap-4";
	const titleClasses = "text-4xl font-bold";
	const bodyClasses = "text-base text-zinc-600";
	const stagger = config.animation?.timeline?.stagger ?? 0.1;
	const duration = config.animation?.timeline?.duration ?? 0.4;
	const ease = config.animation?.timeline?.ease ?? "power2.out";
	const fromScale = config.animation?.timeline?.fromScale ?? 0.9;
	const scrollTriggerStart =
		config.animation?.scrollTrigger?.start ?? "top 85%";
	const scrollTriggerEnd = config.animation?.scrollTrigger?.end ?? "top 60%";
	const scrollTriggerMarkers =
		config.animation?.scrollTrigger?.markers ?? false;

	const validatedPhotos = trip.photos;
	const mousePosition = useMousePosition(gridRef);

	useEffect(() => {
		if (!gridRef.current) return;

		const gridEl = gridRef.current;
		const photoItems = gridEl.querySelectorAll("[data-photo-item]");

		const ctx = gsap.context(() => {
			photoItems.forEach((item, index) => {
				const el = item as HTMLElement;
				const inViewport =
					el.getBoundingClientRect().top < window.innerHeight;

				gsap.fromTo(
					el,
					{ opacity: 0, scale: fromScale },
					{
						opacity: 1,
						scale: 1,
						duration,
						ease,
						delay: (index % 6) * stagger,
						// Cells already visible on page load play immediately.
						// Below-fold cells wait for their scroll position.
						...(!inViewport && {
							scrollTrigger: {
								trigger: el,
								start: scrollTriggerStart,
								end: scrollTriggerEnd,
								toggleActions: "play none none none",
								markers: scrollTriggerMarkers,
							},
						}),
					}
				);
			});
		}, gridEl);

		return () => ctx.revert();
	}, [
		validatedPhotos.length,
		duration,
		ease,
		fromScale,
		stagger,
		scrollTriggerStart,
		scrollTriggerEnd,
		scrollTriggerMarkers,
	]);

	const scrollToKeepPhotoInView = (photoRef: HTMLDivElement) => {
		const rect = photoRef.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;
		const padding = 40;

		const scaledWidth = rect.width * 1.2;
		const scaledHeight = rect.height * 1.2;

		const photoCenter = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};

		let scrollX = 0;
		let scrollY = 0;

		const leftEdge = photoCenter.x - scaledWidth / 2;
		const rightEdge = photoCenter.x + scaledWidth / 2;

		if (leftEdge < padding) {
			scrollX = leftEdge - padding;
		} else if (rightEdge > viewportWidth - padding) {
			scrollX = rightEdge - (viewportWidth - padding);
		} else if (scaledWidth + padding * 2 <= viewportWidth) {
			scrollX = photoCenter.x - viewportWidth / 2;
		}

		const topEdge = photoCenter.y - scaledHeight / 2;
		const bottomEdge = photoCenter.y + scaledHeight / 2;

		if (topEdge < padding) {
			scrollY = topEdge - padding;
		} else if (bottomEdge > viewportHeight - padding) {
			scrollY = bottomEdge - (viewportHeight - padding);
		} else if (scaledHeight + padding * 2 <= viewportHeight) {
			scrollY = photoCenter.y - viewportHeight / 2;
		}

		if (scrollX !== 0 || scrollY !== 0) {
			window.scrollBy({
				top: scrollY,
				left: scrollX,
				behavior: "smooth",
			});
		}
	};

	const handlePhotoClick = (
		index: number,
		photoRef: HTMLDivElement | null
	) => {
		if (!photoRef) return;

		if (expandedPhotoIndex === index) {
			gsap.to(photoRef, {
				scale: 1,
				duration,
				ease,
				zIndex: 1,
			});
			setExpandedPhotoIndex(null);
		} else {
			if (expandedPhotoIndex !== null) {
				const prevItem = gridRef.current?.querySelector(
					`[data-photo-index="${expandedPhotoIndex}"]`
				);
				if (prevItem) {
					gsap.to(prevItem, { scale: 1, duration, ease, zIndex: 1 });
				}
			}

			setExpandedPhotoIndex(index);
			gsap.to(photoRef, {
				scale: 1.2,
				duration,
				ease,
				zIndex: 10,
				onComplete: () => scrollToKeepPhotoInView(photoRef),
			});
		}
	};

	const renderHeader = () => (
		<div className={styles.header}>
			<h1
				className={`${styles.title} ${titleClasses} ${bebas.className}`}
			>
				{trip.name}
			</h1>
			<p
				className={`${styles.subtitle} ${bodyClasses} ${inter.className}`}
			>
				{getCountryNames(trip.countries)}{" "}
				{trip.year && `• ${trip.year}`}
			</p>
		</div>
	);

	const renderPhotoGrid = () => {
		if (validatedPhotos.length === 0) {
			return (
				<div className={styles.emptyState}>
					<p className={inter.className}>No photos available</p>
				</div>
			);
		}

		return (
			<div
				ref={gridRef}
				className={`${styles.photoGrid} ${spacing}`}
				style={
					{
						"--mouse-x": `${mousePosition.x}%`,
						"--mouse-y": `${mousePosition.y}%`,
					} as React.CSSProperties
				}
			>
				{validatedPhotos.map((photo, index) => {
					const gridSize = getGridCellSize(photo, index);
					const isExpanded = expandedPhotoIndex === index;

					return (
						<MosaicCell
							key={index}
							photo={photo}
							index={index}
							gridSize={gridSize}
							isExpanded={isExpanded}
							onCellClick={handlePhotoClick}
						/>
					);
				})}
			</div>
		);
	};

	return (
		<div className={styles.theme}>
			{renderHeader()}
			{renderPhotoGrid()}
		</div>
	);
}
