"use client";

import { useEffect } from "react";
import { Trip } from "@/types/trip";
import { useGlobe } from "@/hooks/use-globe";
import { GlobeTooltipCard } from "./components/globe-tooltip-card";
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
		tooltipPos,
		handleMouseMove,
		clearActiveCountry,
	} = useGlobe({ trips, focusTripId, isMobile });

	useEffect(() => {
		if (isStripOpen) clearActiveCountry();
	}, [isStripOpen, clearActiveCountry]);

	const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isMobile || !activeCountry) return;
		if (e.target === e.currentTarget) {
			clearActiveCountry();
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
			{activeCountry && (
				<GlobeTooltipCard
					trip={activeCountry.trip}
					countryName={activeCountry.countryName}
					x={tooltipPos.x}
					y={tooltipPos.y}
					mobile={isMobile}
				/>
			)}
		</div>
	);
}
