"use client";

import dynamic from "next/dynamic";
import { getAllTrips } from "@/utils/trip";
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

	return (
		<section className={styles.hero}>
			<div className={styles.background} />

			<div className={styles.content}>
				<h1 className={styles.title}>TravelThemes</h1>
				<p className={styles.subtitle}>Adventures through the lens</p>
			</div>

			<div className={styles.globeContainer}>
				<GlobeVisualization trips={trips} />
			</div>
		</section>
	);
}
