"use client";

import { Trip } from "@/types/trip";
import { useGlobe } from "@/hooks/use-globe";
import { GlobeTooltipCard } from "./components/globe-tooltip-card";
import styles from "./globe.module.scss";

interface GlobeVisualizationProps {
	trips: Trip[];
	focusTripId?: string | null;
}

export function GlobeVisualization({
	trips,
	focusTripId,
}: GlobeVisualizationProps) {
	const {
		containerRef,
		isLoaded,
		hoveredCountry,
		tooltipPos,
		handleMouseMove,
	} = useGlobe({ trips, focusTripId });

	return (
		<div className={styles.wrapper} onMouseMove={handleMouseMove}>
			<div
				ref={containerRef}
				className={`${styles.globe} ${isLoaded ? styles.loaded : ""}`}
			/>
			{hoveredCountry && (
				<GlobeTooltipCard
					trip={hoveredCountry.trip}
					countryName={hoveredCountry.countryName}
					x={tooltipPos.x}
					y={tooltipPos.y}
				/>
			)}
		</div>
	);
}
