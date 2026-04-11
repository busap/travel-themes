"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getAllTrips } from "@/utils/trip";
import { TripStrip } from "@/ui/components/trip-strip/trip-strip";
import styles from "./home-hero.module.scss";

const GlobeVisualization = dynamic(
	() =>
		import("@/ui/components/globe/globe").then(
			(mod) => mod.GlobeVisualization
		),
	{ ssr: false }
);

export function HomeHero() {
	const trips = getAllTrips();
	const [focusTripId, setFocusTripId] = useState<string | null>(null);
	const [isStripOpen, setIsStripOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 1024px)");
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return (
		<section className={styles.hero}>
			<div className={styles.background} />

			<div className={styles.content}>
				<div className={styles.titleStamp}>
					<h1 className={styles.title}>TravelThemes</h1>
				</div>
				<p className={styles.subtitle}>Adventures through the lens</p>
			</div>

			<div
				className={`${styles.globeContainer} ${isStripOpen ? styles.globeContainerOpen : ""}`}
			>
				<GlobeVisualization
						trips={trips}
						focusTripId={focusTripId}
						isMobile={isMobile}
					/>
			</div>

			<TripStrip
				trips={trips}
				onTripHover={isMobile ? undefined : setFocusTripId}
				onIsOpenChange={setIsStripOpen}
			/>
		</section>
	);
}
