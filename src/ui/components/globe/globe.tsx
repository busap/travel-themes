"use client";

import { useEffect } from "react";
import { Trip } from "@/types/trip";
import { useGlobe } from "@/hooks/use-globe";
import { GlobeTooltipCard } from "./components/globe-tooltip-card";
import { CountryTripsOverlay } from "./components/country-trips-overlay";
import styles from "./globe.module.scss";

interface GlobeVisualizationProps {
	trips: Trip[];
	focusTripId?: string | null;
	isMobile?: boolean;
	isStripOpen?: boolean;
}

export function GlobeVisualization({
	trips,
	focusTripId,
	isMobile = false,
	isStripOpen = false,
}: GlobeVisualizationProps) {
	const {
		containerRef,
		isLoaded,
		activeCountry,
		expandedCountry,
		tooltipPos,
		handleMouseMove,
		clearActiveCountry,
		clearExpandedCountry,
	} = useGlobe({ trips, focusTripId, isMobile });

	useEffect(() => {
		if (isStripOpen) {
			clearActiveCountry();
			clearExpandedCountry();
		}
	}, [isStripOpen, clearActiveCountry, clearExpandedCountry]);

	const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isMobile || (!activeCountry && !expandedCountry)) return;
		if (e.target === e.currentTarget) {
			clearActiveCountry();
			clearExpandedCountry();
		}
	};

	return (
		<div
			className={styles.wrapper}
			onMouseMove={handleMouseMove}
			onClick={handleWrapperClick}
		>
			<div
				ref={containerRef}
				className={`${styles.globe} ${isLoaded ? styles.loaded : ""}`}
			/>
			{activeCountry && !expandedCountry && (
				<GlobeTooltipCard
					trips={activeCountry.trips}
					countryName={activeCountry.countryName}
					x={tooltipPos.x}
					y={tooltipPos.y}
					mobile={isMobile}
				/>
			)}
			{expandedCountry && (
				<CountryTripsOverlay
					trips={expandedCountry.trips}
					countryName={expandedCountry.countryName}
					mobile={isMobile}
					onClose={clearExpandedCountry}
				/>
			)}
		</div>
	);
}
