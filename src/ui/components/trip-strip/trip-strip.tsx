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

function CloseIcon() {
	return (
		<svg
			className={styles.closeIcon}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M19.071 4.929a1 1 0 0 0-1.414 0L12 10.586 6.343 4.929A1 1 0 0 0 4.929 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0 0-1.414z" />
		</svg>
	);
}

export function TripStrip({
	trips,
	onTripHover,
	onIsOpenChange,
}: TripStripProps) {
	const [phase, setPhase] = useState<AnimPhase>("closed");

	const handleOpen = useCallback(() => {
		setPhase("opening");
		onIsOpenChange?.(true);
		setTimeout(() => setPhase("open"), 1050);
	}, [onIsOpenChange]);

	const handleClose = useCallback(() => {
		setPhase("closing");
		setTimeout(() => {
			setPhase("closed");
			onIsOpenChange?.(false);
		}, 870);
	}, [onIsOpenChange]);

	const isStripInteractive = phase === "open";

	const planeClass = [
		styles.planeWrapper,
		phase === "opening" && styles.planeFlyAway,
		phase === "open" && styles.planeHidden,
		phase === "closing" && styles.planeFlyBack,
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

	const renderOpener = () => {
		return (
			<button
				className={styles.opener}
				onClick={phase === "closed" ? handleOpen : undefined}
				disabled={phase !== "closed"}
				aria-label="Open all trips"
				aria-expanded={phase === "open"}
			>
				<span
					className={`${styles.openerLabel} ${phase !== "closed" ? styles.labelHidden : ""}`}
				>
					All Trips
				</span>
				<span className={planeClass}>
					<PlaneIcon />
				</span>
				<svg
					className={`${styles.arcBorder} ${phase !== "closed" ? styles.arcHidden : ""}`}
					viewBox="0 0 320 320"
					aria-hidden="true"
				>
					<path d="M 0 160 A 160 160 0 0 0 160 320" />
				</svg>
			</button>
		);
	};

	const renderList = () => {
		return (
			<div className={styles.list}>
				{trips.map((trip, i) => (
					<div key={trip.id} className={styles.cardWrapper}>
						<TripCard
							trip={trip}
							priority={i < 3}
							compact
							onTripHover={
								isStripInteractive ? onTripHover : undefined
							}
							onTripHoverEnd={
								isStripInteractive && onTripHover
									? () => onTripHover(null)
									: undefined
							}
						/>
					</div>
				))}
			</div>
		);
	};

	const renderStrip = () => {
		return (
			<aside className={stripClass} aria-hidden={!isStripInteractive}>
				<button
					className={styles.closeBtn}
					onClick={handleClose}
					aria-label="Close trips panel"
					tabIndex={isStripInteractive ? 0 : -1}
				>
					<CloseIcon />
				</button>

				{renderList()}
			</aside>
		);
	};

	return (
		<div className={styles.container} data-phase={phase}>
			{renderOpener()}
			{renderStrip()}
		</div>
	);
}
