"use client";

import { Trip } from "@/types/trip";
import { Photo } from "@/types/photo";
import { ThemeConfig } from "@/config/theme-config";
import { useState, useRef, useEffect, useCallback } from "react";
import { getCountryNames } from "@/utils/country";
import Image, { getImageProps } from "next/image";
import styles from "./showcase-theme.module.scss";

const ACTIVE_PHOTO_SIZES = "(max-width: 768px) 100vw, 80vw";
const THUMBNAIL_SIZES = "(max-width: 768px) 80px, 110px";

interface ShowcaseThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

interface ThumbnailProps {
	photo: Photo;
	index: number;
	isActive: boolean;
	isEager: boolean;
	onClick: () => void;
	onPreload: () => void;
}

function Thumbnail({
	photo,
	index,
	isActive,
	isEager,
	onClick,
	onPreload,
}: ThumbnailProps) {
	const [ready, setReady] = useState(false);

	return (
		<div
			className={`${styles.thumbnail} ${isActive ? styles.thumbnailActive : ""}`}
			onClick={onClick}
			onMouseEnter={onPreload}
			onFocus={onPreload}
		>
			{!ready && <div className={styles.thumbnailSkeleton} aria-hidden />}
			<Image
				src={photo.src}
				alt={photo.title || `Thumbnail ${index + 1}`}
				width={110}
				height={78}
				sizes={THUMBNAIL_SIZES}
				loading={isEager ? undefined : "lazy"}
				onLoad={() => setReady(true)}
				className={`${styles.thumbnailImage} ${ready ? styles.thumbnailImageReady : ""}`}
			/>
		</div>
	);
}

export function ShowcaseTheme({ trip, config }: ShowcaseThemeProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const preloadedRef = useRef<Set<string>>(new Set());
	const displayPhotos = trip.photos;
	const effectiveIndex =
		displayPhotos.length > 0
			? Math.min(activeIndex, displayPhotos.length - 1)
			: 0;
	const timeline = config.animation.timeline;
	const titleClasses = "text-4xl font-light tracking-wide";
	const bodyClasses = "text-sm";

	const updateScrollButtons = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 1);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		updateScrollButtons();
		el.addEventListener("scroll", updateScrollButtons, { passive: true });
		window.addEventListener("resize", updateScrollButtons);

		return () => {
			el.removeEventListener("scroll", updateScrollButtons);
			window.removeEventListener("resize", updateScrollButtons);
		};
	}, [updateScrollButtons, displayPhotos.length]);

	const preloadFullSize = useCallback((src: string) => {
		if (typeof document === "undefined") return;
		if (preloadedRef.current.has(src)) return;
		preloadedRef.current.add(src);

		// Use getImageProps so the preload URL matches the same optimized
		// /_next/image variant the active <Image> will render, sharing the
		// browser cache instead of fetching the original twice.
		const {
			props: { src: optimizedSrc, srcSet, sizes },
		} = getImageProps({
			src,
			alt: "",
			fill: true,
			sizes: ACTIVE_PHOTO_SIZES,
		});

		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "image";
		link.href = optimizedSrc;
		if (srcSet) link.setAttribute("imagesrcset", srcSet);
		if (sizes) link.setAttribute("imagesizes", sizes);
		document.head.appendChild(link);
	}, []);

	const handleThumbnailClick = useCallback(
		(index: number) => {
			setActiveIndex(index);

			const photo = displayPhotos[index];
			if (photo) preloadFullSize(photo.src);

			const thumbs = scrollRef.current?.children;
			if (thumbs?.[index]) {
				(thumbs[index] as HTMLElement).scrollIntoView({
					behavior: "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		},
		[displayPhotos, preloadFullSize]
	);

	const scrollThumbs = useCallback((direction: number) => {
		scrollRef.current?.scrollBy({
			left: direction * 300,
			behavior: "smooth",
		});
	}, []);

	const renderChevronLeft = () => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M10 12L6 8L10 4" />
		</svg>
	);

	const renderChevronRight = () => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M6 4L10 8L6 12" />
		</svg>
	);

	const renderActivePhoto = () => {
		if (displayPhotos.length === 0) return null;

		return (
			<div className={styles.activeArea}>
				<div className={styles.photoContainer}>
					{displayPhotos.map((photo, index) => (
						<div
							key={photo.src}
							className={`${styles.activePhoto} ${
								index === effectiveIndex
									? styles.activePhotoVisible
									: styles.activePhotoHidden
							}`}
							style={
								timeline
									? {
											transition: `opacity ${timeline.duration}s ${timeline.ease}`,
										}
									: undefined
							}
						>
							<Image
								src={photo.src}
								alt={photo.title || `Photo ${index + 1}`}
								fill
								sizes="(max-width: 768px) 100vw, 80vw"
								style={{ objectFit: "cover" }}
								priority={index === 0}
							/>
						</div>
					))}
				</div>

				<div className={styles.gradientOverlay} />

				<div className={styles.tripInfo}>
					<h1 className={`${styles.tripTitle} ${titleClasses}`}>
						{trip.name}
					</h1>
					<p className={`${styles.tripMeta} ${bodyClasses}`}>
						{getCountryNames(trip.countries)}{" "}
						{trip.year && `· ${trip.year}`}
					</p>
				</div>

				<div className={styles.photoCounter}>
					{effectiveIndex + 1} / {displayPhotos.length}
				</div>
			</div>
		);
	};

	const renderThumbnailStrip = () => {
		if (displayPhotos.length <= 1) return null;

		return (
			<div className={styles.thumbnailStrip}>
				<button
					className={`${styles.arrow} ${styles.arrowLeft} ${!canScrollLeft ? styles.arrowHidden : ""}`}
					onClick={() => scrollThumbs(-1)}
					aria-label="Scroll thumbnails left"
				>
					{renderChevronLeft()}
				</button>

				<div ref={scrollRef} className={styles.thumbnailScroll}>
					{displayPhotos.map((photo, index) => (
						<Thumbnail
							key={photo.src}
							photo={photo}
							index={index}
							isActive={index === effectiveIndex}
							isEager={index < 4}
							onClick={() => handleThumbnailClick(index)}
							onPreload={() => preloadFullSize(photo.src)}
						/>
					))}
				</div>

				<button
					className={`${styles.arrow} ${styles.arrowRight} ${!canScrollRight ? styles.arrowHidden : ""}`}
					onClick={() => scrollThumbs(1)}
					aria-label="Scroll thumbnails right"
				>
					{renderChevronRight()}
				</button>
			</div>
		);
	};

	return (
		<div className={styles.theme}>
			{renderActivePhoto()}
			{renderThumbnailStrip()}
		</div>
	);
}
