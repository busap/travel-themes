"use client";

import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { useRef, useEffect } from "react";
import { getCountryNames } from "@/utils/country";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollBasedReveal } from "@/hooks/use-scroll-based-reveal";
import { ImagePlaceholder } from "@/ui/components/image-placeholder/image-placeholder";
import styles from "./feed-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

interface FeedThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function FeedTheme({ trip, config }: FeedThemeProps) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const feedRef = useRef<HTMLDivElement>(null);

	const duration = config.animation?.timeline?.duration ?? 0.5;
	const ease = config.animation?.timeline?.ease ?? "power2.out";
	const stagger = config.animation?.timeline?.stagger ?? 0.5;

	const validatedPhotos = trip.photos;

	const { mountedItems: mountedPhotos } = useScrollBasedReveal({
		containerRef: viewportRef,
		enabled: true,
		totalItems: validatedPhotos.length,
		mountAhead: 3,
	});

	useEffect(() => {
		if (!feedRef.current || !viewportRef.current) return;

		const cards = feedRef.current.querySelectorAll("[data-feed-card]");

		cards.forEach((card) => {
			gsap.fromTo(
				card,
				{ opacity: 0, scale: 0.95 },
				{
					opacity: 1,
					scale: 1,
					duration,
					ease,
					scrollTrigger: {
						trigger: card,
						scroller: viewportRef.current,
						start: "top 95%",
						toggleActions: "play none none none",
					},
				}
			);
		});

		return () => {
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, [validatedPhotos.length, duration, ease, stagger]);

	const renderHeader = () => (
		<div className={styles.tripHeader}>
			<h1 className={styles.tripName}>{trip.name}</h1>
			<p className={styles.tripMeta}>
				{getCountryNames(trip.countries)}{" "}
				{trip.year && `· ${trip.year}`}
			</p>
			{trip.description && (
				<p className={styles.tripDescription}>{trip.description}</p>
			)}
		</div>
	);

	const renderHeartIcon = () => (
		<svg
			className={styles.heartIcon}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);

	const renderFeedCard = (
		photo: (typeof validatedPhotos)[number],
		index: number
	) => {
		const isFirst = index === 0;
		const shouldLoadImage = mountedPhotos.has(index);

		return (
			<div
				key={index}
				className={styles.feedCard}
				data-feed-card
				data-photo-index={index}
			>
				<div className={styles.feedCardImage}>
					<div className={styles.feedCardSkeleton} aria-hidden>
						<ImagePlaceholder isLoading />
					</div>
					{shouldLoadImage && (
						<Image
							src={photo.src}
							alt={photo.title || `Photo ${index + 1}`}
							fill
							sizes="(max-width: 640px) 100vw, 375px"
							style={{ objectFit: "cover" }}
							priority={isFirst}
						/>
					)}
				</div>
				<div className={styles.feedCardFooter}>
					{renderHeartIcon()}
					{photo.title && (
						<p className={styles.feedCardCaption}>
							<span className={styles.feedCardTitle}>
								{trip.name}
							</span>{" "}
							{photo.title}
						</p>
					)}
				</div>
			</div>
		);
	};

	const renderFeed = () => {
		if (validatedPhotos.length === 0) {
			return <div className={styles.emptyState}>No photos available</div>;
		}

		return (
			<div ref={feedRef}>
				{validatedPhotos.map((photo, index) =>
					renderFeedCard(photo, index)
				)}
			</div>
		);
	};

	return (
		<div className={styles.theme}>
			<div className={styles.phoneFrameWrapper}>
				<div className={styles.phoneFrame}>
					<div className={styles.phoneNotch} />
					<div className={styles.phoneViewport} ref={viewportRef}>
						<div className={styles.feedContent}>
							{renderHeader()}
							{renderFeed()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
