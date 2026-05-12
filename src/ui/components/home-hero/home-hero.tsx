"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Trip } from "@/types/trip";
import { TripStrip } from "@/ui/components/trip-strip/trip-strip";
import styles from "./home-hero.module.scss";

const GlobeVisualization = dynamic(
	() =>
		import("@/ui/components/globe/globe").then(
			(mod) => mod.GlobeVisualization
		),
	{ ssr: false }
);

function subscribe(cb: () => void) {
	const mq = window.matchMedia("(max-width: 1024px)");
	mq.addEventListener("change", cb);
	return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
	return window.matchMedia("(max-width: 1024px)").matches;
}

export function HomeHero({ trips }: { trips: Trip[] }) {
	const [focusTripId, setFocusTripId] = useState<string | null>(null);
	const [isStripOpen, setIsStripOpen] = useState(true);
	const isMobile = useSyncExternalStore(subscribe, getSnapshot, () => false);

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
					isStripOpen={isStripOpen}
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
