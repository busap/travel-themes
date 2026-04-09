"use client";

import { useState, useCallback } from "react";
import { Trip } from "@/types/trip";
import { TripCard } from "@/ui/components/trip-card/trip-card";
import styles from "./trip-strip.module.scss";

type AnimPhase = "closed" | "opening" | "open" | "closing";

interface TripStripProps {
	trips: Trip[];
	onTripHover?: (tripId: string | null) => void;
	onIsOpenChange?: (isOpen: boolean) => void;
}

function PlaneIcon() {
	return (
		<svg
			className={styles.planeIcon}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
		</svg>
	);
}

export function TripStrip({ trips, onTripHover, onIsOpenChange }: TripStripProps) {
	const [phase, setPhase] = useState<AnimPhase>("closed");

	const handleOpen = useCallback(() => {
		setPhase("opening");
		onIsOpenChange?.(true);
		setTimeout(() => setPhase("open"), 720);
	}, [onIsOpenChange]);

	const handleClose = useCallback(() => {
		setPhase("closing");
		setTimeout(() => {
			setPhase("closed");
			onIsOpenChange?.(false);
		}, 870);
	}, [onIsOpenChange]);

	const isStripInteractive = phase === "open";

	const openerClass = [
		styles.opener,
		phase === "opening" && styles.openerFlyAway,
		phase === "closing" && styles.openerFlyBack,
		phase === "open" && styles.openerHidden,
	]
		.filter(Boolean)
		.join(" ");

	const stripClass = [
		styles.strip,
		phase === "opening" && styles.stripSlideIn,
		phase === "open" && styles.stripOpen,
		phase === "closing" && styles.stripSlideOut,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={styles.container}>
			{/* Opener trigger */}
			<button
				className={openerClass}
				onClick={phase === "closed" ? handleOpen : undefined}
				disabled={phase !== "closed"}
				aria-label="Open all trips"
				aria-expanded={phase === "open"}
			>
				<PlaneIcon />
				<span className={styles.openerLabel}>All Trips</span>
			</button>

			{/* Strip panel */}
			<aside className={stripClass} aria-hidden={!isStripInteractive}>
				{/* Close button */}
				<button
					className={styles.closeBtn}
					onClick={handleClose}
					aria-label="Close trips panel"
					tabIndex={isStripInteractive ? 0 : -1}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>

				<div className={styles.list}>
					{trips.map((trip, i) => (
						<div key={trip.id} className={styles.cardWrapper}>
							<TripCard
								trip={trip}
								priority={i < 3}
								compact
								onTripHover={isStripInteractive ? onTripHover : undefined}
								onTripHoverEnd={
									isStripInteractive && onTripHover
										? () => onTripHover(null)
										: undefined
								}
							/>
						</div>
					))}
				</div>
			</aside>
		</div>
	);
}
