"use client";

import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { useRef, useMemo, useState, useEffect } from "react";
import { getCountryNames } from "@/utils/country";
import Image from "next/image";
import { Playfair_Display, Crimson_Pro } from "next/font/google";
import { AuroraBackground } from "./aurora-background";
import { useAuroraAnimation } from "@/hooks/use-aurora-animation";
import { useScrollPinnedReveal } from "@/hooks/use-scroll-pinned-reveal";
import { seededRandom } from "@/utils/random";
import styles from "./aurora-theme.module.scss";

const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const crimson = Crimson_Pro({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	display: "swap",
});

interface AuroraThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function AuroraTheme({ trip, config }: AuroraThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	const timelineDuration = config.animation?.timeline?.duration ?? 20;
	const scrollTriggerConfig = config.animation?.scrollTrigger;
	const pinDuration = scrollTriggerConfig?.end ?? "+=80%";
	const spacing = "gap-8";
	const titleClasses = "text-4xl md:text-6xl font-light tracking-wide";
	const bodyClasses = "text-base md:text-lg text-white/80";

	const validatedPhotos = trip.photos;

	useAuroraAnimation(svgRef, {
		enabled: true,
		duration: timelineDuration,
	});

	const scrollConfig = useMemo(
		() => ({
			scrub: scrollTriggerConfig?.scrub,
			ease: config.animation?.timeline?.ease,
		}),
		[scrollTriggerConfig?.scrub, config.animation?.timeline?.ease]
	);

	const MOUNT_BEHIND = 1;
	const MOUNT_AHEAD = 2;

	const [activeSectionIndex, setActiveSectionIndex] = useState(0);
	const [mountedPhotos, setMountedPhotos] = useState<Set<number>>(() => {
		const end = Math.min(validatedPhotos.length - 1, MOUNT_AHEAD);
		const initialSet = new Set<number>();
		for (let i = 0; i <= end; i++) initialSet.add(i);
		return initialSet;
	});

	useEffect(() => {
		const start = Math.max(0, activeSectionIndex - MOUNT_BEHIND);
		const end = Math.min(
			validatedPhotos.length - 1,
			activeSectionIndex + MOUNT_AHEAD
		);

		setMountedPhotos((previous) => {
			const next = new Set(previous);
			for (let i = start; i <= end; i++) next.add(i);
			return next.size === previous.size ? previous : next;
		});
	}, [activeSectionIndex, validatedPhotos.length]);

	useScrollPinnedReveal({
		containerRef,
		enabled: true,
		itemCount: validatedPhotos.length,
		pinDuration,
		config: scrollConfig,
		onSectionEnter: setActiveSectionIndex,
		onSectionEnterBack: setActiveSectionIndex,
	});

	const renderBackground = () => <AuroraBackground ref={svgRef} />;

	const renderHeader = () => (
		<div className={styles.header}>
			<h1
				className={`${styles.title} ${titleClasses} ${playfair.className}`}
			>
				{trip.name}
			</h1>
			<p
				className={`${styles.subtitle} ${bodyClasses} ${crimson.className}`}
			>
				{getCountryNames(trip.countries)}{" "}
				{trip.year && `• ${trip.year}`}
			</p>
		</div>
	);

	const renderPhotoSections = () => {
		const getPhotoLayout = (index: number) => {
			const widthRand = seededRandom(index * 7.3);
			const offsetRand = seededRandom(index * 11.7);

			let width: "narrow" | "medium" | "wide";
			if (widthRand < 0.4) {
				width = "narrow";
			} else if (widthRand < 0.7) {
				width = "medium";
			} else {
				width = "wide";
			}

			const offsetPercent = Math.round((offsetRand * 30 - 15) * 10) / 10;

			return { width, offsetPercent };
		};

		const getPhotoClass = (width: "narrow" | "medium" | "wide") => {
			const variantClass =
				width === "narrow"
					? styles.photoNarrow
					: width === "medium"
						? styles.photoMedium
						: styles.photoWide;
			return `${styles.photo} ${variantClass}`;
		};

		return (
			<div className={`${styles.photos} ${spacing}`}>
				{validatedPhotos.map((photo, index) => {
					const layout = getPhotoLayout(index);
					const photoClass = getPhotoClass(layout.width);

					return (
						<div
							key={index}
							data-photo-index={index}
							className={styles.photoSection}
							style={{
								paddingLeft: `max(2rem, ${Math.max(0, layout.offsetPercent)}%)`,
								paddingRight: `max(2rem, ${Math.max(0, -layout.offsetPercent)}%)`,
							}}
						>
							<div className={photoClass}>
								{mountedPhotos.has(index) ? (
									<Image
										src={photo.src}
										alt={photo.title || `Photo ${index + 1}`}
										className={styles.photoImage}
										width={800}
										height={600}
										sizes="(max-width: 768px) 90vw, 900px"
										priority={index === 0}
										loading={index === 0 ? undefined : "eager"}
									/>
								) : (
									<div
										className={styles.photoPlaceholder}
										aria-hidden
									/>
								)}
								<p
									className={`${styles.photoCaption} ${crimson.className}`}
								>
									{photo.title || ""}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div ref={containerRef} className={styles.layout}>
			{renderBackground()}
			{renderHeader()}
			{renderPhotoSections()}
		</div>
	);
}
