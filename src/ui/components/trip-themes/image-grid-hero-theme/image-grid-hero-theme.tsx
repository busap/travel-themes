"use client";

import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { useRef, useEffect, useState } from "react";
import { getCountryNames } from "@/utils/country";
import Image from "next/image";
import { useVirtualWindow } from "@/hooks/use-virtual-window";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./image-grid-hero-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

interface ImageGridHeroThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

const CELL_CLASSES = [
	styles.cellImg0,
	styles.cellImg1,
	styles.cellImg2,
	styles.cellImg3,
	styles.cellImg4,
	styles.cellImg5,
] as const;

const DISPLACED: { x: string; y: string }[] = [
	{ x: "-30vw", y: "-28vh" },
	{ x: "-30vw", y: "28vh" },
	{ x: "0vw", y: "-42vh" },
	{ x: "30vw", y: "-28vh" },
	{ x: "0vw", y: "28vh" },
	{ x: "30vw", y: "28vh" },
];

// Accurate sizes derived from the CSS grid layout:
// Desktop cols: 2fr / 1.5fr / 1.3fr (total 4.8fr)
// Mobile cols: 1fr / 1fr; img2 and img4 hidden
const HERO_SIZES = [
	"(max-width: 768px) 50vw, 73vw", // img0: cols 0-1, row 0
	"(max-width: 768px) 50vw, 42vw", // img1: col 0, rows 1-2
	"(max-width: 768px) 50vw, 31vw", // img2: col 1, row 1 (hidden mobile)
	"(max-width: 768px) 50vw, 27vw", // img3: col 2, rows 0-1
	"(max-width: 768px) 50vw, 31vw", // img4: col 1, row 2 (hidden mobile)
	"(max-width: 768px) 50vw, 27vw", // img5: col 2, row 2
] as const;

export function ImageGridHeroTheme({ trip, config }: ImageGridHeroThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const heroRef = useRef<HTMLDivElement>(null);
	const heroTextRef = useRef<HTMLDivElement>(null);
	const scrollIndicatorRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
	const galleryRef = useRef<HTMLDivElement>(null);
	const heroPhotos = trip.photos.slice(0, 6);
	const galleryPhotos = trip.photos.slice(6);
	const scrollSt = config.animation?.scrollTrigger;
	const timelineCfg = config.animation?.timeline;

	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryPreloadEnabled, setGalleryPreloadEnabled] = useState(false);

	const { isMounted: isGalleryItemMounted } = useVirtualWindow({
		mode: "dom-visibility",
		count: galleryPhotos.length,
		indexAttr: "data-gallery-index",
		rootMarginPx: 200,
		additive: true,
		after: 6,
	});

	// `useVirtualWindow` initialises with a non-empty mount window, so it
	// can't double as the GSAP timeline trigger — keep a one-shot IO here.
	useEffect(() => {
		if (!galleryRef.current || galleryPhotos.length === 0) return;
		const el = galleryRef.current;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setGalleryOpen(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [galleryPhotos.length]);

	// Hero animation (pinned scroll + cell displacement)
	useEffect(() => {
		if (!gridRef.current) return;

		const trigger = scrollSt?.trigger ?? heroRef.current;
		if (trigger == null) return;

		const ctx = gsap.context(() => {
			const cells = cellRefs.current.filter(Boolean);

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger,
					start: scrollSt?.start ?? "top top",
					end: scrollSt?.end ?? "+=180%",
					pin: scrollSt?.pin ?? true,
					scrub: scrollSt?.scrub ?? 1,
					anticipatePin: 1,
				},
			});

			const cellDuration = timelineCfg?.duration ?? 0.8;
			const cellEase = timelineCfg?.ease ?? "power2.inOut";

			cells.forEach((cell, i) => {
				const d = DISPLACED[i];
				if (!cell || !d) return;
				tl.to(
					cell,
					{ x: 0, y: 0, duration: cellDuration, ease: cellEase },
					0
				);
			});

			tl.to(
				[heroTextRef.current, scrollIndicatorRef.current],
				{
					autoAlpha: 0,
					scale: 0.78,
					duration: 0.32,
					ease: "power2.out",
				},
				0
			);
		}, containerRef);

		return () => ctx.revert();
	}, [
		scrollSt?.start,
		scrollSt?.end,
		scrollSt?.scrub,
		scrollSt?.pin,
		scrollSt?.trigger,
		timelineCfg?.duration,
		timelineCfg?.ease,
	]);

	// Gallery scroll-reveal animations — runs once after gallery images are mounted
	useEffect(() => {
		if (!galleryOpen || !galleryRef.current) return;

		const ctx = gsap.context(() => {
			const grid = galleryRef.current!.querySelector<HTMLElement>(
				"[data-gallery-grid]"
			);
			const allItems = Array.from(
				galleryRef.current!.querySelectorAll<HTMLElement>(
					"[data-gallery-item]"
				)
			);
			if (allItems.length === 0) return;

			const computedColumns = grid
				? window.getComputedStyle(grid).gridTemplateColumns.split(" ")
						.length
				: 3;
			const columns = Math.max(1, computedColumns);
			const rowCount = Math.ceil(allItems.length / columns);

			for (let row = 0; row < rowCount; row += 1) {
				const rowItems = allItems.slice(
					row * columns,
					row * columns + columns
				);
				if (rowItems.length === 0) continue;

				const rowTl = gsap.timeline({
					scrollTrigger: {
						trigger: rowItems[0],
						start:
							row === 0
								? "top 88%"
								: row === 1
									? "top 84%"
									: "top 80%",
						end:
							row === 0
								? "top 34%"
								: row === 1
									? "top 28%"
									: "top 22%",
						scrub: row === 1 ? 1.1 : row === 2 ? 0.7 : 0.45,
					},
				});

				rowItems.forEach((item, col) => {
					const inner = item.querySelector<HTMLElement>(
						"[data-gallery-item-inner]"
					);
					const image = item.querySelector<HTMLElement>("img");
					const title = item.querySelector<HTMLElement>(
						"[data-gallery-title]"
					);
					const colDelay = col * 0.09;

					const fromX =
						row === 0
							? col === 0
								? -42
								: 20
							: row === 1
								? col === rowItems.length - 1
									? 36
									: -24
								: col % 2 === 0
									? -20
									: 28;
					const fromY = row === 0 ? 62 : row === 1 ? 52 : 44;
					const fromRotate =
						row === 0
							? col === 1
								? -3
								: 4
							: row === 1
								? col === 0
									? -5
									: 3
								: col === 2
									? -4
									: 2;

					rowTl.fromTo(
						item,
						{ autoAlpha: 0, y: fromY, x: fromX },
						{
							autoAlpha: 1,
							y: 0,
							x: 0,
							duration: 0.9,
							ease: "power3.out",
						},
						colDelay
					);

					if (inner) {
						rowTl.fromTo(
							inner,
							{
								scale: row === 1 ? 0.9 : 0.94,
								rotate: fromRotate,
								clipPath: "inset(16% 14% 20% 14% round 18px)",
							},
							{
								scale: 1,
								rotate: 0,
								clipPath: "inset(0% 0% 0% 0% round 2px)",
								duration: 1.0,
								ease: "power4.out",
							},
							colDelay + 0.03
						);
					}

					if (image) {
						rowTl.fromTo(
							image,
							{ scale: row === 2 ? 1.12 : 1.18 },
							{
								scale: 1,
								duration: 1.06,
								ease: "power3.out",
							},
							colDelay
						);
					}

					if (title) {
						rowTl.fromTo(
							title,
							{ autoAlpha: 0, y: 12 },
							{
								autoAlpha: 1,
								y: 0,
								duration: 0.45,
								ease: "power2.out",
							},
							colDelay + 0.44
						);
					}
				});
			}
		}, containerRef);

		return () => ctx.revert();
	}, [galleryOpen]);

	const renderHeroText = () => (
		<div className={styles.heroText} ref={heroTextRef}>
			<p className={styles.eyebrow}>
				{getCountryNames(trip.countries, " · ")}
				{trip.year && <span> · {trip.year}</span>}
			</p>
			<h1 className={styles.title}>{trip.name}</h1>
			{trip.description && (
				<p className={styles.description}>{trip.description}</p>
			)}
		</div>
	);

	const renderGrid = () => (
		<div
			className={styles.heroGrid}
			ref={gridRef}
			onMouseEnter={() => setGalleryPreloadEnabled(true)}
		>
			{heroPhotos.slice(0, 6).map((photo, index) => (
				<div
					key={index}
					className={`${styles.gridCell} ${CELL_CLASSES[index]}`}
					ref={(el) => {
						cellRefs.current[index] = el;
					}}
					style={{
						transform: `translate(${DISPLACED[index]?.x ?? "0vw"}, ${DISPLACED[index]?.y ?? "0vh"})`,
					}}
				>
					<Image
						src={photo.src}
						alt={photo.title || `${trip.name} – photo ${index + 1}`}
						fill
						sizes={HERO_SIZES[index]}
						style={{ objectFit: "cover" }}
						priority={index === 0}
						loading={index >= 3 ? "lazy" : undefined}
					/>
					{photo.title && (
						<div className={styles.cellOverlay}>
							<span className={styles.cellCaption}>
								{photo.title}
							</span>
						</div>
					)}
				</div>
			))}
		</div>
	);

	const renderScrollIndicator = () => (
		<div
			className={styles.scrollIndicator}
			ref={scrollIndicatorRef}
			aria-hidden="true"
		>
			<span className={styles.scrollIndicatorLabel}>Scroll</span>
			<span className={styles.scrollIndicatorTrack}>
				<span className={styles.scrollIndicatorDot} />
			</span>
		</div>
	);

	const renderGallery = () => {
		if (galleryPhotos.length === 0) return null;
		return (
			<section className={styles.gallery} ref={galleryRef}>
				<div className={styles.galleryHeader}>
					<h2 className={styles.galleryHeading}>All Photos</h2>
					<div className={styles.galleryDivider} />
				</div>
				<div className={styles.galleryGrid} data-gallery-grid>
					{galleryPhotos.map((photo, index) => {
						const showImage =
							galleryPreloadEnabled ||
							isGalleryItemMounted(index);
						return (
							<div
								key={index}
								className={styles.galleryItem}
								data-gallery-item
								data-gallery-index={index}
							>
								<div
									className={styles.galleryItemInner}
									data-gallery-item-inner
								>
									{showImage && (
										<>
											<Image
												src={photo.src}
												alt={
													photo.title ||
													`${trip.name} – photo ${index + 7}`
												}
												fill
												sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
												style={{ objectFit: "cover" }}
											/>
											{photo.title && (
												<div
													className={
														styles.galleryOverlay
													}
												>
													<span
														className={
															styles.galleryItemTitle
														}
														data-gallery-title
													>
														{photo.title}
													</span>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		);
	};

	return (
		<div className={styles.theme} ref={containerRef}>
			<section className={styles.hero} ref={heroRef}>
				{renderHeroText()}
				{renderGrid()}
				{renderScrollIndicator()}
			</section>
			{renderGallery()}
		</div>
	);
}
