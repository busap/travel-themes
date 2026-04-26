"use client";

import Image from "next/image";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { getCountryNames } from "@/utils/country";
import { useMemo } from "react";
import { CursorImageTrail } from "./cursor-image-trail";
import styles from "./trail-theme.module.scss";

interface TrailThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function TrailTheme({ trip }: TrailThemeProps) {
	const stackPhotos = useMemo(() => trip.photos.slice(0, 5), [trip.photos]);
	const trailImages = useMemo(
		() => trip.photos.map((photo) => photo.src),
		[trip.photos]
	);

	const titleClasses = "text-5xl font-light tracking-wide";
	const subtitleClasses = "text-lg text-zinc-500";

	const renderInfo = () => (
		<div className={styles.meta}>
			<h1 className={`${styles.title} ${titleClasses}`}>{trip.name}</h1>
			<p className={subtitleClasses}>
				{getCountryNames(trip.countries)}
				{trip.year ? ` • ${trip.year}` : ""}
			</p>
		</div>
	);

	const renderStack = () => (
		<div className={styles.stack}>
			{stackPhotos.map((photo, index) => (
				<div key={photo.src} className={styles.card}>
					<div className={styles.cardInner}>
						<Image
							src={photo.src}
							alt={photo.title || `Photo ${index + 1}`}
							className={styles.cardImage}
							fill
							sizes="(max-width: 768px) 90vw, 640px"
							priority
						/>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<div className={styles.layout}>
			<div className={styles.content}>
				{renderInfo()}
				{renderStack()}
				{trailImages.length > 0 && (
					<CursorImageTrail
						images={trailImages}
						spawnThreshold={200}
						smoothing={0.14}
						lifespan={4000}
						maxItems={26}
					/>
				)}
			</div>
		</div>
	);
}
