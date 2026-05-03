"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import styles from "./country-trips-overlay.module.scss";

interface CountryTripsOverlayProps {
	trips: Trip[];
	countryName: string;
	mobile?: boolean;
	onClose: () => void;
}

// Pre-defined scatter positions for up to 5 cards — arranged around the globe
// center so cards occupy the corners and edges of the viewport.
const SCATTER_POSITIONS: CSSProperties[] = [
	{ top: "10vh", left: "5vw", transform: "rotate(-4deg)" },
	{ top: "7vh", left: "38vw", transform: "rotate(2deg)" },
	{ top: "10vh", right: "5vw", transform: "rotate(-2deg)" },
	{ bottom: "22vh", left: "7vw", transform: "rotate(3deg)" },
	{ bottom: "18vh", right: "7vw", transform: "rotate(-3deg)" },
];

function TripMiniCard({
	trip,
	style,
	animationDelay,
}: {
	trip: Trip;
	style?: CSSProperties;
	animationDelay?: string;
}) {
	return (
		<Link
			href={getTripRoute(trip.id)}
			className={styles.card}
			style={{ ...style, animationDelay }}
			onClick={(e) => e.stopPropagation()}
		>
			<div className={styles.cardImage}>
				<Image
					src={trip.coverPhoto}
					alt={trip.name}
					fill
					className={styles.image}
					sizes="240px"
				/>
				<div className={styles.imageOverlay} />
			</div>
			<div className={styles.cardContent}>
				<span className={styles.cardName}>{trip.name}</span>
				{trip.year && (
					<span className={styles.cardYear}>{trip.year}</span>
				)}
				<span className={styles.cardExplore}>Explore →</span>
			</div>
		</Link>
	);
}

export function CountryTripsOverlay({
	trips,
	countryName,
	mobile = false,
	onClose,
}: CountryTripsOverlayProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	);

	if (!mounted) return null;

	const visibleTrips = trips.slice(0, 5);

	const overlay = (
		<div className={styles.backdrop} onClick={onClose}>
			<div className={styles.label}>
				<span className={styles.labelCountry}>{countryName}</span>
				<span className={styles.labelCount}>
					{trips.length} trips
				</span>
			</div>

			<button
				className={styles.closeButton}
				onClick={onClose}
				aria-label="Close"
			>
				✕
			</button>

			{mobile ? (
				<div
					className={styles.mobileStrip}
					onClick={(e) => e.stopPropagation()}
				>
					{visibleTrips.map((trip, i) => (
						<TripMiniCard
							key={trip.id}
							trip={trip}
							animationDelay={`${i * 50}ms`}
						/>
					))}
				</div>
			) : (
				visibleTrips.map((trip, i) => (
					<TripMiniCard
						key={trip.id}
						trip={trip}
						style={SCATTER_POSITIONS[i]}
						animationDelay={`${i * 60}ms`}
					/>
				))
			)}
		</div>
	);

	return createPortal(overlay, document.body);
}
