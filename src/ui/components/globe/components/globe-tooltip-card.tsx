"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import styles from "./globe-tooltip-card.module.scss";

interface GlobeTooltipCardProps {
	trips: Trip[];
	countryName: string;
	x: number;
	y: number;
	mobile?: boolean;
}

export function GlobeTooltipCard({
	trips,
	countryName,
	x,
	y,
	mobile = false,
}: GlobeTooltipCardProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	);

	const trip = trips[0];
	const isMulti = trips.length > 1;

	// On mobile, multi-trip countries are handled by the overlay — no tooltip needed.
	if (mobile && isMulti) return null;

	const inner = isMulti ? (
		<>
			<div className={styles.imageWrapper}>
				<Image
					src={trip.coverPhoto}
					alt={countryName}
					fill
					className={styles.image}
					sizes="320px"
				/>
				<div className={styles.imageOverlay} />
				<div className={styles.multiBadge}>{trips.length}</div>
			</div>
			<div className={styles.content}>
				<span className={styles.name}>{countryName}</span>
				<span className={styles.country}>{trips.length} trips</span>
				<span className={styles.tapHint}>Click to explore all →</span>
			</div>
		</>
	) : (
		<>
			<div className={styles.imageWrapper}>
				<Image
					src={trip.coverPhoto}
					alt={trip.name}
					fill
					className={styles.image}
					sizes="320px"
				/>
				<div className={styles.imageOverlay} />
			</div>
			<div className={styles.content}>
				<span className={styles.name}>{trip.name}</span>
				<span className={styles.country}>{countryName}</span>
				{mobile && (
					<span className={styles.tapHint}>Tap to explore →</span>
				)}
			</div>
		</>
	);

	if (mobile) {
		const card = (
			<Link href={getTripRoute(trip.id)} className={styles.tooltipMobile}>
				{inner}
			</Link>
		);
		return mounted ? createPortal(card, document.body) : null;
	}

	return (
		<div className={styles.tooltip} style={{ left: x + 16, top: y - 16 }}>
			{inner}
		</div>
	);
}
